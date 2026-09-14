"use client";

import { useMemo, useState } from "react";
import type { SourceCard } from "@/lib/ai";
import type { Einspruchsfrist } from "@/lib/deadlines";
import { SourceMargin } from "./SourceMargin";

type Channel = "email" | "telefon" | "portal";

type IntakeResult = {
  extraction: {
    kategorie: string;
    anliegen: string;
    mandant: { name: string | null; kontakt: string | null; mandantennummer: string | null };
    steuerart: string | null;
    jahr: string | null;
    fehlendeAngaben: string[];
  };
  frist: Einspruchsfrist | null;
  draft: {
    dringlichkeit: "hoch" | "mittel" | "niedrig";
    dringlichkeitGrund: string;
    zusammenfassung: string;
    checkliste: { punkt: string; beleg: number[] }[];
    naechsteSchritte: { schritt: string; wer: string; bis: string }[];
    antwortEntwurf: { betreff: string; text: string };
  };
  sources: SourceCard[];
};

// fictional sample requests, as they arrive at a small practice every week
const SAMPLES: { label: string; channel: Channel; text: string }[] = [
  {
    label: "E-Mail · Bescheid",
    channel: "email",
    text: `Betreff: Steuerbescheid 2025 – das kann so nicht stimmen

Hallo Frau Weber,

gestern kam mein Einkommensteuerbescheid für 2025, datiert auf den 3. September 2026. Das Finanzamt hat die Fahrtkosten und mein häusliches Arbeitszimmer nicht anerkannt, ich soll 1.840 € nachzahlen. Können Sie dagegen Einspruch einlegen? Ich bin ab dem 21.09. für zwei Wochen im Urlaub.

Viele Grüße
Thomas Brandt (Mandantennr. 10427)
0171 2345678`,
  },
  {
    label: "Anrufbeantworter · Neumandat",
    channel: "telefon",
    text: `Ja hallo, hier ist Aylin Demir. Ich hab mich im März als Grafikdesignerin selbstständig gemacht und bisher noch gar nichts mit Steuern gemacht. Jetzt hab ich Post vom Finanzamt, so einen Fragebogen zur steuerlichen Erfassung, und ich weiß nicht, ob ich Kleinunternehmerin bin oder Umsatzsteuer zahlen muss. Umsatz dieses Jahr so ungefähr 28.000 Euro. Können Sie mich zurückrufen? 0152 9876543. Danke!`,
  },
  {
    label: "Portal · Unterlagen",
    channel: "portal",
    text: `Hallo zusammen,

welche Unterlagen brauchen Sie von uns für die Steuererklärung 2025? Wir haben letztes Jahr eine Eigentumswohnung gekauft und vermieten sie seit Juli 2025. Außerdem gab es eine neue Küche in unserer eigenen Wohnung (Handwerker, bar bezahlt). Bis wann muss alles bei Ihnen sein?

Viele Grüße
Familie Schneider`,
  },
];

const URGENCY: Record<string, string> = {
  hoch: "bg-stamp text-sheet",
  mittel: "bg-marker text-ink",
  niedrig: "bg-pruef-wash text-pruef",
};

export function IntakeView() {
  const [text, setText] = useState(SAMPLES[0].text);
  const [channel, setChannel] = useState<Channel>("email");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<IntakeResult | null>(null);
  const [hover, setHover] = useState<number | null>(null);
  const [done, setDone] = useState<Set<number>>(new Set());
  const [reply, setReply] = useState("");
  const [copied, setCopied] = useState(false);

  const run = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    setDone(new Set());
    try {
      const res = await fetch("/api/intake", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ message: text, channel }) });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Die Anfrage konnte nicht verarbeitet werden.");
      setResult(json);
      setReply(`Betreff: ${json.draft.antwortEntwurf.betreff}\n\n${json.draft.antwortEntwurf.text}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Die Anfrage konnte nicht verarbeitet werden.");
    } finally {
      setLoading(false);
    }
  };

  const cited = useMemo(() => {
    if (!result) return new Set<number>();
    const s = new Set<number>(result.draft.checkliste.flatMap((c) => c.beleg));
    for (const m of result.draft.zusammenfassung.matchAll(/\[(\d{1,2})\]/g)) s.add(Number(m[1]));
    return s;
  }, [result]);

  return (
    <div className="mx-auto w-full max-w-[1180px] px-4 pb-24 sm:px-6">
      <div className="grid gap-x-10 gap-y-6 pt-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0">
          <h1 className="font-display text-[clamp(1.5rem,3vw,2.1rem)] font-medium leading-tight tracking-[-0.01em]">Posteingang: Anfrage rein, Vorgang raus.</h1>
          <p className="mt-2 max-w-[62ch] text-[0.95rem] leading-relaxed text-ink-soft">
            Eine E-Mail, eine Nachricht auf dem Anrufbeantworter oder eine Portalnachricht wird eingeordnet, Fristen werden nachvollziehbar berechnet, und die Antwort an den Mandanten liegt als Entwurf bereit.
          </p>

          <div className="mt-6 rounded-[4px] border border-rule bg-sheet">
            <div className="flex flex-wrap items-center gap-2 border-b border-rule px-3 py-2">
              <span className="font-mono text-[0.68rem] uppercase tracking-[0.12em] text-muted">Beispiel</span>
              {SAMPLES.map((s) => (
                <button
                  key={s.label}
                  type="button"
                  onClick={() => {
                    setText(s.text);
                    setChannel(s.channel);
                    setResult(null);
                  }}
                  className={`rounded-[3px] px-2 py-1 text-[0.78rem] ${text === s.text ? "bg-ink text-sheet" : "text-ink-soft hover:bg-paper hover:text-ink"}`}
                >
                  {s.label}
                </button>
              ))}
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={9}
              aria-label="Eingehende Anfrage"
              className="block w-full resize-y bg-transparent px-4 py-3 font-mono text-[0.84rem] leading-relaxed text-ink outline-none"
            />
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-rule px-3 py-2">
              <label className="flex items-center gap-2 text-[0.8rem] text-ink-soft">
                Kanal
                <select value={channel} onChange={(e) => setChannel(e.target.value as Channel)} className="rounded-[3px] border border-rule bg-sheet px-2 py-1 text-[0.8rem] text-ink">
                  <option value="email">E-Mail</option>
                  <option value="telefon">Telefon / Anrufbeantworter</option>
                  <option value="portal">Mandantenportal</option>
                </select>
              </label>
              <button type="button" onClick={run} disabled={loading || text.trim().length < 10} className="h-9 rounded-[4px] bg-ink px-4 text-sm font-medium text-sheet disabled:opacity-40">
                {loading ? "Wird bearbeitet …" : "Vorgang anlegen"}
              </button>
            </div>
          </div>

          {error && <p className="mt-4 rounded-[4px] border border-stamp/40 bg-stamp-wash px-4 py-3 text-sm text-stamp">{error}</p>}
          {loading && (
            <p className="mt-6 flex items-center gap-2 text-sm text-muted">
              <span className="pulse-dot inline-block h-1.5 w-1.5 rounded-full bg-pruef" />
              Anfrage wird eingeordnet, Fristen berechnet, Kanzlei-Handbuch und Gesetz durchsucht …
            </p>
          )}

          {result && (
            <div className="rise mt-8 flex flex-col gap-6">
              {/* case header */}
              <div className="flex flex-wrap items-start justify-between gap-6">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-[3px] border border-ink px-1.5 py-0.5 font-mono text-[0.7rem] font-semibold tracking-[0.08em]">{result.extraction.kategorie}</span>
                    <span className={`rounded-[3px] px-1.5 py-0.5 font-mono text-[0.7rem] font-semibold uppercase tracking-[0.08em] ${URGENCY[result.draft.dringlichkeit]}`}>
                      Dringlichkeit {result.draft.dringlichkeit}
                    </span>
                  </div>
                  <p className="mt-3 font-display text-[1.15rem] leading-snug">{result.extraction.anliegen}</p>
                  <p className="mt-1 text-[0.8rem] text-muted">{result.draft.dringlichkeitGrund}</p>
                  <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-[0.82rem]">
                    {[
                      ["Mandant", [result.extraction.mandant.name, result.extraction.mandant.mandantennummer && `Nr. ${result.extraction.mandant.mandantennummer}`].filter(Boolean).join(" · ")],
                      ["Kontakt", result.extraction.mandant.kontakt],
                      ["Steuerart", [result.extraction.steuerart, result.extraction.jahr].filter(Boolean).join(" ")],
                    ].map(([k, v]) => (
                      <div key={k as string} className="contents">
                        <dt className="text-muted">{k}</dt>
                        <dd className="text-ink">{v || <span className="text-muted">– nicht angegeben</span>}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
                {result.frist && <DeadlineStamp frist={result.frist} />}
              </div>

              {result.frist && (
                <details className="rounded-[4px] border border-rule bg-sheet px-4 py-3 text-[0.82rem]" open>
                  <summary className="cursor-pointer font-medium">Rechenweg der Einspruchsfrist</summary>
                  <ol className="mt-3 flex flex-col gap-2">
                    {result.frist.steps.map((s, i) => (
                      <li key={i} className="grid grid-cols-[7.5rem_1fr] gap-3">
                        <span className="font-mono text-[0.78rem] text-ink">{s.date}</span>
                        <span>
                          {s.label}
                          <span className="block text-[0.74rem] text-muted">{s.basis}</span>
                        </span>
                      </li>
                    ))}
                  </ol>
                  <ul className="mt-3 border-t border-rule pt-2 text-[0.74rem] text-muted">
                    {result.frist.caveats.map((c) => (
                      <li key={c}>– {c}</li>
                    ))}
                  </ul>
                </details>
              )}

              <Block title="Zusammenfassung für die Sachbearbeitung">
                <p className="text-[0.92rem] leading-relaxed">
                  <Cited text={result.draft.zusammenfassung} onHover={setHover} />
                </p>
              </Block>

              <Block title="Beim Mandanten anfordern">
                <ul className="flex flex-col gap-1.5">
                  {result.draft.checkliste.map((c, i) => (
                    <li key={i}>
                      <label className="flex cursor-pointer items-start gap-2.5 text-[0.9rem] leading-snug">
                        <input
                          type="checkbox"
                          checked={done.has(i)}
                          onChange={() => {
                            const n = new Set(done);
                            if (n.has(i)) n.delete(i);
                            else n.add(i);
                            setDone(n);
                          }}
                          className="mt-1 accent-[var(--pruef)]"
                        />
                        <span className={done.has(i) ? "text-muted line-through" : ""}>
                          {c.punkt}
                          {c.beleg.map((n) => (
                            <a key={n} href={`#card-${n}`} className="cite" onMouseEnter={() => setHover(n)} onMouseLeave={() => setHover(null)}>
                              {n}
                            </a>
                          ))}
                        </span>
                      </label>
                    </li>
                  ))}
                </ul>
                {result.extraction.fehlendeAngaben.length > 0 && (
                  <p className="mt-3 text-[0.8rem] text-ink-soft">
                    <span className="font-medium">Noch offen:</span> {result.extraction.fehlendeAngaben.join(" · ")}
                  </p>
                )}
              </Block>

              <Block title="Nächste Schritte">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[0.86rem]">
                    <thead>
                      <tr className="text-[0.72rem] uppercase tracking-[0.08em] text-muted">
                        <th className="pb-1.5 pr-3 font-medium">Schritt</th>
                        <th className="pb-1.5 pr-3 font-medium">Wer</th>
                        <th className="pb-1.5 font-medium">Bis</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.draft.naechsteSchritte.map((s, i) => (
                        <tr key={i} className="border-t border-rule align-top">
                          <td className="py-2 pr-3">{s.schritt}</td>
                          <td className="py-2 pr-3 text-ink-soft">{s.wer}</td>
                          <td className="whitespace-nowrap py-2 font-mono text-[0.8rem]">{s.bis}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Block>

              <Block
                title="Antwortentwurf an den Mandanten"
                action={
                  <button
                    type="button"
                    onClick={async () => {
                      await navigator.clipboard.writeText(reply);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 1600);
                    }}
                    className="rounded-[3px] border border-rule px-2 py-1 text-[0.75rem] font-medium text-ink-soft hover:text-ink"
                  >
                    {copied ? "Kopiert" : "Entwurf kopieren"}
                  </button>
                }
              >
                <textarea value={reply} onChange={(e) => setReply(e.target.value)} rows={12} aria-label="Antwortentwurf" className="w-full resize-y rounded-[3px] bg-paper/50 px-3 py-2.5 text-[0.88rem] leading-relaxed outline-none focus:bg-paper/80" />
                <p className="mt-1.5 text-[0.72rem] text-muted">Entwurf – wird erst nach Freigabe durch die Sachbearbeitung versendet.</p>
              </Block>
            </div>
          )}
        </div>

        <aside className="min-w-0 lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:self-start lg:overflow-y-auto lg:pr-1">
          {result ? (
            <>
              <p className="mb-2 font-mono text-[0.68rem] uppercase tracking-[0.12em] text-muted">Fundstellen</p>
              <SourceMargin sources={result.sources} cited={cited} activeSource={hover} onHover={setHover} compact />
            </>
          ) : (
            <div className="hidden text-[0.8rem] leading-relaxed text-muted lg:block lg:pt-24">
              <p className="font-mono text-[0.68rem] uppercase tracking-[0.12em]">Was passiert</p>
              <ol className="mt-3 flex flex-col gap-3">
                <li>
                  <span className="text-ink">Einordnen.</span> Kategorie, Mandant, Steuerart und Jahr werden aus dem Text gelesen, nicht geraten.
                </li>
                <li>
                  <span className="text-ink">Frist rechnen.</span> Das Datum liest die KI, gerechnet wird mit festen Regeln nach § 122, § 108 und § 355 AO.
                </li>
                <li>
                  <span className="text-ink">Belegen.</span> Checkliste und Schritte folgen Ihrem Kanzlei-Handbuch und dem Gesetz, mit Fundstelle.
                </li>
                <li>
                  <span className="text-ink">Entwerfen.</span> Die Antwort an den Mandanten liegt bereit, verbindlich wird sie erst durch Ihre Freigabe.
                </li>
              </ol>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

function DeadlineStamp({ frist }: { frist: Einspruchsfrist }) {
  const date = new Date(`${frist.fristende}T00:00:00Z`).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "UTC" });
  const left = frist.daysLeft;
  return (
    <div className="stamp shrink-0 px-4 py-2.5 text-center" role="img" aria-label={`Einspruchsfrist bis ${date}`}>
      <p className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.22em]">Frist · Einspruch</p>
      <p className="font-mono text-[1.55rem] font-semibold leading-tight tracking-[0.02em]">{date}</p>
      <p className="font-mono text-[0.66rem] font-medium uppercase tracking-[0.14em]">
        {left < 0 ? `abgelaufen seit ${-left} Tagen` : left === 0 ? "läuft heute ab" : `noch ${left} Tage`} · vorläufig
      </p>
    </div>
  );
}

function Block({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-[4px] border border-rule bg-sheet px-4 py-3.5 sm:px-5">
      <div className="mb-2.5 flex items-center justify-between gap-2">
        <h2 className="font-mono text-[0.7rem] font-medium uppercase tracking-[0.12em] text-muted">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function Cited({ text, onHover }: { text: string; onHover: (n: number | null) => void }) {
  const parts = text.split(/(\[\d{1,2}\])/g);
  return (
    <>
      {parts.map((p, i) => {
        const m = p.match(/^\[(\d{1,2})\]$/);
        if (!m) return <span key={i}>{p}</span>;
        const n = Number(m[1]);
        return (
          <a key={i} href={`#card-${n}`} className="cite" onMouseEnter={() => onHover(n)} onMouseLeave={() => onHover(null)}>
            {n}
          </a>
        );
      })}
    </>
  );
}
