import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import { model, model1 } from "../config/model";
import { webSearch } from "../tools/webSearch";
import { interrupt } from "@langchain/langgraph";
import { WorkflowState } from "../graph/state";
import { buildPolicyGeneratorPrompt } from "../config/prompts";
import {
  formatRiskSummary,
  buildInventoryTableMarkdown,
} from "../config/onboardingContext";

function sanitizeMessages(messages: any[]) {
  return messages.map((m) => {
    if (typeof m.content === "string") return m;

    if (Array.isArray(m.content)) {
      const text = m.content
        .filter((b: any) => b.type === "text")
        .map((b: any) => b.text ?? "")
        .join("");

      return {
        ...m,
        content: text,
      };
    }

    return m;
  });
}

export async function stage4(state: WorkflowState) {
  console.log("Hello from Stage 4 Trial");

  const modelWithTools = model.bindTools([webSearch]);
  const messages = state.messages;
  const cleanMessages = sanitizeMessages(messages);

  const response = await modelWithTools.invoke(cleanMessages);
  const aiMsg = response.content?.toString().trim() || "";

  if (aiMsg.includes("[STAGE4_COMPLETE]")) {
    const riskSummary = formatRiskSummary(state.risk_classifications);
    const inventoryTable = buildInventoryTableMarkdown(
      state.risk_classifications,
    );

    const draftResponse = await model1.invoke([
      new SystemMessage(
        "You are an expert AI Governance Policy Drafter. Output ONLY the markdown text for the sections requested without conversational filler.",
      ),
      new HumanMessage(
        `Generate a professional Markdown draft for the "Applicable Regulations" and "Risk Appetite Statement" sections based on the following data:\n\nOnboarding Data:\n${state.onboarding_data}\n\nStage 4 Output:\n${aiMsg}\n\nEU AI Act Risk Classification:\n${riskSummary}\n\nInventory table (reference in risk appetite):\n${inventoryTable}`,
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
${typeof response.content === "string" ? response.content : JSON.stringify(response.content, null, 2)}

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

    console.log(
      "Stage 4 Completed. Preparing to generate final policy draft...",
    );
    return {
      messages: [response, policySystem, policyData],
      stage4_data: [response],
      stage4_complete: true,
      draft_policy_4: draftResponse.content?.toString(),
    };
  }

  if (response.tool_calls?.length) {
    return { messages: [response] };
  }

  const userInput = interrupt(aiMsg);

  return {
    messages: [response, new HumanMessage(userInput)],
    current_question: aiMsg,
  };
}
