import {
  SystemMessage,
  HumanMessage,
} from "@langchain/core/messages";
import { model, model1 } from "../config/model";
import { webSearch } from "../tools/webSearch";
import { interrupt } from "@langchain/langgraph";
import { buildStageSystemPrompt } from "../config/prompts";
import { parseStage2Output } from "../classifier/stage2Parser";
import { classifyAISystems } from "../classifier/riskClassifier";
import {
  parseOnboardingData,
  companyContextFromOnboarding,
  formatRiskSummary,
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

export async function stage2(state: any) {
  console.log("Hello from Stage 2 Trial");

  const modelWithTools = model.bindTools([webSearch]);
  const messages = state.messages;
  console.log("Received Onboarding data: ", state.onboarding_data);

  const cleanMessages = sanitizeMessages(messages);
  const response = await modelWithTools.invoke(cleanMessages);

  console.log("\n====== MODEL RESPONSE ======");

  const aiMsg = response.content?.toString().trim() || "";

  if (aiMsg.includes("[STAGE2_COMPLETE]")) {
    console.log("stage 2 Completed");

    const onboarding = parseOnboardingData(state.onboarding_data);
    const systems = parseStage2Output(aiMsg, state.onboarding_data);
    const risk_classifications = classifyAISystems(
      systems,
      companyContextFromOnboarding(onboarding),
    );
    const riskSummary = formatRiskSummary(risk_classifications);
    console.log("Risk classifications:", risk_classifications.summary);

    const draftResponse = await model1.invoke([
      new SystemMessage(
        "You are an expert AI Governance Policy Drafter. Output ONLY the markdown text for the sections requested without conversational filler.",
      ),
      new HumanMessage(
        `Generate a professional Markdown draft for the "Purpose & Scope" and "AI System Inventory" sections based on the following data:\n\nOnboarding Data:\n${state.onboarding_data}\n\nStage 2 Output:\n${aiMsg}\n\nEU AI Act Risk Classification (include risk tiers in the inventory):\n${riskSummary}`,
      ),
    ]);
    console.log("Draft Policy 2 : \n", draftResponse.content?.toString());

    const stage2Data = response;
    const deployerList =
      risk_classifications.systems
        .filter((s) =>
          /third.?party|deployer|vendor/i.test(
            systems.find((sys) => sys.systemName === s.systemName)?.devSource ??
              "",
          ),
        )
        .map((s) => s.systemName)
        .join(", ") || "None identified yet";

    const stage3System = new SystemMessage(
      buildStageSystemPrompt(3, state.onboarding_data, {
        Q13_vendor_list: deployerList,
      }),
    );

    const stage3Human = new HumanMessage(`
stage 1 data:
${state.onboarding_data}

stage 2 data:
${typeof stage2Data.content === "string" ? stage2Data.content : JSON.stringify(stage2Data.content, null, 2)}

EU AI Act risk classifications:
${JSON.stringify(risk_classifications, null, 2)}
`);

    return {
      messages: [response, stage3System, stage3Human],
      stage2_data: stage2Data,
      stage2_complete: true,
      draft_policy_2: draftResponse.content?.toString(),
      risk_classifications,
    };
  }

  if (response.tool_calls?.length) {
    return {
      messages: [response],
    };
  }

  const userInput = interrupt(aiMsg);

  return {
    messages: [response, new HumanMessage(userInput)],
    current_question: aiMsg,
  };
}
