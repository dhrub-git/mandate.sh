import { CompanyProfile, PolicySectionDef, SectionState } from "@/utils/types";
import { cn } from "@repo/ui/lib/utils";
import { Skeleton } from "@repo/ui/skeleton";
import ReactMarkdown from "react-markdown";
import { CheckCircle2, FileText, Loader2 } from "lucide-react";

export function PolicySectionCard({
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
