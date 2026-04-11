import { StateGraph, START, END } from "@langchain/langgraph";
import { JobImpactState } from "./state";
import { onetNode, classifyNode, upskillNode, roiNode, reportNode } from "./node";
const workflow = new StateGraph(JobImpactState)
  .addNode("onet", onetNode)
  .addNode("classify", classifyNode)
  .addNode("upskill", upskillNode)
  .addNode("roi_calculation", roiNode)
  .addNode("final_report", reportNode)
  .addEdge(START, "onet")
  .addEdge("onet", "classify")
  .addEdge("classify", "upskill")
  .addEdge("upskill", "roi_calculation")
  .addEdge("roi_calculation", "final_report")
  .addEdge("final_report", END);
export const jobImpactGraph = workflow.compile();
