"use server";

import { createStreamableValue } from "@ai-sdk/rsc";
import {
  greenAIGraph,
  jobImpactGraph,
  fairnessAgentGraph,
  accountabilityGraph,
  communityBenefitGraph,
  privacySecurityGraph,
  riskAggregationGraph,
  transparencyGraph,
} from "@repo/agents";
import { generateId } from "ai";
import fs from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { getPoliciesByCompany } from "../../../packages/database/src/policy";
import { PolicyStatus, updatePolicy } from "@repo/database";

// --- Types ---

interface SustainabilityInput {
  prompt: string;
  region?: string;
  modelName?: string;
  instanceType?: string;
}

interface JobImpactInput {
  jobRole: string;
  aiToolDescription: string;
  employeeCount?: number;
  hourlyRateAvg?: number;
}

interface TransparencyInput {
  compliance_data: string;
}

// --- Helpers ---

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));




// import {
//   createHallucinationGraph,
//   HallucinationInputSchema,
//   type StreamEvent,
//   type AgentResult,
//   type HallucinationStateType, // ADD THIS IMPORT
// } from '@repo/agents';
// export async function runHallucinationAgent(input?: {
//   query?: string;
//   pdfPath?: string;
//   customTests?: any[];
// }) {
//   // Create streamable value
//   const stream = createStreamableValue<StreamEvent>();
  
//   // Run async
//   (async () => {
//     try {
//       const startTime = Date.now();
      
//       // Validate and set defaults
//       const validatedInput = HallucinationInputSchema.parse(input || {});
      
//       // Create graph
//       const graph = createHallucinationGraph();
      
//       // Stream node starts
//       stream.update({
//         type: 'node_start',
//         node: 'loadDocuments',
//         timestamp: Date.now(),
//       });
      
//       // Execute graph with streaming - ADD TYPE ASSERTION
//       const result = await graph.invoke({
//         query: validatedInput.query,
//         pdfPath: validatedInput.pdfPath,
//         customTests: validatedInput.customTests || [],
//       }) as unknown as  HallucinationStateType;
      
//       // Stream progress for each node
//       stream.update({
//         type: 'node_complete',
//         node: 'loadDocuments',
//         data: {
//           documentsLoaded: result.metadata?.documentsLoaded,
//           chunksCreated: result.metadata?.chunksCreated,
//         },
//       });
      
//       stream.update({
//         type: 'node_start',
//         node: 'ragAnswer',
//         timestamp: Date.now(),
//       });
      
//       stream.update({
//         type: 'node_complete',
//         node: 'ragAnswer',
//         data: {
//           answer: result.answer,
//           contextLength: result.retrievedContext?.length,
//         },
//       });
      
//       stream.update({
//         type: 'node_start',
//         node: 'promptfooEvaluation',
//         timestamp: Date.now(),
//       });
      
//       stream.update({
//         type: 'node_complete',
//         node: 'promptfooEvaluation',
//         data: {
//           evaluationResults: result.evaluationResults,
//         },
//       });
      
//       const executionTimeMs = Date.now() - startTime;
      
//       // Final result
//       const finalResult: AgentResult = {
//         answer: result.answer,
//         retrievedContext: result.retrievedContext,
//         evaluationResults: result.evaluationResults as any, // Cast evaluationResults
//         metadata: {
//           documentsLoaded: result.metadata?.documentsLoaded || 0,
//           chunksCreated: result.metadata?.chunksCreated || 0,
//           executionTimeMs,
//         },
//       };
      
//       stream.update({
//         type: 'complete',
//         result: finalResult,
//       });
      
//       stream.done();
//     } catch (error) {
//       console.error('Hallucination agent error:', error);
//       stream.update({
//         type: 'error',
//         message: 'Agent execution failed',
//         error: String(error),
//       });
//       stream.done();
//     }
//   })();
  
//   return {
//     stream: stream.value,
//   };
// }


async function runFileBasedAgent(
  formData: FormData,
  agentGraph: any,
  inputKey: string = "pdf_path",
) {
  const stream = createStreamableValue();
  const file = formData.get("file") as File;

  if (!file) {
    throw new Error("No file provided");
  }

  const uploadDir = path.join(process.cwd(), "tmp");
  const filePath = path.join(uploadDir, `${randomUUID()}_${file.name}`);

  try {
    await fs.mkdir(uploadDir, { recursive: true });
    const arrayBuffer = await file.arrayBuffer();
    await fs.writeFile(filePath, Buffer.from(arrayBuffer));
  } catch (e) {
    console.error("File upload error", e);
    throw e;
  }

  (async () => {
    try {
      const inputs = { [inputKey]: filePath };
      const events = await (agentGraph as any).streamEvents(inputs, {
        version: "v2",
      });

      stream.update({ type: "start", messageId: generateId() });

      let finalResult = null;

      for await (const event of events) {
        if (event.event === "on_chat_model_stream") continue;

        if (event.event === "on_chain_start") {
          stream.update({
            type: "data-step",
            data: { step_name: event.name, step_type: "START" },
          });
        }

        if (event.event === "on_chain_end") {
          stream.update({
            type: "data-step",
            data: { step_name: event.name, step_type: "END" },
          });

          if (event.data?.output) {
            // Safety: Convert to string to avoid serialization recursion on deep objects
            // and capturing massive state objects as raw JS objects
            try {
              finalResult = JSON.stringify(event.data.output);
            } catch (e) {
              finalResult = "Error serializing output";
            }
          }
        }
        await sleep(10); // Prevent event loop starvation
      }

      if (finalResult) {
        stream.update({ type: "data-final", data: finalResult });
      }

      stream.update({ type: "finish" });
      stream.done();
    } catch (error) {
      console.error("Agent Execution Error:", error);
      stream.error(
        error instanceof Error ? error.message : "An unknown error occurred",
      );
      stream.done();
    } finally {
      await fs
        .unlink(filePath)
        .catch((e) => console.error("Cleanup error:", e));
    }
  })();

  return { output: stream.value };
}

// --- Action 1: Sustainability Agent ---

export async function runSustainabilityAgent(input: SustainabilityInput) {
  const stream = createStreamableValue();

  (async () => {
    try {
      const inputs = {
        prompt: input.prompt,
        region: input.region || "ap-south-1",
        modelName: input.modelName || "gemini-2.0-flash",
        instanceType: input.instanceType || "ml.p4d.24xlarge",
      };

      const streamEvents = await (greenAIGraph as any).streamEvents(inputs, {
        version: "v2",
      });

      stream.update({ type: "start", messageId: generateId() });

      let fullText = "";

      for await (const event of streamEvents) {
        if (event.event === "on_chat_model_stream") continue;

        if (
          event.event === "on_chain_end" &&
          event.name === "classify" &&
          event.data.output
        ) {
          await sleep(1000);
          stream.update({
            type: "data-classification",
            data: event.data.output,
          });
        }

        if (
          event.event === "on_chain_end" &&
          event.name === "llm_metrics" &&
          event.data.output
        ) {
          stream.update({
            type: "data-metrics",
            data: event.data.output,
          });
          if (event.data.output.response) {
            fullText = event.data.output.response;
          }
        }
        await sleep(0);
      }

      if (fullText) {
        stream.update({
          type: "text-delta",
          id: "final-full-text",
          delta: fullText,
        });
      }

      stream.done();
    } catch (error) {
      console.error("Sustainability Agent Error:", error);
      stream.error(error);
      stream.done();
    }
  })();

  return { output: stream.value };
}

// --- Action 2: Job Impact Agent ---

export async function runJobImpactAgent(input: JobImpactInput) {
  const stream = createStreamableValue();

  (async () => {
    try {
      const inputs = {
        jobRole: input.jobRole,
        aiToolDescription: input.aiToolDescription,
        employeeCount: input.employeeCount || 100,
        hourlyRateAvg: input.hourlyRateAvg || 50,
      };

      const streamEvents = await (jobImpactGraph as any).streamEvents(inputs, {
        version: "v2",
      });

      stream.update({ type: "start", messageId: generateId() });

      for await (const event of streamEvents) {
        if (event.event === "on_chat_model_stream") continue;

        if (
          event.event === "on_chain_end" &&
          event.name === "onet" &&
          event.data.output
        ) {
          stream.update({ type: "data-onet", data: event.data.output });
        }

        if (
          event.event === "on_chain_end" &&
          event.name === "classify" &&
          event.data.output
        ) {
          await sleep(1000);
          stream.update({ type: "data-job-classify", data: event.data.output });
        }

        if (
          event.event === "on_chain_end" &&
          event.name === "upskill" &&
          event.data.output
        ) {
          stream.update({ type: "data-upskill", data: event.data.output });
        }

        if (
          event.event === "on_chain_end" &&
          event.name === "roi_calculation" &&
          event.data.output
        ) {
          stream.update({ type: "data-roi", data: event.data.output });
        }

        if (
          event.event === "on_chain_end" &&
          event.name === "final_report" &&
          event.data.output
        ) {
          stream.update({ type: "data-report", data: event.data.output });
        }
        await sleep(0);
      }
      stream.done();
    } catch (error) {
      console.error("Job Impact Agent Error:", error);
      stream.error(error);
      stream.done();
    }
  })();

  return { output: stream.value };
}

// --- Action 3: Fairness Agent (CSV Upload) ---

export async function runFairnessAgent(formData: FormData) {
  return runFileBasedAgent(formData, fairnessAgentGraph, "csv_path");
}

// --- Action 4: Accountability Agent (PDF Upload) ---

export async function runAccountabilityAgent(formData: FormData) {
  const stream = createStreamableValue();
  const file = formData.get("file") as File;

  if (!file) {
    throw new Error("No file provided");
  }

  const uploadDir = path.join(process.cwd(), "tmp");
  const filePath = path.join(uploadDir, `${randomUUID()}_${file.name}`);

  try {
    await fs.mkdir(uploadDir, { recursive: true });
    const arrayBuffer = await file.arrayBuffer();
    await fs.writeFile(filePath, Buffer.from(arrayBuffer));
  } catch (e) {
    console.error("File upload error", e);
    throw e;
  }

  (async () => {
    try {
      const inputs = { pdf_path: filePath };
      const events = await (accountabilityGraph as any).streamEvents(inputs, {
        version: "v2",
      });

      stream.update({ type: "start", messageId: generateId() });
      let finalResult = null;

      const ALLOWED_NODES = new Set([
        "pdf_to_text",
        "responsible_officer_assessment",
        "human_oversight_assessment",
        "audit_trail_assessment",
        "generate_final_accountability_report",
      ]);

      for await (const event of events) {
        if (!ALLOWED_NODES.has(event.name)) continue;

        if (event.event === "on_chain_start") {
          stream.update({
            type: "data-step",
            data: { step_name: event.name, step_type: "START" },
          });
        }

        if (event.event === "on_chain_end") {
          stream.update({
            type: "data-step",
            data: { step_name: event.name, step_type: "END" },
          });

          if (
            event.name === "generate_final_accountability_report" &&
            event.data?.output
          ) {
            const report = event.data.output.final_accountability_report;
            finalResult =
              typeof report === "string" ? report : JSON.stringify(report);
          }
        }
        await sleep(10);
      }

      if (finalResult) {
        stream.update({ type: "data-final", data: finalResult });
      }

      stream.update({ type: "finish" });
      stream.done();
    } catch (error) {
      console.error("Accountability Agent Error:", error);
      stream.error(
        error instanceof Error ? error.message : "An unknown error occurred",
      );
      stream.done();
    } finally {
      await fs
        .unlink(filePath)
        .catch((e) => console.error("Cleanup error:", e));
    }
  })();

  return { output: stream.value };
}

// --- Action 5: Community Benefit Agent (PDF Upload) ---

export async function runCommunityBenefitAgent(formData: FormData) {
  const stream = createStreamableValue();
  const file = formData.get("file") as File;

  if (!file) {
    throw new Error("No file provided");
  }

  // 1. File Upload Logic
  const uploadDir = path.join(process.cwd(), "tmp");
  const filePath = path.join(uploadDir, `${randomUUID()}_${file.name}`);

  try {
    await fs.mkdir(uploadDir, { recursive: true });
    const arrayBuffer = await file.arrayBuffer();
    await fs.writeFile(filePath, Buffer.from(arrayBuffer));
  } catch (e) {
    console.error("File upload error", e);
    throw e;
  }

  (async () => {
    try {
      const inputs = { pdf_path: filePath };
      const events = await (communityBenefitGraph as any).streamEvents(inputs, {
        version: "v2",
      });

      stream.update({ type: "start", messageId: generateId() });
      let finalResult = null;

      // 2. Define Allowed Nodes (The 5 steps you want to see)
      const ALLOWED_NODES = new Set([
        "pdf_to_text",
        "perform_benefit_analysis",
        "perform_risk_assessment",
        "perform_stakeholder_analysis",
        "generate_final_report",
      ]);

      for await (const event of events) {
        // Filter: Ignore internal LangGraph events
        if (!ALLOWED_NODES.has(event.name)) continue;

        // Step Start
        if (event.event === "on_chain_start") {
          stream.update({
            type: "data-step",
            data: { step_name: event.name, step_type: "START" },
          });
        }

        // Step End
        if (event.event === "on_chain_end") {
          stream.update({
            type: "data-step",
            data: { step_name: event.name, step_type: "END" },
          });

          // Capture output from the final node
          if (event.name === "generate_final_report" && event.data?.output) {
            // Explicitly extract string to ensure no object references causing recursion
            const report = event.data.output.final_report;
            finalResult =
              typeof report === "string" ? report : JSON.stringify(report);
          }
        }
        await sleep(10); // Optional: Throttle updates for better UI experience
      }

      // 3. Send Final Result
      if (finalResult) {
        stream.update({ type: "data-final", data: finalResult });
      }

      stream.update({ type: "finish" });
      stream.done();
    } catch (error) {
      console.error("Community Benefit Agent Error:", error);
      stream.error(
        error instanceof Error ? error.message : "An unknown error occurred",
      );
      stream.done();
    } finally {
      // 4. Cleanup
      await fs
        .unlink(filePath)
        .catch((e) => console.error("Cleanup error:", e));
    }
  })();

  return { output: stream.value };
}

// --- Action 6: Privacy & Security Agent (PDF Upload) ---

export async function runPrivacySecurityAgent(formData: FormData) {
  const stream = createStreamableValue();
  const file = formData.get("file") as File;

  if (!file) {
    throw new Error("No file provided");
  }

  const uploadDir = path.join(process.cwd(), "tmp");
  const filePath = path.join(uploadDir, `${randomUUID()}_${file.name}`);

  try {
    await fs.mkdir(uploadDir, { recursive: true });
    const arrayBuffer = await file.arrayBuffer();
    await fs.writeFile(filePath, Buffer.from(arrayBuffer));
  } catch (e) {
    console.error("File upload error", e);
    throw e;
  }

  (async () => {
    try {
      const inputs = { pdf_path: filePath };
      const events = await (privacySecurityGraph as any).streamEvents(inputs, {
        version: "v2",
      });

      stream.update({ type: "start", messageId: generateId() });
      let finalResult = null;

      const ALLOWED_NODES = new Set([
        "pdf_to_text",
        "privacy_impact_assessment",
        "security_assessment",
        "compliance_governance_check",
        "generate_final_privacy_report",
      ]);

      for await (const event of events) {
        if (!ALLOWED_NODES.has(event.name)) continue;

        if (event.event === "on_chain_start") {
          stream.update({
            type: "data-step",
            data: { step_name: event.name, step_type: "START" },
          });
        }

        if (event.event === "on_chain_end") {
          stream.update({
            type: "data-step",
            data: { step_name: event.name, step_type: "END" },
          });

          if (
            event.name === "generate_final_privacy_report" &&
            event.data?.output
          ) {
            const report = event.data.output.final_privacy_report;
            finalResult =
              typeof report === "string" ? report : JSON.stringify(report);
          }
        }
        await sleep(10);
      }

      if (finalResult) {
        stream.update({ type: "data-final", data: finalResult });
      }

      stream.update({ type: "finish" });
      stream.done();
    } catch (error) {
      console.error("Privacy & Security Agent Error:", error);
      stream.error(
        error instanceof Error ? error.message : "An unknown error occurred",
      );
      stream.done();
    } finally {
      await fs
        .unlink(filePath)
        .catch((e) => console.error("Cleanup error:", e));
    }
  })();

  return { output: stream.value };
}

// --- Action 7: Risk Aggregation Agent (PDF Upload) ---

export async function runRiskAggregationAgent(formData: FormData) {
  const stream = createStreamableValue();
  const file = formData.get("file") as File;

  if (!file) {
    throw new Error("No file provided");
  }

  const uploadDir = path.join(process.cwd(), "tmp");
  const filePath = path.join(uploadDir, `${randomUUID()}_${file.name}`);

  try {
    await fs.mkdir(uploadDir, { recursive: true });
    const arrayBuffer = await file.arrayBuffer();
    await fs.writeFile(filePath, Buffer.from(arrayBuffer));
  } catch (e) {
    console.error("File upload error", e);
    throw e;
  }

  (async () => {
    try {
      const inputs = { pdf_path: filePath };
      const events = await (riskAggregationGraph as any).streamEvents(inputs, {
        version: "v2",
      });

      stream.update({ type: "start", messageId: generateId() });
      let finalResult = null;

      const ALLOWED_NODES = new Set([
        "pdf_to_json",
        "consolidate_risks",
        "integrated_mitigation",
        "submission_decision",
        "final_reports",
      ]);

      for await (const event of events) {
        if (!ALLOWED_NODES.has(event.name)) continue;

        if (event.event === "on_chain_start") {
          stream.update({
            type: "data-step",
            data: { step_name: event.name, step_type: "START" },
          });
        }

        if (event.event === "on_chain_end") {
          stream.update({
            type: "data-step",
            data: { step_name: event.name, step_type: "END" },
          });

          if (event.name === "final_reports" && event.data?.output) {
            const report = event.data.output.final_integrated_report_package;
            finalResult =
              typeof report === "string" ? report : JSON.stringify(report);
          }
        }
        await sleep(10);
      }

      if (finalResult) {
        stream.update({ type: "data-final", data: finalResult });
      }

      stream.update({ type: "finish" });
      stream.done();
    } catch (error) {
      console.error("Risk Aggregation Agent Error:", error);
      stream.error(
        error instanceof Error ? error.message : "An unknown error occurred",
      );
      stream.done();
    } finally {
      await fs
        .unlink(filePath)
        .catch((e) => console.error("Cleanup error:", e));
    }
  })();

  return { output: stream.value };
}

// --- Action 8: Transparency Assessment Agent (Text Input) ---

export async function runTransparencyAgent(input: TransparencyInput) {
  const stream = createStreamableValue();

  (async () => {
    try {
      const inputs = { compliance_data: input.compliance_data };
      const events = await (transparencyGraph as any).streamEvents(inputs, {
        version: "v2",
      });

      stream.update({ type: "start", messageId: generateId() });
      let finalResult = null;

      for await (const event of events) {
        if (event.event === "on_chat_model_stream") continue;

        if (event.event === "on_chain_start") {
          stream.update({
            type: "data-step",
            data: { step_name: event.name, step_type: "START" },
          });
        }

        if (event.event === "on_chain_end") {
          stream.update({
            type: "data-step",
            data: { step_name: event.name, step_type: "END" },
          });
          if (event.data?.output) {
            finalResult = event.data.output;
          }
        }
        await sleep(0);
      }

      if (finalResult) {
        stream.update({ type: "data-final", data: finalResult });
      }

      stream.update({ type: "finish" });
      stream.done();
    } catch (error) {
      console.error("Transparency Agent Error:", error);
      stream.error(error);
      stream.done();
    }
  })();

  return { output: stream.value };
}

export async function getPoliciesByThread(threadId: string) {
  return await getPoliciesByCompany(threadId);
}

export async function changePolicyStatus(policyId: string, newStatus: PolicyStatus, changeNote: string) {
  return await updatePolicy(policyId, newStatus, changeNote);
}