import { StateGraph, END, START } from "@langchain/langgraph";
import { HallucinationAgentState } from "./state";
import { ingestNode, retrieveNode, generateNode, hallucinationCheckNode } from "./node";
// Define the state channels
// We chain .addNode and .addEdge to ensure TypeScript infers the node names correctly
const workflow = new StateGraph<HallucinationAgentState>({
  channels: {
    fileBase64: { value: (x, y) => y ?? x, default: () => undefined },
    question: { value: (x, y) => y ?? x, default: () => "" },
    messages: { value: (x, y) => x.concat(y), default: () => [] },
    context: { value: (x, y) => y ?? x, default: () => [] },
    answer: { value: (x, y) => y ?? x, default: () => "" },
    hallucinationScore: { value: (x, y) => y ?? x, default: () => 0 },
    hallucinationReasoning: { value: (x, y) => y ?? x, default: () => "" },
    isHallucinated: { value: (x, y) => y ?? x, default: () => false },
  }
})
  .addNode("ingest", ingestNode)
  .addNode("retrieve", retrieveNode)
  .addNode("generate", generateNode)
  .addNode("check", hallucinationCheckNode)
  .addEdge(START, "ingest")
  .addEdge("ingest", "retrieve")
  .addEdge("retrieve", "generate")
  .addEdge("generate", "check")
  .addEdge("check", END);
export const hallucinationGraph =workflow.compile()