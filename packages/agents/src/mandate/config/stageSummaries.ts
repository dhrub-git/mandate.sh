/** Truncate stage interview text into a compact summary for later stages. */
export function compactStageSummary(
  stage: 2 | 3 | 4,
  summaryOrText: string,
  maxChars = 1800,
): string {
  const cleaned = summaryOrText.replace(/\s+/g, " ").trim();
  if (!cleaned) return `Stage ${stage} completed (no summary text).`;
  if (cleaned.length <= maxChars) return cleaned;
  return `${cleaned.slice(0, maxChars)}…`;
}

/**
 * Build a compact handoff payload for the final policy generator so we do not
 * re-inject full conversational histories / raw AIMessage blobs.
 */
export function buildCompactPolicyHandoff(args: {
  onboardingData: string;
  stage2Summary?: string;
  stage3Summary?: string;
  stage4Summary?: string;
  riskJson: string;
  draft2?: string;
  draft3?: string;
  draft4?: string;
}): string {
  return `
## Onboarding (Stage 1)
${args.onboardingData}

## Stage 2 summary (AI inventory)
${args.stage2Summary ?? "(missing)"}

## Stage 3 summary (governance)
${args.stage3Summary ?? "(missing)"}

## Stage 4 summary (risk & regulations)
${args.stage4Summary ?? "(missing)"}

## EU AI Act risk classifications (structured)
${args.riskJson}

## Interim drafts to merge/refine (do not ignore)
### draft_policy_2
${args.draft2 ?? ""}

### draft_policy_3
${args.draft3 ?? ""}

### draft_policy_4
${args.draft4 ?? ""}
`.trim();
}
