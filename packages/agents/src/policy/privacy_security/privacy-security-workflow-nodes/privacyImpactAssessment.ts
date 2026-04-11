import { PrivacySecurityState } from "../privacySecurityState";
import { PromptTemplate } from "@langchain/core/prompts";
import {model} from "../../../config/model"
import privacySecurityPrompts from "../privacySecurityPrompts";
export async function performPrivacyImpactAssessment(
  state: PrivacySecurityState,
  config?: any
): Promise<PrivacySecurityState> {

  config?.writer?.({
    type: "step_started",
    step_name: "Privacy Impact Assessment",
  });

    const formatted = `${privacySecurityPrompts.privacyImpactAssessmentPrompt}

Project Documentation:
${state.project_documentation}

Data Flow Map:
${state.data_flow_map}
`;

  const response = await model.invoke(formatted);

  state.pia_output = response.content as string;

  config?.writer?.({
    type: "step_finished",
    step_name: "Privacy Impact Assessment",
  });

  return state;
}