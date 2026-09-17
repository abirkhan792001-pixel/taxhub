// Runs the ask and intake test cases against a deployed TaxHub and computes the metrics
// defined in evals/rubric.md. Usage: npm run eval:live  (EVAL_BASE_URL to target another deployment)
import { mkdirSync, writeFileSync } from "node:fs";
import { normalizeCitations } from "../src/lib/cite";
import { ASK_CASES, HOLDOUT_CASES, HOLDOUT_V2_CASES, INTAKE_CASES, type AskCase, type IntakeCase } from "./cases";

const BASE = process.env.EVAL_BASE_URL ?? "https://taxhub-sqrlane.vercel.app";
const PAUSE_MS = Number(process.env.EVAL_PAUSE_MS ?? 6000); // free-tier model rate limits
const ONLY = process.env.EVAL_ONLY; // optional comma-separated case ids
const SUITE = process.env.EVAL_SUITE ?? "main"; // "main" (ask + intake), "holdout" or "holdout2" (ask only)
const SUITES: Record<string, AskCase[]> = { main: ASK_CASES, holdout: HOLDOUT_CASES, holdout2: HOLDOUT_V2_CASES };
const OUT = process.env.EVAL_OUT ?? (SUITE === "main" ? "live" : SUITE);
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// "the sources don't cover this", in German or English
const ABSTAIN =
  /(Quellen|Fundstellen|sources?)[^.\n]{0,90}\b(nicht|keine|keinen|nichts|kein|not|no|don['’]t)\b|\b(nicht|keine|keinen)\b[^.\n]{0,50}\b(in|aus)\s+den\s+(vorliegenden\s+|bereitgestellten\s+)?(Quellen|Fundstellen)|lässt sich[^.\n]{0,60}nicht|\bnot\s+(covered|contained|included|found|provided)\b|\bno\s+(information|provision|section)\b|existiert\s+(in\s+den\s+Quellen\s+)?nicht|nicht\s+enthalten|gibt es (in den Quellen )?keinen/i;

type Source = { n: number; id: string; ref: string; title: string; sourceName: string; kind: string };

const citedNumbers = (text: string) => [...new Set([...normalizeCitations(text).matchAll(/\[(\d{1,2})\]/g)].map((m) => Number(m[1])))];

function factualSentences(text: string) {
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

const matchesExpected = (s: Source, expected: string) =>
  s.id === expected || s.id.startsWith(`${expected}-`) || (expected.startsWith("KB-") && s.id.startsWith(expected)) || s.title === expected || s.sourceName === expected;

function detectLanguage(text: string): "de" | "en" {
  const en = (text.match(/\b(the|and|is|of|to|for|with|when|must|tax)\b/gi) ?? []).length;
  const de = (text.match(/\b(der|die|das|und|ist|nicht|für|mit|wenn|muss|Steuer)\b/gi) ?? []).length;
  return en > de ? "en" : "de";
}

// ---------------------------------------------------------------- ask

async function callAsk(c: AskCase) {
  const turns = [...(c.history ?? []), { role: "user" as const, text: c.question }];
  const messages = turns.map((m, i) => ({ id: `m${i}`, role: m.role, parts: [{ type: "text", text: m.text }] }));
  const t0 = performance.now();
  const res = await fetch(`${BASE}/api/ask`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ messages, sessionDocs: c.sessionDocs ?? [] }),
  });
  if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let text = "";
  let sources: Source[] = [];
  let ttftMs: number | null = null;
  const errors: string[] = [];
  let toolCalls = 0;
  let finished = false; // a stream that ends without "finish" was cut off (e.g. function timeout)
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let nl: number;
    while ((nl = buffer.indexOf("\n")) >= 0) {
      const line = buffer.slice(0, nl).trim();
      buffer = buffer.slice(nl + 1);
      if (!line.startsWith("data: ") || line === "data: [DONE]") continue;
      let ev: { type: string; delta?: string; data?: { sources: Source[] }; errorText?: string };
      try {
        ev = JSON.parse(line.slice(6));
      } catch {
        continue;
      }
      if (ev.type === "text-delta") {
        ttftMs ??= performance.now() - t0;
        text += ev.delta ?? "";
      } else if (ev.type === "data-sources" && ev.data) sources = ev.data.sources;
      else if (ev.type === "error") errors.push(ev.errorText ?? "error");
      else if (ev.type === "tool-output-available") toolCalls++;
      else if (ev.type === "finish") finished = true;
    }
  }
  return { text, sources, ttftMs, totalMs: performance.now() - t0, errors, toolCalls, finished };
}

function scoreAsk(c: AskCase, run: Awaited<ReturnType<typeof callAsk>>) {
  const cited = citedNumbers(run.text);
  const validNumbers = new Set(run.sources.map((s) => s.n));
  const invalidCitations = cited.filter((n) => !validNumbers.has(n));
  const expected = c.expectSources ?? [];
  const retrieved = expected.length ? run.sources.some((s) => expected.some((e) => matchesExpected(s, e))) : null;
  const expectedCited = expected.length ? run.sources.filter((s) => cited.includes(s.n)).some((s) => expected.some((e) => matchesExpected(s, e))) : null;
  const sentences = factualSentences(run.text);
  const withCitation = sentences.filter((s) => /\[\d{1,2}\]/.test(s)).length;
  const coverage = sentences.length ? withCitation / sentences.length : null;
  const missingFacts = (c.mustContain ?? []).filter((re) => !re.test(run.text)).map(String);
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

// ---------------------------------------------------------------- intake

type IntakeResponse = {
  error?: string;
  extraction: { kategorie: string; fehlendeAngaben: string[] };
  frist: { bekanntgabe: string; fristende: string } | null;
  draft: {
    dringlichkeit: string;
    dringlichkeitGrund: string;
    zusammenfassung: string;
    checkliste: { punkt: string; beleg: number[] }[];
    naechsteSchritte: { schritt: string; wer: string; bis: string }[];
    antwortEntwurf: { betreff: string; text: string };
  };
  sources: Source[];
};

async function callIntake(c: IntakeCase) {
  const t0 = performance.now();
  const res = await fetch(`${BASE}/api/intake`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ message: c.message, channel: c.channel }),
  });
  const json = (await res.json()) as IntakeResponse;
  if (!res.ok || json.error) throw new Error(json.error ?? `HTTP ${res.status}`);
  return { json, totalMs: performance.now() - t0 };
}

const deDate = (iso: string) => iso.split("-").reverse().join(".");
const longDate = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("de-DE", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
};

function scoreIntake(c: IntakeCase, run: Awaited<ReturnType<typeof callIntake>>) {
  const { extraction, frist, draft, sources } = run.json;
  const valid = new Set(sources.map((s) => s.n));
  const categoryCorrect = extraction.kategorie === c.expectCategory;
  const deadlineCorrect = c.expectDeadline === null ? frist === null : !!frist && frist.bekanntgabe === c.expectDeadline.bekanntgabe && frist.fristende === c.expectDeadline.fristende;
  const draftText = `${draft.antwortEntwurf.betreff}\n${draft.antwortEntwurf.text}`;
  const draftStatesDeadline = c.expectDeadline ? draftText.includes(deDate(c.expectDeadline.fristende)) || draftText.includes(longDate(c.expectDeadline.fristende)) : null;
  const draftHasRawCitations = /\[\d{1,2}\]/.test(draftText);
  // telling a client a deadline was "provisionally calculated" when none was is misleading
  const draftClaimsUncomputedDeadline = !c.expectDeadline && /vorläufig\s+berechnet/i.test(draftText);
  const draftForbidden = [
    ...(c.draftMustNotContain ?? []).filter((re) => re.test(draftText)).map(String),
    ...(draftClaimsUncomputedDeadline ? ["mentions a provisionally calculated deadline, but none was calculated"] : []),
  ];
  const summaryCited = citedNumbers(`${draft.zusammenfassung} ${draft.dringlichkeitGrund}`);
  const checklistCited = draft.checkliste.flatMap((i) => i.beleg);
  const invalidCitations = [...new Set([...summaryCited, ...checklistCited])].filter((n) => !valid.has(n));
  const checklistCoverage = draft.checkliste.length ? draft.checkliste.filter((i) => i.beleg.length > 0).length / draft.checkliste.length : null;
  const haystack = `${draft.zusammenfassung}\n${draft.checkliste.map((i) => i.punkt).join("\n")}`;
  const missingFacts = (c.mustContain ?? []).filter((re) => !re.test(haystack)).map(String);
  const draftQualityOk = draftStatesDeadline !== false && !draftHasRawCitations && draftForbidden.length === 0;
  return {
    id: c.id,
    pass: categoryCorrect && deadlineCorrect && draftQualityOk && invalidCitations.length === 0 && missingFacts.length === 0,
    category: extraction.kategorie,
    expectedCategory: c.expectCategory,
    categoryCorrect,
    deadline: frist && { bekanntgabe: frist.bekanntgabe, fristende: frist.fristende },
    expectedDeadline: c.expectDeadline,
    deadlineCorrect,
    draftStatesDeadline,
    draftHasRawCitations,
    draftForbidden,
    draftQualityOk,
    invalidCitations,
    checklistCoverage,
    missingFacts,
    urgency: draft.dringlichkeit,
    totalMs: Math.round(run.totalMs),
    summary: draft.zusammenfassung,
    draft: draftText,
  };
}

// ---------------------------------------------------------------- runner

// up to three attempts with backoff; a case that still fails is recorded as failed, not fatal to the run
async function withRetry<T>(label: string, fn: () => Promise<T>, ok: (v: T) => boolean): Promise<T | Error> {
  let last: unknown = new Error("empty or errored response");
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const v = await fn();
      if (ok(v) || attempt === 3) return v;
      last = new Error("empty or errored response");
    } catch (err) {
      last = err;
    }
    if (attempt < 3) {
      console.warn(`  ${label}: ${String(last).slice(0, 120)}, retry ${attempt} in ${30 * attempt} s`);
      await sleep(30_000 * attempt);
    }
  }
  return last instanceof Error ? last : new Error(String(last));
}

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

async function main() {
  const pick = <T extends { id: string }>(xs: T[]) => (ONLY ? xs.filter((x) => ONLY.split(",").includes(x.id)) : xs);
  console.log(`Evaluating ${BASE}`);

  const ask = [];
  for (const c of pick(SUITES[SUITE] ?? ASK_CASES)) {
    const attempt = await withRetry(c.id, () => callAsk(c), (r) => r.text.length > 0 && r.errors.length === 0);
    const run = attempt instanceof Error ? { text: "", sources: [], ttftMs: null, totalMs: 0, errors: [String(attempt)], toolCalls: 0, finished: false } : attempt;
    const r = scoreAsk(c, run);
    ask.push(r);
    console.log(`${r.pass ? "✓" : "✗"} ask    ${c.id.padEnd(28)} cov ${r.citationCoverage?.toFixed(2) ?? " –  "}  ${String(r.totalMs).padStart(6)} ms${r.missingFacts.length ? `  missing ${r.missingFacts.join(" ")}` : ""}${r.forbiddenFacts.length ? `  FORBIDDEN ${r.forbiddenFacts.join(" ")}` : ""}${r.invalidCitations.length ? `  invalid [${r.invalidCitations}]` : ""}`);
    await sleep(PAUSE_MS);
  }

  const intake = [];
  for (const c of SUITE === "main" ? pick(INTAKE_CASES) : []) {
    const attempt = await withRetry(c.id, () => callIntake(c), () => true);
    if (attempt instanceof Error) {
      console.log(`✗ intake ${c.id.padEnd(28)} request failed: ${String(attempt).slice(0, 100)}`);
      intake.push({ id: c.id, pass: false, category: "ERROR", expectedCategory: c.expectCategory, categoryCorrect: false, deadline: null, expectedDeadline: c.expectDeadline, deadlineCorrect: false, draftStatesDeadline: null, draftHasRawCitations: false, draftForbidden: [], draftQualityOk: false, invalidCitations: [], checklistCoverage: null, missingFacts: [], urgency: "", totalMs: 0, summary: "", draft: "", error: String(attempt) });
      await sleep(PAUSE_MS);
      continue;
    }
    const run = attempt;
    const r = scoreIntake(c, run);
    intake.push(r);
    console.log(`${r.pass ? "✓" : "✗"} intake ${c.id.padEnd(28)} ${r.category.padEnd(10)} deadline ${r.deadlineCorrect ? "ok" : "WRONG"}  ${String(r.totalMs).padStart(6)} ms`);
    await sleep(PAUSE_MS);
  }

  const inScope = ask.filter((a) => a.scope === "in");
  const outScope = ask.filter((a) => a.scope === "out");
  const dated = intake.filter((i) => i.expectedDeadline !== null);
  const summary = {
    base: BASE,
    ranAt: new Date().toISOString(),
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

  mkdirSync("evals/results", { recursive: true });
  writeFileSync(`evals/results/${OUT}.json`, JSON.stringify({ summary, ask, intake }, null, 2));
  console.log("\n", JSON.stringify(summary, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
