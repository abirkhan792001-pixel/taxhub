"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type Lang = "de" | "en";

const LangContext = createContext<{ lang: Lang; setLang: (l: Lang) => void }>({
  lang: "de",
  setLang: () => {},
});

const STORAGE_KEY = "taxhub-lang";

export function LangProvider({ children }: { children: React.ReactNode }) {
  // Always start "de" so the server and first client render agree (no hydration mismatch).
  const [lang, setLang] = useState<Lang>("de");

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "en" || stored === "de") setLang(stored);
    } catch {
      /* private mode / blocked storage */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      /* ignore */
    }
    document.documentElement.lang = lang;
  }, [lang]);

  return <LangContext.Provider value={{ lang, setLang }}>{children}</LangContext.Provider>;
}

export function useLang() {
  return useContext(LangContext);
}

// Segmented DE · EN switch, styled to sit in either the light nav or a dark surface.
export function LangToggle({ tone = "light" }: { tone?: "light" | "dark" }) {
  const { lang, setLang } = useLang();
  const base = tone === "dark" ? "border-white/30 text-white/70" : "border-rule text-muted";
  const active = tone === "dark" ? "bg-white/15 text-white" : "bg-pruef text-white";
  return (
    <div className={`inline-flex items-center rounded-[6px] border p-0.5 ${base}`} role="group" aria-label="Sprache / Language">
      {(["de", "en"] as Lang[]).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          className={`rounded-[4px] px-2.5 py-1 text-[0.82rem] font-semibold uppercase tracking-[0.04em] transition-colors ${lang === l ? active : "hover:opacity-80"}`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
