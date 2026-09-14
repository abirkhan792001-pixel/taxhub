// Which Gemini models does this API key reach (free tier or not)? Never prints the key.
// Run: node --env-file=.env.local scripts/check-models.mjs
import { google } from "@ai-sdk/google";
import { generateText } from "ai";

if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
  console.error("GOOGLE_GENERATIVE_AI_API_KEY is not set (expected in .env.local)");
  process.exit(1);
}

const CANDIDATES = [
  "gemini-3.8-flash",
  "gemini-3.7-flash",
  "gemini-3.6-flash",
  "gemini-3.5-flash",
  "gemini-3.5-flash-lite",
  "gemini-3-flash-preview",
  "gemini-3.1-flash-lite-preview",
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
];

for (const id of CANDIDATES) {
  const t0 = Date.now();
  try {
    const { text } = await generateText({ model: google(id), prompt: "Antworte nur mit: OK", maxRetries: 0 });
    console.log(`✓ ${id.padEnd(32)} ${String(Date.now() - t0).padStart(5)} ms  → ${text.trim().slice(0, 20)}`);
  } catch (err) {
    const msg = String(err?.message ?? err).replace(/\s+/g, " ").slice(0, 110);
    console.log(`✗ ${id.padEnd(32)} ${msg}`);
  }
}
