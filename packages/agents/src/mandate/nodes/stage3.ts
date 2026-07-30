import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import { model, model1 } from "../config/model";
import { webSearch } from "../tools/webSearch";
import { interrupt } from "@langchain/langgraph";
import { WorkflowState } from "../graph/state";
import { STAGE3_SYSTEM_PROMPT, STAGE4_SYSTEM_PROMPT } from "../config/prompts";
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
export async function stage3(state: WorkflowState) {
  console.log("Hello from Stage 3 Trial");

  const modelWithTools = model.bindTools([webSearch]);
  const message = STAGE3_SYSTEM_PROMPT;
  const messages = [message, ...state.messages];

  // debugMessages("STAGE 3 --- BEFORE INVOKE ", messages);

const cleanMessages = sanitizeMessages(messages);

const response = await modelWithTools.invoke(cleanMessages);
  const aiMsg = response.content?.toString().trim() || "";

  // console.log("Stage 3 AI:", aiMsg);
  const stage4System = new SystemMessage(STAGE4_SYSTEM_PROMPT);
  const stage3Data = response;

  const stage4Human = new HumanMessage(`
                  stage 1 data:
                  ${state.onboarding_data}

                  stage 2 data:
                  ${JSON.stringify(state.stage2_data)}

                  stage 3 data:
                  ${JSON.stringify(stage3Data.content, null, 2)}
                  `);``

  if (aiMsg.includes("[STAGE3_COMPLETE]")) {
    console.log(`stage 3 data : ${(stage3Data.content, null, 2)}`);
    console.log("**********************************************************");

    console.log(`stage 4 Human : \n ${stage4Human}`);
    console.log("**********************************************************");

     // --- NEW: Generate Draft 3 ---
    const draftResponse = await model1.invoke([
      new SystemMessage("You are an expert AI Governance Policy Drafter. Output ONLY the markdown text for the sections requested without conversational filler."),
      new HumanMessage(`Generate a professional Markdown draft for the "Governance Structure" and "Roles & Responsibilities" sections based on the following data:\n\nOnboarding Data:\n${state.onboarding_data}\n\nStage Output:\n${aiMsg}`)
    ]);
    // ----------------------------
    console.log("Draft Policy 3 : \n", draftResponse.content?.toString());
    return {
      messages: [response, stage4System, stage4Human],
      stage3_data: [response],
      stage3_complete: true,
      draft_policy_3: draftResponse.content?.toString(),
    };
  }

  if (aiMsg.includes("[STAGE3_SKIPPED — PROVIDER ONLY]")) {
     // --- NEW: Generate Draft 3 ---
    const draftResponse = await model.invoke([
      new SystemMessage("You are an expert AI Governance Policy Drafter. Output ONLY the markdown text for the sections requested without conversational filler."),
      new HumanMessage(`Generate a professional Markdown draft for the "Governance Structure" and "Roles & Responsibilities" sections based on the following data:\n\nOnboarding Data:\n${state.onboarding_data}\n\nStage Output:\n${aiMsg}`)
    ]);
    // ----------------------------
    console.log("Draft Policy 3 skipped : \n", draftResponse.content?.toString());
    return {
      messages: [response, stage4System, stage4Human],
      stage3_data: [response],
      stage3_complete: true,
      draft_policy_3: draftResponse.content?.toString(),
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
