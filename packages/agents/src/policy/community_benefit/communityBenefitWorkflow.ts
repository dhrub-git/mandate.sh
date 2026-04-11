import { StateGraph,  Annotation, START, END} from "@langchain/langgraph";
import { pdfToText } from "./community-benefit-workflow/pdfToText";
import { performBenefitAnalysis } from "./community-benefit-workflow/performBenefitAnalysis";
import { performRiskAssessment } from "./community-benefit-workflow/performRiskAssessment";
import { performStakeholderAnalysis } from "./community-benefit-workflow/performStakeholderAnalysis";
import { generateFinalReport } from "./community-benefit-workflow/generateFinalReport";


const communityBenefitAnnotation = Annotation.Root({
  pdf_path: Annotation<string>,
    community_benefit_report: Annotation<string | undefined>,
    project_documentation: Annotation<string | undefined>,
    benefit_analysis: Annotation<string | undefined>,
    risk_assessment: Annotation<string | undefined>,
    stakeholder_analysis: Annotation<string | undefined>,
    final_report: Annotation<string | undefined>,
});

export const communityBenefitGraph = new StateGraph(communityBenefitAnnotation)
    .addNode("pdf_to_text", pdfToText)
    .addNode("perform_benefit_analysis", performBenefitAnalysis)
    .addNode("perform_risk_assessment", performRiskAssessment)
    .addNode("perform_stakeholder_analysis", performStakeholderAnalysis)
    .addNode("generate_final_report", generateFinalReport)
    .addEdge(START, "pdf_to_text")
    .addEdge("pdf_to_text", "perform_benefit_analysis")
    .addEdge("perform_benefit_analysis", "perform_risk_assessment")
    .addEdge("perform_risk_assessment", "perform_stakeholder_analysis")
    .addEdge("perform_stakeholder_analysis", "generate_final_report")
    .addEdge("generate_final_report", END)
    .compile() ;