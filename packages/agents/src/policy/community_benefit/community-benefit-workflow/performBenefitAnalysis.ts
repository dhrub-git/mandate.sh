import { CommunityBenefitState } from "../communityBenefitState";
import { PromptTemplate } from "@langchain/core/prompts";
import {model} from "../../../config/model"
import CommunityBenefitPrompts from "../communityBenefitPrompts";
export async function performBenefitAnalysis(
  state: CommunityBenefitState,
  config?: any
): Promise<CommunityBenefitState> {

  // config?.writer?.({
  //   type: "step_started",
  //   step_name: "Benefit Analysis",
  // });

  const benefitAnalysisPrompt = CommunityBenefitPrompts.benefitAnalysisPrompt;

  const formatted = `${benefitAnalysisPrompt}

Project Documentation:
${state.project_documentation ?? ""}

Strategic Plans:
${state.strategic_plans ?? ""}
`;
  const response = await model.invoke(formatted);

  state.benefit_analysis_output =
    typeof response.content === "string"
      ? response.content
      : JSON.stringify(response.content);

  // config?.writer?.({
  //   type: "step_finished",
  //   step_name: "Benefit Analysis",
  // });

  return state;
}