"use client";
import { useState, useEffect, useRef } from "react";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Skeleton } from "@repo/ui/skeleton";
import {
  Bot,
  User,
  Info,
  Send,
  CheckCircle2,
  Loader2,
  Search,
  Cpu,
  Zap,
  ChevronDown,
  ChevronUp,
  FileText,
  Download,
  Copy,
} from "lucide-react";
import { cn } from "@repo/ui/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import RiskPyramid from "./RiskPyramid";

// ─── Types ────────────────────────────────────────────────────────────────────
type WorkflowStatus = "interrupt" | "completed" | "running" | "error";
type Message = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
};
type LiveEvent =
  | { type: "node_start"; node: string; label: string; timestamp: number }
  | { type: "node_complete"; node: string; label: string }
  | { type: "tool_start"; tool: string; query?: string; timestamp: number }
  | { type: "tool_complete"; tool: string; timestamp: number }
  | { type: "token"; text: string };

export type CompanyProfile = {
  name: string;
  industry: string;
  size: string;
  countries: string;
};

type ChatInterfaceProps = {
  threadId: string;
  initialStatus: WorkflowStatus;
  initialQuestion?: string;
  initialPolicies?: string;
  errorMessage?: string;
  companyProfile?: CompanyProfile;
  initialMessages?: Message[];
  initialDrafts?: Record<string, string>;
  initialStagesComplete?: string[];
  initialActiveStage?: string | null;
  initialRiskClassifications?: any;
};

// ─── Stage order ──────────────────────────────────────────────────────────────
const STAGE_ORDER = ["stage_2", "stage_3", "stage_4", "policy_generator"];

const STAGE_LABELS: Record<string, string> = {
  stage_2: "AI Inventory",
  stage_3: "Governance Essentials",
  stage_4: "Risk & Regulations",
  policy_generator: "Policy Generation",
};

// ─── Policy section definitions ───────────────────────────────────────────────
type SectionState =
  | "shimmer"
  | "gathering"
  | "drafted"
  | "ai_drafted"
  | "final";

type PolicySectionDef = {
  id: string;
  title: string;
  gatherStage: string;
  draftAfterStage: string;
  draftedContent: (profile: CompanyProfile | undefined) => string;
};

const POLICY_SECTIONS: PolicySectionDef[] = [
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

function getSectionState(
  section: PolicySectionDef,
  activeStage: string | null,
  stagesComplete: Set<string>,
  finalPolicy: string | undefined,
): SectionState {
  if (finalPolicy) return "final";
  if (stagesComplete.has(section.draftAfterStage)) return "drafted";
  if (activeStage === section.gatherStage) return "gathering";

  const gatherIdx = STAGE_ORDER.indexOf(section.gatherStage);
  const activeIdx = activeStage ? STAGE_ORDER.indexOf(activeStage) : -1;
  const maxCompleteIdx = Math.max(
    -1,
    ...STAGE_ORDER.map((s, i) => (stagesComplete.has(s) ? i : -1)),
  );
  if (maxCompleteIdx >= gatherIdx || activeIdx > gatherIdx) return "drafted";
  return "shimmer";
}

// ─── Backend Markdown Parser ──────────────────────────────────────────────────
// This function parses the raw combined markdown from the backend into
const parseBackendDrafts = (drafts: Record<string, string>) => {
  const parsed: Record<string, string> = {};
  const fullText = Object.values(drafts)
    .filter(Boolean)
    .join("\n\n")
    .replace(/```markdown/gi, "")
    .replace(/```/g, "");

  const extract = (key: string, regex: RegExp) => {
    const match = fullText.match(regex);
    if (match && match[1]) parsed[key] = match[1].trim();
  };

  // Matches "## 1. Purpose & Scope", or "## Purpose & Scope"
  extract("purpose", /##\s*(?:\d+\.\s*)?Purpose.*?Scope([\s\S]*?)(?=##|$)/i);
  // Matches "## 2. AI System Inventory" or "## 3. Inventory Summary"
  extract(
    "inventory",
    /##\s*(?:\d+\.\s*)?(?:AI\s*System\s*)?Inventory([\s\S]*?)(?=##|$)/i,
  );
  // Matches "## 4. Governance Structure"
  extract(
    "governance",
    /##\s*(?:\d+\.\s*)?Governance.*?Structure([\s\S]*?)(?=##|$)/i,
  );
  // Matches "## 5. Roles & Responsibilities"
  extract(
    "roles",
    /##\s*(?:\d+\.\s*)?Roles.*?Responsibilities([\s\S]*?)(?=##|$)/i,
  );
  // Matches "## 2. Applicable Regulations"
  extract(
    "regulations",
    /##\s*(?:\d+\.\s*)?Applicable.*?Regulations([\s\S]*?)(?=##|$)/i,
  );
  // Matches "## 6. Risk Appetite Statement"
  extract("risk", /##\s*(?:\d+\.\s*)?Risk.*?Appetite([\s\S]*?)(?=##|$)/i);

  return parsed;
};

// ─── Question Block Parser ────────────────────────────────────────────────────
// Returns an array of QuestionBlock, one per detected Q-number section.
// function parseQuestionBlocks(content: string): QuestionBlock[] {
//   const blocks: QuestionBlock[] = [];
//   // Split the content into lines for processing
//   const lines = content.split("\n");
//   let currentQuestion: { number: string; label: string } | null = null;
//   let collectingOptions = false;
//   let currentOptions: string[] = [];
//   const flushBlock = () => {
//     if (currentQuestion && currentOptions.length > 0) {
//       blocks.push({
//         questionNumber: currentQuestion.number,
//         questionLabel: currentQuestion.label,
//         options: currentOptions,
//       });
//     }
//     currentQuestion = null;
//     collectingOptions = false;
//     currentOptions = [];
//   };
//   // Patterns to skip (not actual options)
//   const skipPatterns = [
//     /^one note/i,
//     /^note:/i,
//     /^before you answer/i,
//     /^based on that/i,
//     /^options answered/i,
//     /^i need to confirm/i,
//     /^i found/i,
//   ];
//   const isSkipLine = (text: string): boolean => {
//     return skipPatterns.some((pattern) => pattern.test(text));
//   };
//   for (let i = 0; i < lines.length; i++) {
//     const line = lines[i];
//     const trimmed = line!.trim();
//     // Detect a question heading: 
//     // Supports: ### Q26. ..., **Q26.** ..., Q26. ... (plain)
//     // Updated regex to match plain Q26. format without any prefix
//     const qHeadingMatch = trimmed.match(
//       /^(?:#{1,4}\s+)?(?:\*\*)?(?:Q(\d+))\.?\s+(.+?)(?:\?\s*)?(?:\*\*)?$/
//     );
    
//     if (qHeadingMatch && qHeadingMatch[1]) {
//       // Flush previous block before starting a new one
//       flushBlock();
//       const num = `Q${qHeadingMatch[1]}`;
//       const rest = qHeadingMatch[2]!.replace(/\?$/, '').trim();
//       currentQuestion = {
//         number: num,
//         label: `${num}. ${rest}?`,
//       };
//       collectingOptions = false;
//       continue;
//     }
//     // Detect **Options:** marker (various formats including plain "Options:")
//     if (/^(?:\*{0,2})Options:?(?:\*{0,2})\s*$/i.test(trimmed)) {
//       if (currentQuestion) {
//         collectingOptions = true;
//         currentOptions = [];
//       }
//       continue;
//     }
//     // If we're collecting options
//     if (collectingOptions) {
//       // Stop if we hit a new heading
//       if (trimmed.startsWith("#") || /^\*\*[^*]+\*\*$/.test(trimmed)) {
//         collectingOptions = false;
//         continue;
//       }
//       // Stop if we hit a new question (Q followed by number)
//       if (/^(?:Q\d+)\./i.test(trimmed)) {
//         // Don't continue - let the next iteration handle this as a new question
//         collectingOptions = false;
//         // Decrement i so the next iteration processes this line as a question
//         i--;
//         continue;
//       }
//       // Empty line - keep collecting (options might have gaps)
//       if (trimmed === "") {
//         continue;
//       }
//       // Skip lines that look like notes/explanations, not options
//       if (isSkipLine(trimmed)) {
//         // Don't stop collecting, just skip this line
//         continue;
//       }
//       // Try to match bullet-prefixed options first: "- Option" or "* Option" or "• Option"
//       const bulletMatch = trimmed.match(/^[-*•]\s*(.+)$/);
//       if (bulletMatch) {
//         const optionText = bulletMatch[1]!.trim();
//         if (optionText && !isSkipLine(optionText)) {
//           currentOptions.push(optionText);
//         }
//         continue;
//       }
//       // Accept non-bullet lines as options if they look like valid options
//       // Valid options typically: start with Yes/No, or are short phrases, or contain "—"
//       const looksLikeOption =
//         /^(?:Yes|No|N\/A|Not sure|Don't|Some|All|Retained|System)/i.test(trimmed) ||
//         trimmed.includes("—") ||
//         trimmed.includes(" - ") ||
//         (trimmed.length < 100 && !trimmed.includes(". ") && !trimmed.endsWith(":"));
//       if (looksLikeOption) {
//         currentOptions.push(trimmed);
//         continue;
//       }
//       // If we get here with a long line or sentence, stop collecting
//       // This helps avoid capturing explanatory text as options
//       if (trimmed.length > 80 || trimmed.includes(". ")) {
//         collectingOptions = false;
//       }
//     }
//   }
//   // Flush the last block
//   flushBlock();
//   return blocks;
// }

// ─── PolicySectionCard ────────────────────────────────────────────────────────
function PolicySectionCard({
  section,
  state,
  companyProfile,
  aiDraftContent,
}: {
  section: PolicySectionDef;
  state: SectionState;
  companyProfile: CompanyProfile | undefined;
  aiDraftContent?: string;
}) {
  if (state === "shimmer") {
    return (
      <div className="rounded-lg border border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 opacity-50">
        <div className="flex items-center gap-2 mb-3">
          <FileText className="h-3.5 w-3.5 text-gray-300 dark:text-zinc-600 shrink-0" />
          <p className="text-xs font-semibold text-gray-300 dark:text-zinc-600">
            {section.title}
          </p>
        </div>
        <div className="space-y-2">
          <Skeleton className="h-2.5 w-full rounded bg-gray-100 dark:bg-zinc-800" />
          <Skeleton className="h-2.5 w-4/5 rounded bg-gray-100 dark:bg-zinc-800" />
          <Skeleton className="h-2.5 w-3/5 rounded bg-gray-100 dark:bg-zinc-800" />
        </div>
      </div>
    );
  }

  if (state === "gathering") {
    return (
      <div className="rounded-lg border border-amber-200 dark:border-amber-900/50 bg-amber-50/60 dark:bg-amber-950/20 p-4">
        <div className="flex items-center gap-2 mb-2">
          <Loader2 className="h-3.5 w-3.5 text-amber-500 animate-spin shrink-0" />
          <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">
            {section.title}
          </p>
        </div>
        <p className="text-xs text-amber-600/70 dark:text-amber-500/70 italic">
          Gathering data for this section...
        </p>
      </div>
    );
  }

  if (state === "drafted" || state === "ai_drafted") {
    const isRealAI = !!aiDraftContent;
    const content = aiDraftContent || section.draftedContent(companyProfile);

    return (
      <div className="rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-4 transition-all duration-500 animate-in fade-in">
        <div className="flex items-center gap-2 mb-3 border-b border-gray-100 dark:border-zinc-800/60 pb-2">
          <CheckCircle2
            className={cn(
              "h-3.5 w-3.5 shrink-0",
              isRealAI ? "text-blue-500" : "text-emerald-500",
            )}
          />
          <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex-1">
            {section.title}
          </p>
          <span
            className={cn(
              "text-[10px] font-medium px-1.5 py-0.5 rounded-full border shrink-0",
              isRealAI
                ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border-blue-100 dark:border-blue-900/50"
                : "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-100 dark:border-emerald-900/50",
            )}
          >
            {isRealAI ? "AI Generated" : "Draft Placeholder"}
          </span>
        </div>
        <div className="prose prose-xs max-w-none text-xs text-gray-600 dark:text-gray-400 leading-relaxed [&>p]:mb-0 [&>p:not(:last-child)]:mb-2 [&>ul]:mt-1 [&>ul]:mb-2 [&>strong]:text-gray-700 dark:[&>strong]:text-gray-300">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      </div>
    );
  }

  return null;
}

// ─── JSON to Markdown Converter ───────────────────────────────────────────────
// Detects if the AI output JSON and magically converts it into styled Markdown
// function formatFinalPolicy(rawPolicy: string | undefined): string | undefined {
//   if (!rawPolicy) return undefined;
  
//   const firstBrace = rawPolicy.indexOf('{');
//   const lastBrace = rawPolicy.lastIndexOf('}');
  
//   // If no JSON block found, it's already markdown, return as is
//   if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
//     return rawPolicy;
//   }

//   try {
//     const jsonStr = rawPolicy.slice(firstBrace, lastBrace + 1);
//     const data = JSON.parse(jsonStr);
    
//     // 1. Clean up the text BEFORE the JSON (Remove the rogue ```json)
//     let beforeText = rawPolicy.slice(0, firstBrace).trim();
//     beforeText = beforeText.replace(/```json\s*$/i, '').replace(/```\s*$/, '').trim();
    
//     let md = beforeText ? beforeText + "\n\n" : "";
    
//     const convertToMd = (obj: any, depth: number = 2) => {
//       let output = "";
//       for (const [key, val] of Object.entries(obj)) {
//         if (["policy_name", "company_name", "version", "status"].includes(key)) continue;
        
//         // Convert "governance_structure" -> "Governance Structure"
//         const heading = key.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
        
//         if (typeof val === "string") {
//            output += `${"#".repeat(depth)} ${heading}\n${val}\n\n`;
//         } else if (Array.isArray(val)) {
//            output += `${"#".repeat(depth)} ${heading}\n`;
//            val.forEach(item => {
//              if (typeof item === "string") {
//                output += `- ${item}\n`;
//              } else if (typeof item === "object" && item !== null) {
//                // Handle arrays of objects (like inventory systems)
//                const primaryKey = Object.keys(item)[0];
//                if (primaryKey) {
//                  output += `- **${String(item[primaryKey])}**\n`;
//                  for (const [k, v] of Object.entries(item)) {
//                    if (k !== primaryKey && typeof v === "string") {
//                      output += `  - **${k.replace(/_/g, " ")}**: ${v}\n`;
//                    }
//                  }
//                }
//              }
//            });
//            output += "\n";
//         } else if (typeof val === "object" && val !== null) {
//            output += `${"#".repeat(depth)} ${heading}\n`;
//            output += convertToMd(val, depth + 1);
//         }
//       }
//       return output;
//     };
    
//     if (data.policy_name) md += `# ${data.policy_name}\n\n`;
//     md += convertToMd(data);
    
//     // 2. Clean up the text AFTER the JSON (Remove the closing ```)
//     let afterText = rawPolicy.slice(lastBrace + 1).trim();
//     afterText = afterText.replace(/^```/, '').trim();
    
//     if (afterText) md += `\n\n${afterText}`;
    
//     return md;
//   } catch (e) {
//     return rawPolicy; // If parsing fails, fallback to raw string
//   }
// }
// ─── DraftPolicy ──────────────────────────────────────────────────────────────
function DraftPolicy({
  companyProfile,
  activeStage,
  stagesComplete,
  finalPolicy,
  backendDrafts,
}: {
  companyProfile: CompanyProfile | undefined;
  activeStage: string | null;
  stagesComplete: Set<string>;
  questionCount: number;
  finalPolicy: string | undefined;
  backendDrafts: Record<string, string>;
}) {
  if (finalPolicy) {
     // RUN THE FORMATTER HERE
    // const formattedPolicy = formatFinalPolicy(finalPolicy); 
    return (
<div className="flex-1 overflow-y-auto p-4 lg:p-8 bg-slate-50 dark:bg-zinc-950 print:block print:p-0 print:bg-white print:overflow-visible">        {/* Document "Page" Wrapper */}
        <div
          id="final-policy-document"
          className="max-w-4xl mx-auto bg-white dark:bg-zinc-900 rounded-xl p-8 lg:p-12 border border-gray-200 dark:border-zinc-800 shadow-lg relative print:max-w-none print:border-none print:shadow-none print:p-0 print:m-0"
        >
          {/* Decorative Top Accent */}
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-t-xl print:hidden" />

          <div className="flex items-center gap-3 mb-8 border-b border-gray-100 dark:border-zinc-800 pb-6">
            <div className="h-12 w-12 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center shrink-0">
              <FileText className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Final AI Governance Policy
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Generated on {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="font-sans">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ node, ...props }) => (
                  <h1
                    className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 mt-10 mb-6 pb-2 border-b-2 border-gray-100 dark:border-zinc-800"
                    {...props}
                  />
                ),
                h2: ({ node, ...props }) => (
                  <h2
                    className="text-xl font-bold text-gray-800 dark:text-gray-200 mt-10 mb-4 tracking-tight"
                    {...props}
                  />
                ),
                h3: ({ node, ...props }) => (
                  <h3
                    className="text-lg font-semibold text-gray-800 dark:text-gray-300 mt-8 mb-3"
                    {...props}
                  />
                ),
                p: ({ node, ...props }) => (
                  <p
                    className="text-[15px] text-gray-600 dark:text-gray-400 leading-relaxed mb-5"
                    {...props}
                  />
                ),
                ul: ({ node, ...props }) => (
                  <ul
                    className="list-disc pl-6 mb-6 space-y-2 text-[15px] text-gray-600 dark:text-gray-400 marker:text-emerald-500"
                    {...props}
                  />
                ),
                ol: ({ node, ...props }) => (
                  <ol
                    className="list-decimal pl-6 mb-6 space-y-2 text-[15px] text-gray-600 dark:text-gray-400 marker:text-emerald-500 font-medium"
                    {...props}
                  />
                ),
                li: ({ node, ...props }) => (
                  <li className="pl-1 leading-relaxed" {...props} />
                ),
                strong: ({ node, ...props }) => (
                  <strong
                    className="font-semibold text-gray-900 dark:text-gray-200"
                    {...props}
                  />
                ),
                blockquote: ({ node, ...props }) => (
                  <blockquote
                    className="border-l-4 border-emerald-500/50 bg-emerald-50/50 dark:bg-emerald-500/10 pl-5 py-3 my-6 rounded-r-lg italic text-gray-700 dark:text-gray-300"
                    {...props}
                  />
                ),
                a: ({ node, ...props }) => (
                  <a
                    className="text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
                    {...props}
                  />
                ),
                table: ({ node, ...props }) => (
                  <div className="overflow-x-auto my-6 border border-gray-200 dark:border-zinc-700 rounded-lg">
                    <table
                      className="w-full text-left text-sm text-gray-600 dark:text-gray-400"
                      {...props}
                    />
                  </div>
                ),
                thead: ({ node, ...props }) => (
                  <thead
                    className="bg-gray-50 dark:bg-zinc-800 text-gray-900 dark:text-gray-200 font-semibold"
                    {...props}
                  />
                ),
                th: ({ node, ...props }) => (
                  <th
                    className="px-4 py-3 border-b border-gray-200 dark:border-zinc-700"
                    {...props}
                  />
                ),
                td: ({ node, ...props }) => (
                  <td
                    className="px-4 py-3 border-b border-gray-100 dark:border-zinc-800/50"
                    {...props}
                  />
                ),
              }}
            >
              {/* {formattedPolicy} */}
              {finalPolicy}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    );
  }

  // Parse the combined markdown strings into isolated sections
  const parsedDrafts = parseBackendDrafts(backendDrafts);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
      {POLICY_SECTIONS.map((section) => {
        let state = getSectionState(
          section,
          activeStage,
          stagesComplete,
          finalPolicy,
        );

        // If the section is drafted and we found real parsed AI content, upgrade the state
        const aiContent = parsedDrafts[section.id];
        if (aiContent && state === "drafted") {
          state = "ai_drafted";
        }

        return (
          <PolicySectionCard
            key={section.id}
            section={section}
            state={state}
            companyProfile={companyProfile}
            aiDraftContent={aiContent}
          />
        );
      })}
    </div>
  );
}

// ─── StageProgressBar ─────────────────────────────────────────────────────────
function StageProgressBar({
  activeStage,
  stagesComplete,
}: {
  activeStage: string | null;
  stagesComplete: Set<string>;
}) {
  return (
    <div className="flex items-center gap-1 px-4 py-2.5 border-b border-gray-100 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950/40 shrink-0 overflow-x-auto print:hidden">
      {STAGE_ORDER.map((stage, idx) => {
        const isComplete = stagesComplete.has(stage);
        const isActive = activeStage === stage;
        return (
          <div key={stage} className="flex items-center gap-1 shrink-0">
            {idx > 0 && (
              <div
                className={cn(
                  "w-3 h-px shrink-0",
                  isComplete || stagesComplete.has(STAGE_ORDER[idx - 1] ?? "")
                    ? "bg-emerald-400"
                    : "bg-gray-200 dark:bg-zinc-700",
                )}
              />
            )}
            <div
              className={cn(
                "flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium whitespace-nowrap",
                isComplete &&
                  "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50",
                isActive &&
                  !isComplete &&
                  "bg-primary/10 text-primary border border-primary/20",
                !isComplete &&
                  !isActive &&
                  "bg-gray-100 dark:bg-zinc-800 text-gray-400 dark:text-zinc-500 border border-gray-200 dark:border-zinc-700",
              )}
            >
              {isComplete ? (
                <CheckCircle2 className="h-2.5 w-2.5 shrink-0" />
              ) : isActive ? (
                <Loader2 className="h-2.5 w-2.5 animate-spin shrink-0" />
              ) : (
                <div className="h-2 w-2 rounded-full border border-current shrink-0" />
              )}
              {STAGE_LABELS[stage]}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── AgentActivityStrip ───────────────────────────────────────────────────────
function AgentActivityStrip({
  liveEvents,
  currentNode,
  streamingText,
  isStreaming,
}: {
  liveEvents: LiveEvent[];
  currentNode: string | null;
  streamingText: string;
  isStreaming: boolean;
}) {
  const [expanded, setExpanded] = useState(false);

  const relevantEvents = liveEvents.filter(
    (e) =>
      e.type === "node_start" ||
      e.type === "node_complete" ||
      e.type === "tool_start",
  );
  const lastEvent = relevantEvents[relevantEvents.length - 1];

  if (relevantEvents.length === 0 && !isStreaming) return null;

  const lastLabel =
    lastEvent?.type === "node_start" || lastEvent?.type === "node_complete"
      ? lastEvent.label
      : lastEvent?.type === "tool_start"
        ? `Searching: ${lastEvent.query?.slice(0, 40) ?? ""}`
        : null;

  return (
    <div className="shrink-0 border-t border-gray-100 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950/60">
      <button
        onClick={() => setExpanded((p) => !p)}
        className="w-full flex items-center gap-2 px-4 py-2 text-left hover:bg-gray-100/60 dark:hover:bg-zinc-800/40 transition-colors"
      >
        {isStreaming ? (
          <Loader2 className="h-3 w-3 text-primary animate-spin shrink-0" />
        ) : (
          <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />
        )}
        <span className="text-xs text-gray-500 dark:text-gray-400 flex-1 truncate">
          {isStreaming && currentNode
            ? `Working on ${currentNode.replace(/_/g, " ")}...`
            : lastLabel
              ? `Last: ${lastLabel}`
              : "Agent activity"}
        </span>
        <span className="text-[10px] text-gray-400 shrink-0 mr-1">
          {relevantEvents.length} events
        </span>
        {expanded ? (
          <ChevronDown className="h-3 w-3 text-gray-400 shrink-0" />
        ) : (
          <ChevronUp className="h-3 w-3 text-gray-400 shrink-0" />
        )}
      </button>

      {expanded && (
        <div className="px-4 pb-3 max-h-48 overflow-y-auto space-y-1.5 border-t border-gray-100 dark:border-zinc-800 pt-2">
          {relevantEvents.map((ev, i) => {
            if (ev.type === "node_start") {
              const isActive = currentNode === ev.node;
              return (
                <div key={i} className="flex items-start gap-2">
                  <div
                    className={cn(
                      "h-1.5 w-1.5 rounded-full mt-1 shrink-0",
                      isActive
                        ? "bg-primary animate-pulse"
                        : "bg-gray-300 dark:bg-zinc-600",
                    )}
                  />
                  <span
                    className={cn(
                      "text-xs",
                      isActive
                        ? "text-gray-700 dark:text-gray-300 font-medium"
                        : "text-gray-400 dark:text-gray-500",
                    )}
                  >
                    {ev.label}
                    {isActive && streamingText && (
                      <span className="ml-1 font-mono text-[10px] text-gray-400 dark:text-gray-500">
                        {" — "}
                        {streamingText.slice(-60)}
                        <span className="inline-block w-1 h-2.5 ml-0.5 bg-primary animate-pulse align-middle" />
                      </span>
                    )}
                  </span>
                </div>
              );
            }
            if (ev.type === "node_complete") {
              return (
                <div key={i} className="flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3 text-emerald-400 shrink-0" />
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {ev.label} complete
                  </span>
                </div>
              );
            }
            if (ev.type === "tool_start") {
              return (
                <div key={i} className="flex items-center gap-2 pl-3">
                  <Search className="h-3 w-3 text-blue-400 shrink-0" />
                  <span className="text-xs text-blue-500 dark:text-blue-400 truncate">
                    {ev.query ? `"${ev.query.slice(0, 60)}"` : "Web search"}
                  </span>
                </div>
              );
            }
            return null;
          })}
          {isStreaming && (
            <div className="flex items-center gap-2 pt-0.5">
              <Loader2 className="h-3 w-3 text-primary animate-spin shrink-0" />
              <span className="text-xs text-primary">Processing...</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// keep NodeIcon available for future use — eslint-disable avoids unused warning
function NodeIcon({ node, active }: { node: string; active: boolean }) {
  const cls = cn("h-4 w-4 shrink-0", active && "animate-pulse");
  if (node.startsWith("web_search")) return <Search className={cls} />;
  if (node === "policy_generator") return <Zap className={cls} />;
  return <Cpu className={cls} />;
}
void NodeIcon;

// ─── QuestionBlocksRenderer ───────────────────────────────────────────────────
// Renders clickable option buttons for multiple choice questions inside a
// single assistant message. Supports selecting one option per question block,
// then submitting all answers together in numbered format.
// function QuestionBlocksRenderer({
//   messageId,
//   blocks,
//   selectedOptions,
//   onSelect,
//   onSubmit,
//   disabled,
//   submitted,
// }: {
//   messageId: string;
//   // blocks: QuestionBlock[];
//   selectedOptions: Record<string, string>;
//   onSelect: (questionNumber: string, option: string) => void;
//   onSubmit: () => void;
//   disabled: boolean;
//   submitted: boolean;
// }) {
//   const allAnswered = blocks.every((b) => selectedOptions[b.questionNumber]);
//   const answerCount = Object.keys(selectedOptions).length;

//   if (submitted) {
//     return (
//       <div className="mt-3 pt-3 border-t border-gray-100 dark:border-zinc-700">
//         <p className="text-xs text-gray-400 dark:text-zinc-500 italic">
//           Options answered — {answerCount} of {blocks.length} selected
//         </p>
//       </div>
//     );
//   }

//   return (
//     <div className="mt-4 space-y-4">
//       {blocks.map((block) => {
//         const selected = selectedOptions[block.questionNumber];
//         return (
//           <div key={`${messageId}-${block.questionNumber}`}>
//             {/* Question label */}
//             <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
//               {block.questionLabel}
//             </p>
//             {/* Option chips */}
//             <div className="flex flex-wrap gap-2">
//               {block.options.map((option) => {
//                 const isSelected = selected === option;
//                 return (
//                   <button
//                     key={option}
//                     type="button"
//                     disabled={disabled}
//                     onClick={() =>
//                       !disabled && onSelect(block.questionNumber, option)
//                     }
//                     className={cn(
//                       "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200",
//                       "focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:ring-offset-1",
//                       isSelected
//                         ? "bg-emerald-500 border-emerald-500 text-white shadow-sm"
//                         : "bg-white dark:bg-zinc-800 border-gray-200 dark:border-zinc-600 text-gray-600 dark:text-gray-300 hover:border-emerald-400 dark:hover:border-emerald-500 hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20",
//                       disabled && "opacity-50 cursor-not-allowed",
//                     )}
//                   >
//                     {isSelected && (
//                       <span className="h-1.5 w-1.5 rounded-full bg-white inline-block" />
//                     )}
//                     {option}
//                   </button>
//                 );
//               })}
//             </div>
//           </div>
//         );
//       })}

//       {/* Submit button */}
//       <div className="pt-1">
//         <button
//           type="button"
//           disabled={disabled || !allAnswered}
//           onClick={onSubmit}
//           className={cn(
//             "inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200",
//             "focus:outline-none focus:ring-2 focus:ring-emerald-500/40",
//             allAnswered && !disabled
//               ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm hover:shadow-md active:scale-95"
//               : "bg-gray-100 dark:bg-zinc-800 text-gray-400 dark:text-zinc-500 cursor-not-allowed",
//           )}
//         >
//           <Send className="h-3 w-3" />
//           {allAnswered
//             ? `Submit ${blocks.length > 1 ? `${blocks.length} answers` : "answer"}`
//             : `Select ${blocks.length - answerCount} more answer${blocks.length - answerCount === 1 ? "" : "s"}`}
//         </button>
//       </div>
//     </div>
//   );
// }

// ─── ChatInterface ────────────────────────────────────────────────────────────
export function ChatInterface({
  threadId,
  initialStatus,
  initialQuestion,
  initialPolicies,
  errorMessage,
  companyProfile,
  initialMessages =[], // Defaults
  initialDrafts = {},
  initialStagesComplete =[],
  initialActiveStage = null,
  initialRiskClassifications,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<WorkflowStatus>(initialStatus);
  const [policies, setPolicies] = useState<string | undefined>(initialPolicies);
  const [error, setError] = useState<string | undefined>(errorMessage);
  const [copiedPolicies, setCopiedPolicies] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false); // <-- NEW STATE FOR PDF
  const [riskClassifications, setRiskClassifications] = useState<any | undefined>(initialRiskClassifications);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Live event state
  const [liveEvents, setLiveEvents] = useState<LiveEvent[]>([]);
  const [currentNode, setCurrentNode] = useState<string | null>(null);
  const [streamingText, setStreamingText] = useState<string>("");
  const [isStreaming, setIsStreaming] = useState(false);

   // 2. Initialize Stage Progress from DB History
  const [stagesComplete, setStagesComplete] = useState<Set<string>>(new Set(initialStagesComplete));
  const [activeStage, setActiveStage] = useState<string | null>(initialActiveStage);
  const [questionCount, setQuestionCount] = useState(initialQuestion ? 1 : 0);
   const [backendDrafts, setBackendDrafts] = useState<Record<string, string>>(initialDrafts);


  // ─── Options selection state: { [messageId]: { "Q26": "chosen option", ... } }
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, Record<string, string>>
  >({});
  // Track which message ids have been submitted via options panel
   const[submittedOptionMessages, setSubmittedOptionMessages] = useState<Set<string>>(() => {
    const set = new Set<string>();
    if (initialMessages.length > 0) {
      initialMessages.forEach((m, idx) => {
        // Mark all assistant messages as submitted EXCEPT the very last one (if we are interrupted)
        if (m.role === "assistant" && idx < initialMessages.length - 1) {
          set.add(m.id);
        }
      });
    }
    return set;
  });

  // 5. Update the initialQuestion effect to avoid duplicate messages on refresh
  useEffect(() => {
    if (initialQuestion) {
      // const questionBlocks = parseQuestionBlocks(initialQuestion);
      setMessages([
        {
          id: "init",
          role: "assistant",
          content: initialQuestion,
          // questionBlocks: questionBlocks.length > 0 ? questionBlocks : undefined,
          timestamp: new Date(),
        },
      ]);
    }
  }, [initialQuestion])



  useEffect(() => {
    if (initialStatus === "running") connectToStream("start", undefined);
    return () => {
      abortRef.current?.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function connectToStream(
    action: "start" | "resume",
    userInput: string | undefined,
  ) {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setIsStreaming(true);
    setStatus("running");
    setStreamingText("");
    setCurrentNode(null);
    if (action === "start") setLiveEvents([]);

    (async () => {
      try {
        const res = await fetch("/api/mandate/stream", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ threadId, action, input: userInput }),
          signal: controller.signal,
        });
        if (!res.ok || !res.body)
          throw new Error(`Stream request failed: ${res.status}`);

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const parts = buffer.split("\n\n");
          buffer = parts.pop() ?? "";
          for (const part of parts) {
            if (!part.trim()) continue;
            let eventName = "message";
            let dataLine = "";
            for (const line of part.split("\n")) {
              if (line.startsWith("event: ")) eventName = line.slice(7).trim();
              if (line.startsWith("data: ")) dataLine = line.slice(6).trim();
            }
            if (!dataLine) continue;
            try {
              handleSseEvent(eventName, JSON.parse(dataLine));
            } catch {
              continue;
            }
          }
        }
      } catch (err: any) {
        if (err?.name === "AbortError") return;
        setError(err.message ?? "Stream connection failed");
        setStatus("error");
      } finally {
        setIsStreaming(false);
        setCurrentNode(null);
        setActiveStage(null);
      }
    })();
  }

  function handleSseEvent(eventName: string, data: any) {
    // 🔥 RECURSIVE SEARCH: Extract state modifications no matter where the API hides them
    const extractDraftsDeep = (obj: any) => {
      if (!obj || typeof obj !== "object") return;
      for (const [key, val] of Object.entries(obj)) {
        if (key.startsWith("draft_policy_") && typeof val === "string") {
          setBackendDrafts((prev) => {
            if (prev[key] === val) return prev;
            return { ...prev, [key]: val };
          });
        } else if (typeof val === "object") {
          extractDraftsDeep(val);
        }
      }
    };
    extractDraftsDeep(data);

    // Extract risk classifications from SSE data
    if (data?.risk_classifications) {
      setRiskClassifications(data.risk_classifications);
    }

    switch (eventName) {
      case "node_start":
        setCurrentNode(data.node);
        setStreamingText("");
        setLiveEvents((prev) => [...prev, { type: "node_start", ...data }]);
        if (STAGE_ORDER.includes(data.node)) setActiveStage(data.node);
        break;

      case "node_complete":
        setCurrentNode((cur) => (cur === data.node ? null : cur));
        setLiveEvents((prev) => [...prev, { type: "node_complete", ...data }]);
        if (STAGE_ORDER.includes(data.node)) {
          setStagesComplete((prev) => new Set(prev).add(data.node));
        }
        break;

      case "token":
        setStreamingText((prev) => {
          const next = prev + data.text;
          return next.length > 300 ? next.slice(-300) : next;
        });
        break;

      case "tool_start":
        setLiveEvents((prev) => [...prev, { type: "tool_start", ...data }]);
        break;

      case "tool_complete":
        setLiveEvents((prev) => [...prev, { type: "tool_complete", ...data }]);
        break;

      case "status": {
        const newStatus: WorkflowStatus =
          data.status === "interrupt"
            ? "interrupt"
            : data.status === "completed"
              ? "completed"
              : data.status === "error"
                ? "error"
                : "running";
        setStatus(newStatus);

        if (newStatus === "interrupt" && data.question) {
          pushMessage({ role: "assistant", content: data.question });
          setQuestionCount((c) => c + 1);
        }
        if (newStatus === "completed" && data.policies) {
          setPolicies(data.policies);
          pushMessage({
            role: "system",
            content:
              "Your AI governance policies are ready. Review the full document in the panel on the left.",
          });
        }
        break;
      }

      case "error":
        setError(data.message ?? "An error occurred in the stream");
        setStatus("error");
        break;

      case "done":
        setIsStreaming(false);
        break;
    }
  }

  function pushMessage(msg: Omit<Message, "id" | "timestamp">) {
    // const questionBlocks =
    //   msg.role === "assistant" ? parseQuestionBlocks(msg.content) : undefined;
    setMessages((prev) => [
      ...prev,
      {
        ...msg,
        // questionBlocks:
        //   questionBlocks && questionBlocks.length > 0
        //     ? questionBlocks
        //     : undefined,
        id: `msg-${Date.now()}-${Math.random()}`,
        timestamp: new Date(),
      },
    ]);
  }

  const submitAnswer = (text: string) => {
    setInput("");
    setError(undefined);
    setIsSubmitting(true);
    pushMessage({ role: "user", content: text });
    connectToStream("resume", text);
    setIsSubmitting(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    const userText = input;
    submitAnswer(userText);
  };

  const handleCopyPolicies = () => {
    if (policies) {
      navigator.clipboard.writeText(policies);
      setCopiedPolicies(true);
      setTimeout(() => setCopiedPolicies(false), 2000);
    }
  };
  // ─── NEW: PDF DOWNLOAD HANDLER ──────────────────────────────────────────────
  const handleDownloadPdf = async () => {
    // setIsDownloading(true);
    // try {
    //   const element = document.getElementById("final-policy-document");
    //   if (!element) throw new Error("Document element not found");

    //   // Dynamically import to bypass Next.js SSR document/window errors
    //   const html2pdf = (await import("html2pdf.js")).default;

    //   const fileName = companyProfile?.name
    //     ? `${companyProfile.name.replace(/\s+/g, "_")}_AI_Policy.pdf`
    //     : "AI_Governance_Policy.pdf";

    //   const opt = {
    //     // Fix: Use 'as const' to tell TypeScript this is exactly a 4-number tuple
    //     margin:[15, 15, 15, 15] as [number, number, number, number],
    //     filename: fileName,
    //     image: { type: "jpeg" as const, quality: 0.98 },
    //     html2canvas: {
    //       scale: 2,
    //       useCORS: true,
    //       logging: false,
    //       windowWidth: 1024 // Forces desktop rendering of tailwind classes
    //     },
    //     jsPDF: { unit: "mm" as const, format: "a4" as const, orientation: "portrait" as const }
    //   };

    //   await html2pdf().set(opt).from(element).save();
    // } catch (err) {
    //   console.error("Error generating PDF:", err);
    // } finally {
    //   setIsDownloading(false);
    // }
    window.print();
  };

  const StatusBadge = () => (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
        status === "interrupt" && "bg-primary/10 text-primary",
        status === "running" && "bg-secondary text-secondary-foreground",
        status === "completed" && "bg-green-100 text-green-700",
        status === "error" && "bg-destructive/10 text-destructive",
      )}
    >
      <div
        className={cn(
          "w-2 h-2 rounded-full",
          status === "running" && "animate-pulse bg-secondary-foreground",
          status === "interrupt" && "bg-primary",
          status === "completed" && "bg-green-600",
          status === "error" && "bg-destructive",
        )}
      />
      {status === "interrupt"
        ? "Waiting for response"
        : status === "running"
          ? "Processing..."
          : status === "completed"
            ? "Completed"
            : "Error"}
    </div>
  );

  const leftPanelTitle = policies ? "AI Governance Policies" : "Policy Draft";
  const leftPanelSubtitle = policies
    ? "Your final AI governance document"
    : questionCount > 0
      ? `${questionCount} question${questionCount !== 1 ? "s" : ""} answered — draft updates as you go`
      : "Sections fill in as you answer questions";

  return (
<div className="flex h-screen w-full bg-slate-100 dark:bg-zinc-900 overflow-hidden print:block print:h-auto print:overflow-visible print:bg-white">      {/* ── LEFT PANEL ─────────────────────────────────────────────────── */}
      <div className="hidden lg:flex flex-col w-3/5 h-full z-10 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 shadow-lg  print:flex print:w-full print:border-none print:shadow-none print:h-auto print:overflow-visible print:bg-white">
        <div className="py-4 px-5 border-b border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shrink-0 print:hidden">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary shrink-0" />
                <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                  {leftPanelTitle}
                </h2>
                {/* ── NEW: BUTTON GROUP FOR COPY & DOWNLOAD ── */}
                {policies && (
                  <div className="flex items-center gap-2 ml-2">
                    <button
                      onClick={handleCopyPolicies}
                      className="text-[11px] font-medium flex items-center gap-1 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 border border-gray-200 dark:border-zinc-700 rounded px-2.5 py-1 transition-colors"
                    >
                      {copiedPolicies ? (
                        <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                      {copiedPolicies ? "Copied" : "Copy"}
                    </button>
                    <button
                      onClick={handleDownloadPdf}
                      disabled={isDownloading}
                      className="text-[11px] font-medium flex items-center gap-1 bg-gray-50 dark:bg-zinc-800 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 border border-gray-200 dark:border-zinc-700 rounded px-2.5 py-1 transition-colors disabled:opacity-50"
                    >
                      {isDownloading ? (
                        <Loader2 className="h-3 w-3 animate-spin text-primary" />
                      ) : (
                        <Download className="h-3 w-3" />
                      )}
                      {isDownloading ? "Saving..." : "PDF"}
                    </button>
                  </div>
                )}
              </div>
              <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5 truncate">
                {leftPanelSubtitle}
              </p>
            </div>
            {isStreaming && (
              <div className="flex items-center gap-1 text-xs text-primary shrink-0 ml-3">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Updating...</span>
              </div>
            )}
          </div>
        </div>

        {!policies && (
          <StageProgressBar
            activeStage={activeStage}
            stagesComplete={stagesComplete}
          />
        )}

        {riskClassifications && stagesComplete.has("stage_2") && !policies && (
          <RiskPyramid classifications={riskClassifications} />
        )}

        <DraftPolicy
          companyProfile={companyProfile}
          activeStage={activeStage}
          stagesComplete={stagesComplete}
          questionCount={questionCount}
          finalPolicy={policies}
          backendDrafts={backendDrafts}
        />

        {!policies && (
          <AgentActivityStrip
            liveEvents={liveEvents}
            currentNode={currentNode}
            streamingText={streamingText}
            isStreaming={isStreaming}
          />
        )}
      </div>

      {/* ── RIGHT PANEL ────────────────────────────────────────────────── */}
      <div className="flex flex-col h-full w-full lg:w-2/5 print:hidden">
        <div className="flex flex-col h-full w-full max-w-5xl mx-auto bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-zinc-800 overflow-hidden">
          <div className="bg-white dark:bg-zinc-900 border-b border-gray-100 dark:border-zinc-800 shadow-sm z-10 shrink-0">
            <div className="px-6 py-5 lg:px-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                    AI Governance Assistant
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {companyProfile?.name
                      ? `Building policy for ${companyProfile.name}`
                      : "Get personalised AI compliance guidance"}
                  </p>
                </div>
                <StatusBadge />
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto bg-slate-50/50 dark:bg-zinc-950/50">
            <div className="px-4 py-6 lg:px-8 lg:py-8 space-y-6">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "flex gap-4 animate-in fade-in-50 slide-in-from-bottom-3 duration-500",
                    msg.role === "user" && "flex-row-reverse",
                    msg.role === "system" && "justify-center",
                  )}
                >
                  {msg.role !== "system" && (
                    <div
                      className={cn(
                        "flex h-10 w-10 lg:h-12 lg:w-12 shrink-0 items-center justify-center rounded-full shadow-md",
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700",
                      )}
                    >
                      {msg.role === "user" ? (
                        <User className="h-5 w-5 lg:h-6 lg:w-6" />
                      ) : (
                        <Bot className="h-5 w-5 lg:h-6 lg:w-6 text-gray-700 dark:text-gray-300" />
                      )}
                    </div>
                  )}
                  <div
                    className={cn(
                      "max-w-[85%] lg:max-w-[75%] rounded-3xl px-5 py-4 shadow-sm transition-all hover:shadow-md",
                      msg.role === "user" &&
                        "bg-primary text-primary-foreground rounded-br-sm",
                      msg.role === "assistant" &&
                        "bg-white dark:bg-zinc-800 text-gray-800 dark:text-gray-200 rounded-bl-sm border border-gray-100 dark:border-zinc-700",
                      msg.role === "system" &&
                        "bg-blue-50/80 text-blue-900 dark:bg-blue-900/20 dark:text-blue-200 max-w-md mx-auto border border-blue-100 dark:border-blue-900",
                    )}
                  >
                    {msg.role === "system" && (
                      <div className="flex items-center gap-2 mb-2">
                        <Info className="h-4 w-4" />
                        <span className="text-xs font-bold uppercase tracking-wider">
                          System
                        </span>
                      </div>
                    )}
                    <div className="prose prose-sm max-w-none text-[15px] leading-relaxed dark:prose-invert [&>p]:mb-0 [&>p:not(:last-child)]:mb-4">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          h1: ({ node, ...props }) => (
                            <h1
                              className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 mt-10 mb-6 pb-2 border-b-2 border-gray-100 dark:border-zinc-800"
                              {...props}
                            />
                          ),
                          h2: ({ node, ...props }) => (
                            <h2
                              className="text-xl font-bold text-gray-800 dark:text-gray-200 mt-10 mb-4 tracking-tight"
                              {...props}
                            />
                          ),
                          h3: ({ node, ...props }) => (
                            <h3
                              className="text-lg font-semibold text-gray-800 dark:text-gray-300 mt-8 mb-3"
                              {...props}
                            />
                          ),
                          p: ({ node, ...props }) => (
                            <p
                              className="text-[15px] text-gray-600 dark:text-gray-400 leading-relaxed mb-5"
                              {...props}
                            />
                          ),
                          ul: ({ node, ...props }) => (
                            <ul
                              className="list-disc pl-6 mb-6 space-y-2 text-[15px] text-gray-600 dark:text-gray-400 marker:text-emerald-500"
                              {...props}
                            />
                          ),
                          ol: ({ node, ...props }) => (
                            <ol
                              className="list-decimal pl-6 mb-6 space-y-2 text-[15px] text-gray-600 dark:text-gray-400 marker:text-emerald-500 font-medium"
                              {...props}
                            />
                          ),
                          li: ({ node, ...props }) => (
                            <li className="pl-1 leading-relaxed" {...props} />
                          ),
                          strong: ({ node, ...props }) => (
                            <strong
                              className="font-semibold text-gray-900 dark:text-gray-200"
                              {...props}
                            />
                          ),
                          blockquote: ({ node, ...props }) => (
                            <blockquote
                              className="border-l-4 border-emerald-500/50 bg-emerald-50/50 dark:bg-emerald-500/10 pl-5 py-3 my-6 rounded-r-lg italic text-gray-700 dark:text-gray-300"
                              {...props}
                            />
                          ),
                          a: ({ node, ...props }) => (
                            <a
                              className="text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
                              {...props}
                            />
                          ),
                          table: ({ node, ...props }) => (
                            <div className="overflow-x-auto my-6 border border-gray-200 dark:border-zinc-700 rounded-lg">
                              <table
                                className="w-full text-left text-sm text-gray-600 dark:text-gray-400"
                                {...props}
                              />
                            </div>
                          ),
                          thead: ({ node, ...props }) => (
                            <thead
                              className="bg-gray-50 dark:bg-zinc-800 text-gray-900 dark:text-gray-200 font-semibold"
                              {...props}
                            />
                          ),
                          th: ({ node, ...props }) => (
                            <th
                              className="px-4 py-3 border-b border-gray-200 dark:border-zinc-700"
                              {...props}
                            />
                          ),
                          td: ({ node, ...props }) => (
                            <td
                              className="px-4 py-3 border-b border-gray-100 dark:border-zinc-800/50"
                              {...props}
                            />
                          ),
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    </div>

                    {/* Clickable option buttons for Stage 3/4 multiple-choice questions */}
                    {/* {msg.role === "assistant" &&
                      msg.questionBlocks &&
                      msg.questionBlocks.length > 0 && (
                        <QuestionBlocksRenderer
                          messageId={msg.id}
                          blocks={msg.questionBlocks}
                          selectedOptions={selectedOptions[msg.id] ?? {}}
                          submitted={submittedOptionMessages.has(msg.id)}
                          disabled={
                            status !== "interrupt" ||
                            isSubmitting ||
                            submittedOptionMessages.has(msg.id)
                          }
                          onSelect={(qNum, option) => {
                            setSelectedOptions((prev) => ({
                              ...prev,
                              [msg.id]: {
                                ...(prev[msg.id] ?? {}),
                                [qNum]: option,
                              },
                            }));
                          }}
                          onSubmit={() => {
                            const picks = selectedOptions[msg.id] ?? {};
                            const blocks = msg.questionBlocks!;
                            // Format: "Q26: Yes — received and following\nQ27: ..."
                            const formatted = blocks
                              .map(
                                (b) =>
                                  `${b.questionNumber}: ${picks[b.questionNumber] ?? ""}`,
                              )
                              .join("\n");
                            setSubmittedOptionMessages((prev) =>
                              new Set(prev).add(msg.id),
                            );
                            submitAnswer(formatted);
                          }}
                        />
                      )} */}
                    <span
                      className={cn(
                        "mt-2.5 block text-xs font-medium",
                        msg.role === "user"
                          ? "text-primary-foreground/70"
                          : "text-gray-400",
                      )}
                    >
                      {msg.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              ))}

              {isStreaming && (
                <div className="flex gap-4 animate-in fade-in-50">
                  <div className="flex h-10 w-10 lg:h-12 lg:w-12 shrink-0 items-center justify-center rounded-full bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 shadow-md">
                    <Bot className="h-5 w-5 lg:h-6 lg:w-6 text-gray-700 dark:text-gray-300 animate-pulse" />
                  </div>
                  <div className="space-y-3 flex-1 max-w-[75%] bg-white dark:bg-zinc-800 p-4 rounded-3xl rounded-bl-sm border border-gray-100 dark:border-zinc-700 shadow-sm">
                    <Skeleton className="h-4 w-3/4 rounded-full bg-gray-200 dark:bg-zinc-700" />
                    <Skeleton className="h-4 w-2/3 rounded-full bg-gray-200 dark:bg-zinc-700" />
                    <Skeleton className="h-4 w-1/2 rounded-full bg-gray-200 dark:bg-zinc-700" />
                  </div>
                </div>
              )}

              {error && (
                <div className="max-w-2xl mx-auto bg-red-50 dark:bg-red-950/30 border-l-4 border-red-500 text-red-900 dark:text-red-200 px-6 py-4 rounded-r-xl shadow-md">
                  <strong className="font-bold">Error: </strong>
                  <span>{error}</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {status === "interrupt" && (
            <div className="bg-white dark:bg-zinc-900 border-t border-gray-100 dark:border-zinc-800 px-4 py-4 lg:px-6 lg:py-6 z-10 shrink-0">
              <form
                onSubmit={handleSubmit}
                className="relative flex items-center gap-2 bg-slate-50 dark:bg-zinc-950 rounded-full border border-gray-200 dark:border-zinc-800 pl-6 pr-2 py-2 transition-all hover:shadow-md"
              >
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your response..."
                  disabled={isSubmitting}
                  className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-base h-auto placeholder:text-gray-400 py-2 dark:text-gray-100"
                />
                <Button
                  type="submit"
                  disabled={isSubmitting || !input.trim()}
                  variant="primary"
                  size="icon"
                  className="h-10 w-10 lg:h-12 lg:w-12 rounded-full shrink-0 hover:scale-105 active:scale-95 transition-transform duration-200 shadow-md"
                >
                  <Send className="h-5 w-5" />
                </Button>
              </form>
            </div>
          )}

          {status === "completed" && !policies && (
            <div className="border-t border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-6 py-6 z-10 shrink-0">
              <div className="max-w-2xl mx-auto bg-green-50 dark:bg-green-950/30 border-l-4 border-green-500 rounded-r-lg p-5 shadow-sm">
                <div className="flex items-center gap-4">
                  <CheckCircle2 className="h-6 w-6 text-green-500 shrink-0" />
                  <p className="text-sm font-medium text-green-900 dark:text-green-200">
                    Policy generation complete. Review the document on the left.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
