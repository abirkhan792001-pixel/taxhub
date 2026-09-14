// Builds data/corpus.json from official sources on gesetze-im-internet.de
// (Bundesministerium der Justiz / juris). Run: npm run ingest
import { unzipSync, strFromU8 } from "fflate";
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";

const BASE = "https://www.gesetze-im-internet.de";

// slug on gesetze-im-internet.de -> display abbreviation + full name
const LAWS = [
  { slug: "ao_1977", abbr: "AO", name: "Abgabenordnung" },
  { slug: "aoeg_1977", abbr: "EGAO", name: "Einführungsgesetz zur Abgabenordnung" },
  { slug: "estg", abbr: "EStG", name: "Einkommensteuergesetz" },
  { slug: "ustg_1980", abbr: "UStG", name: "Umsatzsteuergesetz" },
  { slug: "kstg_1977", abbr: "KStG", name: "Körperschaftsteuergesetz" },
  { slug: "gewstg", abbr: "GewStG", name: "Gewerbesteuergesetz" },
  { slug: "grstg_1973", abbr: "GrStG", name: "Grundsteuergesetz" },
  { slug: "stberg", abbr: "StBerG", name: "Steuerberatungsgesetz" },
  { slug: "stbgebv", abbr: "StBVV", name: "Steuerberatervergütungsverordnung" },
];

const MAX_CHARS = 1600;

const decode = (s) =>
  s
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)))
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"');

// XML / HTML fragment -> readable text, keeping paragraph and list structure
function toText(xml) {
  return decode(
    xml
      .replace(/<(P|p|DT|dt|br|BR|tr|TR|row|Title|TITLE)\b[^>]*\/?>/g, "\n")
      .replace(/<\/(DT|dt)>/g, " ")
      .replace(/<(DD|dd|td|TD|entry)\b[^>]*>/g, " ")
      .replace(/<[^>]+>/g, "")
  )
    .replace(/[ \t ]+/g, " ")
    .replace(/ *\n */g, "\n")
    .replace(/\n{2,}/g, "\n")
    .trim();
}

// Split long norms at Absatz boundaries "(1) ... (2) ..." into chunks <= MAX_CHARS
function splitNorm(text) {
  if (text.length <= MAX_CHARS) return [{ text, abs: null }];
  const parts = text.split(/\n(?=\(\d+[a-z]?\)\s)/);
  const chunks = [];
  let cur = "";
  let first = null;
  let last = null;
  const flush = () => {
    if (!cur) return;
    chunks.push({ text: cur.trim(), abs: first && (first === last ? first : `${first}–${last}`) });
    cur = "";
    first = last = null;
  };
  for (const p of parts) {
    const m = p.match(/^\((\d+[a-z]?)\)/);
    if (cur && cur.length + p.length > MAX_CHARS) flush();
    // a single oversized Absatz is hard-split on sentence boundaries
    if (p.length > MAX_CHARS) {
      const sentences = p.match(/[^.;]+[.;]?\s*/g) ?? [p];
      for (const s of sentences) {
        if (cur.length + s.length > MAX_CHARS) flush();
        if (m) {
          first ??= m[1];
          last = m[1];
        }
        cur += s;
      }
      continue;
    }
    if (m) {
      first ??= m[1];
      last = m[1];
    }
    cur += (cur ? "\n" : "") + p;
  }
  flush();
  return chunks;
}

function normUrl(slug, enbez, article) {
  const m = enbez.match(/^§+\s*([0-9]+[a-z]?)/i);
  if (m && article) return `${BASE}/${slug}/art_${article.toLowerCase()}__${m[1].toLowerCase()}.html`;
  if (m) return `${BASE}/${slug}/__${m[1].toLowerCase()}.html`;
  const a = enbez.match(/^Art(?:ikel)?\s*([0-9]+[a-z]?)/i);
  if (a) return `${BASE}/${slug}/art_${a[1].toLowerCase()}.html`;
  return `${BASE}/${slug}/index.html`;
}

async function fetchLaw({ slug, abbr, name }) {
  const res = await fetch(`${BASE}/${slug}/xml.zip`);
  if (!res.ok) throw new Error(`${slug}: HTTP ${res.status}`);
  const files = unzipSync(new Uint8Array(await res.arrayBuffer()));
  const xmlName = Object.keys(files).find((f) => f.endsWith(".xml"));
  const xml = strFromU8(files[xmlName]);
  const stand = xml.match(/builddate="(\d{8})/)?.[1];

  const out = [];
  for (const [, norm] of xml.matchAll(/<norm\b[^>]*>([\s\S]*?)<\/norm>/g)) {
    const enbez = decode(norm.match(/<enbez>([\s\S]*?)<\/enbez>/)?.[1] ?? "").trim();
    if (!enbez || !/^(§|Art|Anlage)/.test(enbez)) continue;
    const titel = toText(norm.match(/<titel[^>]*>([\s\S]*?)<\/titel>/)?.[1] ?? "");
    const content = norm.match(/<text format="XML">([\s\S]*?)<\/text>/)?.[1] ?? "";
    const text = toText(content);
    if (text.length < 20 || /^\(?weggefallen\)?$/i.test(text)) continue;

    // EGAO nests §§ inside articles ("Art. 97 § 36 EGAO")
    const article = decode(norm.match(/<gliederungsbez>Art (\d+[a-z]?)<\/gliederungsbez>/)?.[1] ?? "") || null;
    const label = article ? `Art. ${article} ${enbez}` : enbez;
    const parts = splitNorm(text);
    // an Absatz split over several chunks gets "Teil 1/2" so citations stay distinguishable
    const absCount = parts.reduce((m, c) => m.set(c.abs, (m.get(c.abs) ?? 0) + 1), new Map());
    const absSeen = new Map();
    parts.forEach((c, i, all) => {
      const k = (absSeen.get(c.abs) ?? 0) + 1;
      absSeen.set(c.abs, k);
      const teil = absCount.get(c.abs) > 1 ? `, Teil ${k}/${absCount.get(c.abs)}` : "";
      out.push({
        id: `${abbr}-${label.replace(/[^0-9a-zA-Z]+/g, "_").replace(/^_|_$/g, "")}${all.length > 1 ? `-${i + 1}` : ""}`,
        source: abbr,
        sourceName: name,
        ref: c.abs ? `${label} Abs. ${c.abs}${teil} ${abbr}` : `${label}${teil ? ` (${teil.slice(2)})` : ""} ${abbr}`,
        title: titel,
        text: c.text,
        url: normUrl(slug, enbez, article),
        lang: "de",
        stand: stand ? `${stand.slice(6, 8)}.${stand.slice(4, 6)}.${stand.slice(0, 4)}` : null,
        kind: "law",
      });
    });
  }
  console.log(`${abbr.padEnd(7)} ${out.length} chunks (Stand ${stand})`);
  return out;
}

// Official English translation of the AO (translation may lag the German text)
async function fetchEnglishAO() {
  const url = `${BASE}/englisch_ao/englisch_ao.html`;
  const res = await fetch(url);
  const html = new TextDecoder("utf-8").decode(await res.arrayBuffer());
  const headRe = /<p style="text-align: center; font-weight: bold"><a name="(p\d+)"><!----><\/a>(Section \d+[a-z]?)<br \/>([\s\S]*?)<\/p>/g;
  const heads = [...html.matchAll(headRe)];
  const out = [];
  heads.forEach((h, i) => {
    const end = i + 1 < heads.length ? heads[i + 1].index : html.length;
    const body = html
      .slice(h.index + h[0].length, end)
      .replace(/<p style="text-align: (left|center)[^"]*"[\s\S]*?<\/p>/g, "");
    const text = toText(body);
    if (text.length < 20) return;
    splitNorm(text).forEach((c, j, all) => {
      out.push({
        id: `AO-EN-${h[2].replace(/\D+/g, "")}${h[2].match(/[a-z]$/)?.[0] ?? ""}${all.length > 1 ? `-${j + 1}` : ""}`,
        source: "AO (EN)",
        sourceName: "Fiscal Code of Germany – official translation",
        ref: `${h[2]}${c.abs ? `(${c.abs})` : ""} Fiscal Code (AO)`,
        title: toText(h[3]),
        text: c.text,
        url: `${url}#${h[1]}`,
        lang: "en",
        stand: null,
        kind: "law",
      });
    });
  });
  console.log(`AO (EN) ${out.length} chunks`);
  return out;
}

// The firm's own know-how: every "## " section of knowledge/*.md becomes one chunk.
// The bundled files describe a fictional sample practice ("Kanzlei Muster").
function readFirmKnowledge() {
  const out = [];
  for (const file of readdirSync("knowledge").filter((f) => f.endsWith(".md")).sort()) {
    const raw = readFileSync(`knowledge/${file}`, "utf8").replace(/\r\n/g, "\n");
    const title = raw.match(/^title:\s*(.+)$/m)?.[1].trim() ?? file;
    const body = raw.replace(/^---[\s\S]*?---\n/, "");
    const slug = file.replace(/\.md$/, "");
    for (const section of body.split(/\n(?=## )/)) {
      const heading = section.match(/^## (.+)$/m)?.[1].trim();
      const text = section.replace(/^## .+\n/, "").trim();
      if (!heading || text.length < 20) continue;
      out.push({
        id: `KB-${slug}-${heading.toLowerCase().replace(/[^a-z0-9äöüß]+/g, "-").replace(/^-|-$/g, "")}`,
        source: "Kanzlei",
        sourceName: title,
        ref: `${title} › ${heading}`,
        title: heading,
        text,
        url: `/kanzlei/${slug}`,
        lang: "de",
        stand: null,
        kind: "firm",
      });
    }
  }
  console.log(`Kanzlei ${out.length} chunks`);
  return out;
}

const chunks = [];
for (const law of LAWS) chunks.push(...(await fetchLaw(law)));
chunks.push(...(await fetchEnglishAO()));
chunks.push(...readFirmKnowledge());

// de-duplicate ids (rare duplicate enbez in Anlagen)
const seen = new Map();
for (const c of chunks) {
  const n = seen.get(c.id) ?? 0;
  seen.set(c.id, n + 1);
  if (n) c.id = `${c.id}~${n}`;
}

mkdirSync("data", { recursive: true });
writeFileSync(
  "data/corpus.json",
  JSON.stringify({ builtAt: new Date().toISOString(), sources: LAWS, chunks })
);
console.log(`Total ${chunks.length} chunks, ${(JSON.stringify(chunks).length / 1e6).toFixed(1)} MB`);
