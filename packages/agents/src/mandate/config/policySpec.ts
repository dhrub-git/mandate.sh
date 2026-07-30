export type PolicySection = {
  inputs: string[];
  method: "DET" | "LLM" | "HYB" | "STO + DET";
  generation_details: string;
};

export type PolicySpec = {
  sections: Record<string, PolicySection>;
};

export const aiGovernancePolicySpec: PolicySpec = {
  sections: {
    "1. Purpose & Scope": {
      inputs: ["Q1 (name)", "Q3 (industry)", "Q6 (countries)", "applicable_frameworks[]"],
      method: "HYB",
      generation_details:
        "DET selects scope template based on framework applicability. " +
        "LLM writes 2–3 sentence purpose statement tailored to industry. " +
        "STO injects framework names and regulatory references.",
    },

    "2. Applicable Regulations": {
      inputs: ["applicable_frameworks[]", "Q6", "Q7"],
      method: "STO + DET",
      generation_details:
        "Table of applicable frameworks with enforcement dates, penalty ranges, " +
        "and applicability rationale. All from knowledge base — zero LLM.",
    },

    "3. AI System Inventory Summary": {
      inputs: ["Q11–Q16 (all systems)", "risk_tier[]"],
      method: "DET",
      generation_details:
        "Auto-generated table: system name, function category, domain, " +
        "risk tier, provider/deployer role. Pure database query — no LLM.",
    },

    "4. Governance Structure": {
      inputs: ["Q9 (governance)", "Q10 (role)", "company_role"],
      method: "HYB",
      generation_details:
        "IF Q9 = 'Dedicated committee' → template with existing structure + " +
        "LLM recommendations for AI-specific enhancements. " +
        "IF Q9 = 'No governance' → LLM generates recommended structure " +
        "(AI governance committee, AI ethics officer, reporting lines) " +
        "based on Q4 company size. DET inserts required roles per Art. 17(1)(m).",
    },

    "5. Roles & Responsibilities": {
      inputs: ["Q9", "Q10", "company_role", "per_system_role[]"],
      method: "LLM",
      generation_details:
        "Prompt: Generate a RACI matrix for AI governance at a {Q4}-size {Q3} company " +
        "that is an AI {company_role}. Include roles required by {applicable_frameworks}. " +
        "LLM drafts role descriptions. STO injects article requirements.",
    },

    "6. Risk Appetite Statement": {
      inputs: ["Q3", "risk_tier[]", "Q22 (consequences)"],
      method: "LLM",
      generation_details:
        "Prompt: Draft a risk appetite statement referencing NIST GOVERN 1.3 " +
        "and ISO 42001 Clause 6.1.1.",
    },

    "7. Policy Review Schedule": {
      inputs: ["is_sme", "applicable_frameworks[]"],
      method: "DET",
      generation_details:
        "Annual review minimum. Triggered review on regulatory changes, " +
        "system changes, or incidents. SMEs simplified schedule per Art. 62.",
    },

    "8. Document Control": {
      inputs: ["Q1", "generation_date"],
      method: "DET",
      generation_details:
        "Boilerplate: version number, approval authority, effective date, next review date.",
    },
  },
};