import { StateGraph,Annotation } from "@langchain/langgraph";

import { TransparencyAssessmentState } from "./transparencyAssessmentState";
import { runExplainabilityAssessment } from "./transparency-assessment-workflow-nodes/runExplainabilityAssessment";
import { runPublicDisclosure } from "./transparency-assessment-workflow-nodes/runPublicDisclosure";
import { runDecisionReview } from "./transparency-assessment-workflow-nodes/runDecisionReview";
import { runGipaCompliance } from "./transparency-assessment-workflow-nodes/runGipaCompliance";


const TransparencyAssessmentAnnotation = Annotation.Root({
  compliance_data: Annotation<string>,
    explainability_assessment: Annotation<string | undefined>,
    public_disclousure_and_transparency: Annotation<string | undefined>,
    decision_review_and_challenge_mechanisms: Annotation<string | undefined>,
    GIPA_compliance_and_information_accessibility: Annotation<string | undefined>,
});

export const graph = new StateGraph(TransparencyAssessmentAnnotation)
    .addNode("run_explainability_assessment", runExplainabilityAssessment)
    .addNode("public_disclosure", runPublicDisclosure)
    .addNode("decision_review", runDecisionReview)
    .addNode("gipa_compliance", runGipaCompliance)
    .addEdge("__start__", "run_explainability_assessment")
    .addEdge("run_explainability_assessment", "public_disclosure")
    .addEdge("public_disclosure", "decision_review")
    .addEdge("decision_review", "gipa_compliance")
    .addEdge("gipa_compliance", "__end__")
    .compile() ;