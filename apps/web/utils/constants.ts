import { PolicySectionDef } from "./types";

export const STAGE_ORDER = ["stage_2", "stage_3", "stage_4", "policy_generator"];

export const STAGE_LABELS: Record<string, string> = {
  stage_2: "AI Inventory",
  stage_3: "Governance Essentials",
  stage_4: "Risk & Regulations",
  policy_generator: "Policy Generation",
};

export const POLICY_SECTIONS: PolicySectionDef[] = [
  {
    id: "purpose",
    title: "1. Purpose & Scope",
    gatherStage: "stage_2",
    draftAfterStage: "stage_2",
    draftedContent: (p) =>
      p?.name
        ? `This policy governs the development, procurement, and deployment of AI systems at **${p.name}**${p.industry ? `, operating in the ${p.industry} sector` : ""}. It applies to all personnel, contractors, and third parties involved in AI-related activities.`
        : `This policy governs the development, procurement, and deployment of AI systems across the organisation. It applies to all personnel and contractors involved in AI-related activities.`,
  },
  {
    id: "regulations",
    title: "2. Applicable Regulations",
    gatherStage: "stage_4",
    draftAfterStage: "stage_4",
    draftedContent: (p) =>
      p?.countries
        ? `Regulatory frameworks applicable to **${p.name || "your organisation"}** based on operations in **${p.countries}**. Includes EU AI Act, GDPR, and sector-specific requirements. Enforcement dates, penalty ranges, and applicability rationale will be detailed here.`
        : `Applicable regulatory frameworks including the EU AI Act, GDPR, and relevant national legislation. Enforcement dates, penalty ranges, and applicability rationale will be detailed in the final document.`,
  },
  {
    id: "inventory",
    title: "3. AI System Inventory",
    gatherStage: "stage_2",
    draftAfterStage: "stage_2",
    draftedContent: (p) =>
      `AI systems identified during the inventory review${p?.name ? ` at **${p.name}**` : ""}. Each system is classified by function, risk tier, and provider/deployer role. The full inventory table will be generated in the final policy.`,
  },
  {
    id: "governance",
    title: "4. Governance Structure",
    gatherStage: "stage_3",
    draftAfterStage: "stage_3",
    draftedContent: (p) =>
      p?.size
        ? `Governance structure tailored for a **${p.size}**${p.industry ? ` ${p.industry}` : ""} organisation${p?.name ? ` (${p.name})` : ""}. Includes AI governance committee composition, reporting lines, and escalation procedures per Art. 17(1)(m) of the EU AI Act.`
        : `Governance structure including AI governance committee composition, reporting lines, and escalation procedures. Designed to comply with Art. 17(1)(m) of the EU AI Act.`,
  },
  {
    id: "roles",
    title: "5. Roles & Responsibilities",
    gatherStage: "stage_3",
    draftAfterStage: "stage_3",
    draftedContent: (p) =>
      `RACI matrix for AI governance roles${p?.name ? ` at **${p.name}**` : ""}. Covers AI Owner, AI Ethics Officer, Data Protection Officer, and operational staff. Role descriptions aligned with applicable regulatory frameworks.`,
  },
  {
    id: "risk",
    title: "6. Risk Appetite Statement",
    gatherStage: "stage_4",
    draftAfterStage: "stage_4",
    draftedContent: (p) =>
      p?.industry
        ? `Risk appetite statement for AI deployments in the **${p.industry}** sector. References NIST GOVERN 1.3 and ISO 42001 Clause 6.1.1. Defines acceptable risk thresholds and required mitigations per risk tier.`
        : `Risk appetite statement referencing NIST GOVERN 1.3 and ISO 42001 Clause 6.1.1. Defines acceptable risk thresholds and required mitigations for each AI risk tier.`,
  },
  {
    id: "review",
    title: "7. Policy Review Schedule",
    gatherStage: "policy_generator",
    draftAfterStage: "policy_generator",
    draftedContent: () =>
      `Annual minimum review cycle with triggered reviews on: regulatory changes, new AI system deployments, material changes to existing systems, or governance incidents. Simplified schedule available for SMEs per Art. 62.`,
  },
  {
    id: "control",
    title: "8. Document Control",
    gatherStage: "policy_generator",
    draftAfterStage: "policy_generator",
    draftedContent: (p) =>
      `**${p?.name ?? "Organisation"} — AI Governance Policy v1.0**\n\nEffective date: ${new Date().toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" })}\n\nApproval authority: Board / AI Governance Committee\n\nNext review: ${new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString("en-GB", { year: "numeric", month: "long" })}`,
  },
];