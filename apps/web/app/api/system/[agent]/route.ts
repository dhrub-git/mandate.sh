// import { toUIMessageStream } from "@ai-sdk/langchain";
// import {
//   createUIMessageStream,
//   createUIMessageStreamResponse,
//   generateId,
// } from "ai";
// import { greenAIGraph } from "@repo/agents";
// const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// export const maxDuration = 60;
// export async function POST(req: Request) {
//   const {
//     prompt,
//     region = "ap-south-1",
//     modelName = "gemini-2.0-flash", // Updated default
//     instanceType = "ml.p4d.24xlarge",
//   } = await req.json();
//   // Initialize stream with inputs
//   const streamEvents = await greenAIGraph.streamEvents(
//     {
//       prompt,
//       region,
//       modelName,
//       instanceType,
//     },
//     {
//       version: "v2",
//     },
//   );
//   const stream = createUIMessageStream({
//     execute: async ({ writer }) => {
//       writer.write({ type: "start", messageId: generateId() });
//       const wrappedStream = (async function* () {
//         let fullText = "";
//         for await (const event of streamEvents) {
//           if (
//             event.event === "on_chain_end" &&
//             event.name === "classify" &&
//             event.data.output
//           ) {
//             await sleep(1000); // 1 second delay before sending classification
//             writer.write({
//               type: "data-classification",
//               data: event.data.output,
//             });
//           }

//           if (
//             event.event === "on_chain_end" &&
//             event.name === "llm_metrics" &&
//             event.data.output
//           ) {
//             writer.write({
//               type: "data-metrics",
//               data: event.data.output,
//             });

//             if (event.data.output.response) {
//               fullText = event.data.output.response;
//             }
//           }

//           if (event.event === "on_chat_model_stream") {
//             continue;
//           }

//           yield event;
//         }

//         if (fullText) {
//           writer.write({
//             type: "text-delta",
//             id: "final-full-text",
//             delta: fullText,
//           });
//         }
//       })();

//       // @ts-expect-error - toUIMessageStream supports streamEvents iterator
//       await writer.merge(toUIMessageStream(wrappedStream));
//     },
//   });
//   return createUIMessageStreamResponse({ stream });
// // }

// import { LangChainAdapter } from "ai";
// import { jobImpactGraph } from "@repo/agents";

// export async function POST(req: Request) {
//   const {
//     jobRole,
//     aiToolDescription,
//     employeeCount = 0,
//     hourlyRateAvg = 0
//   } = await req.json();
//   const stream = await jobImpactGraph.streamEvents(
//     {
//       jobRole,
//       aiToolDescription,
//       employeeCount,
//       hourlyRateAvg,
//     },
//     {
//       version: "v2",
//     }
//   );
//   return LangChainAdapter.toDataStreamResponse(stream);
// } }

import { toUIMessageStream } from "@ai-sdk/langchain";
import {
  createUIMessageStream,
  createUIMessageStreamResponse,
  generateId,
} from "ai";
import { greenAIGraph, jobImpactGraph ,hallucinationGraph} from "@repo/agents";
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
export const maxDuration = 60;
export async function POST(
  req: Request,
  props: { params: Promise<{ agent: string }> },
) {
  const params = await props.params;
  const { agent } = params;
  const body = await req.json();
  // 1. LOG THE BODY
  console.log("--> API Received Body:", JSON.stringify(body, null, 2));
  let graph;
  let inputs;
  // 1. Switch Case for Agent Selection & Input Mapping
  switch (agent) {
    case "sustainability":
      graph = greenAIGraph;
      inputs = {
        prompt: body.prompt,
        region: body.region || "ap-south-1",
        modelName: body.modelName || "gemini-2.0-flash",
        instanceType: body.instanceType || "ml.p4d.24xlarge",
      };
      break;
    case "job_impact":
      graph = jobImpactGraph;
      inputs = {
        jobRole: body.job_role,
        aiToolDescription: body.ai_tool_description,
        // Default values if not provided
        employeeCount: body.employee_count || 100,
        hourlyRateAvg: body.hourly_rate_avg || 50,
      };
      break;
      case "hallucination":
        // For the hallucination agent, we expect a question input
        graph = hallucinationGraph;
        inputs = {
          question: body.question,
          fileBase64:body.file //expecting base64 from UI
        };
        break;
    default:
      return new Response(`Agent '${agent}' not found`, { status: 404 });
  }
  // 2. Initialize the Event Stream
  const streamEvents = await (graph as any).streamEvents(inputs, {
    version: "v2",
  });
  const stream = createUIMessageStream({
    execute: async ({ writer }) => {
      // Manual Start Event
      writer.write({ type: "start", messageId: generateId() });
      const wrappedStream = (async function* () {
        let fullText = ""; // Only used for sustainability agent's text response
        for await (const event of streamEvents) {
          // --- SHARED: Suppress standard token streaming ---
          if (event.event === "on_chat_model_stream") {
            continue;
          }
          // ============================================================
          // LOGIC: Sustainability Agent
          // ============================================================
          if (agent === "sustainability") {
            // Intercept Classification
            if (
              event.event === "on_chain_end" &&
              event.name === "classify" &&
              event.data.output
            ) {
              await sleep(1000); // Pacing delay
              console.log("Sending data classification", event.data.output);
              writer.write({
                type: "data-classification",
                data: event.data.output,
              });
            }
            // Intercept Metrics
            if (
              event.event === "on_chain_end" &&
              event.name === "llm_metrics" &&
              event.data.output
            ) {
              writer.write({
                type: "data-metrics",
                data: event.data.output,
              });
              // Capture the text response to send at the very end
              if (event.data.output.response) {
                fullText = event.data.output.response;
              }
            }
          }
          // ============================================================
          // LOGIC: Job Impact Agent
          // ============================================================
          if (agent === "job_impact") {
            // console.log("Received event", event);
            // 1. O*NET Data
            if (
              event.event === "on_chain_end" &&
              event.name === "onet" &&
              event.data.output
            ) {
              console.log("Sending data-onet", event.data.output);
              writer.write({
                type: "data-onet",
                data: event.data.output,
              });
            }

            // 2. Job Classification (with delay for UX)
            if (
              event.event === "on_chain_end" &&
              event.name === "classify" &&
              event.data.output
            ) {
              console.log("Sending data-job-classify", event.data.output);
              await sleep(1000);
              writer.write({
                type: "data-job-classify",
                data: event.data.output,
              });
            }

            // 3. Upskilling Plan
            if (
              event.event === "on_chain_end" &&
              event.name === "upskill" &&
              event.data.output
            ) {
              console.log("Sending data-upskill", event.data.output);
              writer.write({
                type: "data-upskill",
                data: event.data.output,
              });
            }

            // 4. ROI Calculation
            if (
              event.event === "on_chain_end" &&
              event.name === "roi_calculation" &&
              event.data.output
            ) {
              console.log("Sending data-roi", event.data.output);
              writer.write({
                type: "data-roi",
                data: event.data.output,
              });
            }
            if (
              event.event === "on_chain_end" &&
              event.name === "final_report" &&
              event.data.output
            ) {
              console.log("Sending data-report", event.data.output);
              writer.write({
                type: "data-report",
                data: event.data.output, // { report: ... }
              });
            }
          }

         // === HALLUCINATION AGENT LOGIC ===
          if (agent === "hallucination") {
            
            // 1. Ingest Complete
            if (event.event === "on_chain_end" && event.name === "ingest") {
               writer.write({
                 type: "data-onet",
                 data: { step: "ingest", status: "complete" }
               });
            }
            // 2. Retrieval Complete (Send Context)
            if (event.event === "on_chain_end" && event.name === "retrieve" && event.data.output) {
               writer.write({
                 type: "data-onet",
                 data: { 
                   step: "retrieve", 
                   status: "complete", 
                   context: event.data.output.context 
                 }
               });
            }
            // 3. Generation Complete (Send Answer)
            if (event.event === "on_chain_end" && event.name === "generate" && event.data.output) {
               writer.write({
                 type: "data-onet",
                 data: { step: "generate", status: "complete" }
               });
               
               // Stream the text answer visually
               writer.write({
                 type: "text-delta",
                 id: "final-answer",
                 delta: event.data.output.answer
               });
            }
            // 4. Hallucination Check Complete (Send Score)
            if (event.event === "on_chain_end" && event.name === "check" && event.data.output) {
               writer.write({
                 type: "data-onet",
                 data: { 
                   step: "check", 
                   status: "complete", 
                   score: event.data.output.hallucinationScore,
                   reason: event.data.output.hallucinationReasoning
                 }
               });
            }
          }
          yield event;
        }
        // --- Final Text Block (Sustainability Only) ---
        // The Job Impact agent is data-only and doesn't produce a final chat text block
        if (agent === "sustainability" && fullText) {
          writer.write({
            type: "text-delta",
            id: "final-full-text",
            delta: fullText,
          });
        }
      })();
      await writer.merge(toUIMessageStream(wrappedStream));
    },
  });
  return createUIMessageStreamResponse({ stream });
}
