import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const DIR = path.join(process.cwd(), "knowledge");

export function generateStaticParams() {
  return readdirSync(DIR)
    .filter((f) => f.endsWith(".md"))
    .map((f) => ({ slug: f.replace(/\.md$/, "") }));
}

export default async function KanzleiDoc({ params }: PageProps<"/kanzlei/[slug]">) {
  const { slug } = await params;
  if (!/^[a-z0-9-]+$/.test(slug)) notFound();
  let raw: string;
  try {
    raw = readFileSync(path.join(DIR, `${slug}.md`), "utf8").replace(/\r\n/g, "\n");
  } catch {
    notFound();
  }
  const title = raw.match(/^title:\s*(.+)$/m)?.[1] ?? slug;
  const owner = raw.match(/^owner:\s*(.+)$/m)?.[1];
  const body = raw.replace(/^---[\s\S]*?---\n/, "");

  return (
    <main className="mx-auto w-full max-w-[760px] px-4 py-10 sm:px-6">
      <Link href="/#quellen" className="text-[0.82rem] text-ink-soft hover:text-ink">
        ← Zurück zu TaxHub
      </Link>
      <p className="mt-6 font-mono text-[0.68rem] uppercase tracking-[0.12em] text-muted">Kanzlei Muster (fiktive Beispielkanzlei) · {owner}</p>
      <h1 className="mt-1 font-display text-[1.9rem] font-medium leading-tight">{title}</h1>
      <article className="answer mt-6 rounded-[4px] border border-rule bg-sheet px-6 py-5">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{body}</ReactMarkdown>
      </article>
    </main>
  );
}
