import { PromptTemplate } from "@langchain/core/prompts";
import { TransparencyAssessmentState } from "../transparencyAssessmentState";
import { model } from "../../../config/model";
import transparencyAssessmentPrompts from "../transparencyAssessmentPrompts";

const PROMPT = new PromptTemplate({
  template: `
You are an AI transparency expert.

Assess explainability based on:

{compliance_data}
`,
  inputVariables: ["compliance_data"],
});

export async function runExplainabilityAssessment(
  state: TransparencyAssessmentState,
  config?: any
): Promise<TransparencyAssessmentState> {

  config?.writer?.({
    type: "step_started",
    step_name: "Explainability Assessment",
  });

  const formattedPrompt = `${transparencyAssessmentPrompts.explainabilityAssessmentPrompt}

Compliance Data:
${state.compliance_data ?? ""}
`;

  const response = await model.invoke(formattedPrompt);

  state.explainability_assessment = response.content as string;

  config?.writer?.({
    type: "step_finished",
    step_name: "Explainability Assessment",
  });

  return state;
}