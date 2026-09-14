// Ad-hoc retrieval check: npx tsx scripts/try-query.ts "your question" ["planner query" ...]
import { retrieve } from "../src/lib/search";
const [question, ...queries] = process.argv.slice(2);
for (const c of retrieve({ rawQuestion: question, queries })) console.log(`[${c.n}] ${c.ref} – ${c.title.slice(0, 60)} (${c.score.toFixed(4)})`);
