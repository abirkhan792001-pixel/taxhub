"use client";

import Link from "next/link";
import { useState } from "react";
import { useLang } from "./lang";

const COPY = {
  de: { tag: "Neu", lead: "Fristen-Check", rest: " – TaxHub merkt, wenn ein Fristende auf einen Sonntag fällt. Jetzt live ausprobieren", close: "Hinweis schließen" },
  en: { tag: "New", lead: "Deadline check", rest: " – TaxHub notices when a deadline falls on a Sunday. Try it live now", close: "Dismiss notice" },
};

export function AnnouncementBar() {
  const [open, setOpen] = useState(true);
  const { lang } = useLang();
  const t = COPY[lang];
  if (!open) return null;
  return (
    <div className="relative border-b border-rule bg-paper">
      <div className="mx-auto flex w-full max-w-[1280px] items-center justify-center gap-3 px-12 py-2.5 text-center text-[0.84rem] sm:text-[0.9rem]">
        <span className="hidden shrink-0 rounded-md bg-pruef-wash px-2 py-0.5 text-[0.72rem] font-semibold uppercase tracking-[0.04em] text-pruef sm:inline">{t.tag}</span>
        <Link href="/app#wissen" className="text-ink hover:text-pruef">
          <span className="font-semibold text-pruef">{t.lead}</span>
          {t.rest} <span aria-hidden>→</span>
        </Link>
      </div>
      <button type="button" onClick={() => setOpen(false)} aria-label={t.close} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-ink-soft hover:bg-rule/60 hover:text-ink">
        <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
          <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}
