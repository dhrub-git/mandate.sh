import { STAGE_ORDER } from "./constants";
import { PolicySectionDef, SectionState } from "./types";



export function getSectionState(
  section: PolicySectionDef,
  activeStage: string | null,
  stagesComplete: Set<string>,
  finalPolicy: string | undefined,
): SectionState {
  if (finalPolicy) return "final";
  if (stagesComplete.has(section.draftAfterStage)) return "drafted";
  if (activeStage === section.gatherStage) return "gathering";

  const gatherIdx = STAGE_ORDER.indexOf(section.gatherStage);
  const activeIdx = activeStage ? STAGE_ORDER.indexOf(activeStage) : -1;
  const maxCompleteIdx = Math.max(
    -1,
    ...STAGE_ORDER.map((s, i) => (stagesComplete.has(s) ? i : -1)),
  );
  if (maxCompleteIdx >= gatherIdx || activeIdx > gatherIdx) return "drafted";
  return "shimmer";
}