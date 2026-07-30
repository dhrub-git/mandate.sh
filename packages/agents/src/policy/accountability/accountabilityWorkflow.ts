import { StateGraph, START, END, Annotation } from "@langchain/langgraph";
import { AccountabilityState } from "./accountabilityState";
import { pdfToText } from "./accountability-workflow-nodes/pdfToText";
import { runAuditTrailAssessment } from "./accountability-workflow-nodes/auditTrailAssessment";
import { generateFinalAccountabilityReport } from "./accountability-workflow-nodes/finalReportGeneration";
import { runHumanOversightAssessment } from "./accountability-workflow-nodes/humanOversightAssessment";
import { runResponsibleOfficerAssessment } from "./accountability-workflow-nodes/responsibleOfficerAssessment";

const AccountabilityAnnotation = Annotation.Root({
  pdf_path: Annotation<string>,
  project_documentation: Annotation<string | undefined>,
  org_chart_or_roles_doc: Annotation<string | undefined>,
  training_materials: Annotation<string | undefined>,
  audit_log_specs: Annotation<string | undefined>,
  responsible_officer_analysis: Annotation<string | undefined>,
  human_oversight_analysis: Annotation<string | undefined>,
  audit_trail_analysis: Annotation<string | undefined>,
  final_accountability_report: Annotation<string | undefined>,
});

export const accountabilityGraph = new StateGraph(AccountabilityAnnotation)
  .addNode("pdf_to_text", pdfToText)
  .addNode("responsible_officer_assessment", runResponsibleOfficerAssessment)
  .addNode("human_oversight_assessment", runHumanOversightAssessment)
  .addNode("audit_trail_assessment", runAuditTrailAssessment)
  .addNode("generate_final_accountability_report", generateFinalAccountabilityReport)
  .addEdge("__start__", "pdf_to_text")
  .addEdge("pdf_to_text", "responsible_officer_assessment")
  .addEdge("responsible_officer_assessment", "human_oversight_assessment")
  .addEdge("human_oversight_assessment", "audit_trail_assessment")
  .addEdge("audit_trail_assessment", "generate_final_accountability_report")
  .addEdge("generate_final_accountability_report", "__end__")
  .compile();