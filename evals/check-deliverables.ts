// Checks the deliverables named in the case brief: live routes, public repository,
// corpus, one-pager structure and grounding, and (optionally) the Loom speech.
// Usage: npm run eval:deliverables  [-- --speech=../loom-speech.md]
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const BASE = process.env.EVAL_BASE_URL ?? "https://taxhub-sqrlane.vercel.app";
const REPO = process.env.EVAL_REPO ?? "abirkhan792001-pixel/taxhub";
const CASE_RECEIVED = "2026-09-14";
const speechPath = process.argv.find((a) => a.startsWith("--speech="))?.slice("--speech=".length);
const gh = { headers: { "user-agent": "taxhub-eval", accept: "application/vnd.github+json" } };

const strip = (html: string) =>
  html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();

function englishShare(text: string) {
  const en = (text.match(/\b(the|and|is|of|to|for|with|that|it|on)\b/gi) ?? []).length;
  const de = (text.match(/\b(der|die|das|und|ist|nicht|für|mit|dass|auf)\b/gi) ?? []).length;
  return en / Math.max(1, en + de);
}

async function main() {
  // ---- live routes
  const routes: Record<string, number> = {};
  for (const path of ["/", "/app", "/one-pager", "/kanzlei/01-fristenmanagement"]) {
    routes[path] = (await fetch(BASE + path, { redirect: "manual" })).status;
  }

  // ---- repository
  const repo = (await (await fetch(`https://api.github.com/repos/${REPO}`, gh)).json()) as { visibility?: string; created_at?: string; default_branch?: string; html_url?: string };
  const readme = await (await fetch(`https://raw.githubusercontent.com/${REPO}/${repo.default_branch ?? "master"}/README.md`)).text();
  const commits = (await (await fetch(`https://api.github.com/repos/${REPO}/commits?per_page=100`, gh)).json()) as { commit: { message: string } }[];
  const coAuthored = Array.isArray(commits) ? commits.filter((c) => /Co-Authored-By: Claude/i.test(c.commit.message)).length : 0;

  // ---- corpus
  const corpus = JSON.parse(readFileSync("data/corpus.json", "utf8")) as { sources: unknown[]; chunks: { kind: string; source: string }[] };
  const lawSources = new Set(corpus.chunks.filter((c) => c.kind === "law").map((c) => c.source));

  // ---- one-pager
  const html = await (await fetch(`${BASE}/one-pager`)).text();
  const body = html.slice(html.indexOf('class="op"'));
  const headings = [...body.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/g)];
  const segments = headings.map((h, i) => ({
    title: strip(h[1]),
    html: body.slice(h.index!, i + 1 < headings.length ? headings[i + 1].index : body.indexOf("op-sources")),
  }));
  const seg = (re: RegExp) => segments.find((s) => re.test(s.title));
  const why = seg(/why/i);
  const icp = seg(/icp|willingness/i);
  const incumbent = seg(/incumbent/i);
  const build = seg(/build first/i);
  const first30 = seg(/30 days/i);
  const objections = seg(/objection/i);

  const count = (h: string | undefined, re: RegExp) => (h ? (h.match(re) ?? []).length : 0);
  const moves = first30 ? [...first30.html.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/g)].map((m) => strip(m[1])) : [];

  // numeric claims in the argument sections: every block with a figure needs a footnote or an assumption marker
  const claimBlocks = [why, icp, incumbent, objections].flatMap((s) =>
    s ? [...s.html.matchAll(/<(li|dd)[^>]*>([\s\S]*?)<\/\1>/g)].map((m) => ({ section: s.title, html: m[2] })) : []
  );
  const numericClaims = claimBlocks
    .map((b) => {
      const text = strip(b.html);
      const withoutNorms = text.replace(/§§?\s*[\d\s,a-z]+(\(\d+\))?\s*(AO|StBerG|UStG|EStG)?/g, "");
      return { section: b.section, text: text.slice(0, 160), numeric: /\d/.test(withoutNorms), supported: /op-fn|op-assume/.test(b.html) };
    })
    .filter((b) => b.numeric);
  const unsupported = numericClaims.filter((b) => !b.supported);

  const onePager = {
    sections: segments.map((s) => s.title),
    A1_marketStructure: !!why && count(why.html, /op-fn/g) >= 2,
    A2_icpDefined: !!icp && /15–60 staff/.test(strip(icp.html)) && /BAG/.test(strip(icp.html)) && /Buyer/i.test(strip(icp.html)),
    A3_wtpEvidenced: !!icp && /€/.test(strip(icp.html)) && /op-fn/.test(icp.html) && /op-assume/.test(icp.html),
    A4_incumbentAndGap: !!incumbent && /DATEV/.test(strip(incumbent.html)) && /op-fn/.test(incumbent.html) && /gap/i.test(strip(incumbent.html)),
    D1_buildFirst: !!build && count(build.html, /<li/g) >= 3,
    D2_threeMoves: moves.length === 3 && moves.every((m) => /Days?\s+\d/.test(m)),
    D3_threeObjections: !!objections && count(objections.html, /<dt/g) === 3 && count(objections.html, /<dd/g) === 3,
    D5_numericClaims: numericClaims.length,
    D5_supported: numericClaims.length - unsupported.length,
    D5_unsupported: unsupported,
    englishShare: englishShare(strip(body)),
  };

  // ---- Loom speech readiness (optional, the speech itself stays out of the repo)
  let speech = null;
  if (speechPath) {
    const md = readFileSync(speechPath, "utf8");
    const sectionOf = (re: RegExp) => md.split(/\n## /).find((s) => re.test(s.split("\n")[0])) ?? "";
    const spokenIn = (s: string) => [...s.matchAll(/"([^"]{3,})"/g)].map((m) => m[1]).join(" ");
    const scriptPart = md.slice(md.indexOf("\n## 1"), md.indexOf("**If you blank"));
    const spoken = spokenIn(scriptPart);
    const words = spoken.split(/\s+/).filter(Boolean).length;
    const pauses = (scriptPart.match(/^…/gm) ?? []).length;
    const demoWaitSec = 25;
    const estSec = Math.round((words / 140) * 60 + pauses * 2 + demoWaitSec);
    const beforeFirstQuestion = spokenIn(scriptPart).split("?")[0].split(/\s+/).length;
    const firstQuestionSec = Math.round((beforeFirstQuestion / 140) * 60 + 2);
    speech = {
      estimatedDurationSec: estSec,
      underFiveMinutes: estSec <= 300,
      firstPainQuestionSec: firstQuestionSec,
      painWithin60s: firstQuestionSec <= 60,
      hasOpening: /Open/.test(sectionOf(/Open/)),
      valueInNumbers: /(hours|minutes|requests)/i.test(spokenIn(sectionOf(/Show it/))) && /(fifteen|forty|ninety|thirty|\d)/i.test(spokenIn(sectionOf(/Show it/))),
      pushbackHandled: /DATEV/.test(spokenIn(sectionOf(/pushback/i))),
      concreteNextStep: /(Tuesday|Thursday)/.test(spokenIn(sectionOf(/Close/))) && /minutes/i.test(spokenIn(sectionOf(/Close/))),
      words,
    };
  }

  const result = {
    base: BASE,
    checkedAt: new Date().toISOString(),
    routes,
    routesAll200: Object.values(routes).every((s) => s === 200),
    repo: { url: repo.html_url, visibility: repo.visibility, createdAt: repo.created_at, readmeLinksLiveDemo: readme.includes(BASE) && readme.includes("/app"), coAuthoredCommits: coAuthored, totalCommitsSeen: Array.isArray(commits) ? commits.length : 0, createdForCase: !!repo.created_at && repo.created_at.slice(0, 10) >= CASE_RECEIVED },
    corpus: { lawSources: lawSources.size, lawChunks: corpus.chunks.filter((c) => c.kind === "law").length, firmChunks: corpus.chunks.filter((c) => c.kind === "firm").length },
    onePager,
    speech,
  };

  mkdirSync("evals/results", { recursive: true });
  writeFileSync("evals/results/deliverables.json", JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
