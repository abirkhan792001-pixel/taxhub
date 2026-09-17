// Runs the ask and intake test cases against a deployed TaxHub and computes the metrics
// defined in evals/rubric.md. Usage: npm run eval:live  (EVAL_BASE_URL to target another deployment)
import { mkdirSync, writeFileSync } from "node:fs";
import { ASK_CASES, HOLDOUT_CASES, HOLDOUT_V2_CASES, INTAKE_CASES, type AskCase, type IntakeCase } from "./cases";
import { citedNumbers, scoreAsk, summarize, type Source } from "./metrics";

const BASE = process.env.EVAL_BASE_URL ?? "https://taxhub-sqrlane.vercel.app";
const PAUSE_MS = Number(process.env.EVAL_PAUSE_MS ?? 6000); // free-tier model rate limits
const ONLY = process.env.EVAL_ONLY; // optional comma-separated case ids
const SUITE = process.env.EVAL_SUITE ?? "main"; // "main" (ask + intake), "holdout" or "holdout2" (ask only)
const SUITES: Record<string, AskCase[]> = { main: ASK_CASES, holdout: HOLDOUT_CASES, holdout2: HOLDOUT_V2_CASES };
const OUT = process.env.EVAL_OUT ?? (SUITE === "main" ? "live" : SUITE);
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

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
    sources: sources.map((x) => `${x.n}: ${x.ref}`),
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

  const summary = summarize(BASE, new Date().toISOString(), ask, intake);

  mkdirSync("evals/results", { recursive: true });
  writeFileSync(`evals/results/${OUT}.json`, JSON.stringify({ summary, ask, intake }, null, 2));
  console.log("\n", JSON.stringify(summary, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
