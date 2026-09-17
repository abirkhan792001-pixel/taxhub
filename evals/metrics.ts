// Metric definitions shared by the live runner and the re-scorer (see evals/rubric.md).
import { normalizeCitations } from "../src/lib/cite";
import type { AskCase } from "./cases";

// "the sources don't cover this", in German or English
export const ABSTAIN =
  /(Quellen|Fundstellen|sources?)[^.\n]{0,90}\b(nicht|keine|keinen|nichts|kein|not|no|don['’]t)\b|\b(nicht|keine|keinen)\b[^.\n]{0,50}\b(in|aus)\s+den\s+(vorliegenden\s+|bereitgestellten\s+)?(Quellen|Fundstellen)|lässt sich[^.\n]{0,60}nicht|\bnot\s+(covered|contained|included|found|provided)\b|\bno\s+(information|provision|section)\b|existiert\s+(in\s+den\s+Quellen\s+)?nicht|nicht\s+enthalten|gibt es (in den Quellen )?keinen/i;

export type Source = { n: number; id: string; ref: string; title: string; sourceName: string; kind: string };

export type AskRun = { text: string; sources: Source[]; ttftMs: number | null; totalMs: number; errors: string[]; toolCalls: number; finished: boolean };

export const citedNumbers = (text: string) => [...new Set([...normalizeCitations(text).matchAll(/\[(\d{1,2})\]/g)].map((m) => Number(m[1])))];

export function factualSentences(text: string) {
  const lines = normalizeCitations(text)
    .replace(/\*\*|__/g, "")
    // a citation placed right after the full stop belongs to that sentence
    .replace(/([.!?])\s*((?:\[\d{1,2}\])+)/g, "$2$1")
    .split("\n")
    .map((l) => l.replace(/^\s*(?:[-*•]|\d+\.)\s+/, "").trim())
    .filter((l) => l && !/^#{1,6}\s/.test(l) && !/:\s*$/.test(l));
  // split at sentence ends, but not after ordinals and dates ("31. Juli") or legal abbreviations ("Abs.", "i. V. m.")
  return lines
    .flatMap((l) => l.split(/(?<=[^\d\s][.!?])(?<!\b(?:[A-Za-z]|Abs|Nr|Art|bzw|ggf|vgl|inkl|evtl|ca|Tz|Rn)\.)\s+(?=[A-ZÄÖÜ„"(])/))
    .map((s) => s.trim())
    .filter((s) => s.length >= 30 && !ABSTAIN.test(s));
}

// the short answer the reader acts on: the first paragraph, before any details or bullet list
export function leadOf(text: string) {
  const paragraphs = text.trim().split(/\n\s*\n|\n(?=\s*[-*•]\s)/);
  return paragraphs.find((p) => p.trim().length > 0)?.trim() ?? "";
}

export const matchesExpected = (s: Source, expected: string) =>
  s.id === expected || s.id.startsWith(`${expected}-`) || (expected.startsWith("KB-") && s.id.startsWith(expected)) || s.title === expected || s.sourceName === expected;

export function detectLanguage(text: string): "de" | "en" {
  const en = (text.match(/\b(the|and|is|of|to|for|with|when|must|tax)\b/gi) ?? []).length;
  const de = (text.match(/\b(der|die|das|und|ist|nicht|für|mit|wenn|muss|Steuer)\b/gi) ?? []).length;
  return en > de ? "en" : "de";
}

export function scoreAsk(c: AskCase, run: AskRun) {
  const cited = citedNumbers(run.text);
  const validNumbers = new Set(run.sources.map((s) => s.n));
  const invalidCitations = cited.filter((n) => !validNumbers.has(n));
  const expected = c.expectSources ?? [];
  const retrieved = expected.length ? run.sources.some((s) => expected.some((e) => matchesExpected(s, e))) : null;
  const expectedCited = expected.length ? run.sources.filter((s) => cited.includes(s.n)).some((s) => expected.some((e) => matchesExpected(s, e))) : null;
  const sentences = factualSentences(run.text);
  const withCitation = sentences.filter((s) => /\[\d{1,2}\]/.test(s)).length;
  const coverage = sentences.length ? withCitation / sentences.length : null;
  const lead = leadOf(run.text);
  const missingFacts = [
    ...(c.mustContain ?? []).filter((re) => !re.test(run.text)).map(String),
    ...(c.leadMustContain ?? []).filter((re) => !re.test(lead)).map((re) => `lead ${String(re)}`),
  ];
  const forbiddenFacts = (c.mustNotContain ?? []).filter((re) => re.test(run.text)).map(String);
  const abstained = ABSTAIN.test(run.text);
  const language = detectLanguage(run.text);
  const keyFactsCorrect = missingFacts.length === 0 && forbiddenFacts.length === 0 && run.text.length > 0;
  const incomplete = !run.finished;
  const pass =
    !incomplete &&
    (c.scope === "out"
      ? abstained && forbiddenFacts.length === 0
      : !!retrieved && !!expectedCited && invalidCitations.length === 0 && keyFactsCorrect && (!c.language || c.language === language));
  return {
    id: c.id,
    scope: c.scope,
    pass,
    incomplete,
    retrieved,
    expectedCited,
    citedNumbers: cited,
    invalidCitations,
    factualSentences: sentences.length,
    citationCoverage: coverage,
    keyFactsCorrect,
    missingFacts,
    forbiddenFacts,
    abstained,
    language,
    expectedLanguage: c.language ?? "de",
    toolCalls: run.toolCalls,
    ttftMs: run.ttftMs && Math.round(run.ttftMs),
    totalMs: Math.round(run.totalMs),
    errors: run.errors,
    sources: run.sources.map(({ n, id, ref, title, sourceName, kind }) => ({ n, id, ref, title, sourceName, kind })),
    answer: run.text,
  };
}

export type AskResult = ReturnType<typeof scoreAsk>;

export type IntakeResult = {
  id: string;
  pass: boolean;
  categoryCorrect: boolean;
  deadlineCorrect: boolean;
  expectedDeadline: unknown;
  draftQualityOk: boolean;
  checklistCoverage: number | null;
  totalMs: number;
};

const median = (xs: number[]) => {
  const s = [...xs].sort((a, b) => a - b);
  return s.length ? s[Math.floor((s.length - 1) / 2)] : null;
};
const share = (xs: (boolean | null)[]) => {
  const d = xs.filter((x): x is boolean => x !== null);
  return d.length ? d.filter(Boolean).length / d.length : null;
};
const mean = (xs: (number | null)[]) => {
  const d = xs.filter((x): x is number => x !== null);
  return d.length ? d.reduce((a, b) => a + b, 0) / d.length : null;
};

export function summarize(base: string, ranAt: string, ask: AskResult[], intake: IntakeResult[]) {
  const inScope = ask.filter((a) => a.scope === "in");
  const outScope = ask.filter((a) => a.scope === "out");
  const dated = intake.filter((i) => i.expectedDeadline !== null);
  return {
    base,
    ranAt,
    ask: {
      cases: ask.length,
      passed: ask.filter((a) => a.pass).length,
      retrievalRecall: share(inScope.map((a) => a.retrieved)),
      expectedSourceCited: share(inScope.map((a) => a.expectedCited)),
      citationCoverage: mean(inScope.map((a) => a.citationCoverage)),
      answersWithoutInvalidCitations: share(ask.map((a) => a.invalidCitations.length === 0)),
      keyFactAccuracy: share(inScope.map((a) => a.keyFactsCorrect)),
      abstentionAccuracy: share(outScope.map((a) => a.abstained && a.forbiddenFacts.length === 0)),
      sessionDocumentPass: ask.find((a) => a.id === "session-document")?.pass ?? null,
      incompleteAnswers: ask.filter((a) => a.incomplete).length,
      languageMatch: share(ask.filter((a) => a.expectedLanguage === "en").map((a) => a.language === "en")),
      medianTotalMs: median(ask.map((a) => a.totalMs)),
      medianTtftMs: median(ask.map((a) => a.ttftMs ?? a.totalMs)),
    },
    intake: {
      cases: intake.length,
      passed: intake.filter((i) => i.pass).length,
      categoryAccuracy: share(intake.map((i) => i.categoryCorrect)),
      deadlineAccuracy: share(intake.map((i) => i.deadlineCorrect)),
      datedDeadlineAccuracy: share(dated.map((i) => i.deadlineCorrect)),
      draftQuality: share(intake.map((i) => i.draftQualityOk)),
      checklistCitationCoverage: mean(intake.map((i) => i.checklistCoverage)),
      medianTotalMs: median(intake.map((i) => i.totalMs)),
    },
  };
}
