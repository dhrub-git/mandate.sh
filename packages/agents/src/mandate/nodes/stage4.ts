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
    const stageSummary = aiMsg || completeCall?.args.summary || "";

    const draftResponse = await model1.invoke([
      new SystemMessage(
        "You are an expert AI Governance Policy Drafter. Output ONLY the markdown text for the sections requested without conversational filler.",
      ),
      new HumanMessage(
        `Generate a professional Markdown draft for the "Applicable Regulations" and "Risk Appetite Statement" sections based on the following data:\n\nOnboarding Data:\n${state.onboarding_data}\n\nStage 4 Output:\n${stageSummary}\n\nEU AI Act Risk Classification:\n${riskSummary}\n\nInventory table (reference in risk appetite):\n${inventoryTable}`,
      ),
    ]);
    console.log("Draft Policy 4 : \n", draftResponse.content?.toString());

    const policySystem = new SystemMessage(
      buildPolicyGeneratorPrompt(
        state.onboarding_data,
        state.risk_classifications,
      ),
    );

    const policyData = new HumanMessage(`
stage 1 data:
${state.onboarding_data}

stage 2 data:
${JSON.stringify(state.stage2_data, null, 2)}

stage 3 data:
${JSON.stringify(state.stage3_data, null, 2)}

stage 4 data:
${stageSummary}

EU AI Act risk classifications:
${JSON.stringify(state.risk_classifications ?? null, null, 2)}

Interim drafts (merge/refine; do not ignore):
--- draft_policy_2 ---
${state.draft_policy_2 ?? ""}
--- draft_policy_3 ---
${state.draft_policy_3 ?? ""}
--- draft_policy_4 ---
${draftResponse.content?.toString() ?? ""}
`);

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
      stage4_data: [response],
      stage4_complete: true,
      draft_policy_4: draftResponse.content?.toString(),
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
