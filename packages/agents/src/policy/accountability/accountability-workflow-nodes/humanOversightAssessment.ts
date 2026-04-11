import { model } from "../../../config/model";
import { AccountabilityState } from "../accountabilityState";
import AccountabilityPrompts from "../accountabilityPrompts";

export async function runHumanOversightAssessment(
  state: AccountabilityState,
  config?: any
): Promise<AccountabilityState> {

  config?.writer?.({
    type: "step_started",
    step_name: "Human Oversight Assessment",
  });

    const prompt = `${AccountabilityPrompts.humanOversightPrompt}\n
Project Documentation:
${state.project_documentation}

Training Materials:
${state.training_materials}
`;

  const response = await model.invoke(prompt);

  state.human_oversight_analysis = response.content as string;

  config?.writer?.({
    type: "step_finished",
    step_name: "Human Oversight Assessment",
  });

  return state;
}