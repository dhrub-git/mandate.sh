import { PrivacySecurityState } from "../privacySecurityState";
import { PromptTemplate } from "@langchain/core/prompts";
import {model} from "../../../config/model"

import privacySecurityPrompts from "../privacySecurityPrompts";
export async function performSecurityAssessment(
  state: PrivacySecurityState,
  config?: any
): Promise<PrivacySecurityState> {

  config?.writer?.({
    type: "step_started",
    step_name: "Security Assessment",
  });

  const formatted = `${privacySecurityPrompts.securityAssessmentPrompt}

Project Documentation:
${state.project_documentation}

Security Policies:
${state.security_policies}
`;

  const response = await model.invoke(formatted);

  state.security_assessment_output = response.content as string;

  config?.writer?.({
    type: "step_finished",
    step_name: "Security Assessment",
  });

  return state;
}