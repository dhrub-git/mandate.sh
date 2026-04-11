import { RiskAggregationState } from "../riskAggregationState";
// import { consolidateRisksPrompt } from "@/prompts/riskAggregationPrompts";
import { PromptTemplate } from "@langchain/core/prompts";
import { model } from "../../../config/model";

import riskAggregationPrompt from "../riskAggregationPrompts";
export async function consolidateAndAnalyzeRisks(
  state: RiskAggregationState,
  config?: any
): Promise<RiskAggregationState> {
    

 const formattedPrompt = `${riskAggregationPrompt.consolidatedRiskPrompt}

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

Make sure to identify overlapping risks, categorize them, and provide mitigation strategies.
`;

const response = await model.invoke(formattedPrompt);



  state.consolidated_risk_profile = response.content as string;

  config?.writer?.({
    type: "step_finished",
    step_name: "Consolidate & Analyze Risks"
  });

  return state;
}