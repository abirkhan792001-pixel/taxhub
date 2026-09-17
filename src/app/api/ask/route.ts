import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  isStepCount,
  streamText,
  toUIMessageStream,
  tool,
} from "ai";
import { z } from "zod";
import { ANSWER_MODEL, ANSWER_OPTIONS, answerInstructions, formatSources, planNorms, planSearch, sessionChunks, toSourceCards } from "@/lib/ai";
import { pruefeFristende } from "@/lib/deadlines";
import { retrieve, type NormRef } from "@/lib/search";
import type { TaxHubMessage } from "@/lib/types";

export const maxDuration = 120; // free-tier models can be slow under load; a cut-off stream is worse than a slow answer

// deadline questions always need the general computation rule, even if nobody names it
const DEADLINE_QUESTION = /frist|bis wann|spätestens|abgabe|einspruch|deadline|due|file by|objection/i;

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
      const norms: NormRef[] = [...planNorms(plan), ...(DEADLINE_QUESTION.test(question) ? [{ law: "AO", section: "108" }] : [])];
      const earlierQuestions = recent
        .filter((m) => m.role === "user" && m !== lastUser)
        .slice(-2)
        .map((m) => m.parts.map((p) => (p.type === "text" ? p.text : "")).join(" ").slice(0, 500));
      const chunks = retrieve({
        rawQuestion: question,
        contextQuestions: earlierQuestions,
        queries: plan.searchQueries.filter((q) => q !== question),
        norms,
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
        tools: {
          fristende_pruefen: tool({
            description:
              "Prüft ein berechnetes Fristende (YYYY-MM-DD): Wochentag, bundeseinheitlicher Feiertag und ggf. Verschiebung auf den nächsten Werktag nach § 108 Abs. 3 AO. Vor jeder Nennung eines konkreten Fristendes aufrufen.",
            inputSchema: z.object({ datum: z.string().describe("Fristende im Format YYYY-MM-DD") }),
            execute: async ({ datum }) => pruefeFristende(datum),
          }),
        },
        stopWhen: isStepCount(4),
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
