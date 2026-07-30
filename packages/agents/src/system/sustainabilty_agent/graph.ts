import { StateGraph, START, END } from "@langchain/langgraph";
import { GreenAIState } from "./state";
import { classifyNode, llmAndMetricsNode } from "./node";
const workflow = new StateGraph(GreenAIState)
  .addNode("classify", classifyNode)
  .addNode("llm_metrics", llmAndMetricsNode)
  .addEdge(START, "classify")
  .addEdge("classify", "llm_metrics")
  .addEdge("llm_metrics", END);
export const greenAIGraph = workflow.compile();







