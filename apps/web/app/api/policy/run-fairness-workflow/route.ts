
import { NextRequest } from "next/server";
import {
  createUIMessageStream,
  createUIMessageStreamResponse,
  generateId,
} from "ai";

import fs from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

import { fairnessAgentGraph } from "@repo/agents";
export const maxDuration = 60;
const ALLOWED_NODES= new Set([
    
    "csv_to_json",
    "run_data_quality",
    "run_bias_analysis",
    "calculate_fairness_metrics",
    "perform_mitigation",
  ]);
  

export async function POST(req: NextRequest) {
  const body = await req.json();

  const filename = body?.state?.csvFileName;
  const fileContent = body?.state?.csvBuffer;

  if (!filename || !fileContent) {
    return new Response("Invalid input", { status: 400 });
  }

  const uploadDir = path.join(process.cwd(), "tmp");
  await fs.mkdir(uploadDir, { recursive: true });

  const filePath = path.join(uploadDir, `${randomUUID()}_${filename}`);

  try {
    const base64Data =
      typeof fileContent === "string" && fileContent.startsWith("data:")
        ? fileContent.split(",", 2)[1]
        : fileContent;

    await fs.writeFile(filePath, Buffer.from(base64Data, "base64"));

    // ✅ USE streamEvents (NOT stream)
    const events = await fairnessAgentGraph.streamEvents(
      { csv_path: filePath },
      { version: "v2" }
    );

    const stream = createUIMessageStream({
      execute: async ({ writer }) => {
        writer.write({
          type: "start",
          messageId: generateId(),
        });

        // let finalResult: any = null;
        const finalResult: Record<string, any> = {};


        try {
          for await (const event of events) {
            if(!ALLOWED_NODES.has(event.name)){
              continue
            }
            

            
            
            // ✅ STEP START
            if (event.event === "on_chain_start") {
              writer.write({
                type: "data-step",
                data: {
                  step_name: event.name,
                  step_type: "START",
                },
              });
            }

            // ✅ STEP END
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

            // ❌ IGNORE token streaming completely
            // if (
            //   event.event === "on_chat_model_stream" ||
            //   event.event === "on_llm_stream"
            // ) {
            //   continue;
            // }
          }

          // ✅ SEND FINAL RESULT ONCE
          if (finalResult) {
            writer.write({
              type: "data-final",
              data: finalResult,
            });
          }

          writer.write({ type: "finish" });

        } finally {
          await fs.unlink(filePath).catch(() => {});
        }
      },
    });

    return createUIMessageStreamResponse({ stream });

  } catch (err: any) {
    await fs.unlink(filePath).catch(() => {});
    return new Response(err.message, { status: 500 });
  }
}