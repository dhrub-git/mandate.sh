import { model } from "../config/model";
import { WorkflowState } from "../graph/state";


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


export async function policyGenerator(state: WorkflowState) {
  console.log("Entering policy generator");


  const messages = state.messages ;

  const cleanMessages = sanitizeMessages(messages);

const response = await model.invoke(cleanMessages);

  if (response.tool_calls?.length) {
    return { messages: [response] };
  }
 console.log("policy generator end");
  return {
    messages: [response],
    policies: response.content,
  };
}