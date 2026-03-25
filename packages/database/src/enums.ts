export const Industry = {
  TECHNOLOGY: "TECHNOLOGY",
  HEALTHCARE: "HEALTHCARE",
  FINANCIAL_SERVICES: "FINANCIAL_SERVICES",
  INSURANCE: "INSURANCE",
  EDUCATION: "EDUCATION",
  LEGAL: "LEGAL",
  MANUFACTURING: "MANUFACTURING",
  RETAIL: "RETAIL",
  GOVERNMENT: "GOVERNMENT",
  CRITICAL_INFRASTRUCTURE: "CRITICAL_INFRASTRUCTURE",
  LAW_ENFORCEMENT: "LAW_ENFORCEMENT",
  HR: "HR",
  OTHER: "OTHER",
} as const;

export type Industry = (typeof Industry)[keyof typeof Industry];

export const EmployeeCount = {
  ONE_TO_49: "ONE_TO_49",
  FIFTY_TO_99: "FIFTY_TO_99",
  ONE_HUNDRED_TO_249: "ONE_HUNDRED_TO_249",
  TWO_HUNDRED_FIFTY_TO_499: "TWO_HUNDRED_FIFTY_TO_499",
  FIVE_HUNDRED_TO_999: "FIVE_HUNDRED_TO_999",
  ONE_THOUSAND_PLUS: "ONE_THOUSAND_PLUS",
} as const;

export type EmployeeCount =
  (typeof EmployeeCount)[keyof typeof EmployeeCount];

export const RevenueRange = {
  UNDER_2M: "UNDER_2M",
  TWO_TO_10M: "TWO_TO_10M",
  TEN_TO_50M: "TEN_TO_50M",
  FIFTY_TO_250M: "FIFTY_TO_250M",
  OVER_250M: "OVER_250M",
} as const;

export type RevenueRange = (typeof RevenueRange)[keyof typeof RevenueRange];

export const AIInteraction = {
  DIRECT_EU_CUSTOMERS: "DIRECT_EU_CUSTOMERS",
  AI_OUTPUT_REACHES_EU: "AI_OUTPUT_REACHES_EU",
  NO: "NO",
  NOT_SURE: "NOT_SURE",
} as const;

export type AIInteraction =
  (typeof AIInteraction)[keyof typeof AIInteraction];

export const GovernanceStructure = {
  DEDICATED_COMMITTEE: "DEDICATED_COMMITTEE",
  PART_OF_EXISTING: "PART_OF_EXISTING",
  NO_FORMAL_STRUCTURE: "NO_FORMAL_STRUCTURE",
  NO_GOVERNANCE: "NO_GOVERNANCE",
} as const;

export type GovernanceStructure =
  (typeof GovernanceStructure)[keyof typeof GovernanceStructure];

export const AIRole = {
  PROVIDER: "PROVIDER",
  DEPLOYER: "DEPLOYER",
  BOTH: "BOTH",
  NOT_SURE: "NOT_SURE",
} as const;

export type AIRole = (typeof AIRole)[keyof typeof AIRole];

export type { Company, Prisma, User } from "@prisma/client";
