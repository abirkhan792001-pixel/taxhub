import type { UIMessage } from "ai";
import type { SourceCard } from "./ai";

export type TaxHubMessage = UIMessage<
  never,
  {
    sources: { queries: string[]; sources: SourceCard[] };
    status: { stage: "planning" | "answering" };
  }
>;
