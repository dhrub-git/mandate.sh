import { model } from "../../../config/model";

import { AccountabilityState } from "../accountabilityState";
import { AccountabilityPrompts } from "../accountabilityPrompts";

export async function runAuditTrailAssessment(
  state: AccountabilityState,
  config?: any
): Promise<AccountabilityState> {

  config?.writer?.({
    type: "step_started",
    step_name: "Audit Trail Assessment",
  });

  const prompt = `${AccountabilityPrompts.auditTrailPrompt}\n
Project Documentation:
${state.project_documentation}

Audit Log Specifications:
${state.audit_log_specs}
`;

  const response = await model.invoke(prompt);

  state.audit_trail_analysis = response.content as string;

  config?.writer?.({
    type: "step_finished",
    step_name: "Audit Trail Assessment",
  });

  return state;
}