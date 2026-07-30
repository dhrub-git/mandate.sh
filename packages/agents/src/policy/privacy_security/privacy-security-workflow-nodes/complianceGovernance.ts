import { PrivacySecurityState } from "../privacySecurityState";
import { PromptTemplate } from "@langchain/core/prompts";
import {model} from "../../../config/model"
import { privacySecurityPrompts } from "../privacySecurityPrompts";

export async function performComplianceGovernanceCheck(
  state: PrivacySecurityState,
  config?: any
): Promise<PrivacySecurityState> {

  config?.writer?.({
    type: "step_started",
    step_name: "Regulatory Compliance Verification",
  });

    const formatted = `${privacySecurityPrompts.complianceGovernancePrompt}

Project Documentation:
${state.project_documentation}

PIA Output:
${state.pia_output}
`;
  const response = await model.invoke(formatted);

  state.compliance_and_governance_output = response.content as string;

  config?.writer?.({
    type: "step_finished",
    step_name: "Regulatory Compliance Verification",
  });

  return state;
}