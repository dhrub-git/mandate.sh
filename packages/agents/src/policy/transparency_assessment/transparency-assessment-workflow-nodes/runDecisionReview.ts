import { PromptTemplate } from "@langchain/core/prompts";
import { TransparencyAssessmentState } from "../transparencyAssessmentState";
import { model } from "../../../config/model";

import transparencyAssessmentPrompts from "../transparencyAssessmentPrompts";

const PROMPT = new PromptTemplate({
  template: `
Assess decision review and challenge mechanisms:

{compliance_data}
`,
  inputVariables: ["compliance_data"],
});

export async function runDecisionReview(
  state: TransparencyAssessmentState,
  config?: any
): Promise<TransparencyAssessmentState> {

  config?.writer?.({
    type: "step_started",
    step_name: "Decision Review & Challenge Mechanisms",
  });

  const formattedPrompt = `${transparencyAssessmentPrompts.decisionReviewAndChallengeMechanismPrompt}

Compliance Data:
${state.compliance_data ?? ""}
`;

  const response = await model.invoke(formattedPrompt);

  state.decision_review_and_challenge_mechanisms =
    response.content as string;

  config?.writer?.({
    type: "step_finished",
    step_name: "Decision Review & Challenge Mechanisms",
  });

  return state;
}