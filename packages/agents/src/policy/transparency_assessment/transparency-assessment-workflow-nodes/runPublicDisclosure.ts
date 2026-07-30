import { PromptTemplate } from "@langchain/core/prompts";
import { TransparencyAssessmentState } from "../transparencyAssessmentState";
import { model } from "../../../config/model";

import transparencyAssessmentPrompts from "../transparencyAssessmentPrompts";
export async function runPublicDisclosure(
  state: TransparencyAssessmentState,
  config?: any
): Promise<TransparencyAssessmentState> {

  config?.writer?.({
    type: "step_started",
    step_name: "Public Disclosure & Transparency",
  });

   const prompt = `${transparencyAssessmentPrompts.publicDisclousureAndTransparencyPrompt}\n${JSON.stringify(state.compliance_data, null, 2)}`;


  const response = await model.invoke(prompt);

  state.public_disclousure_and_transparency =
    response.content as string;

  config?.writer?.({
    type: "step_finished",
    step_name: "Public Disclosure & Transparency",
  });

  return state;
}