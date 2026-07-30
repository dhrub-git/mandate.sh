import { accountabilityGraph } from "@repo/agents";

import { NextRequest } from "next/server";
import {
  createUIMessageStream,
  createUIMessageStreamResponse,
  generateId,
} from "ai";

import fs from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

export const maxDuration = 60;
const ALLOWED_NODES = new Set([
              "pdf_to_text",
              "responsible_officer_assessment",
              "human_oversight_assessment",
              "audit_trail_assessment",
              "generate_final_accountability_report",
            ]);

export async function POST(req: NextRequest) {
  let filePath: string | null = null;

  try {
    const body = await req.json();

    console.log("=== INCOMING REQUEST DATA (Accountability) ===");
    console.log(JSON.stringify(body, null, 2));

    const filename = body?.state?.pdfFileName;
    const fileContent = body?.state?.pdfBuffer;

    // ✅ Validate input
    if (!filename) {
      return new Response("Missing pdfFileName", { status: 400 });
    }

    if (!fileContent) {
      return new Response("Missing pdfBuffer", { status: 400 });
    }

    if (!filename.toLowerCase().endsWith(".pdf")) {
      return new Response("Only PDF files are allowed", { status: 400 });
    }

    // ✅ Create upload directory
    const uploadDir = path.join(process.cwd(), "tmp");
    await fs.mkdir(uploadDir, { recursive: true });

    const safeFilename = `${randomUUID()}_${filename}`;
    filePath = path.join(uploadDir, safeFilename);

    // ✅ Decode base64 PDF
    const base64Data =
      typeof fileContent === "string" && fileContent.startsWith("data:")
        ? fileContent.split(",", 2)[1]
        : fileContent;

    const fileBytes =
      typeof base64Data === "string"
        ? Buffer.from(base64Data, "base64")
        : Buffer.from(base64Data);

    await fs.writeFile(filePath, fileBytes);

    // ✅ Run LangGraph workflow
    const events = await accountabilityGraph.streamEvents(
      { pdf_path: filePath },
      { version: "v2" },
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

            // Ignore token streaming
            // if (
            //   event.event === "on_chat_model_stream" ||
            //   event.event === "on_llm_stream"
            // ) {
            //   continue;
            // }
            

          }

          // FINAL RESULT
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
          console.error("Accountability workflow error:", err);

          writer.write({
            type: "error",
            errorText: `Accountability workflow failed: ${err.message}`,
          });
        } finally {
          // Cleanup temp file
          if (filePath) {
            await fs.unlink(filePath).catch(() => {});
          }
        }
      },
    });

    return createUIMessageStreamResponse({ stream });
  } catch (err: any) {
    console.error(err);

    if (filePath) {
      await fs.unlink(filePath).catch(() => {});
    }

    return new Response(err.message || "Error processing PDF", { status: 500 });
  }
}
