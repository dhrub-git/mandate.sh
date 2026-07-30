import { Command, isInterrupted, INTERRUPT } from "@langchain/langgraph";
import { buildGraph } from "./builder";
import { buildStageSystemPrompt } from "../config/prompts";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";

let graphPromise: ReturnType<typeof buildGraph> | null = null;
function getGraph() {
  if (!graphPromise) {
    graphPromise = buildGraph();
  }
  return graphPromise;
}

function buildInitialMessages(onboardingData: unknown) {
  return [
    new SystemMessage(buildStageSystemPrompt(2, onboardingData)),
    new HumanMessage(
      `Stage 1 : Data:\n${typeof onboardingData === "string" ? onboardingData : JSON.stringify(onboardingData, null, 2)}`,
    ),
  ];
}

/**
 * Start a new workflow
 */
export async function startWorkflow(threadId: string, input: any) {
  const graph = await getGraph();
  const onboardingData = input?.onboarding_data ?? input;

  const result = await graph.invoke(
    {
      ...input,
      thread_id: threadId,
      stage2_data: [],
      stage3_data: [],
      stage4_data: [],
      risk_classifications: null,
      messages: buildInitialMessages(onboardingData),
    },
    {
      configurable: { thread_id: threadId },
    },
  );
  return formatGraphResponse(result);
}

/**
 * Resume after interrupt
 */
export async function resumeWorkflow(threadId: string, userInput: string) {
  const graph = await getGraph();
  const result = await graph.invoke(new Command({ resume: userInput }), {
    configurable: { thread_id: threadId },
  });

  return formatGraphResponse(result);
}

export async function* streamWorkflowEvents(
  threadId: string,
  action: "start" | "resume",
  input: any,
): AsyncGenerator<any> {
  const graph = await getGraph();
  const config = {
    configurable: { thread_id: threadId },
    version: "v2" as const,
  };

  const onboardingData = input?.onboarding_data ?? input;
  const graphInput =
    action === "resume"
      ? new Command({ resume: input })
      : {
          ...input,
          thread_id: threadId,
          stage2_data: [],
          stage3_data: [],
          stage4_data: [],
          risk_classifications: null,
          messages: buildInitialMessages(onboardingData),
        };

  for await (const result of graph.streamEvents(graphInput, config)) {
    yield result;
  }
}

export async function getThreadStateHistory(thread_id: string) {
  if (!thread_id) {
    throw new Error("thread_id is required");
  }

  const config = {
    configurable: {
      thread_id,
    },
  };

  const states: any[] = [];

  const graph = await getGraph();
  for await (const state of graph.getStateHistory(config)) {
    states.push({
      checkpoint_id: state.config.configurable?.checkpoint_id,
      next: state.next,
      values: state.values,
      created_at: state.createdAt,
    });
  }

  return {
    thread_id,
    total_checkpoints: states.length,
    history: states,
  };
}

export async function getThreadCurrentState(thread_id: string) {
  const config = { configurable: { thread_id: thread_id } };
  const graph = await getGraph();
  return await graph.getState(config);
}

/**
 * Normalize response for frontend
 */
function formatGraphResponse(result: any) {
  if (isInterrupted(result)) {
    const interrupts = result[INTERRUPT];
    const question = interrupts[0]?.value;

    return {
      status: "interrupt",
      question,
    };
  }

  if (result?.policies) {
    return {
      status: "completed",
      policies: result.policies,
    };
  }

  return {
    status: "running",
    data: result,
  };
}
