import type { ClassificationResult } from "../classifier/types";
import {
  buildInventoryTableMarkdown,
  buildRegulatoryText,
  isEuAiActApplicable,
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
      const end =
        i + 1 < headings.length ? headings[i + 1]!.index : markdown.length;
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
  return markdown.slice(0, bounds.start) + block + markdown.slice(bounds.end);
}

export function buildPurposeScopeSectionMarkdown(
  onboarding: ParsedOnboarding,
): string {
  const regions =
    onboarding.operatingRegions.length > 0
      ? onboarding.operatingRegions.join(", ")
      : "its operating regions";
  const role = onboarding.aiRole.replace(/_/g, " ").toLowerCase();
  const eu = isEuAiActApplicable(onboarding);

  return `## 1. Purpose & Scope

This AI Governance Policy establishes how **${onboarding.name}** governs the design, procurement, deployment, and monitoring of artificial intelligence systems. It applies to all employees, contractors, and third parties involved in AI-related activities across ${regions}.

**${onboarding.name}** operates in the **${onboarding.industry.replace(/_/g, " ")}** sector and acts as an AI **${role}**. ${
    eu
      ? "Given EU market exposure, this policy is aligned with the EU AI Act and related data-protection obligations."
      : "This policy adopts internationally recognised AI governance practices (NIST AI RMF, ISO/IEC 42001) and monitors potential EU AI Act extraterritorial effects."
  }

The policy covers AI systems used in products, internal operations, and vendor-supplied solutions under the organisation's control or substantial influence.
`;
}

export function buildRegulationsSectionMarkdown(
  onboarding: ParsedOnboarding,
  risk: ClassificationResult | null | undefined,
): string {
  const eu = isEuAiActApplicable(onboarding);
  const hasHigh =
    (risk?.summary.highRisk ?? 0) > 0 || (risk?.summary.prohibited ?? 0) > 0;
  const hasLimited = (risk?.summary.limitedRisk ?? 0) > 0;

  const rows: string[] = [];

  if (eu) {
    rows.push(
      `| EU AI Act (Reg. (EU) 2024/1689) | Operating regions / EU exposure (${(onboarding.euInteraction ?? "NOT_SURE").replace(/_/g, " ")}) | Risk-based duties for providers/deployers; Art. 5 prohibited practices; Arts. 9–15 high-risk; transparency Art. 50/52 |`,
    );
    rows.push(
      `| GDPR (Reg. (EU) 2016/679) | Personal data in AI systems | Lawful basis, DPIA where required, data subject rights, processor controls |`,
    );
  } else {
    rows.push(
      `| EU AI Act (extraterritorial watch) | Possible future EU users/outputs | Monitor applicability if products or outputs reach the EU market |`,
    );
  }

  rows.push(
    `| NIST AI RMF 1.0 | Voluntary best practice | GOVERN / MAP / MEASURE / MANAGE functions for risk management |`,
  );
  rows.push(
    `| ISO/IEC 42001 | AI management system | Organisational controls for AI lifecycle governance |`,
  );

  if (onboarding.certifications.length > 0) {
    rows.push(
      `| Existing certifications (${onboarding.certifications.join(", ")}) | Held by organisation | Maintain alignment; reuse evidence where controls overlap |`,
    );
  }

  if (hasHigh) {
    rows.push(
      `| EU AI Act high-risk / prohibited controls | Inventoried system risk tiers | Mandatory risk management, data governance, logging, human oversight, and technical documentation for in-scope systems |`,
    );
  } else if (hasLimited) {
    rows.push(
      `| EU AI Act transparency duties | Limited-risk systems inventoried | User-facing disclosure / labelling obligations for chatbots and generative content |`,
    );
  }

  return `## 2. Applicable Regulations

The following frameworks apply to **${onboarding.name}** based on operating profile and AI system risk classification. Citations below are fixed knowledge-base entries — do not treat them as legal advice.

| Framework | Why applicable | Key obligations |
| --- | --- | --- |
${rows.join("\n")}

### Reference notes
${buildRegulatoryText(onboarding)}
`;
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

export function buildReviewScheduleSectionMarkdown(
  onboarding: ParsedOnboarding,
): string {
  const isSme = [
    "ONE_TO_49",
    "FIFTY_TO_99",
    "ONE_HUNDRED_TO_249",
  ].includes(onboarding.employeeCount);

  return `## 7. Policy Review Schedule

This policy is reviewed at least **annually**. Additional triggered reviews occur when:

- Applicable regulations change (including EU AI Act guidance updates)
- New AI systems are deployed or material changes are made to existing systems
- A governance, security, or ethics incident involving AI occurs
- The organisation's AI role (provider / deployer) or operating regions change

${
  isSme
    ? "As an SME-scale organisation, documentation and review cadence may use simplified artefacts consistent with EU AI Act Art. 62 proportionality, without reducing accountability for high-risk systems."
    : "Enterprise-scale operations require formal committee sign-off on each scheduled review and on any material amendment."
}
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
 * Overwrite DET / STO sections so they cannot drift from structured state.
 * LLM-authored sections (governance, roles, risk appetite) are preserved.
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
    [/##\s*\d*\.?\s*Purpose\s*&\s*Scope/i, /##\s*1[\.\)]/i],
    buildPurposeScopeSectionMarkdown(onboarding),
  );

  next = replaceOrAppendSection(
    next,
    [/##\s*\d*\.?\s*Applicable Regulations/i, /##\s*2[\.\)]/i],
    buildRegulationsSectionMarkdown(onboarding, risk),
  );

  next = replaceOrAppendSection(
    next,
    [/##\s*\d*\.?\s*AI System Inventory/i, /##\s*3[\.\)]/i],
    buildInventorySectionMarkdown(risk, onboarding),
  );

  next = replaceOrAppendSection(
    next,
    [/##\s*\d*\.?\s*Policy Review Schedule/i, /##\s*7[\.\)]/i],
    buildReviewScheduleSectionMarkdown(onboarding),
  );

  next = replaceOrAppendSection(
    next,
    [/##\s*\d*\.?\s*Document Control/i, /##\s*8[\.\)]/i],
    buildDocumentControlSectionMarkdown(onboarding),
  );

  return next.trim() + "\n";
}
