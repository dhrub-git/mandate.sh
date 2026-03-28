import { CompanyProfile } from "@/utils/types";
import { PolicySectionCard } from "./PolicySectionCard";
import { FileText } from "lucide-react";
import { parseBackendDrafts } from "@/utils/parseBackendDrafts";
import { POLICY_SECTIONS } from "@/utils/constants";
import { getSectionState } from "@/utils/getSectionState";
import { MarkdownResponse } from "../messages/MessageMarkdown";

export function DraftPolicy({
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
      <div className="flex-1 overflow-y-auto p-4 lg:p-8 bg-slate-50 dark:bg-zinc-950 print:block print:p-0 print:bg-white print:overflow-visible">
        {" "}
        {/* Document "Page" Wrapper */} 
        <div
          id="final-policy-document"
          className="max-w-4xl mx-auto bg-white dark:bg-zinc-900 rounded-xl p-8 lg:p-12 border border-gray-200 dark:border-zinc-800 shadow-lg relative print:max-w-none print:border-none print:shadow-none print:p-0 print:m-0"
        >
          {/* Decorative Top Accent */}
          <div className="absolute top-0 left-0 w-full h-1.5 bg-linear-to-r from-emerald-500 to-blue-500 rounded-t-xl print:hidden" />

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
            <MarkdownResponse>
              {finalPolicy}
            </MarkdownResponse>
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
