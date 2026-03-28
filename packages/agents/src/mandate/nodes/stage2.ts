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
  // console.log("Content:", aiMsg);
  // console.log("============================\n");
  if (aiMsg.includes("[STAGE2_COMPLETE]")) {
    console.log(`stage 2 Completed : ${(response.content, null, 2)}`);
    console.log("**********************************************************");
    // --- NEW: Generate Draft 2 ---
    const draftResponse = await model1.invoke([
      new SystemMessage(
        "You are an expert AI Governance Policy Drafter. Output ONLY the markdown text for the sections requested without conversational filler.",
      ),
      new HumanMessage(
        `Generate a professional Markdown draft for the "Purpose & Scope" and "AI System Inventory" sections based on the following data:\n\nOnboarding Data:\n${state.onboarding_data}\n\nStage 2 Output:\n${aiMsg}`,
      ),
    ]);
    // ----------------------------
    console.log("Draft Policy 2 : \n", draftResponse.content?.toString());

    // append stage 3 system prompt and stage 2 data to message state.

    const stage2Data = response;

    const stage3System = new SystemMessage(STAGE3_SYSTEM_PROMPT);

    const stage3Human = new HumanMessage(`
      stage 1 data:
      ${state.onboarding_data}

      stage 2 data:
      ${JSON.stringify(stage2Data.content, null, 2)}
      `);

    // console.log(`stage 2 data : \n${JSON.stringify(stage2Data, null, 2)}`);

    return {
      messages: [response, stage3System, stage3Human],
      stage2_data: stage2Data,
      stage2_complete: true,
      draft_policy_2: draftResponse.content?.toString(),
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
