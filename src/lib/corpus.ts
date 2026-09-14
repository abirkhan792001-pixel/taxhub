import { readFileSync } from "node:fs";
import path from "node:path";

export type Chunk = {
  id: string;
  source: string; // "AO", "EStG", "AO (EN)", "Kanzlei", ...
  sourceName: string;
  ref: string; // "§ 355 AO", "Art. 97 § 36 Abs. 3 EGAO", "Kanzlei-Handbuch › ..."
  title: string;
  text: string;
  url: string;
  lang: "de" | "en";
  stand: string | null;
  kind: "law" | "firm";
};

type CorpusFile = {
  builtAt: string;
  sources: { slug: string; abbr: string; name: string }[];
  chunks: Chunk[];
};

let cached: CorpusFile | null = null;

export function getCorpus(): CorpusFile {
  if (!cached) {
    const file = path.join(process.cwd(), "data", "corpus.json");
    cached = JSON.parse(readFileSync(file, "utf8")) as CorpusFile;
  }
  return cached;
}
