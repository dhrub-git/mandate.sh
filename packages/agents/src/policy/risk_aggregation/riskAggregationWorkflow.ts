import {
  StateGraph,

  Annotation
} from "@langchain/langgraph";

import { pdfToJson } from "./risk-aggregation-workflow-nodes/pdfToJson";
import { consolidateAndAnalyzeRisks } from "./risk-aggregation-workflow-nodes/consolidateRisks";
import { developIntegratedMitigationPlan } from "./risk-aggregation-workflow-nodes/integratedMitigation";
import { applySubmissionDecisionFramework } from "./risk-aggregation-workflow-nodes/submissionDecision";
import { generateFinalReports } from "./risk-aggregation-workflow-nodes/finalReports";

const RiskAggregationAnnotation = Annotation.Root({
  pdf_path: Annotation<string>,

  community_benefit_report: Annotation<string | undefined>,
  fairness_report: Annotation<string | undefined>,
  privacy_security_report: Annotation<string | undefined>,
  transparency_report: Annotation<string | undefined>,
  accountability_report: Annotation<string | undefined>,

  project_metadata: Annotation<{
    budget?: number;
    uses_digital_restart_fund?: boolean;
    project_name?: string;
    project_owner?: string;
    [key: string]: any;
  } | undefined>,

  consolidated_risk_profile: Annotation<string | undefined>,
  integrated_mitigation_plan: Annotation<string | undefined>,
  submission_recommendation: Annotation<string | undefined>,
  final_integrated_report_package: Annotation<string | undefined>,
});



export const graph = new StateGraph(RiskAggregationAnnotation)
    .addNode("pdf_to_json", pdfToJson)
    .addNode("consolidate_risks", consolidateAndAnalyzeRisks)
    .addNode("integrated_mitigation", developIntegratedMitigationPlan)
    .addNode("submission_decision", applySubmissionDecisionFramework)
    .addNode("final_reports", generateFinalReports)
    .addEdge("__start__", "pdf_to_json")
    .addEdge("pdf_to_json", "consolidate_risks")
    .addEdge("consolidate_risks", "integrated_mitigation")
    .addEdge("integrated_mitigation", "submission_decision")
    .addEdge("submission_decision", "final_reports")
    .addEdge("final_reports", "__end__")
    .compile() ;

