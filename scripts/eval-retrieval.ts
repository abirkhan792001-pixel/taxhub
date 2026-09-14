// Retrieval regression check: does the right norm show up in the top results?
// Run: npm run eval   (no API key needed – tests the search layer only)
import { retrieve } from "../src/lib/search";

type Case = { q: string[]; expect: string[] };

// queries are phrased the way the planner model (or a clerk) would search
const CASES: Case[] = [
  { q: ["Einspruchsfrist Steuerbescheid", "Bekanntgabe Verwaltungsakt Post vierter Tag"], expect: ["AO-355", "AO-122"] },
  { q: ["Abgabefrist Steuererklärung Steuerberater", "Frist beratene Steuerpflichtige letzter Tag Februar"], expect: ["AO-149"] },
  { q: ["Verspätungszuschlag Höhe Monat"], expect: ["AO-152"] },
  { q: ["Kleinunternehmer Umsatzgrenze"], expect: ["UStG-19"] },
  { q: ["Handwerkerleistungen Steuerermäßigung Zahlung Konto"], expect: ["EStG-35a"] },
  { q: ["Gebühr Anfertigung Einkommensteuererklärung Steuerberater"], expect: ["StBVV-24"] },
  { q: ["Fristverlängerung Steuererklärung Antrag"], expect: ["AO-109"] },
  { q: ["Festsetzungsfrist Beginn Ablauf"], expect: ["AO-169", "AO-170"] },
  { q: ["Aufbewahrungsfrist Buchungsbelege zehn Jahre"], expect: ["AO-147"] },
  { q: ["Rechnung Pflichtangaben Umsatzsteuer"], expect: ["UStG-14"] },
  { q: ["Homeoffice Pauschale Tagespauschale"], expect: ["EStG-4"] },
  { q: ["Entfernungspauschale erste Tätigkeitsstätte"], expect: ["EStG-9"] },
  { q: ["Selbstanzeige Steuerhinterziehung Straffreiheit"], expect: ["AO-371"] },
  { q: ["Änderung Steuerbescheid neue Tatsachen"], expect: ["AO-173"] },
  { q: ["Übergangsregelung Abgabefrist Besteuerungszeitraum 2024"], expect: ["EGAO-Art_97_36"] },
  { q: ["Einspruch Frist Telefonleitfaden Sekretariat Bescheid Mandant ruft an"], expect: ["KB-01-fristenmanagement", "KB-04-telefonleitfaden"] },
  { q: ["§ 233a AO Nachzahlungszinsen"], expect: ["AO-233a"] },
];

let hit3 = 0;
let hit8 = 0;
for (const c of CASES) {
  const t0 = performance.now();
  const r = retrieve({ queries: c.q });
  const ms = performance.now() - t0;
  const rankOf = (e: string) => r.findIndex((x) => x.id === e || x.id.startsWith(`${e}-`) || (e.startsWith("KB-") && x.id.startsWith(e)));
  const ranks = c.expect.map(rankOf);
  const best = Math.min(...ranks.map((x) => (x < 0 ? 99 : x)));
  if (best < 3) hit3++;
  if (best < 8) hit8++;
  const mark = best < 3 ? "✓" : best < 8 ? "~" : "✗";
  console.log(`${mark} ${c.q[0].padEnd(55)} expect ${c.expect.join(",").padEnd(40)} rank ${ranks.map((x) => (x < 0 ? "-" : x + 1)).join(",")}  ${ms.toFixed(0)}ms`);
  if (best >= 3) console.log("    top:", r.slice(0, 5).map((x) => x.ref).join(" | "));
}
console.log(`\nhit@3 ${hit3}/${CASES.length}   hit@8 ${hit8}/${CASES.length}`);
