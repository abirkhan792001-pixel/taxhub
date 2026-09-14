"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// "[3]" in model output -> a citation mark that points at margin card 3
const linkCitations = (md: string) => md.replace(/\[(\d{1,2})\](?!\()/g, "[$1](#src-$1)");

export function Answer({
  text,
  activeSource,
  onCite,
}: {
  text: string;
  activeSource: number | null;
  onCite: (n: number | null, pin?: boolean) => void;
}) {
  return (
    <div className="answer">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children }) => {
            const m = href?.match(/^#src-(\d+)$/);
            if (m) {
              const n = Number(m[1]);
              return (
                <a
                  href={href}
                  className="cite"
                  data-active={activeSource === n}
                  aria-label={`Quelle ${n}`}
                  onMouseEnter={() => onCite(n)}
                  onMouseLeave={() => onCite(null)}
                  onFocus={() => onCite(n)}
                  onClick={(e) => {
                    e.preventDefault();
                    onCite(n, true);
                  }}
                >
                  {n}
                </a>
              );
            }
            return (
              <a href={href} target="_blank" rel="noreferrer" className="underline decoration-rule underline-offset-2 hover:decoration-ink">
                {children}
              </a>
            );
          },
        }}
      >
        {linkCitations(text)}
      </ReactMarkdown>
    </div>
  );
}
