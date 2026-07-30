import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";

const systemSchema = z.object({
  systemName: z.string().describe("Name of the AI system (Q11)"),
  devSource: z
    .string()
    .describe(
      "In-house | Third-party | Third-party with substantial modifications | Open-source we adapted (Q12)",
    ),
  purpose: z.string().describe("Short purpose / function description"),
  functionCategories: z
    .array(z.string())
    .describe("Function categories from the Q15 list"),
});

export const stageCompleteSchema = z.object({
  stage: z
    .union([z.literal(2), z.literal(3), z.literal(4)])
    .describe("Which stage is complete"),
  summary: z
    .string()
    .describe("Brief summary of what was collected in this stage"),
  systems: z
    .array(systemSchema)
    .optional()
    .describe("Required for stage 2: every inventoried AI system"),
  deployerSystems: z
    .array(z.string())
    .optional()
    .describe("Stage 2: system names that are deployer / third-party based"),
  providerOnlySkip: z
    .boolean()
    .optional()
    .describe(
      "Stage 3: true if deployer essentials were skipped because the company is provider-only",
    ),
});

export type StageCompleteArgs = z.infer<typeof stageCompleteSchema>;

/**
 * Structured handoff tool. Prefer this over embedding [STAGEx_COMPLETE] in prose.
 * Stage nodes handle the call in-process (not via ToolNode) so routers never see it.
 */
export const stageCompleteTool = new DynamicStructuredTool({
  name: "stage_complete",
  description:
    "Call this exactly once when the current interview stage is fully finished and you have all required answers. Do not call it to ask questions. Prefer this over writing [STAGE*_COMPLETE] in your message text.",
  // LangChain/zod version mismatch can explode TS inference; runtime schema is fine.
  schema: stageCompleteSchema as any,
  func: async (input: StageCompleteArgs) =>
    JSON.stringify({ ok: true, ...input }),
});

export function getStageCompleteCall(
  response: {
    tool_calls?: Array<{ name: string; args: unknown; id?: string }>;
  },
  stage: 2 | 3 | 4,
): { id?: string; args: StageCompleteArgs } | null {
  const call = response.tool_calls?.find((t) => t.name === "stage_complete");
  if (!call) return null;

  const parsed = stageCompleteSchema.safeParse({
    ...(call.args as object),
    stage,
  });

  if (!parsed.success) {
    const raw = (call.args ?? {}) as Partial<StageCompleteArgs>;
    return {
      id: call.id,
      args: {
        stage,
        summary: raw.summary ?? "Stage complete",
        systems: raw.systems,
        deployerSystems: raw.deployerSystems,
        providerOnlySkip: raw.providerOnlySkip,
      },
    };
  }

  return { id: call.id, args: parsed.data };
}

/** True when model used the tool OR the legacy text marker. */
export function isStageMarkedComplete(
  response: {
    content?: unknown;
    tool_calls?: Array<{ name: string; args: unknown; id?: string }>;
  },
  stage: 2 | 3 | 4,
  legacyMarkers: string[],
): boolean {
  if (getStageCompleteCall(response, stage)) return true;
  const text = response.content?.toString() ?? "";
  return legacyMarkers.some((m) => text.includes(m));
}

/** Filter out stage_complete so remaining tool_calls can go to web search ToolNode. */
export function nonCompleteToolCalls<T extends { name: string }>(
  toolCalls: T[] | undefined,
): T[] {
  return (toolCalls ?? []).filter((t) => t.name !== "stage_complete");
}
