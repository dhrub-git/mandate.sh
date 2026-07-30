import { PrivacySecurityState } from "../privacySecurityState";
import { PromptTemplate } from "@langchain/core/prompts";
import {model} from "../../../config/model"
import privacySecurityPrompts from "../privacySecurityPrompts";
export async function generateFinalPrivacyReport(
  state: PrivacySecurityState,
  config?: any
): Promise<PrivacySecurityState> {

  config?.writer?.({
    type: "step_started",
    step_name: "Data Governance & Consent Management",
  });

  const formatted = `${privacySecurityPrompts.finalPrivacyReportPrompt}

PIA Output:
${state.pia_output}

Security Assessment:
${state.security_assessment_output}

Compliance & Governance:
${state.compliance_and_governance_output}`;



  const response = await model.invoke(formatted);

  state.final_privacy_report = response.content as string;

  config?.writer?.({
    type: "step_finished",
    step_name: "Data Governance & Consent Management",
  });

  return state;
}