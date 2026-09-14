"use client";

import Link from "next/link";
import { useState } from "react";

export function AnnouncementBar() {
  const [open, setOpen] = useState(true);
  if (!open) return null;
  return (
    <div className="relative border-b border-rule bg-paper">
      <div className="mx-auto flex w-full max-w-[1280px] items-center justify-center gap-3 px-12 py-2.5 text-center text-[0.84rem] sm:text-[0.9rem]">
        <span className="hidden shrink-0 rounded-md bg-pruef-wash px-2 py-0.5 text-[0.72rem] font-semibold uppercase tracking-[0.04em] text-pruef sm:inline">Neu</span>
        <Link href="/app#wissen" className="text-ink hover:text-pruef">
          <span className="font-semibold text-pruef">Fristen-Check</span> – TaxHub merkt, wenn ein Fristende auf einen Sonntag fällt. Jetzt live ausprobieren <span aria-hidden>→</span>
        </Link>
      </div>
      <button type="button" onClick={() => setOpen(false)} aria-label="Hinweis schließen" className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-ink-soft hover:bg-rule/60 hover:text-ink">
        <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
          <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}
