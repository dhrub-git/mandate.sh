import type { Company, PolicyVariantType } from "@repo/database";

export function buildCompanyContext(company: Company): string {
  return `
Company Context:
- Name: ${company.name}
- Industry: ${company.industry.replace(/_/g, " ")}
- Size: ${company.employeeCount.replace(/_/g, " ")} employees
- Revenue: ${company.revenue.replace(/_/g, " ")}
- Operating Regions: ${company.operatingRegions.join(", ")}
- EU AI Act Interaction: ${company.euInteraction || "Not specified"}
- AI Role: ${company.aiRole}
- Governance Structure: ${company.governance.replace(/_/g, " ")}
- Certifications: ${company.certifications.length ? company.certifications.join(", ") : "None"}
  `.trim();
}

export function getSystemPrompt(variantType: PolicyVariantType): string {
  const baseInstructions = "IMPORTANT: Use '## ' for all top-level section headings to ensure correct parsing.";

  switch (variantType) {
    case "EXECUTIVE_SUMMARY":
      return `${baseInstructions}\nWrite a strategic, non-technical Executive Summary (max 800 words). Include traffic-light risk indicators. End with a section titled '## Key Decisions Required' containing actionable items for the board.`;
      
    case "COMPREHENSIVE_POLICY":
      return `${baseInstructions}\nExpand into a formal policy document. Tone: Formal, authoritative, regulatory-aligned. Must include: Document Control block, Definitions glossary, RACI matrix, regulatory article references, and numbered sections (5-10 pages equivalent).`;
      
    case "VENDOR_REQUIREMENTS":
      return `${baseInstructions}\nDraft Vendor Requirements Guidelines. Tone: Prescriptive, contractual, compliance-oriented. Use RFC 2119 language (MUST/SHOULD/MAY). Include a vendor risk classification framework, a due diligence checklist, and model contractual clauses.`;
      
    case "CODING_STANDARDS":
      return `${baseInstructions}\nDraft AI Coding Standards. Target audience: Software engineers, DevOps, QA. Tone: Technical and prescriptive. Include enforceable rules, code examples, CI/CD integration rules, security standards, and compliance mapping.`;
      
    default:
      return baseInstructions;
  }
}