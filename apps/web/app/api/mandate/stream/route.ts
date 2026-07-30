import {
  mandateStreamWorkflowEvents,
  mandateGetThreadCurrentState,
} from "@repo/agents";
import { NextRequest } from "next/server";
const NODE_LABELS: Record<string, string> = {
  stage_2: "AI Inventory Analysis",
  stage_3: "Deployer Essentials",
  stage_4: "Governance Essentials",
  policy_generator: "Policy Generation",
  web_search_1: "Regulatory Web Search",
  web_search_2: "Competitive Web Search",
  web_search_3: "Best Practice Web Search",
  web_search_4: "Impact Web Search",
};
const TRACKED_NODES = new Set([
  "stage_2",
  "stage_3",
  "stage_4",
  "policy_generator",
  "web_search_1",
  "web_search_2",
  "web_search_3",
  "web_search_4",
]);
function sseMessage(eventName: string, data: object): string {
  return `event: ${eventName}\ndata: ${JSON.stringify(data)}\n\n`;
}
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { threadId, action, input } = body as {
    threadId: string;
    action: "start" | "resume";
    input?: any;
  };
  if (!threadId || !action) {
    return new Response(
      JSON.stringify({ error: "threadId and action are required" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      function send(eventName: string, data: object) {
        controller.enqueue(encoder.encode(sseMessage(eventName, data)));
      }
      try {
        let finalPolicies: string | undefined;
        for await (const event of mandateStreamWorkflowEvents(
          threadId,
          action,
          input,
        )) {
          const { event: eventType, name, data } = event;
          // --- Node started ---
          if (eventType === "on_chain_start" && TRACKED_NODES.has(name)) {
            send("node_start", {
              node: name,
              label: NODE_LABELS[name] ?? name,
              timestamp: Date.now(),
            });
          }
          // --- Node finished ---
          if (eventType === "on_chain_end" && TRACKED_NODES.has(name)) {
            // Check for policies in output
            const output = data?.output;
            if (output?.policies) {
              finalPolicies = output.policies;
            }
            const payload: any = {
              node: name,
              label: NODE_LABELS[name] ?? name,
            };
            // Inject draft policies into the SSE payload so the UI can grab them!
            if (output?.draft_policy_2){
              console.log("Draft Policy 2 found in output:", output.draft_policy_2);
              payload.draft_policy_2 = output.draft_policy_2;
            }
            if (output?.draft_policy_3)
              payload.draft_policy_3 = output.draft_policy_3;
            if (output?.draft_policy_4)
              payload.draft_policy_4 = output.draft_policy_4;
            send("node_complete", payload);
          }
          // --- LLM token streaming ---
          // streamEvents v2: token is in data.chunk (an AIMessageChunk)
          if (eventType === "on_llm_stream") {
            const chunk = data?.chunk;
            let token: string | null = null;
            // OpenAI returns content as a string on AIMessageChunk
            if (
              typeof chunk?.content === "string" &&
              chunk.content.length > 0
            ) {
              token = chunk.content;
            }
            // OpenAI vision / structured output returns content as array of blocks
            else if (Array.isArray(chunk?.content)) {
              token =
                chunk.content
                  .filter((b: any) => b.type === "text")
                  .map((b: any) => b.text ?? "")
                  .join("") || null;
            }
            // Fallback: some wrappers put it at chunk.text
            else if (typeof chunk?.text === "string" && chunk.text.length > 0) {
              token = chunk.text;
            }
            if (token && token.length > 0) {
              send("token", { text: token });
            }
          }
          // --- Tool call started ---
          if (eventType === "on_tool_start") {
            const toolInput = data?.input;
            const query =
              typeof toolInput === "string"
                ? toolInput
                : (toolInput?.query ??
                  toolInput?.input ??
                  JSON.stringify(toolInput));
            send("tool_start", {
              tool: name,
              query:
                typeof query === "string" ? query.slice(0, 200) : undefined,
              timestamp: Date.now(),
            });
          }
          // --- Tool call finished ---
          if (eventType === "on_tool_end") {
            send("tool_complete", { tool: name, timestamp: Date.now() });
          }
        }
        // ── Stream ended. Determine final status. ──
        // LangGraph does NOT emit an interrupt event in streamEvents — it just
        // stops yielding. tasks[].interrupts is unreliable with MemorySaver
        // (always comes back []). Instead we fall back to reading the last AI
        // message from state.values.messages, which IS reliably persisted.
        let finalStatus: "interrupt" | "completed" | "running" = "running";
        let finalQuestion: string | undefined;
        try {
          const currentState = await mandateGetThreadCurrentState(threadId);
          const tasks = currentState?.tasks ?? [];
          console.log("[SSE] next:", currentState?.next);
          console.log("[SSE] tasks:", JSON.stringify(tasks, null, 2));

          // Priority 1: tasks[].interrupts (works in newer LangGraph versions)
          const interruptTask = tasks.find(
            (t: any) => t.interrupts && t.interrupts.length > 0,
          );

          if (interruptTask) {
            finalStatus = "interrupt";
            finalQuestion = interruptTask.interrupts[0]?.value;
          } else if (finalPolicies) {
            // Policies were collected during the stream → workflow completed
            finalStatus = "completed";
          } else {
            // Priority 2: read the last AI message from persisted state.
            // When a stage node calls interrupt(aiMsg), the stream stops before
            // the node's return executes, so current_question is not yet in
            // state. But the AI message that IS the question is in messages[].
            const messages = (currentState?.values?.messages ?? []) as any[];
            const lastAiMsg = [...messages]
              .reverse()
              .find(
                (m: any) =>
                  (m._getType?.() === "ai" || m.type === "ai") &&
                  !m.tool_calls?.length,
              );
            if (lastAiMsg) {
              const content =
                typeof lastAiMsg.content === "string"
                  ? lastAiMsg.content
                  : Array.isArray(lastAiMsg.content)
                    ? lastAiMsg.content
                        .filter((b: any) => b.type === "text")
                        .map((b: any) => b.text ?? "")
                        .join("")
                    : "";
              // Skip stage completion markers — they are not questions
              if (
                content &&
                !/\[STAGE\d+_(?:COMPLETE|SKIPPED[^\]]*)\]/.test(content)
              ) {
                finalStatus = "interrupt";
                finalQuestion = content;
              }
            }
            console.log("[SSE] fallback status:", finalStatus);
            console.log(
              "[SSE] fallback question (first 120):",
              finalQuestion?.slice(0, 120),
            );
          }
        } catch (stateErr) {
          console.error("Failed to read thread state after stream:", stateErr);
          finalStatus = finalPolicies ? "completed" : "running";
        }
        send("status", {
          status: finalStatus,
          question: finalQuestion,
          policies: finalPolicies,
        });
        send("done", {});
      } catch (err: any) {
        console.error("SSE stream error:", err);
        send("error", { message: err?.message ?? "Stream failed" });
        send("done", {});
      } finally {
        controller.close();
      }
    },
  });
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
