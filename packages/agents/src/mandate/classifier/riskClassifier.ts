import type {
  AISystemInput,
  CompanyContext,
  RiskClassification,
  ClassificationResult,
} from "./types";

const HIGH_RISK_REQUIREMENTS = [
  "Risk management system (Art. 9)",
  "Data governance (Art. 10)",
  "Technical documentation (Art. 11)",
  "Record-keeping & logging (Art. 12)",
  "Transparency to users (Art. 13)",
  "Human oversight measures (Art. 14)",
  "Accuracy, robustness & cybersecurity (Art. 15)",
];

// --- Keyword lists for purpose matching ---

const SOCIAL_SCORING_KEYWORDS = ["social scoring", "citizen scoring", "behavioral scoring", "citizen rating", "trustworthiness score"];
const REALTIME_BIOMETRIC_KEYWORDS = ["real-time biometric", "live biometric", "real time facial", "facial recognition in public", "live identification"];
const MANIPULATION_KEYWORDS = ["manipulat", "exploit vulnerabilit", "subliminal", "deceptive technique"];
const EMOTION_RECOGNITION_KEYWORDS = ["emotion recognition", "emotion detection", "affect recognition", "sentiment detection from face", "mood detection"];

const BIOMETRIC_KEYWORDS = ["biometric", "facial recognition", "fingerprint", "voice identification", "iris scan", "face detection"];
const EDUCATION_KEYWORDS = ["exam", "scoring", "admission", "grading", "student assessment", "learning evaluation"];
const EMPLOYMENT_KEYWORDS = ["recruit", "hire", "hiring", "terminat", "firing", "promot", "performance review", "cv screening", "resume screening", "worker management"];
const CREDIT_KEYWORDS = ["credit", "creditworth", "loan", "insurance scoring", "eligibility", "benefit entitlement", "emergency dispatch", "emergency priorit"];
const MIGRATION_KEYWORDS = ["migration", "asylum", "border", "visa", "immigration", "refugee"];
const JUSTICE_KEYWORDS = ["justice", "court", "judicial", "election", "democratic process", "legal research", "sentencing"];
const SAFETY_COMPONENT_KEYWORDS = ["medical device", "diagnostic", "safety component", "aviation", "automotive safety", "surgical"];

function purposeMatches(purpose: string, keywords: string[]): boolean {
  const lower = purpose.toLowerCase();
  return keywords.some((kw) => lower.includes(kw));
}

function hasCategory(categories: string[], target: string): boolean {
  return categories.some((c) => c.toLowerCase().includes(target.toLowerCase()));
}

function classifySystem(
  system: AISystemInput,
  context: CompanyContext,
): RiskClassification {
  const { systemName, purpose, functionCategories } = system;
  const { industry } = context;
  const cats = functionCategories;

  // === RULE 1: PROHIBITED (Art. 5) ===

  if (
    hasCategory(cats, "Monitoring/surveillance") &&
    ["GOVERNMENT", "LAW_ENFORCEMENT"].includes(industry) &&
    purposeMatches(purpose, SOCIAL_SCORING_KEYWORDS)
  ) {
    return {
      systemName, tier: "PROHIBITED", tierLevel: 1,
      reasoning: "AI system used for social scoring by a government/law enforcement entity is prohibited under the EU AI Act.",
      article: "Art. 5(1)(c)",
    };
  }

  if (
    hasCategory(cats, "Detection/recognition") &&
    industry === "LAW_ENFORCEMENT" &&
    purposeMatches(purpose, REALTIME_BIOMETRIC_KEYWORDS)
  ) {
    return {
      systemName, tier: "PROHIBITED", tierLevel: 1,
      reasoning: "Real-time biometric identification in publicly accessible spaces for law enforcement is prohibited.",
      article: "Art. 5(1)(d)",
    };
  }

  if (
    hasCategory(cats, "Autonomous decision-making") &&
    purposeMatches(purpose, MANIPULATION_KEYWORDS)
  ) {
    return {
      systemName, tier: "PROHIBITED", tierLevel: 1,
      reasoning: "AI system deploying manipulative or deceptive techniques that exploit vulnerabilities is prohibited.",
      article: "Art. 5(1)(a)",
    };
  }

  if (
    hasCategory(cats, "Detection/recognition") &&
    ["EDUCATION", "HR"].includes(industry) &&
    purposeMatches(purpose, EMOTION_RECOGNITION_KEYWORDS)
  ) {
    return {
      systemName, tier: "PROHIBITED", tierLevel: 1,
      reasoning: "Emotion recognition systems in workplace or educational settings are prohibited.",
      article: "Art. 5(1)(f)",
    };
  }

  // === RULE 2: HIGH-RISK (Art. 6, Annex III) ===

  // Domain 1: Biometric
  if (
    hasCategory(cats, "Detection/recognition") &&
    purposeMatches(purpose, BIOMETRIC_KEYWORDS)
  ) {
    return {
      systemName, tier: "HIGH_RISK", tierLevel: 2,
      reasoning: "AI system used for biometric identification or categorization of natural persons is classified as high-risk.",
      article: "Art. 6(2), Annex III", annexDomain: "1. Biometric identification",
      requirements: HIGH_RISK_REQUIREMENTS,
    };
  }

  // Domain 2: Critical Infrastructure
  if (
    industry === "CRITICAL_INFRASTRUCTURE" &&
    (hasCategory(cats, "Monitoring/surveillance") || hasCategory(cats, "Autonomous decision-making") || hasCategory(cats, "Process automation"))
  ) {
    return {
      systemName, tier: "HIGH_RISK", tierLevel: 2,
      reasoning: "AI system managing or monitoring critical infrastructure (transport, water, gas, electricity) is classified as high-risk.",
      article: "Art. 6(2), Annex III", annexDomain: "2. Critical infrastructure",
      requirements: HIGH_RISK_REQUIREMENTS,
    };
  }

  // Domain 3: Education
  if (
    industry === "EDUCATION" &&
    (hasCategory(cats, "Classification") || hasCategory(cats, "Prediction") || hasCategory(cats, "Autonomous decision-making")) &&
    purposeMatches(purpose, EDUCATION_KEYWORDS)
  ) {
    return {
      systemName, tier: "HIGH_RISK", tierLevel: 2,
      reasoning: "AI system used for educational assessment, scoring, or admission decisions is classified as high-risk.",
      article: "Art. 6(2), Annex III", annexDomain: "3. Education & vocational training",
      requirements: HIGH_RISK_REQUIREMENTS,
    };
  }

  // Domain 4: Employment
  if (
    industry === "HR" &&
    (hasCategory(cats, "Classification") || hasCategory(cats, "Prediction") || hasCategory(cats, "Decision support") || hasCategory(cats, "Autonomous decision-making")) &&
    purposeMatches(purpose, EMPLOYMENT_KEYWORDS)
  ) {
    return {
      systemName, tier: "HIGH_RISK", tierLevel: 2,
      reasoning: "AI system used for employment decisions (recruitment, promotion, termination) is classified as high-risk.",
      article: "Art. 6(2), Annex III", annexDomain: "4. Employment & worker management",
      requirements: HIGH_RISK_REQUIREMENTS,
    };
  }

  // Domain 5: Essential Services
  if (
    ["FINANCIAL_SERVICES", "INSURANCE"].includes(industry) &&
    (hasCategory(cats, "Prediction") || hasCategory(cats, "Classification") || hasCategory(cats, "Decision support") || hasCategory(cats, "Autonomous decision-making")) &&
    purposeMatches(purpose, CREDIT_KEYWORDS)
  ) {
    return {
      systemName, tier: "HIGH_RISK", tierLevel: 2,
      reasoning: "AI system used for creditworthiness assessment or access to essential services is classified as high-risk.",
      article: "Art. 6(2), Annex III", annexDomain: "5. Essential services",
      requirements: HIGH_RISK_REQUIREMENTS,
    };
  }

  // Domain 6: Law Enforcement
  if (
    industry === "LAW_ENFORCEMENT" &&
    (hasCategory(cats, "Prediction") || hasCategory(cats, "Classification") || hasCategory(cats, "Detection/recognition") || hasCategory(cats, "Decision support"))
  ) {
    return {
      systemName, tier: "HIGH_RISK", tierLevel: 2,
      reasoning: "AI system used in law enforcement for evidence evaluation, crime prediction, or profiling is classified as high-risk.",
      article: "Art. 6(2), Annex III", annexDomain: "6. Law enforcement",
      requirements: HIGH_RISK_REQUIREMENTS,
    };
  }

  // Domain 7: Migration
  if (purposeMatches(purpose, MIGRATION_KEYWORDS) && (hasCategory(cats, "Classification") || hasCategory(cats, "Detection/recognition") || hasCategory(cats, "Decision support"))) {
    return {
      systemName, tier: "HIGH_RISK", tierLevel: 2,
      reasoning: "AI system used in migration, asylum, or border control context is classified as high-risk.",
      article: "Art. 6(2), Annex III", annexDomain: "7. Migration & border control",
      requirements: HIGH_RISK_REQUIREMENTS,
    };
  }

  // Domain 8: Justice/Democracy
  if (purposeMatches(purpose, JUSTICE_KEYWORDS) && (hasCategory(cats, "Decision support") || hasCategory(cats, "Autonomous decision-making") || hasCategory(cats, "Prediction"))) {
    return {
      systemName, tier: "HIGH_RISK", tierLevel: 2,
      reasoning: "AI system used in administration of justice or democratic processes is classified as high-risk.",
      article: "Art. 6(2), Annex III", annexDomain: "8. Justice & democracy",
      requirements: HIGH_RISK_REQUIREMENTS,
    };
  }

  // Safety component in regulated product (Art. 6(1))
  if (
    ["HEALTHCARE", "MANUFACTURING"].includes(industry) &&
    hasCategory(cats, "Autonomous decision-making") &&
    purposeMatches(purpose, SAFETY_COMPONENT_KEYWORDS)
  ) {
    return {
      systemName, tier: "HIGH_RISK", tierLevel: 2,
      reasoning: "AI system used as a safety component in a regulated product (medical device, aviation, automotive) is classified as high-risk.",
      article: "Art. 6(1)", annexDomain: "Safety component in regulated product",
      requirements: HIGH_RISK_REQUIREMENTS,
    };
  }

  // === RULE 3: LIMITED RISK (Art. 52) ===

  if (hasCategory(cats, "Chatbot/virtual assistant")) {
    return {
      systemName, tier: "LIMITED_RISK", tierLevel: 3,
      reasoning: "Chatbot/virtual assistant systems must disclose to users that they are interacting with AI.",
      article: "Art. 52(1)",
    };
  }

  if (hasCategory(cats, "Content generation")) {
    return {
      systemName, tier: "LIMITED_RISK", tierLevel: 3,
      reasoning: "AI-generated content must be labeled as artificially created or manipulated.",
      article: "Art. 52(3)",
    };
  }

  if (hasCategory(cats, "Detection/recognition")) {
    return {
      systemName, tier: "LIMITED_RISK", tierLevel: 3,
      reasoning: "Detection/recognition system requires transparency obligations (emotion recognition or biometric categorization in non-high-risk context).",
      article: "Art. 52(2)",
    };
  }

  // === RULE 4: MINIMAL RISK (default) ===

  return {
    systemName, tier: "MINIMAL_RISK", tierLevel: 4,
    reasoning: "This AI system does not fall into prohibited, high-risk, or limited-risk categories. No specific EU AI Act obligations apply, though general EU law (GDPR, consumer protection) remains applicable.",
    article: "No specific AI Act obligation",
  };
}

export function classifyAISystems(
  systems: AISystemInput[],
  context: CompanyContext,
): ClassificationResult {
  const classified = systems.map((s) => classifySystem(s, context));

  return {
    systems: classified,
    summary: {
      total: classified.length,
      prohibited: classified.filter((c) => c.tier === "PROHIBITED").length,
      highRisk: classified.filter((c) => c.tier === "HIGH_RISK").length,
      limitedRisk: classified.filter((c) => c.tier === "LIMITED_RISK").length,
      minimalRisk: classified.filter((c) => c.tier === "MINIMAL_RISK").length,
    },
  };
}
