import { PromptTemplate } from "@langchain/core/prompts";
import { TransparencyAssessmentState } from "../transparencyAssessmentState";
import { model } from "../../../config/model";
import transparencyAssessmentPrompts from "../transparencyAssessmentPrompts";


export async function runGipaCompliance(
  state: TransparencyAssessmentState,
  config?: any
): Promise<TransparencyAssessmentState> {

  config?.writer?.({
    type: "step_started",
    step_name: "GIPA Compliance & Information Accessibility",
  });


      const prompt = `${transparencyAssessmentPrompts.gipaActComplianceAndInformationAccessibility}\n${JSON.stringify(state.compliance_data, null, 2)}`;



  const response = await model.invoke(prompt);

  state.GIPA_compliance_and_information_accessibility =
    response.content as string;

  config?.writer?.({
    type: "step_finished",
    step_name: "GIPA Compliance & Information Accessibility",
  });

  return state;
}