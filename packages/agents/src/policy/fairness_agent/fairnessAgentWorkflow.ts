import { StateGraph, Annotation, START ,END} from "@langchain/langgraph";
import { FairnessState } from "./types";
import { csvToJson } from "./fairness-workflow-nodes/csvToJson";
import { runDataQuality } from "./fairness-workflow-nodes/runDataQuality";
import { runBiasAnalysis } from "./fairness-workflow-nodes/runBiasAnalysis";
import { calculateFairnessMetrics } from "./fairness-workflow-nodes/calculateFairnessMetrics";
import { performMitigation } from "./fairness-workflow-nodes/performMitigation";

// const FairnessAnnotation = Annotation.Root<FairnessState>('');
const FairnessAnnotation = Annotation.Root({
  csv_path: Annotation<string>,
  json_data: Annotation<Record<string, unknown>[]>,
  data_quality: Annotation<string>,
  bias_analysis: Annotation<string>,
  fairness_results: Annotation<string>,
  mitigation_plan: Annotation<string>,
});
export const graph = new StateGraph(FairnessAnnotation)
  .addNode("csv_to_json", csvToJson)
  .addNode("run_data_quality", runDataQuality)
  .addNode("run_bias_analysis", runBiasAnalysis)
  .addNode("calculate_fairness_metrics", calculateFairnessMetrics)
  .addNode("perform_mitigation", performMitigation)
  .addEdge(START, "csv_to_json")
  .addEdge("csv_to_json", "run_data_quality")
  .addEdge("run_data_quality", "run_bias_analysis")
  .addEdge("run_bias_analysis", "calculate_fairness_metrics")
  .addEdge("calculate_fairness_metrics", "perform_mitigation")
  .addEdge("perform_mitigation", END)
  .compile();