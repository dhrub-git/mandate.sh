import { NextRequest } from "next/server";
import {
  createUIMessageStream,
  createUIMessageStreamResponse,
  generateId,
} from "ai";

import { transparencyGraph } from "@repo/agents";

export const maxDuration = 60;
 const ALLOWED_NODES = new Set([
              "run_explainability_assessment",
              "public_disclosure",
              "decision_review",
              "gipa_compliance",
            ]);


export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    console.log("=== INCOMING REQUEST DATA (Transparency) ===");
    console.log(JSON.stringify(body, null, 2));

    const complianceData = body?.state?.compliance_data;

    if (!complianceData) {
      return new Response("Missing compliance_data in request state", {
        status: 400,
      });
    }

    // Start LangGraph event stream
    const events = await transparencyGraph.streamEvents(
      {
        compliance_data: complianceData,
      },
      {
        version: "v2",
      },
    );

    const stream = createUIMessageStream({
      execute: async ({ writer }) => {
        writer.write({
          type: "start",
          messageId: generateId(),
        });

        const finalResult: Record<string, any> = {};

        try {
          for await (const event of events) {
             if (!ALLOWED_NODES.has(event.name)) {
              continue;
            }
            // STEP START
            if (event.event === "on_chain_start") {
              writer.write({
                type: "data-step",
                data: {
                  step_name: event.name,
                  step_type: "START",
                },
              });
            }

            // STEP END
            if (event.event === "on_chain_end") {
              writer.write({
                type: "data-step",
                data: {
                  step_name: event.name,
                  step_type: "END",
                },
              });

              if (event.data?.output) {
                finalResult[event.name] = event.data.output;
              }
            }

            // Ignore token streaming events
            // if (
            //   event.event === "on_chat_model_stream" ||
            //   event.event === "on_llm_stream"
            // ) {
            //   continue;
            // }
           
           
          }

          // SEND FINAL RESULT
          if (finalResult) {
            writer.write({
              type: "data-final",
              data: finalResult,
            });
          }

          writer.write({
            type: "finish",
          });
        } catch (err: any) {
          console.error("Transparency workflow error:", err);

          writer.write({
            type: "error",
            errorText: `Transparency workflow failed: ${err.message}`,
          });
        }
      },
    });

    return createUIMessageStreamResponse({ stream });
  } catch (err: any) {
    console.error(err);

    return new Response(err.message || "Internal server error", {
      status: 500,
    });
  }
}
