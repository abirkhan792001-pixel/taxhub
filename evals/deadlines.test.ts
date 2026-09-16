// Deterministic deadline tests. Every expected date was worked out by hand from
// § 122 Abs. 2/2a AO, § 108 Abs. 3 AO, § 355 Abs. 1 AO and § 188 BGB.
import { mkdirSync, writeFileSync } from "node:fs";
import { einspruchsfrist, pruefeFristende } from "../src/lib/deadlines";

const OBJECTION: [string, "post" | "elektronisch", string, string, string][] = [
  ["2026-09-03", "post", "2026-09-07", "2026-10-07", "Thu → Mon, no shift"],
  ["2026-09-08", "post", "2026-09-14", "2026-10-14", "notice fiction on Saturday → Monday"],
  ["2026-09-29", "post", "2026-10-05", "2026-11-05", "Saturday 3 Oct (also a holiday) → Monday"],
  ["2026-03-30", "post", "2026-04-07", "2026-05-07", "Good Friday, weekend and Easter Monday → Tuesday"],
  ["2026-12-18", "elektronisch", "2026-12-22", "2027-01-22", "electronic notice, § 122 Abs. 2a AO"],
  ["2026-12-27", "post", "2026-12-31", "2027-02-01", "deadline 31 Jan 2027 is a Sunday → Monday 1 Feb"],
  ["2027-01-27", "post", "2027-02-01", "2027-03-01", "fiction on Sunday → Monday, then one month"],
  ["2026-08-27", "post", "2026-08-31", "2026-09-30", "31 Aug + one month → 30 Sep (§ 188 Abs. 3 BGB)"],
  ["2026-02-26", "post", "2026-03-02", "2026-04-02", "day before Good Friday stays"],
];

const DAY_CHECKS: [string, boolean, string, string][] = [
  ["2027-02-28", false, "2027-03-01", "filing deadline 2025 with advisor falls on a Sunday"],
  ["2026-07-31", true, "2026-07-31", "filing deadline 2025 without advisor is a Friday"],
  ["2026-10-03", false, "2026-10-05", "Tag der Deutschen Einheit on a Saturday"],
  ["2026-12-25", false, "2026-12-28", "Christmas Day and Boxing Day, then the weekend"],
];

const results: { case: string; pass: boolean; got: string; expected: string }[] = [];
const today = new Date(Date.UTC(2026, 8, 16));

for (const [date, mode, bekanntgabe, fristende, label] of OBJECTION) {
  const r = einspruchsfrist(date, mode, today);
  const got = `${r.bekanntgabe} → ${r.fristende}`;
  const expected = `${bekanntgabe} → ${fristende}`;
  results.push({ case: `Einspruchsfrist ${date} (${label})`, pass: got === expected, got, expected });
}
for (const [date, werktag, shifted, label] of DAY_CHECKS) {
  const r = pruefeFristende(date);
  const got = "fehler" in r ? String(r.fehler) : `${r.werktag ? "Werktag" : "kein Werktag"} → ${r.fristendeNach108Abs3AO}`;
  const expected = `${werktag ? "Werktag" : "kein Werktag"} → ${shifted}`;
  results.push({ case: `Fristende ${date} (${label})`, pass: got === expected, got, expected });
}

for (const r of results) console.log(`${r.pass ? "✓" : "✗"} ${r.case}${r.pass ? "" : `\n    got ${r.got}, expected ${r.expected}`}`);
const passed = results.filter((r) => r.pass).length;
console.log(`\n${passed}/${results.length} deadline tests passed`);

mkdirSync("evals/results", { recursive: true });
writeFileSync("evals/results/deadlines.json", JSON.stringify({ passed, total: results.length, results }, null, 2));
if (passed !== results.length) process.exit(1);
