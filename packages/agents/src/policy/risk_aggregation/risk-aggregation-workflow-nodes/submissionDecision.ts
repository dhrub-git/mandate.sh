import { RiskAggregationState } from "../riskAggregationState";





export async function applySubmissionDecisionFramework(
  state: RiskAggregationState,
  config?: any
): Promise<RiskAggregationState> {

  config?.writer?.({
    type: "step_started",
    step_name: "Apply Submission Decision Framework"
  });

  let overallRiskRating = "Medium";

  try {
    const parsed = JSON.parse(state.consolidated_risk_profile || "{}");
    overallRiskRating = parsed.overall_risk_rating || "Medium";
  } catch {}

  const metadata = state.project_metadata || {};

  const budget = metadata.budget || 0;
  const usesFund = metadata.uses_digital_restart_fund || false;

  const shouldSubmit =
    overallRiskRating === "High" ||
    overallRiskRating === "Very High" ||
    budget > 5000000 ||
    usesFund;

  const recommendation = {

    should_submit_to_committee: shouldSubmit,

    decision: shouldSubmit
      ? "SUBMIT TO AI REVIEW COMMITTEE"
      : "NO COMMITTEE REVIEW REQUIRED",

    overall_risk_rating: overallRiskRating,

    project_budget: budget,

    uses_digital_restart_fund: usesFund
  };

  state.submission_recommendation =
    JSON.stringify(recommendation, null, 2);

  config?.writer?.({
    type: "step_finished",
    step_name: "Apply Submission Decision Framework"
  });

  return state;
}