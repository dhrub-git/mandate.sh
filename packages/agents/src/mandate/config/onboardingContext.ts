import type { ClassificationResult } from "../classifier/types";

export type ParsedOnboarding = {
  companyId?: string;
  name: string;
  address: string;
  industry: string;
  employeeCount: string;
  revenue: string;
  operatingRegions: string[];
  euInteraction?: string;
  certifications: string[];
  governance: string;
  aiRole: string;
  [key: string]: unknown;
};

const EMPTY: ParsedOnboarding = {
  name: "the organisation",
  address: "",
  industry: "OTHER",
  employeeCount: "",
  revenue: "",
  operatingRegions: [],
  certifications: [],
  governance: "NO_GOVERNANCE",
  aiRole: "NOT_SURE",
};

/** Parse onboarding_data whether it is a JSON string or already an object. */
export function parseOnboardingData(
  onboardingData: unknown,
): ParsedOnboarding {
  if (!onboardingData) return { ...EMPTY };

  let raw: Record<string, unknown> = {};
  if (typeof onboardingData === "string") {
    try {
      raw = JSON.parse(onboardingData);
    } catch {
      return { ...EMPTY };
    }
  } else if (typeof onboardingData === "object") {
    raw = onboardingData as Record<string, unknown>;
  }

  // Support both Prisma field names and legacy Q* keys
  const regions = raw.operatingRegions ?? raw.Q6 ?? raw.regions;
  const certs = raw.certifications ?? raw.Q8;

  return {
    ...raw,
    companyId: typeof raw.companyId === "string" ? raw.companyId : undefined,
    name: String(raw.name ?? raw.Q1 ?? EMPTY.name),
    address: String(raw.address ?? raw.Q2 ?? ""),
    industry: String(raw.industry ?? raw.Q3 ?? EMPTY.industry),
    employeeCount: String(raw.employeeCount ?? raw.Q4 ?? ""),
    revenue: String(raw.revenue ?? raw.Q5 ?? ""),
    operatingRegions: Array.isArray(regions)
      ? regions.map(String)
      : typeof regions === "string"
        ? [regions]
        : [],
    euInteraction:
      raw.euInteraction != null
        ? String(raw.euInteraction)
        : raw.Q7 != null
          ? String(raw.Q7)
          : undefined,
    certifications: Array.isArray(certs)
      ? certs.map(String)
      : typeof certs === "string"
        ? [certs]
        : [],
    governance: String(raw.governance ?? raw.Q9 ?? EMPTY.governance),
    aiRole: String(raw.aiRole ?? raw.Q10 ?? EMPTY.aiRole),
  };
}

export function isEuAiActApplicable(data: ParsedOnboarding): boolean {
  const regions = data.operatingRegions.map((r) => r.toLowerCase());
  const hasEuRegion = regions.some(
    (r) =>
      r.includes("eu") ||
      r.includes("europe") ||
      r.includes("eea") ||
      r === "european union",
  );
  const eu = (data.euInteraction ?? "").toUpperCase();
  return (
    hasEuRegion ||
    eu === "DIRECT_EU_CUSTOMERS" ||
    eu === "AI_OUTPUT_REACHES_EU"
  );
}

export function formatRiskSummary(
  risk: ClassificationResult | null | undefined,
): string {
  if (!risk || risk.systems.length === 0) {
    return "No AI systems classified yet.";
  }

  const lines = risk.systems.map(
    (s) =>
      `- **${s.systemName}**: ${s.tier.replace(/_/g, " ")} (${s.article})${s.annexDomain ? ` — ${s.annexDomain}` : ""}. ${s.reasoning}`,
  );

  const { summary } = risk;
  return [
    `Total systems: ${summary.total} (Prohibited: ${summary.prohibited}, High-risk: ${summary.highRisk}, Limited: ${summary.limitedRisk}, Minimal: ${summary.minimalRisk})`,
    "",
    ...lines,
  ].join("\n");
}

/** Deterministic markdown inventory table for policy section 3. */
export function buildInventoryTableMarkdown(
  risk: ClassificationResult | null | undefined,
): string {
  if (!risk || risk.systems.length === 0) {
    return "_No AI systems inventoried yet._";
  }

  const header =
    "| System | Risk Tier | Legal Basis | Notes |\n| --- | --- | --- | --- |";
  const rows = risk.systems.map((s) => {
    const notes = (s.annexDomain || s.reasoning).replace(/\|/g, "/");
    return `| ${s.systemName} | ${s.tier.replace(/_/g, " ")} | ${s.article} | ${notes} |`;
  });
  return [header, ...rows].join("\n");
}

export function buildRegulatoryText(data: ParsedOnboarding): string {
  const euApplicable = isEuAiActApplicable(data);
  const frameworks: string[] = [];

  if (euApplicable) {
    frameworks.push(
      "EU AI Act (Regulation (EU) 2024/1689) — risk-based obligations for providers and deployers; prohibited practices (Art. 5), high-risk requirements (Arts. 9–15), transparency (Art. 50/52).",
    );
    frameworks.push(
      "GDPR (Regulation (EU) 2016/679) — personal data processing in AI systems, DPIA where required, lawful basis, data subject rights.",
    );
  } else {
    frameworks.push(
      "Monitor EU AI Act extraterritorial effects if outputs or users later reach the EU market.",
    );
  }

  frameworks.push(
    "NIST AI Risk Management Framework (AI RMF 1.0) — GOVERN, MAP, MEASURE, MANAGE functions as voluntary best practice.",
  );
  frameworks.push(
    "ISO/IEC 42001 — AI management system requirements for organisational governance.",
  );

  if (data.certifications.length > 0) {
    frameworks.push(
      `Existing certifications to align with: ${data.certifications.join(", ")}.`,
    );
  }

  return frameworks.map((f, i) => `${i + 1}. ${f}`).join("\n");
}

/**
 * Substitute {{Q*}} placeholders in stage prompt markdown with real
 * onboarding values. Unknown placeholders are left as-is.
 */
export function substitutePromptVars(
  template: string,
  onboardingData: unknown,
  extras: Record<string, string> = {},
): string {
  const data = parseOnboardingData(onboardingData);

  const vars: Record<string, string> = {
    Q1_company_name: data.name,
    Q2_address: data.address,
    Q3_industry: data.industry.replace(/_/g, " "),
    Q4_employees: data.employeeCount.replace(/_/g, " "),
    Q5_revenue: data.revenue.replace(/_/g, " "),
    Q6_regions:
      data.operatingRegions.length > 0
        ? data.operatingRegions.join(", ")
        : "Not specified",
    Q7_eu_exposure: (data.euInteraction ?? "NOT_SURE").replace(/_/g, " "),
    Q8_certifications:
      data.certifications.length > 0
        ? data.certifications.join(", ")
        : "None listed",
    Q9_governance: data.governance.replace(/_/g, " "),
    Q10_provider_deployer: data.aiRole.replace(/_/g, " "),
    Q13_vendor_list: extras.Q13_vendor_list ?? "To be confirmed during interview",
    COMPANY_NAME: data.name,
    ...extras,
  };

  return template.replace(/\{\{(\w+)\}\}/g, (match, key: string) => {
    if (key in vars) return vars[key]!;
    return match;
  });
}

export function companyContextFromOnboarding(data: ParsedOnboarding) {
  return {
    industry: data.industry,
    operatingRegions: data.operatingRegions,
    aiRole: data.aiRole,
    euInteraction: data.euInteraction,
  };
}
