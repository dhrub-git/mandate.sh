import { model } from "../../../config/model";
import { AccountabilityState } from "../accountabilityState";
import AccountabilityPrompts from "../accountabilityPrompts";

export async function runResponsibleOfficerAssessment(
  state: AccountabilityState,
  config?: any
): Promise<AccountabilityState> {

  config?.writer?.({
    type: "step_started",
    step_name: "Responsible Officer Framework",
  });

    const prompt = `${AccountabilityPrompts.responsibleOfficerPrompt}\n
Project Documentation:
${state.project_documentation}

Organization Chart / Roles Documentation:
${state.org_chart_or_roles_doc}
`;

  const response = await model.invoke(prompt);

  state.responsible_officer_analysis = response.content as string;

  config?.writer?.({
    type: "step_finished",
    step_name: "Responsible Officer Framework",
  });

  return state;
}