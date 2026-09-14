// Models sometimes group citations as "[9, 11]" or "[3; 4]"; the UI expects one mark per source.
export const normalizeCitations = (text: string) =>
  text.replace(/\[(\d{1,2}(?:\s*[,;]\s*\d{1,2})+)\]/g, (_, list: string) =>
    list
      .split(/[,;]/)
      .map((n) => `[${n.trim()}]`)
      .join("")
  );

export const citedNumbers = (text: string) => new Set([...normalizeCitations(text).matchAll(/\[(\d{1,2})\]/g)].map((m) => Number(m[1])));
