/**
 * EXPERIMENTAL / QUARANTINED system agents.
 *
 * Hallucination, job-impact, and sustainability agents are not part of the
 * core Mandate AI-governance policy generation graph (`src/mandate/`).
 * Keep them behind /api/system routes until productised.
 */
import { GraphStateType } from "../state";

/** Legacy scaffold node used by `src/graph.ts` — not the Mandate workflow. */
export async function systemAgentNode(_state: GraphStateType) {
  console.log("--- System Agent Processing (experimental scaffold) ---");
  return {};
}

export { hallucinationGraph } from "./hallucinaton_agent/graph";
export { jobImpactGraph } from "./job_impact_agent/graph";
export { greenAIGraph } from "./sustainabilty_agent/graph";
