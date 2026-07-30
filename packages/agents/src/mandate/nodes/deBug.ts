import { BaseMessage } from "@langchain/core/messages";

export function debugMessages(label: string, messages: BaseMessage[]) {
  console.log("\n==============================");
  console.log("DEBUG:", label);
  console.log("==============================");

  messages.forEach((msg: any, index) => {
    console.log(`\n#${index}`);
    console.log("Type:", msg._getType?.());
    console.log("Role:", msg.role);
    
    if (msg.tool_calls) {
      console.log("Tool Calls:", JSON.stringify(msg.tool_calls, null, 2));
    }

    if (msg.tool_call_id) {
      console.log("Tool Call ID:", msg.tool_call_id);
    }

    console.log("Content:", msg.content?.toString().substring(0, 20) || "");
  });

  console.log("\n==============================\n");
}