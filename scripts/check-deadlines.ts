import { einspruchsfrist } from "../src/lib/deadlines";
for (const [d, z] of [["2026-09-10", "post"], ["2026-09-11", "post"], ["2026-09-29", "post"], ["2026-01-29", "post"], ["2026-12-18", "elektronisch"], ["2026-04-01", "post"]] as const) {
  const r = einspruchsfrist(d, z, new Date("2026-09-14"));
  console.log(d, z, "→ Bekanntgabe", r.bekanntgabe, "Fristende", r.fristende, "days", r.daysLeft);
  for (const s of r.steps) console.log("   ", s.date, s.label, "|", s.basis);
}
