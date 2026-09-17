// Re-applies the current metric definitions to stored answers (no API calls), so every run —
// baseline included — is judged by the same, strictest version of the metric.
// Usage: npm run eval:rescore
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { ASK_CASES, HOLDOUT_CASES, HOLDOUT_V2_CASES } from "./cases";
import { scoreAsk, summarize, type AskResult, type IntakeResult } from "./metrics";

const cases = new Map([...ASK_CASES, ...HOLDOUT_CASES, ...HOLDOUT_V2_CASES].map((c) => [c.id, c]));
const files = [
  ...readdirSync("evals/results").filter((f) => f.endsWith(".json") && !["retrieval.json", "deadlines.json", "deliverables.json", "scorecard.json"].includes(f)).map((f) => `evals/results/${f}`),
  "evals/results/baseline/live.json",
];

for (const file of files) {
  const data = JSON.parse(readFileSync(file, "utf8")) as { summary: { base: string; ranAt: string }; ask: (AskResult & { incomplete?: boolean })[]; intake: IntakeResult[] };
  const before = data.ask.filter((a) => a.pass).length;
  data.ask = data.ask.map((a) => {
    const c = cases.get(a.id);
    if (!c) return a;
    return scoreAsk(c, { text: a.answer, sources: a.sources, ttftMs: a.ttftMs, totalMs: a.totalMs, errors: a.errors, toolCalls: a.toolCalls, finished: a.incomplete === undefined ? true : !a.incomplete });
  });
  const after = data.ask.filter((a) => a.pass).length;
  const summary = summarize(data.summary.base, data.summary.ranAt, data.ask, data.intake);
  writeFileSync(file, JSON.stringify({ summary, ask: data.ask, intake: data.intake }, null, 2));
  console.log(`${file.padEnd(46)} ask passed ${before} → ${after} of ${data.ask.length}${before !== after ? "   (changed by stricter metric)" : ""}`);
}
