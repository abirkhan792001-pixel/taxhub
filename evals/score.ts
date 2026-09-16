// Combines the evaluation results into the TaxHub Case Readiness Score (see evals/rubric.md).
// Usage: npm run eval:score
import { readFileSync, writeFileSync } from "node:fs";

const load = <T>(p: string): T => JSON.parse(readFileSync(p, "utf8")) as T;

type Live = {
  summary: {
    ask: { cases: number; passed: number; retrievalRecall: number; expectedSourceCited: number; citationCoverage: number; answersWithoutInvalidCitations: number; keyFactAccuracy: number; abstentionAccuracy: number; sessionDocumentPass: boolean; languageMatch: number; medianTotalMs: number; medianTtftMs: number };
    intake: { cases: number; passed: number; categoryAccuracy: number; deadlineAccuracy: number; datedDeadlineAccuracy: number; draftQuality: number; checklistCitationCoverage: number; medianTotalMs: number };
  };
  ask: { id: string; pass: boolean; missingFacts: string[]; forbiddenFacts: string[]; invalidCitations: number[]; retrieved: boolean | null; expectedCited: boolean | null; abstained: boolean; scope: string; citationCoverage: number | null }[];
  intake: { id: string; pass: boolean; categoryCorrect: boolean; category: string; expectedCategory: string; deadlineCorrect: boolean; draftQualityOk: boolean; missingFacts: string[]; draftForbidden: string[]; invalidCitations: number[] }[];
};
type Deliverables = {
  routesAll200: boolean;
  routes: Record<string, number>;
  repo: { visibility: string; readmeLinksLiveDemo: boolean; coAuthoredCommits: number; totalCommitsSeen: number; createdForCase: boolean };
  corpus: { lawSources: number; lawChunks: number; firmChunks: number };
  onePager: { A1_marketStructure: boolean; A2_icpDefined: boolean; A3_wtpEvidenced: boolean; A4_incumbentAndGap: boolean; D1_buildFirst: boolean; D2_threeMoves: boolean; D3_threeObjections: boolean; D5_numericClaims: number; D5_supported: number; englishShare: number };
  speech: null | { estimatedDurationSec: number; underFiveMinutes: boolean; firstPainQuestionSec: number; painWithin60s: boolean; hasOpening: boolean; valueInNumbers: boolean; pushbackHandled: boolean; concreteNextStep: boolean };
};

const live = load<Live>("evals/results/live.json");
const del = load<Deliverables>("evals/results/deliverables.json");
const retrieval = load<{ cases: number; hit3: number; hit8: number }>("evals/results/retrieval.json");
const deadlines = load<{ passed: number; total: number }>("evals/results/deadlines.json");
const manual = load<{ onePagePrint: { verified: boolean; evidence: string }; sentToCito: { done: boolean; evidence: string }; loomRecorded: { done: boolean; evidence: string } }>("evals/manual.json");

const pct = (x: number | null | undefined) => (x == null ? "–" : `${Math.round(x * 100)} %`);
const round = (x: number) => Math.round(x * 10) / 10;
const a = live.summary.ask;
const i = live.summary.intake;

type Item = { id: string; criterion: string; max: number; points: number; evidence: string };
const items: Item[] = [];
const add = (id: string, criterion: string, max: number, points: number, evidence: string) => items.push({ id, criterion, max, points: round(Math.max(0, Math.min(max, points))), evidence });

// A · vertical
add("A1", "Market and structure argued with sourced figures", 2.5, del.onePager.A1_marketStructure ? 2.5 : 0, "One-pager ‘Why Steuerberater first’ with footnoted BStBK and STAX figures");
add("A2", "ICP defined", 2.5, del.onePager.A2_icpDefined ? 2.5 : 0, "Size band 15–60 staff, BAG structure, buyer and champion named");
add("A3", "Willingness to pay evidenced", 2.5, del.onePager.A3_wtpEvidenced ? 2.5 : 0, "Competitor and adjacent prices with sources; price hypothesis marked as assumption");
add("A4", "Incumbent and gap named", 2.5, del.onePager.A4_incumbentAndGap ? 2.5 : 0, "DATEV figures and Copilot scope sourced; gap stated");

// B · build
const retrievalShare = retrieval.hit8 / retrieval.cases;
add("B1", "Live and shipped with a repo", 5, (del.routesAll200 ? 3 : 0) + (del.repo.visibility === "public" ? 1 : 0) + (del.repo.readmeLinksLiveDemo ? 1 : 0), `Routes ${Object.entries(del.routes).map(([r, s]) => `${r} ${s}`).join(", ")}; repo ${del.repo.visibility}, README links the demo: ${del.repo.readmeLinksLiveDemo}`);
add("B2", "Real material, not a hardcoded demo", 8, (del.corpus.lawSources >= 5 ? 3 : 0) + (a.sessionDocumentPass ? 3 : 0) + 2 * Math.min(1, retrievalShare / 0.9), `${del.corpus.lawSources} official statute sources, ${del.corpus.lawChunks} passages; unseen pasted document answered with citation: ${a.sessionDocumentPass}; retrieval hit@8 ${retrieval.hit8}/${retrieval.cases}`);
add("B3", "Grounded and source-cited", 12, 3 * a.retrievalRecall + 3 * a.expectedSourceCited + 3 * Math.min(1, a.citationCoverage / 0.8) + 3 * a.answersWithoutInvalidCitations, `Expected source retrieved ${pct(a.retrievalRecall)}, cited ${pct(a.expectedSourceCited)}; citation coverage ${pct(a.citationCoverage)}; answers without invalid citations ${pct(a.answersWithoutInvalidCitations)}`);
add("B4", "Honest when the sources are silent", 5, 5 * a.abstentionAccuracy, `Out-of-scope questions answered with an explicit ‘not in the sources’ and no memorised fact: ${pct(a.abstentionAccuracy)}`);
add("B5", "Genuinely useful answers", 6, 4 * a.keyFactAccuracy + 2 * i.categoryAccuracy, `Key facts correct ${pct(a.keyFactAccuracy)} of in-scope questions; intake category accuracy ${pct(i.categoryAccuracy)}`);
add("B6", "Proactive output (stretch)", 4, 2 * i.datedDeadlineAccuracy * (deadlines.passed / deadlines.total) + 2 * i.draftQuality, `Objection deadline exact on dated cases ${pct(i.datedDeadlineAccuracy)}, deadline unit tests ${deadlines.passed}/${deadlines.total}; reply drafts pass quality checks ${pct(i.draftQuality)}`);

// D · one-pager
add("D1", "Build-first section present", 2, del.onePager.D1_buildFirst ? 2 : 0, "‘What I would build first’ with a concrete scope");
add("D2", "First 30 days as exactly three moves", 3, del.onePager.D2_threeMoves ? 3 : 0, "Three moves, each with a day range");
add("D3", "Three hardest objections, each with an answer", 3, del.onePager.D3_threeObjections ? 3 : 0, "Three objection and answer pairs");
add("D4", "It is one page", 2, manual.onePagePrint.verified ? 2 : 0, manual.onePagePrint.evidence);
add("D5", "Grounded, not invented", 10, del.onePager.D5_numericClaims ? (10 * del.onePager.D5_supported) / del.onePager.D5_numericClaims : 0, `${del.onePager.D5_supported}/${del.onePager.D5_numericClaims} blocks with figures carry a footnote or an assumption marker`);

// E · rules
add("E1", "Built with Claude Code / AI tooling", 2, del.repo.coAuthoredCommits > 0 ? 2 : 0, `${del.repo.coAuthoredCommits} of ${del.repo.totalCommitsSeen} commits co-authored by Claude`);
add("E2", "Language English", 1, del.onePager.englishShare > 0.8 ? 1 : 0, `One-pager ${pct(del.onePager.englishShare)} English function words; README in English`);
add("E3", "Something new, not NOAH", 1, del.repo.createdForCase ? 1 : 0, "Repository created after the case was received");
add("E4", "Sent back", 1, manual.sentToCito.done ? 1 : 0, manual.sentToCito.evidence);

const earned = round(items.reduce((s, x) => s + x.points, 0));
const assessable = items.reduce((s, x) => s + x.max, 0);
const share = earned / assessable;
const band = share >= 0.9 ? "Ready to send" : share >= 0.75 ? "Send after fixing the named gaps" : "Not ready";

const loomReadiness = del.speech && {
  estimatedDuration: `${Math.floor(del.speech.estimatedDurationSec / 60)}:${String(del.speech.estimatedDurationSec % 60).padStart(2, "0")}`,
  checks: {
    "Opening with a time box": del.speech.hasOpening,
    [`First pain question by ~0:${String(del.speech.firstPainQuestionSec).padStart(2, "0")}`]: del.speech.painWithin60s,
    "Value framed in the buyer's numbers": del.speech.valueInNumbers,
    "Pushback handled": del.speech.pushbackHandled,
    "Concrete next step with a date": del.speech.concreteNextStep,
    "Estimated under 5:00": del.speech.underFiveMinutes,
  },
};

const failures = [
  ...live.ask.filter((x) => !x.pass).map((x) => `ask/${x.id}: ${[x.retrieved === false && "expected source not retrieved", x.expectedCited === false && "expected source not cited", x.invalidCitations.length && `invalid citations ${x.invalidCitations}`, x.missingFacts.length && `missing ${x.missingFacts.join(", ")}`, x.forbiddenFacts.length && `contains forbidden ${x.forbiddenFacts.join(", ")}`, x.scope === "out" && !x.abstained && "did not state that the sources are silent"].filter(Boolean).join("; ")}`),
  ...live.intake.filter((x) => !x.pass).map((x) => `intake/${x.id}: ${[!x.categoryCorrect && `category ${x.category} instead of ${x.expectedCategory}`, !x.deadlineCorrect && "deadline wrong", !x.draftQualityOk && `draft check failed${x.draftForbidden.length ? ` (${x.draftForbidden.join(", ")})` : ""}`, x.invalidCitations.length && `invalid citations ${x.invalidCitations}`, x.missingFacts.length && `missing ${x.missingFacts.join(", ")}`].filter(Boolean).join("; ")}`),
];

const scorecard = {
  scoredAt: new Date().toISOString(),
  earned,
  assessable,
  share,
  band,
  pending: { loom: 25, note: manual.loomRecorded.evidence },
  blocks: ["A", "B", "D", "E"].map((b) => ({ block: b, earned: round(items.filter((x) => x.id.startsWith(b)).reduce((s, x) => s + x.points, 0)), max: items.filter((x) => x.id.startsWith(b)).reduce((s, x) => s + x.max, 0) })),
  items,
  productMetrics: {
    askCasesPassed: `${a.passed}/${a.cases}`,
    intakeCasesPassed: `${i.passed}/${i.cases}`,
    medianAnswerSeconds: round(a.medianTotalMs / 1000),
    medianFirstTokenSeconds: round(a.medianTtftMs / 1000),
    medianIntakeSeconds: round(i.medianTotalMs / 1000),
    englishQuestionAnsweredInEnglish: pct(a.languageMatch),
    checklistItemsWithCitation: pct(i.checklistCitationCoverage),
    deadlineUnitTests: `${deadlines.passed}/${deadlines.total}`,
    retrievalHit3: `${retrieval.hit3}/${retrieval.cases}`,
    retrievalHit8: `${retrieval.hit8}/${retrieval.cases}`,
  },
  failures,
  loomReadiness,
};

writeFileSync("evals/results/scorecard.json", JSON.stringify(scorecard, null, 2));

const md = [
  `# TaxHub Case Readiness Score`,
  ``,
  `**${earned} / ${assessable} assessable points (${pct(share)}) · ${band}.** The Loom (25 points) is pending: ${manual.loomRecorded.evidence.toLowerCase()}.`,
  ``,
  `Scored ${scorecard.scoredAt.slice(0, 16).replace("T", " ")} UTC against the live deployment. Metric definition: [rubric.md](../rubric.md).`,
  ``,
  `| Block | Points |`,
  `| --- | --- |`,
  ...scorecard.blocks.map((b) => `| ${b.block} | ${b.earned} / ${b.max} |`),
  `| C · Loom | pending / 25 |`,
  ``,
  `| ID | Criterion | Points | Evidence |`,
  `| --- | --- | --- | --- |`,
  ...items.map((x) => `| ${x.id} | ${x.criterion} | ${x.points} / ${x.max} | ${x.evidence} |`),
  ``,
  `## Product metrics`,
  ``,
  ...Object.entries(scorecard.productMetrics).map(([k, v]) => `- ${k}: **${v}**`),
  ``,
  `## Failed cases`,
  ``,
  ...(failures.length ? failures.map((f) => `- ${f}`) : ["- none"]),
  ``,
  `## Loom readiness (preparation only, no points)`,
  ``,
  ...(loomReadiness ? [`Estimated duration ${loomReadiness.estimatedDuration}.`, ``, ...Object.entries(loomReadiness.checks).map(([k, v]) => `- ${v ? "✓" : "✗"} ${k}`)] : ["- speech not checked"]),
  ``,
].join("\n");
writeFileSync("evals/results/scorecard.md", md);
console.log(md);
