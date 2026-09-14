import { Workspace } from "@/components/Workspace";
import { corpusStats } from "@/lib/search";

export default function Home() {
  const stats = corpusStats();
  const laws = stats.bySource.filter(([abbr]) => abbr !== "Kanzlei" && abbr !== "AO (EN)");
  const latest = laws.map(([, s]) => s.stand).filter(Boolean).sort((a, b) => b!.split(".").reverse().join("").localeCompare(a!.split(".").reverse().join("")))[0] ?? "";
  const slugByAbbr = new Map(stats.sources.map((s) => [s.abbr, s.slug]));

  const sourcesView = (
    <div className="mx-auto w-full max-w-[1180px] px-4 pb-24 pt-8 sm:px-6">
      <div className="grid gap-x-10 gap-y-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div>
          <h1 className="font-display text-[clamp(1.5rem,3vw,2.1rem)] font-medium leading-tight tracking-[-0.01em]">Worauf sich jede Antwort stützt.</h1>
          <p className="mt-2 max-w-[62ch] text-[0.95rem] leading-relaxed text-ink-soft">
            Der Wissensbestand wird automatisiert aus dem amtlichen XML-Angebot von gesetze-im-internet.de (Bundesministerium der Justiz) aufgebaut, pro Paragraf bzw. Absatz zerlegt und mit Link zum amtlichen Wortlaut versehen. Dazu kommen die internen Dokumente der Kanzlei.
          </p>

          <h2 className="mt-8 font-mono text-[0.7rem] font-medium uppercase tracking-[0.12em] text-muted">Gesetze und Verordnungen</h2>
          <div className="mt-2 overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-[0.88rem]">
              <thead>
                <tr className="text-[0.72rem] uppercase tracking-[0.08em] text-muted">
                  <th className="pb-2 pr-4 font-medium">Norm</th>
                  <th className="pb-2 pr-4 font-medium">Bezeichnung</th>
                  <th className="pb-2 pr-4 text-right font-medium">Fundstellen</th>
                  <th className="pb-2 font-medium">Stand</th>
                </tr>
              </thead>
              <tbody>
                {stats.bySource
                  .filter(([abbr]) => abbr !== "Kanzlei")
                  .map(([abbr, s]) => (
                    <tr key={abbr} className="border-t border-rule">
                      <td className="py-2 pr-4 font-mono text-[0.8rem] font-medium">{abbr}</td>
                      <td className="py-2 pr-4">
                        <a
                          href={abbr === "AO (EN)" ? "https://www.gesetze-im-internet.de/englisch_ao/" : `https://www.gesetze-im-internet.de/${slugByAbbr.get(abbr)}/`}
                          target="_blank"
                          rel="noreferrer"
                          className="underline decoration-rule underline-offset-2 hover:decoration-ink"
                        >
                          {s.name}
                        </a>
                      </td>
                      <td className="py-2 pr-4 text-right font-mono text-[0.8rem]">{s.chunks.toLocaleString("de-DE")}</td>
                      <td className="py-2 font-mono text-[0.8rem] text-ink-soft">{s.stand ?? "Übersetzung"}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          <h2 className="mt-10 font-mono text-[0.7rem] font-medium uppercase tracking-[0.12em] text-muted">Kanzlei-Handbuch (Beispielkanzlei)</h2>
          <ul className="mt-2 divide-y divide-rule border-y border-rule">
            {[
              ["01-fristenmanagement", "Kanzlei-Handbuch – Fristenmanagement"],
              ["02-mandanten-faq-belege", "Mandanten-FAQ – Unterlagen für die Einkommensteuererklärung"],
              ["03-honorar-und-auftrag", "Honorarrichtlinie und Auftragsannahme"],
              ["04-telefonleitfaden-sekretariat", "Telefonleitfaden Sekretariat"],
            ].map(([slug, title]) => (
              <li key={slug} className="flex items-baseline justify-between gap-4 py-2.5 text-[0.9rem]">
                <a href={`/kanzlei/${slug}`} className="underline decoration-rule underline-offset-2 hover:decoration-ink">
                  {title}
                </a>
                <span className="shrink-0 rounded-[3px] bg-marker/70 px-1.5 py-px text-[0.7rem]">Beispiel</span>
              </li>
            ))}
          </ul>
          <p className="mt-2 max-w-[62ch] text-[0.8rem] leading-relaxed text-muted">
            Die Kanzlei Muster ist fiktiv. Ihre Dokumente zeigen, wie eigene Arbeitsanweisungen neben dem Gesetz durchsuchbar werden. Im Reiter „Wissen fragen“ lässt sich zusätzlich ein eigenes Dokument für die laufende Sitzung einfügen.
          </p>
        </div>

        <aside className="text-[0.84rem] leading-relaxed text-ink-soft">
          <p className="font-mono text-[0.68rem] uppercase tracking-[0.12em] text-muted">So entsteht eine Antwort</p>
          <ol className="mt-3 flex flex-col gap-3">
            <li>
              <span className="font-medium text-ink">1 · Suchplan.</span> Ein schnelles Modell übersetzt die Frage in Fachbegriffe und vermutete Paragrafen.
            </li>
            <li>
              <span className="font-medium text-ink">2 · Retrieval.</span> Volltextsuche (BM25, deutsche Wortformen) über alle Fundstellen; genannte Paragrafen werden nur übernommen, wenn es sie im amtlichen Text wirklich gibt.
            </li>
            <li>
              <span className="font-medium text-ink">3 · Antwort.</span> Das Antwortmodell sieht ausschließlich diese Fundstellen und muss jede Aussage mit [n] belegen, sonst sagt es, dass die Quellen nichts hergeben.
            </li>
            <li>
              <span className="font-medium text-ink">4 · Prüfung.</span> Jede Zahl im Text führt zur Karte mit dem Wortlaut, jede Karte zum amtlichen Text.
            </li>
          </ol>
          <p className="mt-6 font-mono text-[0.7rem] text-muted">Index erstellt: {new Date(stats.builtAt).toLocaleString("de-DE", { timeZone: "Europe/Berlin" })}</p>
        </aside>
      </div>
    </div>
  );

  return <Workspace totalChunks={stats.total} stand={latest} sourcesView={sourcesView} />;
}
