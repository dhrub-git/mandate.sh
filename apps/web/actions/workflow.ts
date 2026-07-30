"use server";
import { randomUUID } from "crypto";
import {
  mandateStartWorkflow,
  mandateResumeWorkflow,
  getMandateThreadHistory,
} from "@repo/agents";
// Define strict return types
type WorkflowStatus = "interrupt" | "completed" | "running" | "error";
type WorkflowResult =
  | {
      success: true;
      threadId: string;
      status: WorkflowStatus;
      question?: string;
      policies?: string;
      data?: any;
    }
  | {
      success: false;
      error: string;
    };
type ResumeResult =
  | {
      success: true;
      status: WorkflowStatus;
      question?: string;
      policies?: string;
      data?: any;
    }
  | {
      success: false;
      error: string;
    };
type StatusResult =
  | {
      success: true;
      status: WorkflowStatus;
      question?: string;
      policies?: string;
      checkpointId?: string;
      nextNodes?: string[];
      totalCheckpoints?: number;
    }
  | {
      success: false;
      error: string;
    };
/**
 * Start a new mandate workflow
 */
export async function startMandateWorkflow(
  onboardingData: any,
): Promise<WorkflowResult> {
  try {
    const threadId = randomUUID();

    const result = await mandateStartWorkflow(threadId, {
      onboarding_data: JSON.stringify(onboardingData),
    });
    // Normalize status to strict type
    let status: WorkflowStatus = "running";
    if (result.status === "interrupt") status = "interrupt";
    else if (result.status === "completed") status = "completed";
    else if (result.status === "error") status = "error";
    const question =
      typeof result.question === "string" ? result.question : undefined;
    return {
      success: true,
      threadId,
      status,
      question: question,
      data: result,
    };
  } catch (error: any) {
    console.error("Error starting mandate workflow:", error);
    return {
      success: false,
      error: error.message || "Failed to start workflow",
    };
  }
}
/**
 * Resume workflow after user responds to interrupt
 */
export async function resumeMandateWorkflow(
  threadId: string,
  userInput: string,
): Promise<ResumeResult> {
  try {
    if (!threadId || !userInput) {
      throw new Error("Thread ID and user input are required");
    }
    const result = await mandateResumeWorkflow(threadId, userInput);
    // Normalize status to strict type
    let status: WorkflowStatus = "running";
    if (result.status === "interrupt") status = "interrupt";
    else if (result.status === "completed") status = "completed";
    else if (result.status === "error") status = "error";
    // ✅ Type assertion for question
    const question =
      typeof result.question === "string" ? result.question : undefined;
    // ✅ Type assertion for policies
    const policies =
      typeof result.policies === "string" ? result.policies : undefined;
    return {
      success: true,
      status,
      question: question,
      policies: policies,
      data: result,
    };
  } catch (error: any) {
    console.error("Error resuming mandate workflow:", error);
    return {
      success: false,
      error: error.message || "Failed to resume workflow",
    };
  }
}
/**
 * Get current workflow status
 */
export async function getMandateWorkflowStatus(
  threadId: string,
): Promise<StatusResult> {
  try {
    if (!threadId) {
      throw new Error("Thread ID is required");
    }
    const history = await getMandateThreadHistory(threadId);
    if (!history || history.total_checkpoints === 0) {
      return {
        success: false,
        error: "No workflow found for this thread",
      };
    }
    const latestCheckpoint = history.history[0];
    // 🐛 DEBUG LOGGING
    console.log("\n=== getMandateWorkflowStatus DEBUG ===");
    console.log("Thread ID:", threadId);
    console.log("Total checkpoints:", history.total_checkpoints);
    console.log("Latest checkpoint ID:", latestCheckpoint.checkpoint_id);
    console.log("Next nodes:", JSON.stringify(latestCheckpoint.next));
    console.log("Has policies:", !!latestCheckpoint.values?.policies);
    console.log("Message count:", latestCheckpoint.values?.messages?.length);
    if (latestCheckpoint.values?.messages) {
      const messages = latestCheckpoint.values.messages;
      const lastMsg = messages[messages.length - 1];
      console.log("\nLast message:");
      console.log(
        "- Type:",
        lastMsg?._getType?.() || lastMsg?.type || lastMsg?.constructor?.name,
      );
      console.log("- Has tool_calls:", !!lastMsg?.tool_calls?.length);
      console.log("- Content type:", typeof lastMsg?.content);
      console.log(
        "- Content (first 200 chars):",
        typeof lastMsg?.content === "string"
          ? lastMsg.content.substring(0, 200)
          : JSON.stringify(lastMsg?.content).substring(0, 200),
      );
    }

    console.log("=====================================\n");

    const hasPolicies = !!latestCheckpoint.values?.policies;
const isComplete = latestCheckpoint.next?.length === 0;
let status: WorkflowStatus = "running";
let question: string | undefined = undefined;
// 🔑 PRIORITY 1: Check state.current_question (Solution 3)
if (latestCheckpoint.values?.current_question) {
  console.log("✅ Found question in state.current_question");
  status = "interrupt";
  question = latestCheckpoint.values.current_question;
}
// PRIORITY 2: Fallback to message detection (existing logic)
else {
  const messages = latestCheckpoint.values?.messages || [];
  if (messages.length > 0) {
    const lastMessage = messages[messages.length - 1];
    const lastMessageType = lastMessage?._getType?.() || lastMessage?.type;
    
    if (lastMessageType === "tool") {
      status = "running";
    }
    else if (lastMessageType === "ai" && !lastMessage.tool_calls?.length) {
      status = "interrupt";
      // Extract question from message content...
    }
    else if (lastMessageType === "ai" && lastMessage.tool_calls?.length > 0) {
      status = "running";
    }
  }
}
// Override with completion
if (hasPolicies || isComplete) {
  status = "completed";
}
    return {
      success: true,
      status,
      question,
      policies: latestCheckpoint.values?.policies,
      checkpointId: latestCheckpoint.checkpoint_id,
      nextNodes: latestCheckpoint.next,
      totalCheckpoints: history.total_checkpoints,
    };
  } catch (error: any) {
    console.error("Error getting workflow status:", error);
    return {
      success: false,
      error: error.message || "Failed to get workflow status",
    };
  }
}
