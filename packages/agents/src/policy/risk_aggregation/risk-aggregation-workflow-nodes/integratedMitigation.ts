import { RiskAggregationState } from "../riskAggregationState";
import { PromptTemplate } from "@langchain/core/prompts";
import { model } from "../../../config/model";
import riskAggregationPrompt from "../riskAggregationPrompts";
export async function developIntegratedMitigationPlan(
  state: RiskAggregationState,
  config?: any
): Promise<RiskAggregationState> {

  config?.writer?.({
    type: "step_started",
    step_name: "Develop Integrated Mitigation Plan"
  });

     const formattedPrompt = `${riskAggregationPrompt.integratedMitigationPrompt}

Consolidated Risk Profile:
${state.consolidated_risk_profile}

Community Benefit Report:
${state.community_benefit_report}

Fairness Report:
${state.fairness_report}

Privacy & Security Report:
${state.privacy_security_report}

Transparency Report:
${state.transparency_report}

Accountability Report:
${state.accountability_report}

Your integrated mitigation plan should prioritize risks, suggest actionable steps, and ensure that mitigation strategies are aligned across all risk categories.
`;
const response = await model.invoke(formattedPrompt);
 

  state.integrated_mitigation_plan = response.content as string;

  config?.writer?.({
    type: "step_finished",
    step_name: "Develop Integrated Mitigation Plan"
  });

  return state;
}