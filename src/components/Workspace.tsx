"use client";

import Link from "next/link";
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
      <header className="sticky top-0 z-30 border-b border-rule bg-sheet/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-[1180px] flex-wrap items-center justify-between gap-x-6 px-4 sm:px-6">
          <div className="flex items-center gap-3 py-3.5">
            <Link href="/" className="text-[1.35rem] font-bold lowercase tracking-[-0.03em] text-ink" aria-label="TaxHub Startseite">
              taxhub
            </Link>
            <span className="hidden rounded-full bg-pruef-wash px-2.5 py-0.5 text-[0.7rem] font-medium text-pruef sm:inline">Live-Demo · Kanzlei Muster</span>
          </div>
          <nav aria-label="Bereiche" className="order-3 -mb-px flex w-full gap-6 sm:order-none sm:w-auto">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => select(t.id)}
                aria-current={tab === t.id ? "page" : undefined}
                className={`border-b-2 pb-3 pt-1 text-[0.92rem] transition-colors sm:py-[1.15rem] ${
                  tab === t.id ? "border-pruef font-medium text-ink" : "border-transparent text-ink-soft hover:text-ink"
                }`}
              >
                {t.label}
              </button>
            ))}
          </nav>
          <div className="hidden items-center gap-5 md:flex">
            <p className="font-mono text-[0.68rem] text-muted">
              {totalChunks.toLocaleString("de-DE")} Fundstellen · Stand {stand}
            </p>
            <Link href="/" className="text-[0.86rem] text-ink-soft hover:text-ink">
              Zur Website
            </Link>
          </div>
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
