import {
  SystemMessage,
  HumanMessage,
  ToolMessage,
} from "@langchain/core/messages";
import { model, model1 } from "../config/model";
import { webSearch } from "../tools/webSearch";
import { interrupt } from "@langchain/langgraph";
import { WorkflowState } from "../graph/state";
import { buildStageSystemPrompt } from "../config/prompts";
import { formatRiskSummary } from "../config/onboardingContext";
import { compactStageSummary } from "../config/stageSummaries";
import {
  stageCompleteTool,
  getStageCompleteCall,
  isStageMarkedComplete,
  nonCompleteToolCalls,
} from "../tools/stageComplete";
import { sanitizeMessages, contentToString } from "./messageUtils";

export async function stage3(
  state: WorkflowState,
): Promise<Record<string, unknown>> {
  console.log("Hello from Stage 3 Trial");

  const modelWithTools = model.bindTools([webSearch, stageCompleteTool]);
  const messages = state.messages;

  const cleanMessages = sanitizeMessages(messages);
  const response = await modelWithTools.invoke(cleanMessages);
  const aiMsg = contentToString(response.content).trim();
  const completeCall = getStageCompleteCall(response, 3);

  const riskSummary = formatRiskSummary(state.risk_classifications);

  if (
    isStageMarkedComplete(response, 3, [
      "[STAGE3_COMPLETE]",
      "[STAGE3_SKIPPED — PROVIDER ONLY]",
    ])
  ) {
    console.log("stage 3 completed / skipped");

    const skipped =
      completeCall?.args.providerOnlySkip === true ||
      aiMsg.includes("[STAGE3_SKIPPED — PROVIDER ONLY]");

    const stage3_summary = compactStageSummary(
      3,
      completeCall?.args.summary || aiMsg,
    );

    const stage4System = new SystemMessage(
      buildStageSystemPrompt(4, state.onboarding_data),
    );

    const stage4Human = new HumanMessage(`
stage 1 data:
${state.onboarding_data}

stage 2 summary:
${state.stage2_summary ?? "(see stage2_data)"}

stage 3 summary:
${stage3_summary}

EU AI Act risk classifications:
${riskSummary}
`);

    const drafter = skipped ? model : model1;

    const draftResponse = await drafter.invoke([
      new SystemMessage(
        "You are an expert AI Governance Policy Drafter. Output ONLY the markdown text for the sections requested without conversational filler.",
      ),
      new HumanMessage(
        `Generate a professional Markdown draft for the "Governance Structure" and "Roles & Responsibilities" sections based on the following data:\n\nOnboarding Data:\n${state.onboarding_data}\n\nStage 3 Summary:\n${stage3_summary}\n\nRisk context:\n${riskSummary}`,
      ),
    ]);
    console.log("Draft Policy 3 : \n", draftResponse.content?.toString());

    const followUps = [];
    if (completeCall?.id) {
      followUps.push(
        new ToolMessage({
          content: JSON.stringify({ ok: true, stage: 3, skipped }),
          tool_call_id: completeCall.id,
        }),
      );
    }

    const completionResponse = completeCall
      ? { ...response, tool_calls: nonCompleteToolCalls(response.tool_calls) }
      : response;

    return {
      messages: [completionResponse, ...followUps, stage4System, stage4Human],
      stage3_data: [{ summary: stage3_summary, skipped }],
      stage3_complete: true,
      stage3_summary,
      draft_policy_3: draftResponse.content?.toString(),
    };
  }

  const searchCalls = nonCompleteToolCalls(response.tool_calls);
  if (searchCalls.length) {
    return { messages: [{ ...response, tool_calls: searchCalls }] };
  }

  const userInput = interrupt(
    aiMsg || "Please continue with governance essentials.",
  );

  return {
    messages: [response, new HumanMessage(userInput)],
    current_question: aiMsg,
  };
}
