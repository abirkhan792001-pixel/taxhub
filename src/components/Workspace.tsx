"use client";

import { useEffect, useState } from "react";
import { AskView } from "./AskView";
import { IntakeView } from "./IntakeView";

type Tab = "wissen" | "posteingang" | "quellen";

const TABS: { id: Tab; label: string }[] = [
  { id: "wissen", label: "Wissen fragen" },
  { id: "posteingang", label: "Posteingang" },
  { id: "quellen", label: "Quellen" },
];

export function Workspace({ totalChunks, stand, sourcesView }: { totalChunks: number; stand: string; sourcesView: React.ReactNode }) {
  const [tab, setTab] = useState<Tab>("wissen");

  useEffect(() => {
    const sync = () => {
      const fromHash = window.location.hash.slice(1) as Tab;
      if (TABS.some((t) => t.id === fromHash)) setTab(fromHash);
    };
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  const select = (t: Tab) => {
    setTab(t);
    history.replaceState(null, "", `#${t}`);
    window.scrollTo({ top: 0 });
  };

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-rule bg-paper/92 backdrop-blur">
        <div className="mx-auto flex w-full max-w-[1180px] flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-3 sm:px-6">
          <div className="flex items-baseline gap-3">
            <span className="font-display text-[1.35rem] font-semibold tracking-[-0.02em] text-ink">
              Tax<span className="text-pruef">Hub</span>
            </span>
            <span className="hidden text-[0.78rem] text-muted sm:inline">Kanzlei Muster · Demo</span>
          </div>
          <nav aria-label="Bereiche" className="order-3 flex w-full gap-1 sm:order-none sm:w-auto">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => select(t.id)}
                aria-current={tab === t.id ? "page" : undefined}
                className={`rounded-[4px] px-3 py-1.5 text-[0.86rem] transition-colors ${tab === t.id ? "bg-ink text-sheet" : "text-ink-soft hover:bg-sheet hover:text-ink"}`}
              >
                {t.label}
              </button>
            ))}
          </nav>
          <p className="hidden font-mono text-[0.7rem] text-muted md:block">
            {totalChunks.toLocaleString("de-DE")} Fundstellen · Gesetze Stand {stand}
          </p>
        </div>
      </header>
      <main>
        <div hidden={tab !== "wissen"}>
          <AskView />
        </div>
        <div hidden={tab !== "posteingang"}>
          <IntakeView />
        </div>
        <div hidden={tab !== "quellen"}>{sourcesView}</div>
      </main>
    </>
  );
}
