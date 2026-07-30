import { CommunityBenefitState } from "../communityBenefitState";
import { PromptTemplate } from "@langchain/core/prompts";
import {model} from "../../../config/model"
import CommunityBenefitPrompts from "../communityBenefitPrompts";
export async function generateFinalReport(
  state: CommunityBenefitState,
  config?: any
): Promise<CommunityBenefitState> {

  // config?.writer?.({
  //   type: "step_started",
  //   step_name: "Final Report Generation",
  // });


const finalReportPrompt = CommunityBenefitPrompts.finalReportPrompt

  
const formatted = `${finalReportPrompt}

Benefit Analysis:
${state.benefit_analysis_output ?? ""}

Risk Assessment:
${state.risk_assessment_output ?? ""}

Stakeholder Analysis:
${state.stakeholder_analysis_output ?? ""}
`;
  const response = await model.invoke(formatted);

  state.final_report =
    typeof response.content === "string"
      ? response.content
      : JSON.stringify(response.content);

  // config?.writer?.({
  //   type: "step_finished",
  //   step_name: "Final Report Generation",
  // });

  return state;
}