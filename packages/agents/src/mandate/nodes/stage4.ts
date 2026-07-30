import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import { model } from "../config/model";
import { webSearch } from "../tools/webSearch";
import { interrupt } from "@langchain/langgraph";
import { WorkflowState } from "../graph/state";
import { STAGE4_SYSTEM_PROMPT } from "../config/prompts";
import { buildPolicyGeneratorPrompt } from "../config/prompts";

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

  // console.log("Stage 4 AI:", aiMsg);

  if (aiMsg.includes("[STAGE4_COMPLETE]")) {
    const policySystem = new SystemMessage(
      buildPolicyGeneratorPrompt(state.onboarding_data),
    );
    // console.log(`policy prompt \n ${policySystem}`);
    // console.log("**********************************************************");
    const policyData = new HumanMessage(`
                  stage 1 data:
                  ${state.onboarding_data}

                  stage 2 data:
                  ${JSON.stringify(state.stage2_data, null, 2)}

                  stage 3 data:
                  ${JSON.stringify(state.stage3_data, null, 2)}
                  stage 4 data : ${response.content}
                  `);

    // console.log(`policy data \n ${policyData}`);
    // console.log("**********************************************************");
    console.log("Stage 4 Completed. Preparing to generate final policy draft...");
    return {
      messages: [response, policySystem, policyData],
      stage4_data: [response],
      stage4_complete: true,
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
