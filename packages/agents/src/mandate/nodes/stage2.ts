import {
  SystemMessage,
  HumanMessage,
  ToolMessage,
} from "@langchain/core/messages";
import { model, model1 } from "../config/model";
import { webSearch } from "../tools/webSearch";
import { interrupt } from "@langchain/langgraph";
import { WorkflowState } from "../graph/state";
import { STAGE2_SYSTEM_PROMPT, STAGE3_SYSTEM_PROMPT } from "../config/prompts";
import { debugMessages } from "./deBug";
import { parseStage2Output } from "../classifier/stage2Parser";
import { classifyAISystems } from "../classifier/riskClassifier";
import type { CompanyContext } from "../classifier/types";
function sanitizeMessages(messages:any[]) {
  return messages.map((m)=>{
    if (typeof m.content === "string") return m;

    if (Array.isArray(m.content)) {
      const text = m.content
        .filter((b:any)=> b.type === "text")
        .map((b:any)=> b.text ?? "")
        .join("");

      return {
        ...m,
        content: text
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

  // debugMessages("STAGE 2 --- BEFORE INVOKE ", messages);

const cleanMessages = sanitizeMessages(messages);

const response = await modelWithTools.invoke(cleanMessages);

  console.log("\n====== MODEL RESPONSE ======");
  // console.log("Tool Calls:", response.tool_calls);

  const aiMsg = response.content?.toString().trim() || "";
  console.log("Content:", aiMsg);
  console.log("============================\n");
  if (aiMsg.includes("[STAGE2_COMPLETE]")) {
    console.log(`stage 2 Completed : ${(response.content, null, 2)}`);
    console.log("**********************************************************");

    // --- Risk Classification ---
    const parsedSystems = parseStage2Output(aiMsg, state.onboarding_data);
    let companyContext: CompanyContext = { industry: "TECHNOLOGY", operatingRegions: [], aiRole: "BOTH" };
    try {
      const onboarding = JSON.parse(state.onboarding_data);
      companyContext = {
        industry: onboarding.industry || "TECHNOLOGY",
        operatingRegions: onboarding.operatingRegions || [],
        aiRole: onboarding.aiRole || "BOTH",
        euInteraction: onboarding.euInteraction,
      };
    } catch { /* use defaults */ }
    const riskClassifications = classifyAISystems(parsedSystems, companyContext);
    console.log("Risk Classifications:", JSON.stringify(riskClassifications.summary));

    // --- Generate Draft 2 (with risk tiers) ---
    const riskContext = riskClassifications.systems.map(s => `- ${s.systemName}: ${s.tier} (${s.article}) — ${s.reasoning}`).join("\n");
    const draftResponse = await model1.invoke([
      new SystemMessage(
        "You are an expert AI Governance Policy Drafter. Output ONLY the markdown text for the sections requested without conversational filler.",
      ),
      new HumanMessage(
        `Generate a professional Markdown draft for the "Purpose & Scope" and "AI System Inventory" sections based on the following data:\n\nOnboarding Data:\n${state.onboarding_data}\n\nStage 2 Output:\n${aiMsg}\n\nRisk Classification Results:\n${riskContext}\n\nInclude a risk tier column in the AI System Inventory table.`,
      ),
    ]);

    const stage2Data = response;

    const stage3System = new SystemMessage(STAGE3_SYSTEM_PROMPT);

    const stage3Human = new HumanMessage(`
      stage 1 data:
      ${state.onboarding_data}

      stage 2 data:
      ${JSON.stringify(stage2Data.content, null, 2)}
      `);

    return {
      messages: [response, stage3System, stage3Human],
      stage2_data: stage2Data,
      stage2_complete: true,
      draft_policy_2: draftResponse.content?.toString(),
      risk_classifications: riskClassifications,
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
