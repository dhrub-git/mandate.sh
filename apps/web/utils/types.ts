import { findSectionContextTool, rewriteForSectionTool } from "@/lib/tools/policy-tools";
import { InferUITool, UIDataTypes, UIMessage } from "ai";
import z from "zod";

export type WorkflowStatus = "interrupt" | "completed" | "running" | "error";

export type Message = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
};

export type CompanyProfile = {
  name: string;
  industry: string;
  size: string;
  countries: string;
};

export type LiveEvent =
  | { type: "node_start"; node: string; label: string; timestamp: number }
  | { type: "node_complete"; node: string; label: string }
  | { type: "tool_start"; tool: string; query?: string; timestamp: number }
  | { type: "tool_complete"; tool: string; timestamp: number }
  | { type: "token"; text: string };

export type PolicySectionDef = {
  id: string;
  title: string;
  gatherStage: string;
  draftAfterStage: string;
  draftedContent: (profile: CompanyProfile | undefined) => string;
};

export type SectionState =
  | "shimmer"
  | "gathering"
  | "drafted"
  | "ai_drafted"
  | "final";

export const messageMetadataSchema = z.object({
  createdAt: z.string(),
});

export type ChatTools = {
  findSectionContext: InferUITool<typeof findSectionContextTool>;
  rewriteForSection: InferUITool<ReturnType<typeof rewriteForSectionTool>>;
};

export type ChatMessageAI = UIMessage<
  MessageMetadata,
  UIDataTypes,
  ChatTools
>;

export type MessageMetadata = z.infer<typeof messageMetadataSchema>;