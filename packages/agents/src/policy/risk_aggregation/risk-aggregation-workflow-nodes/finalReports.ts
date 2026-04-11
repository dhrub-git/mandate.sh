import { RiskAggregationState } from "../riskAggregationState";
import { PromptTemplate } from "@langchain/core/prompts";
import { model } from "../../../config/model";

import riskAggregationPrompt from "../riskAggregationPrompts";
export async function generateFinalReports(
  state: RiskAggregationState,
  config?: any
): Promise<RiskAggregationState> {

  config?.writer?.({
    type: "step_started",
    step_name: "Generate Final Reports"
  });

 const formattedPrompt = `${riskAggregationPrompt.finalReportPrompt}

Consolidated Risk Profile:
${state.consolidated_risk_profile}

Integrated Mitigation Plan:
${state.integrated_mitigation_plan}

Submission Recommendation:
${state.submission_recommendation}

Project Metadata:
${JSON.stringify(state.project_metadata)}
`;

  const response = await model.invoke( formattedPrompt);

  state.final_integrated_report_package =
    response.content as string;

  config?.writer?.({
    type: "step_finished",
    step_name: "Generate Final Reports"
  });

  return state;
}