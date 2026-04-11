import { CommunityBenefitState } from "../communityBenefitState";
import { PromptTemplate } from "@langchain/core/prompts";
import {model} from "../../../config/model"
import CommunityBenefitPrompts from "../communityBenefitPrompts";
export async function performStakeholderAnalysis(
  state: CommunityBenefitState,
  config?: any
): Promise<CommunityBenefitState> {

  // config?.writer?.({
  //   type: "step_started",
  //   step_name: "Stakeholder Analysis",
  // });

  const formatted = `${CommunityBenefitPrompts.stakeHolderAnalysisPrompt}

Project Documentation:
${state.project_documentation ?? ""}

Community Feedback:
${state.community_feedback ?? ""}
`;
  const response = await model.invoke(formatted);

  state.stakeholder_analysis_output =
    typeof response.content === "string"
      ? response.content
      : JSON.stringify(response.content);

  // config?.writer?.({
  //   type: "step_finished",
  //   step_name: "Stakeholder Analysis",
  // });

  return state;
}