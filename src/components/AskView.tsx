"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useMemo, useState } from "react";
import { citedNumbers } from "@/lib/cite";
import type { TaxHubMessage } from "@/lib/types";
import { Answer } from "./Answer";
import { SourceMargin } from "./SourceMargin";

const EXAMPLES = [
  { q: "Bis wann muss die Einkommensteuererklärung 2025 abgegeben werden, wenn wir als Kanzlei sie erstellen?", tag: "Fristen" },
  { q: "Ein Mandant hat die Handwerkerrechnung für sein Bad bar bezahlt. Gibt es die Steuerermäßigung trotzdem?", tag: "EStG" },
  { q: "Welche Gebühr dürfen wir für eine Einkommensteuererklärung ohne Ermittlung der Einkünfte abrechnen?", tag: "StBVV" },
  { q: "Mandant ruft wegen eines Bescheids an. Was muss das Sekretariat laut unserem Leitfaden tun?", tag: "Kanzlei" },
  { q: "How high is the late-filing surcharge, and when is it mandatory?", tag: "English" },
];

type Doc = { title: string; text: string };

export function AskView() {
  const [input, setInput] = useState("");
  const [docs, setDocs] = useState<Doc[]>([]);
  const [docOpen, setDocOpen] = useState(false);
  const [draftDoc, setDraftDoc] = useState<Doc>({ title: "", text: "" });

  const { messages, sendMessage, status, error, stop, regenerate } = useChat<TaxHubMessage>({
    transport: new DefaultChatTransport({ api: "/api/ask" }),
  });

  const busy = status === "submitted" || status === "streaming";

  // session documents travel with each request, so the latest list is always used
  const ask = (text: string) => {
    const t = text.trim();
    if (!t || busy) return;
    sendMessage({ text: t }, { body: { sessionDocs: docs } });
    setInput("");
  };

  // pair each user question with the assistant reply that follows it
  const exchanges = useMemo(() => {
    const out: { q: TaxHubMessage; a?: TaxHubMessage }[] = [];
    for (const m of messages) {
      if (m.role === "user") out.push({ q: m });
      else if (out.length) out[out.length - 1].a = m;
    }
    return out;
  }, [messages]);

  return (
    <div className="mx-auto w-full max-w-[1180px] px-4 pb-44 sm:px-6">
      {exchanges.length === 0 && <EmptyState onPick={ask} />}

      <div className="flex flex-col gap-10 pt-6">
        {exchanges.map((ex, i) => (
          <Exchange key={ex.q.id} q={ex.q} a={ex.a} pending={busy && i === exchanges.length - 1} />
        ))}
      </div>

      {error && (
        <div className="mt-6 flex items-center gap-3 rounded-[8px] border border-stamp/40 bg-stamp-wash px-4 py-3 text-sm text-stamp">
          Die Antwort konnte nicht erzeugt werden.
          <button type="button" onClick={() => regenerate({ body: { sessionDocs: docs } })} className="font-semibold underline underline-offset-2">
            Erneut versuchen
          </button>
        </div>
      )}

      {/* composer */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-rule bg-paper/92 backdrop-blur">
        <div className="mx-auto w-full max-w-[1180px] px-4 py-3 sm:px-6">
          {docOpen && (
            <div className="rise mb-3 rounded-[8px] border border-rule bg-sheet p-3">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-sm font-medium">Eigenes Kanzlei-Dokument testen</p>
                <p className="text-xs text-muted">Nur für diese Sitzung, wird nicht gespeichert.</p>
              </div>
              <input
                value={draftDoc.title}
                onChange={(e) => setDraftDoc({ ...draftDoc, title: e.target.value })}
                placeholder="Titel, z. B. Arbeitsanweisung Lohn"
                className="mt-2 w-full rounded-[8px] border border-rule bg-paper/40 px-3 py-2 text-sm outline-none focus:border-pruef"
              />
              <textarea
                value={draftDoc.text}
                onChange={(e) => setDraftDoc({ ...draftDoc, text: e.target.value })}
                placeholder="Text einfügen (Arbeitsanweisung, Mandanten-FAQ, Merkblatt …)"
                rows={5}
                className="mt-2 w-full resize-y rounded-[8px] border border-rule bg-paper/40 px-3 py-2 text-sm outline-none focus:border-pruef"
              />
              <div className="mt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setDocOpen(false)} className="rounded-[8px] px-3 py-1.5 text-sm text-ink-soft hover:text-ink">
                  Abbrechen
                </button>
                <button
                  type="button"
                  disabled={draftDoc.text.trim().length < 40}
                  onClick={() => {
                    setDocs([...docs, { title: draftDoc.title.trim() || `Dokument ${docs.length + 1}`, text: draftDoc.text }]);
                    setDraftDoc({ title: "", text: "" });
                    setDocOpen(false);
                  }}
                  className="rounded-[8px] bg-pruef px-3 py-1.5 text-sm font-medium text-white hover:bg-pruef-strong disabled:opacity-40"
                >
                  Dokument hinzufügen
                </button>
              </div>
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              ask(input);
            }}
            className="flex items-end gap-2 rounded-[12px] border border-rule bg-sheet p-2 shadow-[0_10px_30px_-20px_rgba(28,26,36,0.45)] focus-within:border-pruef"
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  ask(input);
                }
              }}
              rows={1}
              placeholder="Frage an das Kanzlei-Wissen …"
              aria-label="Frage"
              className="max-h-40 min-h-[2.5rem] flex-1 resize-none bg-transparent px-2 py-2 text-[0.95rem] outline-none placeholder:text-muted"
            />
            {busy ? (
              <button type="button" onClick={() => stop()} className="h-10 rounded-[8px] border border-rule px-4 text-sm font-medium text-ink-soft hover:text-ink">
                Stopp
              </button>
            ) : (
              <button type="submit" disabled={!input.trim()} className="h-10 rounded-[8px] bg-pruef px-5 text-sm font-medium text-white transition-colors hover:bg-pruef-strong disabled:opacity-35">
                Fragen
              </button>
            )}
          </form>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 px-1 text-[0.72rem] text-muted">
            <span>Antworten nur aus Gesetzestext und Kanzlei-Handbuch, jede Aussage mit Fundstelle.</span>
            <button type="button" onClick={() => setDocOpen((v) => !v)} className="font-medium text-ink-soft underline-offset-2 hover:text-ink hover:underline">
              + Eigenes Dokument testen
            </button>
            {docs.map((d, i) => (
              <span key={i} className="inline-flex items-center gap-1 rounded-[3px] bg-marker/70 px-1.5 py-px text-ink">
                {d.title}
                <button type="button" aria-label={`${d.title} entfernen`} onClick={() => setDocs(docs.filter((_, j) => j !== i))} className="text-ink-soft hover:text-stamp">
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Exchange({ q, a, pending }: { q: TaxHubMessage; a?: TaxHubMessage; pending: boolean }) {
  const [hover, setHover] = useState<number | null>(null);
  const [pinned, setPinned] = useState<number | null>(null);

  const question = q.parts.map((p) => (p.type === "text" ? p.text : "")).join("");
  const text = a?.parts.map((p) => (p.type === "text" ? p.text : "")).join("") ?? "";
  const sourcesPart = a?.parts.find((p) => p.type === "data-sources");
  const sources = sourcesPart?.type === "data-sources" ? sourcesPart.data.sources : [];
  const cited = useMemo(() => citedNumbers(text), [text]);

  const stage = !sources.length ? "Suche in Gesetz und Kanzlei-Handbuch …" : !text ? `${sources.length} Fundstellen gelesen – formuliere Antwort …` : null;

  return (
    <section className="grid gap-x-10 gap-y-4 lg:grid-cols-[minmax(0,1fr)_340px]">
      <div className="min-w-0">
        <p className="font-display text-[1.55rem] font-medium leading-[1.2] text-ink">
          <span className="mr-2 font-mono text-[0.7rem] uppercase tracking-[0.12em] text-muted">Frage</span>
          {question}
        </p>
        <div className="mt-4 rounded-[8px] border border-rule bg-sheet px-5 py-4 sm:px-6 sm:py-5">
          {text ? (
            <Answer
              text={text}
              activeSource={hover ?? pinned}
              onCite={(n, pin) => {
                if (pin) setPinned(n === pinned ? null : n);
                else setHover(n);
              }}
            />
          ) : (
            <p className="flex items-center gap-2 text-sm text-muted">
              <span className="pulse-dot inline-block h-1.5 w-1.5 rounded-full bg-pruef" />
              {pending ? stage : "Keine Antwort erhalten."}
            </p>
          )}
        </div>
      </div>
      <aside className="min-w-0 lg:sticky lg:top-24 lg:max-h-[calc(100vh-15rem)] lg:self-start lg:overflow-y-auto lg:pr-1">
        {sources.length > 0 && (
          <>
            <p className="mb-2 font-mono text-[0.68rem] uppercase tracking-[0.12em] text-muted">Fundstellen</p>
            <SourceMargin sources={sources} cited={text && !pending ? cited : undefined} activeSource={hover} pinned={pinned} onHover={setHover} compact={false} />
          </>
        )}
      </aside>
    </section>
  );
}

function EmptyState({ onPick }: { onPick: (q: string) => void }) {
  return (
    <div className="grid gap-10 pt-10 lg:grid-cols-[minmax(0,1fr)_340px]">
      <div>
        <h1 className="font-display text-[clamp(2.4rem,4.8vw,3.6rem)] font-medium leading-[1.02] tracking-[-0.01em] text-ink">
          Fragen Sie Ihr Kanzlei-Wissen.
          <br />
          <span className="text-ink-soft">Jede Antwort mit Paragraf.</span>
        </h1>
        <p className="mt-4 max-w-[58ch] text-[0.98rem] leading-relaxed text-ink-soft">
          TaxHub durchsucht den amtlichen Text von AO, EStG, UStG, StBVV und weiteren Steuergesetzen sowie Ihre internen Arbeitsanweisungen – und antwortet nur, was sich belegen lässt.
        </p>
        <ul className="mt-8 flex flex-col divide-y divide-rule border-y border-rule">
          {EXAMPLES.map((e) => (
            <li key={e.q}>
              <button type="button" onClick={() => onPick(e.q)} className="group flex w-full items-baseline gap-4 py-3.5 text-left">
                <span className="w-16 shrink-0 font-mono text-[0.68rem] uppercase tracking-[0.1em] text-muted group-hover:text-pruef">{e.tag}</span>
                <span className="text-[0.95rem] leading-snug text-ink group-hover:underline group-hover:decoration-rule group-hover:underline-offset-4">{e.q}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
      <aside className="hidden lg:block">
        <p className="mb-2 font-mono text-[0.68rem] uppercase tracking-[0.12em] text-muted">So sieht eine Fundstelle aus</p>
        <div className="rounded-[8px] border border-rule bg-sheet px-3.5 py-3 opacity-80">
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-[0.7rem] font-semibold text-pruef">1</span>
            <span className="font-mono text-[0.78rem] font-medium">§ 355 AO</span>
          </div>
          <p className="mt-0.5 text-[0.78rem] text-ink-soft">Einspruchsfrist</p>
          <p className="mt-2 text-[0.78rem] leading-relaxed">
            (1) Der Einspruch nach § 347 Absatz 1 Satz 1 ist innerhalb eines Monats nach Bekanntgabe des Verwaltungsakts einzulegen. …
          </p>
          <p className="mt-2 text-right text-[0.7rem] font-medium text-pruef">Amtlicher Text ↗</p>
        </div>
        <p className="mt-3 text-[0.78rem] leading-relaxed text-muted">
          Zahlen im Antworttext verweisen auf diese Karten. Ein Klick öffnet den amtlichen Wortlaut auf gesetze-im-internet.de.
        </p>
      </aside>
    </div>
  );
}
