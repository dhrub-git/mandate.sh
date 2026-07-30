import { StateGraph, START, END } from "@langchain/langgraph";
import { GraphState } from "./state";
import { policyAgentNode } from "./policy";
import { systemAgentNode } from "./system";

// Create the graph
const workflow = new StateGraph(GraphState)
  // Add nodes
  .addNode("policy", policyAgentNode)
  .addNode("system", systemAgentNode)
  // .addNode("mandate", mandateAgentNode)

  // Define edges
  // START -> policy -> system -> mandate -> END
  .addEdge(START, "policy")
  .addEdge("policy", "system")
  // .addEdge("system", "mandate")
  .addEdge("system", END);

// Compile the graph
export const graph = workflow.compile();
