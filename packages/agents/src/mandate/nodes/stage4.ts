import {
  SystemMessage,
  HumanMessage,
  ToolMessage,
} from "@langchain/core/messages";
import { model, model1 } from "../config/model";
import { webSearch } from "../tools/webSearch";
import { interrupt } from "@langchain/langgraph";
import { WorkflowState } from "../graph/state";
import { buildPolicyGeneratorPrompt } from "../config/prompts";
import {
  formatRiskSummary,
  buildInventoryTableMarkdown,
} from "../config/onboardingContext";
import {
  buildCompactPolicyHandoff,
  compactStageSummary,
} from "../config/stageSummaries";
import {
  stageCompleteTool,
  getStageCompleteCall,
  isStageMarkedComplete,
  nonCompleteToolCalls,
} from "../tools/stageComplete";
import { sanitizeMessages, contentToString } from "./messageUtils";

export async function stage4(
  state: WorkflowState,
): Promise<Record<string, unknown>> {
  console.log("Hello from Stage 4 Trial");

  const modelWithTools = model.bindTools([webSearch, stageCompleteTool]);
  const messages = state.messages;
  const cleanMessages = sanitizeMessages(messages);

  const response = await modelWithTools.invoke(cleanMessages);
  const aiMsg = contentToString(response.content).trim();
  const completeCall = getStageCompleteCall(response, 4);

  if (isStageMarkedComplete(response, 4, ["[STAGE4_COMPLETE]"])) {
    const riskSummary = formatRiskSummary(state.risk_classifications);
    const inventoryTable = buildInventoryTableMarkdown(
      state.risk_classifications,
    );
    const stage4_summary = compactStageSummary(
      4,
      completeCall?.args.summary || aiMsg,
    );

    const draftResponse = await model1.invoke([
      new SystemMessage(
        "You are an expert AI Governance Policy Drafter. Output ONLY the markdown text for the sections requested without conversational filler. Prefer Risk Appetite content — Applicable Regulations will be deterministically overwritten later.",
      ),
      new HumanMessage(
        `Generate a professional Markdown draft focused on the "Risk Appetite Statement" (and optionally a short Applicable Regulations stub) based on:\n\nOnboarding Data:\n${state.onboarding_data}\n\nStage 4 Summary:\n${stage4_summary}\n\nEU AI Act Risk Classification:\n${riskSummary}\n\nInventory table:\n${inventoryTable}`,
      ),
    ]);
    console.log("Draft Policy 4 : \n", draftResponse.content?.toString());

    const draft4 = draftResponse.content?.toString() ?? "";

    const policySystem = new SystemMessage(
      buildPolicyGeneratorPrompt(
        state.onboarding_data,
        state.risk_classifications,
      ),
    );

    const policyData = new HumanMessage(
      buildCompactPolicyHandoff({
        onboardingData: state.onboarding_data,
        stage2Summary: state.stage2_summary,
        stage3Summary: state.stage3_summary,
        stage4Summary: stage4_summary,
        riskJson: JSON.stringify(state.risk_classifications ?? null, null, 2),
        draft2: state.draft_policy_2,
        draft3: state.draft_policy_3,
        draft4,
      }),
    );

    const followUps = [];
    if (completeCall?.id) {
      followUps.push(
        new ToolMessage({
          content: JSON.stringify({ ok: true, stage: 4 }),
          tool_call_id: completeCall.id,
        }),
      );
    }

    const completionResponse = completeCall
      ? { ...response, tool_calls: nonCompleteToolCalls(response.tool_calls) }
      : response;

    console.log(
      "Stage 4 Completed. Preparing to generate final policy draft...",
    );
    return {
      messages: [completionResponse, ...followUps, policySystem, policyData],
      stage4_data: [{ summary: stage4_summary }],
      stage4_complete: true,
      stage4_summary,
      draft_policy_4: draft4,
    };
  }

  const searchCalls = nonCompleteToolCalls(response.tool_calls);
  if (searchCalls.length) {
    return { messages: [{ ...response, tool_calls: searchCalls }] };
  }

  const userInput = interrupt(
    aiMsg || "Please continue with risk and regulations.",
  );

  return {
    messages: [response, new HumanMessage(userInput)],
    current_question: aiMsg,
  };
}
