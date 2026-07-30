import { StateGraph, START, END, Annotation } from "@langchain/langgraph";
import { PrivacySecurityState } from "./privacySecurityState";

import { pdfToText } from "./privacy-security-workflow-nodes/pdfTotext";
import { performPrivacyImpactAssessment } from "./privacy-security-workflow-nodes/privacyImpactAssessment";
import { performSecurityAssessment } from "./privacy-security-workflow-nodes/securityAssessment";
import { performComplianceGovernanceCheck } from "./privacy-security-workflow-nodes/complianceGovernance";
import { generateFinalPrivacyReport } from "./privacy-security-workflow-nodes/finalReport";

const PrivacySecurityAnnotation = Annotation.Root({
  pdf_path: Annotation<string>,
  project_documentation: Annotation<string | undefined>,
  data_flow_map: Annotation<string | undefined>,
  security_policies: Annotation<string | undefined>,
  pia_output: Annotation<string | undefined>,
  security_assessment_output: Annotation<string | undefined>,
  compliance_and_governance_output: Annotation<string | undefined>,
  final_privacy_report: Annotation<string | undefined>,
});

export const privacySecurityGraph = new StateGraph(PrivacySecurityAnnotation)
  .addNode("pdf_to_text", pdfToText)  
  .addNode("privacy_impact_assessment", performPrivacyImpactAssessment)
  .addNode("security_assessment", performSecurityAssessment)
  .addNode("compliance_governance_check", performComplianceGovernanceCheck)
  .addNode("generate_final_privacy_report", generateFinalPrivacyReport)
  .addEdge("__start__", "pdf_to_text")
  .addEdge("pdf_to_text", "privacy_impact_assessment")
  .addEdge("privacy_impact_assessment", "security_assessment")
  .addEdge("security_assessment", "compliance_governance_check")
  .addEdge("compliance_governance_check", "generate_final_privacy_report")
  .addEdge("generate_final_privacy_report", "__end__")
  .compile();