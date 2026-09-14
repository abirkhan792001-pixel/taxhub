import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  streamText,
  toUIMessageStream,
} from "ai";
import { ANSWER_MODEL, ANSWER_OPTIONS, answerInstructions, formatSources, planNorms, planSearch, sessionChunks, toSourceCards } from "@/lib/ai";
import { retrieve } from "@/lib/search";
import type { TaxHubMessage } from "@/lib/types";

export const maxDuration = 60;

export async function POST(req: Request) {
  const { messages, sessionDocs = [] }: { messages: TaxHubMessage[]; sessionDocs?: { title: string; text: string }[] } =
    await req.json();

  const recent = messages.slice(-6);
  const lastUser = [...recent].reverse().find((m) => m.role === "user");
  const question = lastUser?.parts.map((p) => (p.type === "text" ? p.text : "")).join(" ").trim().slice(0, 2000);
  if (!question) return new Response("Missing question", { status: 400 });

  const conversation = recent
    .map((m) => `${m.role === "user" ? "USER" : "ASSISTANT"}: ${m.parts.map((p) => (p.type === "text" ? p.text : "")).join(" ").slice(0, 1200)}`)
    .join("\n");

  const stream = createUIMessageStream<TaxHubMessage>({
    execute: async ({ writer }) => {
      writer.write({ type: "start" });
      writer.write({ type: "data-status", id: "status", data: { stage: "planning" }, transient: true });

      const plan = await planSearch(conversation, question);
      const chunks = retrieve({
        rawQuestion: question,
        queries: plan.searchQueries.filter((q) => q !== question),
        norms: planNorms(plan),
        extraChunks: sessionChunks(sessionDocs),
      });

      writer.write({
        type: "data-sources",
        id: "sources",
        data: { queries: plan.searchQueries, sources: toSourceCards(chunks) },
      });
      writer.write({ type: "data-status", id: "status", data: { stage: "answering" }, transient: true });

      // earlier turns give conversational context; the latest question gets the sources attached
      const history = await convertToModelMessages(recent.slice(0, -1).map((m) => ({ ...m, parts: m.parts.filter((p) => p.type === "text") })));
      const result = streamText({
        model: ANSWER_MODEL,
        providerOptions: ANSWER_OPTIONS,
        instructions: answerInstructions(plan.language),
        messages: [
          ...history,
          {
            role: "user",
            content: `QUELLEN\n\n${formatSources(chunks)}\n\n=====\n\nFRAGE: ${question}`,
          },
        ],
      });

      writer.merge(toUIMessageStream({ stream: result.stream, sendStart: false }));
    },
    onError: (error) => {
      console.error(error);
      return "Die Anfrage konnte nicht verarbeitet werden. Bitte erneut versuchen.";
    },
  });

  return createUIMessageStreamResponse({ stream });
}
