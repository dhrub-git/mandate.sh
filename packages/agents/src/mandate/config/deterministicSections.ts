import type { ClassificationResult } from "../classifier/types";
import {
  buildInventoryTableMarkdown,
  parseOnboardingData,
  type ParsedOnboarding,
} from "./onboardingContext";

function findSectionBounds(
  markdown: string,
  titleMatchers: RegExp[],
): { start: number; end: number; heading: string } | null {
  const headingRe = /^(##\s+.+)$/gm;
  const headings: { index: number; text: string }[] = [];
  let m: RegExpExecArray | null;
  while ((m = headingRe.exec(markdown)) !== null) {
    headings.push({ index: m.index, text: m[1]! });
  }

  for (let i = 0; i < headings.length; i++) {
    const h = headings[i]!;
    if (titleMatchers.some((re) => re.test(h.text))) {
      const end = i + 1 < headings.length ? headings[i + 1]!.index : markdown.length;
      return { start: h.index, end, heading: h.text };
    }
  }
  return null;
}

function replaceOrAppendSection(
  markdown: string,
  titleMatchers: RegExp[],
  newSection: string,
): string {
  const bounds = findSectionBounds(markdown, titleMatchers);
  const block = newSection.trimEnd() + "\n\n";
  if (!bounds) {
    return markdown.trimEnd() + "\n\n" + block;
  }
  return (
    markdown.slice(0, bounds.start) + block + markdown.slice(bounds.end)
  );
}

export function buildInventorySectionMarkdown(
  risk: ClassificationResult | null | undefined,
  onboarding: ParsedOnboarding,
): string {
  const table = buildInventoryTableMarkdown(risk);
  return `## 3. AI System Inventory Summary

The following AI systems have been inventoried for **${onboarding.name}**. Risk tiers are assigned under the EU AI Act classification rules applied during Stage 2.

${table}
`;
}

export function buildDocumentControlSectionMarkdown(
  onboarding: ParsedOnboarding,
): string {
  const today = new Date();
  const effective = today.toLocaleDateString("en-GB", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const nextReview = new Date(today);
  nextReview.setFullYear(nextReview.getFullYear() + 1);
  const nextReviewLabel = nextReview.toLocaleDateString("en-GB", {
    year: "numeric",
    month: "long",
  });

  return `## 8. Document Control

| Field | Value |
| --- | --- |
| Organisation | ${onboarding.name} |
| Document | AI Governance Policy |
| Version | 1.0 |
| Status | Draft |
| Effective date | ${effective} |
| Approval authority | Board / AI Governance Committee |
| Next review | ${nextReviewLabel} |
`;
}

/**
 * Overwrite DET sections (inventory + document control) so they cannot
 * drift from structured state / onboarding facts.
 */
export function applyDeterministicSections(
  policyMarkdown: string,
  onboardingData: unknown,
  risk: ClassificationResult | null | undefined,
): string {
  const onboarding = parseOnboardingData(onboardingData);
  let next = policyMarkdown;

  next = replaceOrAppendSection(
    next,
    [/##\s*\d*\.?\s*AI System Inventory/i, /##\s*3[\.\)]/i],
    buildInventorySectionMarkdown(risk, onboarding),
  );

  next = replaceOrAppendSection(
    next,
    [/##\s*\d*\.?\s*Document Control/i, /##\s*8[\.\)]/i],
    buildDocumentControlSectionMarkdown(onboarding),
  );

  return next.trim() + "\n";
}
