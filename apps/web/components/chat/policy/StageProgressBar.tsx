import { STAGE_LABELS, STAGE_ORDER } from "@/utils/constants";
import { cn } from "@repo/ui/lib/utils";
import { CheckCircle2, Loader2 } from "lucide-react";

export function StageProgressBar({
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