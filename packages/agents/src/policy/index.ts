/**
 * EXPERIMENTAL / QUARANTINED assessment workflows.
 *
 * Fairness, privacy, accountability, community benefit, risk aggregation,
 * and transparency graphs are NOT part of the main Mandate onboarding →
 * policy generation path under `src/mandate/`.
 *
 * Keep them behind /api/policy/* and AgentRunner until they emit structured
 * evidence attachable to a Policy version.
 */

import { GraphStateType } from "../state";

/** Legacy scaffold node used by `src/graph.ts` — not the Mandate workflow. */
export async function policyAgentNode(_state: GraphStateType) {
  console.log("--- Policy Agent Processing (experimental scaffold) ---");
  return {};
}

export { accountabilityGraph } from "./accountability/accountabilityWorkflow";
export { communityBenefitGraph } from "./community_benefit/communityBenefitWorkflow";
export { graph as fairnessAgentGraph } from "./fairness_agent/fairnessAgentWorkflow";
export { privacySecurityGraph } from "./privacy_security/privacySecurityWorkflow";
export { graph as riskAggregationGraph } from "./risk_aggregation/riskAggregationWorkflow";
export { graph as transparencyGraph } from "./transparency_assessment/transparencyWorkflow";
