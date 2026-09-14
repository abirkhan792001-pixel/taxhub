"use client";

import { useEffect, useRef, useState } from "react";
import type { SourceCard } from "@/lib/ai";

export function SourceMargin({
  sources,
  cited,
  activeSource,
  pinned,
  onHover,
  compact = false,
}: {
  sources: SourceCard[];
  cited?: Set<number>;
  activeSource: number | null;
  pinned?: number | null;
  onHover?: (n: number | null) => void;
  compact?: boolean;
}) {
  const refs = useRef(new Map<number, HTMLElement>());
  const [showUncited, setShowUncited] = useState(false);

  useEffect(() => {
    if (pinned == null) return;
    refs.current.get(pinned)?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [pinned]);

  // once the answer exists, lead with the sources it actually cites
  const primary = cited && cited.size ? sources.filter((s) => cited.has(s.n)) : sources;
  const rest = cited && cited.size ? sources.filter((s) => !cited.has(s.n)) : [];

  const card = (s: SourceCard, i: number) => (
    <article
      key={s.id}
      ref={(el) => {
        if (el) refs.current.set(s.n, el);
      }}
      id={`card-${s.n}`}
      data-active={activeSource === s.n || pinned === s.n}
      onMouseEnter={() => onHover?.(s.n)}
      onMouseLeave={() => onHover?.(null)}
      className="margin-card rise rounded-[4px] border border-rule bg-sheet px-3.5 py-3 transition-shadow"
      style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}
    >
      <header className="flex items-baseline gap-2">
        <span className="font-mono text-[0.7rem] font-semibold text-pruef">{s.n}</span>
        <span className="font-mono text-[0.78rem] font-medium text-ink">{s.ref}</span>
      </header>
      <p className="mt-0.5 text-[0.78rem] leading-snug text-ink-soft">
        {s.title}
        {s.kind === "firm" && <span className="ml-1.5 rounded-[3px] bg-marker/70 px-1 py-px text-[0.66rem] font-medium text-ink">Kanzlei</span>}
        {s.lang === "en" && <span className="ml-1.5 rounded-[3px] bg-paper px-1 py-px text-[0.66rem] font-medium text-ink-soft">EN · nicht amtlich</span>}
      </p>
      <p className={`mt-2 whitespace-pre-line text-[0.78rem] leading-relaxed text-ink ${compact ? "line-clamp-4" : "line-clamp-[9]"}`}>{s.excerpt}</p>
      <footer className="mt-2 flex items-center justify-between gap-2 text-[0.7rem] text-muted">
        <span>{s.kind === "firm" ? s.sourceName : s.stand ? `Stand ${s.stand}` : "gesetze-im-internet.de"}</span>
        {s.url && (
          <a href={s.url} target="_blank" rel="noreferrer" className="font-medium text-pruef underline-offset-2 hover:underline">
            {s.kind === "firm" ? "Dokument öffnen" : "Amtlicher Text"} ↗
          </a>
        )}
      </footer>
    </article>
  );

  return (
    <div className="flex flex-col gap-2.5">
      {primary.map(card)}
      {rest.length > 0 && (
        <button
          type="button"
          onClick={() => setShowUncited((v) => !v)}
          className="self-start rounded-[4px] px-1 py-1 text-left text-[0.75rem] text-muted hover:text-ink"
        >
          {showUncited ? "Weitere Fundstellen ausblenden" : `+ ${rest.length} weitere Fundstellen durchsucht, aber nicht zitiert`}
        </button>
      )}
      {showUncited && rest.map(card)}
    </div>
  );
}
