import fs from "fs";
import path from "path";
import { aiGovernancePolicySpec } from "./policySpec";
import type { ClassificationResult } from "../classifier/types";
import {
  parseOnboardingData,
  isEuAiActApplicable,
  formatRiskSummary,
  buildInventoryTableMarkdown,
  buildRegulatoryText,
  substitutePromptVars,
} from "./onboardingContext";

function getPromptPath(filename: string): string {
  const candidates = [
    // Next.js web app
    path.join(process.cwd(), "public", "prompts", filename),
    // Monorepo root → apps/web
    path.join(process.cwd(), "apps", "web", "public", "prompts", filename),
    // agents package relative to this file
    path.join(__dirname, "../prompts", filename),
    // agents package from monorepo root
    path.join(
      process.cwd(),
      "packages",
      "agents",
      "src",
      "mandate",
      "prompts",
      filename,
    ),
    // cwd is packages/agents
    path.join(process.cwd(), "src", "mandate", "prompts", filename),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate;
  }

  throw new Error(
    `Cannot find prompt file: ${filename}. Searched:\n${candidates.map((c) => `- ${c}`).join("\n")}`,
  );
}

let _stage2Prompt: string | null = null;
let _stage3Prompt: string | null = null;
let _stage4Prompt: string | null = null;

export function getSTAGE2_SYSTEM_PROMPT(): string {
  if (!_stage2Prompt) {
    _stage2Prompt = fs.readFileSync(
      getPromptPath("STAGE2_TRANSITION_PROMPT.md"),
      "utf-8",
    );
  }
  return _stage2Prompt;
}

export function getSTAGE3_SYSTEM_PROMPT(): string {
  if (!_stage3Prompt) {
    _stage3Prompt = fs.readFileSync(
      getPromptPath("STAGE3_TRANSITION_PROMPT.md"),
      "utf-8",
    );
  }
  return _stage3Prompt;
}

export function getSTAGE4_SYSTEM_PROMPT(): string {
  if (!_stage4Prompt) {
    _stage4Prompt = fs.readFileSync(
      getPromptPath("STAGE4_TRANSITION_PROMPT.md"),
      "utf-8",
    );
  }
  return _stage4Prompt;
}

export function buildStageSystemPrompt(
  stage: 2 | 3 | 4,
  onboardingData: unknown,
  extras: Record<string, string> = {},
): string {
  const template =
    stage === 2
      ? getSTAGE2_SYSTEM_PROMPT()
      : stage === 3
        ? getSTAGE3_SYSTEM_PROMPT()
        : getSTAGE4_SYSTEM_PROMPT();
  return substitutePromptVars(template, onboardingData, extras);
}


export function buildPolicyGeneratorPrompt(
  onboardingData: unknown,
  riskClassifications?: ClassificationResult | null,
): string {
  const data = parseOnboardingData(onboardingData);
  const euApplicable = isEuAiActApplicable(data);
  const riskSummary = formatRiskSummary(riskClassifications);
  const inventoryTable = buildInventoryTableMarkdown(riskClassifications);
  const regulatoryText = buildRegulatoryText(data);
  const today = new Date().toISOString().slice(0, 10);

  const sectionSpecs = Object.entries(aiGovernancePolicySpec.sections)
    .map(
      ([title, spec]) =>
        `### ${title}\nMethod: ${spec.method}\nInputs: ${spec.inputs.join(", ")}\nGuidance: ${spec.generation_details}`,
    )
    .join("\n\n");

  return `You are generating a complete AI Governance Policy for **${data.name}**
(${data.industry.replace(/_/g, " ")} industry, ${data.employeeCount.replace(/_/g, " ") || "unknown size"} employees).

## COMPANY CONTEXT
- Company: ${data.name}
- Address: ${data.address || "Not provided"}
- Industry: ${data.industry.replace(/_/g, " ")}
- AI role: ${data.aiRole.replace(/_/g, " ")}
- Operating regions: ${data.operatingRegions.join(", ") || "Not specified"}
- EU AI Act applicable: ${euApplicable ? "YES" : "NO / unclear — note residual extraterritorial risk"}
- Existing certifications: ${data.certifications.length > 0 ? data.certifications.join(", ") : "None listed"}
- Current governance: ${data.governance.replace(/_/g, " ")}

## AI SYSTEMS RISK SUMMARY
${riskSummary}

## PRE-BUILT AI SYSTEM INVENTORY TABLE (use VERBATIM for section 3)
${inventoryTable}

## REGULATORY REQUIREMENTS (cite accurately; do not invent article numbers)
${regulatoryText}

## SECTIONS TO GENERATE
Produce ALL of the following sections as \`##\` markdown headings (number them 1–8). Follow each section's method guidance:

${sectionSpecs}

## HARD RULES
- Output STRICTLY standard Markdown. No JSON. No \`\`\`json fences.
- For **3. AI System Inventory Summary**, reproduce the pre-built inventory table above verbatim (you may add a short intro paragraph).
- For **2. Applicable Regulations**, use the regulatory requirements list; add a simple markdown table of framework / why applicable / key obligations.
- For **8. Document Control**, include: organisation name, version 1.0, status Draft, effective date ${today}, approval authority (Board / AI Governance Committee), next annual review date.
- Write for a compliance practitioner, not a lawyer.
- Be specific and actionable. Reference inventoried systems by name where relevant.
- If a risk tier is PROHIBITED or HIGH_RISK, the Risk Appetite and Governance sections MUST call out required controls explicitly.
`;
}
