import { CommunityBenefitState } from "../communityBenefitState";
import { PromptTemplate } from "@langchain/core/prompts";
import {model} from "../../../config/model"
import CommunityBenefitPrompts from "../communityBenefitPrompts";
export async function performRiskAssessment(
  state: CommunityBenefitState,
  config?: any
): Promise<CommunityBenefitState> {

  // config?.writer?.({
  //   type: "step_started",
  //   step_name: "Risk Assessment",
  // });

const formatted = `${CommunityBenefitPrompts.riskAssessmentPrompt}

Project Documentation:
${state.project_documentation ?? ""}

Benefit Analysis Output:
${state.benefit_analysis_output ?? ""}
`;

  const response = await model.invoke(formatted);

  state.risk_assessment_output =
    typeof response.content === "string"
      ? response.content
      : JSON.stringify(response.content);

  // config?.writer?.({
  //   type: "step_finished",
  //   step_name: "Risk Assessment",
  // });

  return state;
}