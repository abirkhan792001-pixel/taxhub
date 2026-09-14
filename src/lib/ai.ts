import { google } from "@ai-sdk/google";
import { generateText, Output, type LanguageModel } from "ai";
import { z } from "zod";
import type { Chunk } from "./corpus";
import type { NormRef, RetrievedChunk } from "./search";

// With a Google AI Studio key (free tier, no card) the Gemini API is called directly;
// otherwise models are routed through Vercel AI Gateway ("provider/model" strings).
const viaGoogle = Boolean(process.env.GOOGLE_GENERATIVE_AI_API_KEY);

export const PLANNER_MODEL: LanguageModel = viaGoogle
  ? google(process.env.PLANNER_MODEL ?? "gemini-2.5-flash-lite")
  : (process.env.PLANNER_MODEL ?? "anthropic/claude-haiku-4.5");

export const ANSWER_MODEL: LanguageModel = viaGoogle
  ? google(process.env.ANSWER_MODEL ?? "gemini-2.5-flash")
  : (process.env.ANSWER_MODEL ?? "anthropic/claude-sonnet-5");

export const LAWS = ["AO", "EGAO", "EStG", "UStG", "KStG", "GewStG", "GrStG", "StBerG", "StBVV"] as const;

export const todayDe = () =>
  new Date().toLocaleDateString("de-DE", { day: "2-digit", month: "long", year: "numeric", timeZone: "Europe/Berlin" });

const planSchema = z.object({
  language: z.enum(["de", "en"]).describe("Language the user wrote in"),
  searchQueries: z
    .array(z.string())
    .min(1)
    .max(4)
    .describe("2–4 short German keyword queries using the statutory terms (e.g. 'Einspruchsfrist Bekanntgabe Verwaltungsakt')"),
  norms: z
    .array(z.object({ law: z.enum(LAWS), section: z.string().describe("e.g. '149' or '35a'"), article: z.string().optional().describe("only for EGAO, e.g. '97'") }))
    .max(6)
    .describe("Norms that very likely contain the answer. Only list norms you are confident exist."),
});

export type Plan = z.infer<typeof planSchema>;

export async function planSearch(conversation: string, question: string): Promise<Plan> {
  try {
    const { output } = await generateText({
      model: PLANNER_MODEL,
      output: Output.object({ schema: planSchema }),
      instructions: `You turn questions from staff of a German tax advisory firm (Steuerberatungskanzlei) into search queries over German tax statutes (AO, EGAO, EStG, UStG, KStG, GewStG, GrStG, StBerG, StBVV) and the firm's internal handbook (Fristenmanagement, Mandanten-FAQ, Honorarrichtlinie, Telefonleitfaden). Today is ${todayDe()}. Resolve follow-up questions using the earlier turns.`,
      prompt: conversation,
    });
    return output;
  } catch (err) {
    // retrieval still works without the planner: BM25 on the question plus any § references in it
    console.error("planner failed, falling back to the plain question", err);
    return { language: /\b(the|what|when|how|is|are|does)\b/i.test(question) ? "en" : "de", searchQueries: [question], norms: [] };
  }
}

export function planNorms(plan: Plan): NormRef[] {
  return plan.norms.map((n) => ({ law: n.law, section: n.section.replace(/\s|§/g, ""), article: n.article }));
}

export function formatSources(chunks: RetrievedChunk[]) {
  return chunks
    .map((c) => {
      const kind = c.kind === "firm" ? "KANZLEI-RICHTLINIE (interne Vorgabe, kein Gesetz)" : c.lang === "en" ? "GESETZ – englische Übersetzung (nicht amtlich verbindlich)" : `GESETZ${c.stand ? ` – Stand ${c.stand}` : ""}`;
      return `[${c.n}] ${c.ref} – ${c.title}\n(${kind})\n${c.text}`;
    })
    .join("\n\n---\n\n");
}

export function answerInstructions(language: "de" | "en") {
  return `Du bist TaxHub, der Wissensassistent einer deutschen Steuerberatungskanzlei. Du antwortest Mitarbeitenden (Sachbearbeitung, Sekretariat, Berufsträger).

Heute ist der ${todayDe()}.

REGELN
1. Antworte ausschließlich auf Grundlage der nummerierten QUELLEN. Kein Wissen von außerhalb, keine erfundenen Normen, Beträge, Fristen oder Urteile.
2. Belege jede Sachaussage direkt mit [n] (z. B. "… innerhalb eines Monats [2]."). Mehrere Belege: [2][5].
3. Wenn die Quellen die Frage nicht oder nur teilweise beantworten, sage das klar ("Dazu enthalten die Quellen nichts …") und nenne, welche Norm oder Unterlage fehlen würde. Lieber eine ehrliche Lücke als eine plausible Vermutung.
4. Trenne Gesetz und Kanzlei-Richtlinie sichtbar ("Gesetzlich gilt … [1]. Unsere Kanzleiregel: … [4]").
5. Achte auf Übergangsregelungen (EGAO) und darauf, welcher Besteuerungszeitraum betroffen ist; rechne Daten konkret aus, wenn die Quellen das hergeben.
6. Format: zuerst die Kurzantwort in 1–3 Sätzen (fett markiert), dann bei Bedarf kurze Stichpunkte mit Details, am Ende optional "Hinweis:" für Unsicherheiten oder Prüfbedarf durch den Berufsträger. Knapp und praxisnah, keine Einleitungsfloskeln.
7. Englische Übersetzungen der AO sind nicht amtlich; bei Abweichungen gilt der deutsche Text.

${language === "en" ? "Write the answer in English, but keep German legal terms in brackets where helpful (e.g. 'objection period (Einspruchsfrist)')." : "Antworte auf Deutsch."}`;
}

// Documents a user pastes in the UI for this session (not stored) → chunks
export function sessionChunks(docs: { title: string; text: string }[]): Chunk[] {
  const out: Chunk[] = [];
  docs.slice(0, 5).forEach((d, di) => {
    const text = d.text.slice(0, 40_000);
    const paras = text.split(/\n\s*\n/);
    let cur = "";
    let part = 1;
    const push = () => {
      if (cur.trim().length < 20) return;
      out.push({
        id: `UP-${di}-${part++}`,
        source: "Upload",
        sourceName: d.title || `Dokument ${di + 1}`,
        ref: `${d.title || `Dokument ${di + 1}`} (hochgeladen) › Teil ${part - 1}`,
        title: d.title || `Dokument ${di + 1}`,
        text: cur.trim(),
        url: "",
        lang: "de",
        stand: null,
        kind: "firm",
      });
      cur = "";
    };
    for (const p of paras) {
      if (cur.length + p.length > 1400) push();
      cur += `${p}\n\n`;
    }
    push();
  });
  return out;
}

export type SourceCard = Pick<Chunk, "id" | "ref" | "title" | "url" | "kind" | "lang" | "stand" | "sourceName"> & { n: number; excerpt: string };

export const toSourceCards = (chunks: RetrievedChunk[]): SourceCard[] =>
  chunks.map((c) => ({
    n: c.n,
    id: c.id,
    ref: c.ref,
    title: c.title,
    url: c.url,
    kind: c.kind,
    lang: c.lang,
    stand: c.stand,
    sourceName: c.sourceName,
    excerpt: c.text,
  }));
