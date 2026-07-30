import { model } from "../../../config/model";
import { AccountabilityState } from "../accountabilityState";
import AccountabilityPrompts from "../accountabilityPrompts";

export async function generateFinalAccountabilityReport(
  state: AccountabilityState,
  config?: any
): Promise<AccountabilityState> {

  config?.writer?.({
    type: "step_started",
    step_name: "Final Accountability Report Generation",
  });
  
    const prompt = `${AccountabilityPrompts.finalReportPrompt}\n
Responsible Officer Assessment:
${state.responsible_officer_analysis}

Human Oversight Assessment:
${state.human_oversight_analysis}

Audit Trail Assessment:
${state.audit_trail_analysis}
`;

  const response = await model.invoke(prompt);

  state.final_accountability_report = response.content as string;

  config?.writer?.({
    type: "step_finished",
    step_name: "Final Accountability Report Generation",
  });

  return state;
}