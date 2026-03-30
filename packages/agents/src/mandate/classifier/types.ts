export type RiskTier = "PROHIBITED" | "HIGH_RISK" | "LIMITED_RISK" | "MINIMAL_RISK";

export type AISystemInput = {
  systemName: string;
  devSource: string;
  purpose: string;
  functionCategories: string[];
};

export type CompanyContext = {
  industry: string;
  operatingRegions: string[];
  aiRole: string;
  euInteraction?: string;
};

export type RiskClassification = {
  systemName: string;
  tier: RiskTier;
  tierLevel: 1 | 2 | 3 | 4;
  reasoning: string;
  article: string;
  annexDomain?: string;
  requirements?: string[];
};

export type ClassificationResult = {
  systems: RiskClassification[];
  summary: {
    total: number;
    prohibited: number;
    highRisk: number;
    limitedRisk: number;
    minimalRisk: number;
  };
};
