import { generateText, Output } from "ai";
import { z } from "zod";
import { ANSWER_MODEL, ANSWER_OPTIONS, LAWS, PLANNER_MODEL, PLANNER_OPTIONS, formatSources, planNorms, toSourceCards, todayDe } from "@/lib/ai";
import { einspruchsfrist } from "@/lib/deadlines";
import { retrieve } from "@/lib/search";

export const maxDuration = 60;

const extractionSchema = z.object({
  kategorie: z.enum(["BESCHEID", "UNTERLAGEN", "STATUS", "NEUMANDAT", "LOHN", "SONSTIGES"]),
  anliegen: z.string().describe("Das Anliegen in einem Satz, sachlich"),
  mandant: z.object({
    name: z.string().nullable(),
    kontakt: z.string().nullable().describe("E-Mail oder Telefonnummer, falls genannt"),
    mandantennummer: z.string().nullable(),
  }),
  steuerart: z.string().nullable().describe("z. B. Einkommensteuer, Umsatzsteuer, Grundsteuer"),
  jahr: z.string().nullable().describe("Betroffener Besteuerungszeitraum, z. B. '2025'"),
  bescheid: z
    .object({
      datum: z.string().describe("Datum des Bescheids im Format YYYY-MM-DD"),
      zustellung: z.enum(["post", "elektronisch", "ausland"]),
    })
    .nullable()
    .describe("Nur ausfüllen, wenn ein Bescheid mit konkretem Datum erwähnt wird"),
  fehlendeAngaben: z.array(z.string()).describe("Angaben, die für die Bearbeitung fehlen"),
  searchQueries: z.array(z.string()).min(1).max(4).describe("Deutsche Suchbegriffe für Gesetz und Kanzlei-Handbuch"),
  norms: z.array(z.object({ law: z.enum(LAWS), section: z.string(), article: z.string().optional() })).max(5),
});

const draftSchema = z.object({
  dringlichkeit: z.enum(["hoch", "mittel", "niedrig"]),
  dringlichkeitGrund: z.string(),
  zusammenfassung: z.string().describe("2–3 Sätze für den zuständigen Sachbearbeiter, mit Belegen [n]"),
  checkliste: z.array(z.object({ punkt: z.string(), beleg: z.array(z.number()).describe("Quellennummern") })).describe("Unterlagen/Angaben, die beim Mandanten anzufordern sind"),
  naechsteSchritte: z.array(z.object({ schritt: z.string(), wer: z.string(), bis: z.string() })),
  antwortEntwurf: z.object({ betreff: z.string(), text: z.string().describe("E-Mail an den Mandanten, ohne [n]-Belege, Sie-Form, unterschrieben mit 'Ihr Team der Kanzlei Muster'") }),
});

export async function POST(req: Request) {
  const { message, channel = "email" }: { message: string; channel?: "email" | "telefon" | "portal" } = await req.json();
  const text = (message ?? "").trim().slice(0, 6000);
  if (text.length < 10) return Response.json({ error: "Bitte eine Anfrage einfügen." }, { status: 400 });

  try {
    const { output: ex } = await generateText({
      model: PLANNER_MODEL,
      providerOptions: PLANNER_OPTIONS,
      output: Output.object({ schema: extractionSchema }),
      instructions: `Du bist das digitale Sekretariat einer Steuerberatungskanzlei. Extrahiere aus einer eingehenden Mandantenanfrage (${channel}) die strukturierten Angaben. Heute ist der ${todayDe()}. Erfinde nichts: unbekannte Felder sind null.`,
      prompt: text,
    });

    const frist = ex.bescheid?.datum && /^\d{4}-\d{2}-\d{2}$/.test(ex.bescheid.datum) ? einspruchsfrist(ex.bescheid.datum, ex.bescheid.zustellung) : null;

    const queries = [
      ex.anliegen,
      ...ex.searchQueries,
      `Telefonleitfaden Kategorie ${ex.kategorie}`,
      ...(frist ? ["Einspruchsfrist Bekanntgabe Fristenmanagement"] : []),
    ];
    const chunks = retrieve({ queries, norms: planNorms({ language: "de", searchQueries: [], norms: ex.norms }), maxLaw: 7, maxFirm: 4 });

    const fristText = frist
      ? `BERECHNETE EINSPRUCHSFRIST (deterministisch, nicht verändern): Bekanntgabe ${frist.bekanntgabe}, Fristende ${frist.fristende} (${frist.daysLeft} Tage ab heute).\nRechenweg:\n${frist.steps.map((s) => `- ${s.date}: ${s.label} (${s.basis})`).join("\n")}`
      : "Keine Einspruchsfrist berechnet (kein Bescheiddatum genannt).";

    const { output: draft } = await generateText({
      model: ANSWER_MODEL,
      providerOptions: ANSWER_OPTIONS,
      output: Output.object({ schema: draftSchema }),
      instructions: `Du bereitest eine Mandantenanfrage für die Sachbearbeitung einer Steuerberatungskanzlei vor. Heute ist der ${todayDe()}.
Regeln:
- Stütze Checkliste, Zusammenfassung und nächste Schritte auf die nummerierten QUELLEN (Gesetz und Kanzlei-Handbuch) und gib die Quellennummern an. Nichts erfinden.
- Halte dich an die Kanzleiregeln (Telefonleitfaden, Fristenmanagement, Mandanten-FAQ), z. B. Rückrufzusagen und Vier-Augen-Prinzip bei Fristen.
- Der Antwortentwurf an den Mandanten gibt KEINE verbindliche steuerliche Beurteilung ab, bestätigt den Eingang, nennt konkret, was benötigt wird, und nennt eine berechnete Frist nur als "vorläufig berechnet, wird von uns geprüft".
- Verwende eine berechnete Frist exakt so, wie sie vorgegeben ist.`,
      prompt: `EINGEHENDE ANFRAGE (${channel}):\n"""${text}"""\n\nEXTRAHIERTE ANGABEN:\n${JSON.stringify(ex, null, 2)}\n\n${fristText}\n\nQUELLEN\n\n${formatSources(chunks)}`,
    });

    return Response.json({ extraction: ex, frist, draft, sources: toSourceCards(chunks) });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Die Anfrage konnte nicht verarbeitet werden." }, { status: 500 });
  }
}
