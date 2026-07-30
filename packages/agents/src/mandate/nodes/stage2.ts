import {
  SystemMessage,
  HumanMessage,
  ToolMessage,
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
import { compactStageSummary } from "../config/stageSummaries";
import {
  stageCompleteTool,
  getStageCompleteCall,
  isStageMarkedComplete,
  nonCompleteToolCalls,
} from "../tools/stageComplete";
import { sanitizeMessages, contentToString } from "./messageUtils";
import type { AISystemInput } from "../classifier/types";

export async function stage2(state: any): Promise<Record<string, unknown>> {
  console.log("Hello from Stage 2 Trial");

  const modelWithTools = model.bindTools([webSearch, stageCompleteTool]);
  const messages = state.messages;
  console.log("Received Onboarding data: ", state.onboarding_data);

  const cleanMessages = sanitizeMessages(messages);
  const response = await modelWithTools.invoke(cleanMessages);

  console.log("\n====== MODEL RESPONSE ======");

  const aiMsg = contentToString(response.content).trim();
  const completeCall = getStageCompleteCall(response, 2);

  if (isStageMarkedComplete(response, 2, ["[STAGE2_COMPLETE]"])) {
    console.log("stage 2 Completed");

    const onboarding = parseOnboardingData(state.onboarding_data);
    const systemsFromTool = (completeCall?.args.systems ?? []) as AISystemInput[];
    const systems =
      systemsFromTool.length > 0
        ? systemsFromTool
        : parseStage2Output(aiMsg, state.onboarding_data);

    const risk_classifications = classifyAISystems(
      systems,
      companyContextFromOnboarding(onboarding),
    );
    const riskSummary = formatRiskSummary(risk_classifications);
    console.log("Risk classifications:", risk_classifications.summary);

    const stage2_summary = compactStageSummary(
      2,
      completeCall?.args.summary || aiMsg,
    );

    const draftResponse = await model1.invoke([
      new SystemMessage(
        "You are an expert AI Governance Policy Drafter. Output ONLY the markdown text for the sections requested without conversational filler.",
      ),
      new HumanMessage(
        `Generate a professional Markdown draft for the "Purpose & Scope" and "AI System Inventory" sections based on the following data:\n\nOnboarding Data:\n${state.onboarding_data}\n\nStage 2 Summary:\n${stage2_summary}\n\nEU AI Act Risk Classification (include risk tiers in the inventory):\n${riskSummary}`,
      ),
    ]);
    console.log("Draft Policy 2 : \n", draftResponse.content?.toString());

    const deployerList =
      (completeCall?.args.deployerSystems?.length
        ? completeCall.args.deployerSystems
        : risk_classifications.systems
            .filter((s) =>
              /third.?party|deployer|vendor/i.test(
                systems.find((sys) => sys.systemName === s.systemName)
                  ?.devSource ?? "",
              ),
            )
            .map((s) => s.systemName)
      ).join(", ") || "None identified yet";

    const stage3System = new SystemMessage(
      buildStageSystemPrompt(3, state.onboarding_data, {
        Q13_vendor_list: deployerList,
      }),
    );

    const stage3Human = new HumanMessage(`
stage 1 data:
${state.onboarding_data}

stage 2 summary:
${stage2_summary}

EU AI Act risk classifications:
${JSON.stringify(risk_classifications, null, 2)}
`);

    const followUps = [];
    if (completeCall?.id) {
      followUps.push(
        new ToolMessage({
          content: JSON.stringify({
            ok: true,
            stage: 2,
            systemsClassified: risk_classifications.summary.total,
          }),
          tool_call_id: completeCall.id,
        }),
      );
    }

    const completionResponse = completeCall
      ? {
          ...response,
          tool_calls: nonCompleteToolCalls(response.tool_calls),
        }
      : response;

    return {
      messages: [completionResponse, ...followUps, stage3System, stage3Human],
      stage2_data: [{ summary: stage2_summary, systems }],
      stage2_complete: true,
      stage2_summary,
      draft_policy_2: draftResponse.content?.toString(),
      risk_classifications,
    };
  }

  const searchCalls = nonCompleteToolCalls(response.tool_calls);
  if (searchCalls.length) {
    return {
      messages: [{ ...response, tool_calls: searchCalls }],
    };
  }

  const userInput = interrupt(aiMsg || "Please continue with the inventory.");

  return {
    messages: [response, new HumanMessage(userInput)],
    current_question: aiMsg,
  };
}
