// import fs from "fs";
// import path from "path";
// import { aiGovernancePolicySpec } from "./policySpec";
// // In CommonJS (default TypeScript), __dirname already exists



// // const basePath = new URL("../prompts/", import.meta.url);
// const basePath = path.join(__dirname, "../prompts/");

// export const STAGE2_SYSTEM_PROMPT = fs.readFileSync(
//   path.join(basePath, "STAGE2_TRANSITION_PROMPT.md"),
//   "utf-8"
// );

// export const STAGE3_SYSTEM_PROMPT = fs.readFileSync(
//   path.join(basePath, "STAGE3_TRANSITION_PROMPT.md"),
//   "utf-8"
// );

// export const STAGE4_SYSTEM_PROMPT = fs.readFileSync(
//   path.join(basePath, "STAGE4_TRANSITION_PROMPT.md"),
//   "utf-8"
// );
// export function buildPolicyGeneratorPrompt(
//   onboardingData: any,
// ) {
//   return `
// You are generating an AI Governance Policy for ${onboardingData?.Q1} 
// (${onboardingData?.Q3} industry, ${onboardingData?.Q4} employees).

// COMPANY CONTEXT:
// - Role: {companyRole}
// - Operating in: ${onboardingData?.Q1}
// - EU AI Act applicable: {euAiActApplicable}
// - Existing certifications: ${onboardingData?.Q8}
// - Current governance: ${onboardingData?.Q9}
// - AI systems risk summary: {riskSummary}

// REGULATORY REQUIREMENTS (do not modify these citations):
// {regulatoryText}

// Generate sections:
// ${JSON.stringify(aiGovernancePolicySpec.sections["4. Governance Structure"], null, 2)},
// ${JSON.stringify(aiGovernancePolicySpec.sections["5. Roles & Responsibilities"], null, 2)},
// ${JSON.stringify(aiGovernancePolicySpec.sections["6. Risk Appetite Statement"], null, 2)}

// Use the regulatory citations verbatim.
// Write for a compliance practitioner, not a lawyer.
// Be specific and actionable.
// Reference specific systems from the inventory by name where relevant.
// `;
// }

import fs from "fs";
import path from "path";
import { aiGovernancePolicySpec } from "./policySpec";
// Helper function to resolve prompt file paths
function getPromptPath(filename: string): string {
  // In Next.js, prompts are in public/prompts directory
  // process.cwd() gives the app root directory
  const publicPath = path.join(process.cwd(), "public", "prompts", filename);
  
  // Check if running in Next.js context (web app)
  if (fs.existsSync(publicPath)) {
    return publicPath;
  }
  
  // Fallback for running agents package standalone (tests, scripts)
  const localPath = path.join(__dirname, "../prompts", filename);
  if (fs.existsSync(localPath)) {
    return localPath;
  }
  
  // Monorepo fallback - go up to root and find packages/agents
  const monorepoPath = path.join(
    process.cwd(),
    "packages",
    "agents",
    "src",
    "mandate",
    "prompts",
    filename
  );
  if (fs.existsSync(monorepoPath)) {
    return monorepoPath;
  }
  
  throw new Error(`Cannot find prompt file: ${filename}. Searched:\n- ${publicPath}\n- ${localPath}\n- ${monorepoPath}`);
}
// Lazy load prompts to avoid errors during module initialization
let _stage2Prompt: string | null = null;
let _stage3Prompt: string | null = null;
let _stage4Prompt: string | null = null;
export function getSTAGE2_SYSTEM_PROMPT(): string {
  if (!_stage2Prompt) {
    _stage2Prompt = fs.readFileSync(
      getPromptPath("STAGE2_TRANSITION_PROMPT.md"),
      "utf-8"
    );
  }
  return _stage2Prompt;
}
export function getSTAGE3_SYSTEM_PROMPT(): string {
  if (!_stage3Prompt) {
    _stage3Prompt = fs.readFileSync(
      getPromptPath("STAGE3_TRANSITION_PROMPT.md"),
      "utf-8"
    );
  }
  return _stage3Prompt;
}
export function getSTAGE4_SYSTEM_PROMPT(): string {
  if (!_stage4Prompt) {
    _stage4Prompt = fs.readFileSync(
      getPromptPath("STAGE4_TRANSITION_PROMPT.md"),
      "utf-8"
    );
  }
  return _stage4Prompt;
}
// For backward compatibility
export const STAGE2_SYSTEM_PROMPT = getSTAGE2_SYSTEM_PROMPT();
export const STAGE3_SYSTEM_PROMPT = getSTAGE3_SYSTEM_PROMPT();
export const STAGE4_SYSTEM_PROMPT = getSTAGE4_SYSTEM_PROMPT();
export function buildPolicyGeneratorPrompt(onboardingData: any) {
  return `
You are generating an AI Governance Policy for ${onboardingData?.Q1} 
(${onboardingData?.Q3} industry, ${onboardingData?.Q4} employees).
COMPANY CONTEXT:
- Role: {companyRole}
- Operating in: ${onboardingData?.Q1}
- EU AI Act applicable: {euAiActApplicable}
- Existing certifications: ${onboardingData?.Q8}
- Current governance: ${onboardingData?.Q9}
- AI systems risk summary: {riskSummary}
REGULATORY REQUIREMENTS (do not modify these citations):
{regulatoryText}
Generate sections:
${JSON.stringify(aiGovernancePolicySpec.sections["4. Governance Structure"], null, 2)},
${JSON.stringify(aiGovernancePolicySpec.sections["5. Roles & Responsibilities"], null, 2)},
${JSON.stringify(aiGovernancePolicySpec.sections["6. Risk Appetite Statement"], null, 2)}
Use the regulatory citations verbatim.
Write for a compliance practitioner, not a lawyer.
Be specific and actionable.
Reference specific systems from the inventory by name where relevant.
CRITICAL INSTRUCTIONS:
- OUTPUT STRICTLY IN STANDARD MARKDOWN FORMAT ONLY.
- DO NOT OUTPUT A JSON OBJECT. DO NOT USE \`\`\`json.
`;
}