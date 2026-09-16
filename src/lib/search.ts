import { getCorpus, type Chunk } from "./corpus";

// ---------- German-aware tokenisation ----------

const STOPWORDS = new Set(
  (
    "der die das den dem des ein eine einer eines einem einen und oder aber als auch auf aus bei bis durch für fuer gegen in im ins mit nach nicht noch nur ob ohne sich so über ueber um unter von vor wie wird werden wurde ist sind sein seine seiner sowie soweit wenn zu zum zur dass daß es er sie wir ihr ich mein meine kann können koennen muss müssen muessen soll sollen hat haben hatte dies diese dieser dieses jede jeder jedes welche welcher welches was wer wann wo absatz satz nummer nr abs vom am an bzw ggf darf dürfen duerfen gibt trotzdem laut unser unsere unserem unseren tun wie hoch the of and or to a an in is are be for on by with as at from that this which shall any such not what when how does do high"
  ).split(" ")
);

const SUFFIXES = ["ungen", "heiten", "keiten", "ung", "heit", "keit", "lich", "isch", "ern", "en", "er", "es", "em", "e", "n", "s"];

export function normalize(s: string) {
  return s
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss");
}

function stem(t: string) {
  if (/^\d/.test(t)) return t;
  for (const suf of SUFFIXES) {
    if (t.length - suf.length >= 4 && t.endsWith(suf)) return t.slice(0, -suf.length);
  }
  return t;
}

export function tokenize(s: string): string[] {
  return normalize(s)
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 1 && !STOPWORDS.has(t))
    .map(stem);
}

// ---------- BM25 index (built lazily, once per server instance) ----------

type Index = {
  chunks: Chunk[];
  tf: Map<string, number>[];
  len: number[];
  avgLen: number;
  df: Map<string, number>;
  vocab: string[];
  byId: Map<string, number>;
};

let index: Index | null = null;

function getIndex(): Index {
  if (index) return index;
  const { chunks } = getCorpus();
  const tf: Map<string, number>[] = [];
  const len: number[] = [];
  const df = new Map<string, number>();
  const byId = new Map<string, number>();
  chunks.forEach((c, i) => {
    byId.set(c.id, i);
    // title and reference count double: they are what practitioners search for
    const tokens = [...tokenize(`${c.title} ${c.ref}`), ...tokenize(`${c.title} ${c.ref}`), ...tokenize(c.text)];
    const m = new Map<string, number>();
    for (const t of tokens) m.set(t, (m.get(t) ?? 0) + 1);
    tf.push(m);
    len.push(tokens.length);
    for (const t of m.keys()) df.set(t, (df.get(t) ?? 0) + 1);
  });
  const avgLen = len.reduce((a, b) => a + b, 0) / len.length;
  index = { chunks, tf, len, avgLen, df, vocab: [...df.keys()], byId };
  return index;
}

// Query term -> weighted index terms. Prefix matches let "einspruch" find
// "einspruchsfrist", and compound queries still hit their parts.
function expandTerm(ix: Index, term: string): [string, number][] {
  const out: [string, number][] = [];
  if (ix.df.has(term)) out.push([term, 1]);
  if (term.length >= 5 && !/^\d/.test(term)) {
    let added = 0;
    for (const v of ix.vocab) {
      if (v !== term && v.startsWith(term) && added < 25) {
        out.push([v, 0.5]);
        added++;
      }
    }
  }
  if (!out.length && term.length >= 10) {
    // decompound: "grundsteuerbescheid" -> "grundsteuer" + "bescheid"
    for (let cut = 4; cut <= term.length - 4; cut++) {
      const a = term.slice(0, cut);
      const b = term.slice(cut).replace(/^s(?=.{4})/, "");
      if (ix.df.has(a) && ix.df.has(b)) {
        out.push([a, 0.6], [b, 0.6]);
        break;
      }
    }
  }
  return out;
}

function bm25(ix: Index, query: string, filter?: (c: Chunk) => boolean) {
  const k1 = 1.2;
  const b = 0.75;
  const N = ix.chunks.length;
  const weights = new Map<string, number>();
  for (const t of new Set(tokenize(query))) {
    // years ("2025") are everywhere in transitional rules; let them refine, not drive, the ranking
    const damp = /^(19|20)\d\d$/.test(t) ? 0.3 : 1;
    for (const [term, w] of expandTerm(ix, t)) weights.set(term, Math.max(weights.get(term) ?? 0, w * damp));
  }
  const scores: { i: number; score: number }[] = [];
  for (let i = 0; i < N; i++) {
    const c = ix.chunks[i];
    if (filter && !filter(c)) continue;
    let s = 0;
    for (const [term, w] of weights) {
      const f = ix.tf[i].get(term);
      if (!f) continue;
      const df = ix.df.get(term)!;
      const idf = Math.log(1 + (N - df + 0.5) / (df + 0.5));
      s += w * idf * ((f * (k1 + 1)) / (f + k1 * (1 - b + (b * ix.len[i]) / ix.avgLen)));
    }
    if (s > 0) scores.push({ i, score: s });
  }
  return scores.sort((a, b) => b.score - a.score);
}

// ---------- explicit norm references ("§ 355 AO", "Art. 97 § 36 EGAO") ----------

const LAW_ALIASES: Record<string, string> = {
  ao: "AO",
  abgabenordnung: "AO",
  egao: "EGAO",
  estg: "EStG",
  einkommensteuergesetz: "EStG",
  ustg: "UStG",
  umsatzsteuergesetz: "UStG",
  kstg: "KStG",
  gewstg: "GewStG",
  grstg: "GrStG",
  stberg: "StBerG",
  stbvv: "StBVV",
};

export type NormRef = { law: string; section: string; article?: string };

export function parseNormRefs(text: string): NormRef[] {
  const out: NormRef[] = [];
  const re = /(?:Art(?:ikel|\.)?\s*(\d+[a-z]?)\s*)?§§?\s*(\d+[a-z]?)(?:\s*(?:Abs(?:atz|\.)?\s*\d+[a-z]?|S(?:atz|\.)\s*\d+|Nr\.?\s*\d+[a-z]?|,|\s))*\s*([A-Za-zÄÖÜäöü]+)/g;
  for (const m of text.matchAll(re)) {
    const law = LAW_ALIASES[normalize(m[3])];
    if (law) out.push({ law, section: m[2], article: m[1] });
  }
  return out;
}

function chunksForNorm(ix: Index, ref: NormRef): number[] {
  const base = ref.article ? `${ref.law}-Art_${ref.article}_${ref.section}` : `${ref.law}-${ref.section}`;
  const hits: number[] = [];
  const exact = ix.byId.get(base);
  if (exact !== undefined) hits.push(exact);
  for (let n = 1; n < 20; n++) {
    const i = ix.byId.get(`${base}-${n}`);
    if (i === undefined) break;
    hits.push(i);
  }
  return hits;
}

// ---------- public API ----------

export type RetrievedChunk = Chunk & { n: number; score: number };

export type RetrieveOptions = {
  queries: string[];
  norms?: NormRef[];
  maxLaw?: number;
  maxFirm?: number;
  extraChunks?: Chunk[]; // e.g. a document the user pasted for this session
};

export function retrieve({ queries, norms = [], maxLaw = 7, maxFirm = 4, extraChunks = [], rawQuestion }: RetrieveOptions & { rawQuestion?: string }): RetrievedChunk[] {
  const ix = getIndex();
  const fused = new Map<number, number>();
  const K = 60; // reciprocal rank fusion constant

  // the user's own wording counts, but less than the planner's statutory keywords
  const weighted: [string, number][] = [
    ...(rawQuestion ? [[rawQuestion, queries.length ? 0.5 : 1] as [string, number]] : []),
    ...queries.filter(Boolean).map((q) => [q, 1] as [string, number]),
  ];
  for (const [q, w] of weighted) {
    bm25(ix, q, (c) => c.kind === "law")
      .slice(0, 40)
      .forEach(({ i }, rank) => fused.set(i, (fused.get(i) ?? 0) + w / (K + rank)));
  }
  // explicitly referenced norms go to the top, but only if they really exist
  const allNorms = [...norms, ...weighted.flatMap(([q]) => parseNormRefs(q))];
  allNorms.forEach((ref, r) => {
    chunksForNorm(ix, ref).forEach((i, j) => fused.set(i, (fused.get(i) ?? 0) + 0.05 - r * 0.001 - j * 0.0005));
  });

  const lawHits = [...fused.entries()].sort((a, b) => b[1] - a[1]).slice(0, maxLaw);

  // firm knowledge is ranked separately (so it always gets a voice) but fused on
  // the same reciprocal-rank scale, slightly discounted against the statute text
  const firmFused = new Map<number, number>();
  for (const [q, w] of weighted) {
    bm25(ix, q, (c) => c.kind === "firm")
      .filter(({ score }) => score > 3)
      .slice(0, 5)
      .forEach(({ i }, rank) => firmFused.set(i, (firmFused.get(i) ?? 0) + (0.95 * w) / (K + rank + 1)));
  }
  const firmHits = [...firmFused.entries()].sort((a, b) => b[1] - a[1]).slice(0, maxFirm);

  // follow the firm handbook's own cross-references ("… Art. 97 § 36 EGAO") one hop:
  // the handbook knows which norm matters, even when the question doesn't name it
  const lawIds = new Set(lawHits.map(([i]) => i));
  const followed: [number, number][] = [];
  for (const [i, s] of firmHits.slice(0, 2)) {
    for (const ref of parseNormRefs(ix.chunks[i].text).slice(0, 4)) {
      const candidates = new Set(chunksForNorm(ix, ref).map((j) => ix.chunks[j].id));
      if (!candidates.size) continue;
      const best = weighted
        .flatMap(([q]) => bm25(ix, q, (c) => candidates.has(c.id)).slice(0, 1))
        .sort((a, b) => b.score - a.score)[0];
      const j = best?.i ?? ix.byId.get([...candidates][0])!;
      if (!lawIds.has(j) && !followed.some(([k]) => k === j) && followed.length < 3) followed.push([j, s * 0.9]);
    }
  }
  lawHits.push(...followed);

  // statutes spread one concept over consecutive sections (§ 169 Festsetzungsfrist, § 170 Beginn der
  // Festsetzungsfrist): pull in the adjacent section of a top hit when their titles share a topic word
  const inLaw = new Set(lawHits.map(([i]) => i));
  const topicWords = (title: string) => tokenize(title).filter((t) => t.length >= 7);
  const siblings: [number, number][] = [];
  for (const [i, s] of lawHits.slice(0, 3)) {
    const hit = ix.chunks[i];
    const m = hit.id.match(/^([A-Za-z]+)-(\d+)(?:-\d+)?$/); // plain numbered sections only, e.g. AO-170-1
    if (!m || hit.kind !== "law") continue;
    const hitWords = topicWords(hit.title);
    for (const d of [-1, 1]) {
      const base = `${m[1]}-${Number(m[2]) + d}`;
      const j = ix.byId.get(base) ?? ix.byId.get(`${base}-1`);
      if (j === undefined || inLaw.has(j) || siblings.some(([k]) => k === j) || siblings.length >= 2) continue;
      if (topicWords(ix.chunks[j].title).some((w) => hitWords.some((h) => w.includes(h) || h.includes(w)))) siblings.push([j, s * 0.85]);
    }
  }
  lawHits.push(...siblings);

  // neighbouring chunks of the strongest norms (a list split across chunks stays readable)
  const picked = new Map<number, number>();
  [...lawHits, ...firmHits].forEach(([i, s], rank) => {
    picked.set(i, Math.max(picked.get(i) ?? 0, s));
    const m = ix.chunks[i].id.match(/^(.*)-(\d+)$/);
    if (m && rank < 3 && ix.chunks[i].kind === "law") {
      for (const d of [-1, 1]) {
        const j = ix.byId.get(`${m[1]}-${+m[2] + d}`);
        if (j !== undefined && !picked.has(j)) picked.set(j, s * 0.5);
      }
    }
  });

  const results: RetrievedChunk[] = [...picked.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([i, score]) => ({ ...ix.chunks[i], score, n: 0 }));

  // session documents: scored with a small throwaway BM25 over just those chunks
  if (extraChunks.length) {
    const qTokens = new Set(weighted.flatMap(([q]) => tokenize(q)));
    const scored = extraChunks
      .map((c) => {
        const toks = tokenize(`${c.title} ${c.text}`);
        const hits = toks.filter((t) => qTokens.has(t)).length;
        return { c, score: hits / Math.sqrt(toks.length + 1) };
      })
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
    results.unshift(...scored.map(({ c, score }) => ({ ...c, score, n: 0 })));
  }

  return results.map((c, k) => ({ ...c, n: k + 1 }));
}

export function corpusStats() {
  const { chunks, builtAt, sources } = getCorpus();
  const bySource = new Map<string, { name: string; chunks: number; stand: string | null }>();
  for (const c of chunks) {
    const s = bySource.get(c.source) ?? { name: c.sourceName, chunks: 0, stand: c.stand };
    s.chunks++;
    bySource.set(c.source, s);
  }
  return { builtAt, total: chunks.length, sources, bySource: [...bySource.entries()] };
}
