"use client";

import { useState } from "react";
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  GitBranch,
} from "lucide-react";
import { cn } from "@repo/ui/lib/utils";
import { Policy } from "@repo/database";

const STATUS_STYLES = {
  DRAFT:
    "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800",
  IN_REVIEW:
    "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800",
  APPROVED:
    "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800",
  PUBLISHED:
    "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-900/20 dark:text-teal-300 dark:border-teal-800",
};

export function PolicyVersionTimeline({
  policies,
  currentPolicyId,
  onSelectVersion,
}: {
  policies: Policy[];
  currentPolicyId: number | null;
  onSelectVersion: (version: number | null) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  if (!policies || policies.length === 0) return null;

  const sorted = [...policies].sort((a, b) => b.version - a.version);
  const current = sorted.find((p) => p.version === currentPolicyId);

  return (
    <div className="shrink-0 border-t border-gray-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950/60">
      {/* HEADER */}
      <button
        onClick={() => setExpanded((p) => !p)}
        className="w-full flex items-center gap-2 px-4 py-2 text-left hover:bg-gray-100/60 dark:hover:bg-zinc-800/40 transition-colors"
      >
        <GitBranch className="h-3.5 w-3.5 text-primary shrink-0" />

        <span className="text-xs text-gray-600 dark:text-gray-400 flex-1 truncate">
          {current
            ? `Current: v${current.version} • ${current.status.replace("_", " ")}`
            : "Version history"}
        </span>

        <span className="text-[10px] text-gray-400 shrink-0 mr-1">
          {policies.length} versions
        </span>

        {expanded ? (
          <ChevronDown className="h-3 w-3 text-gray-400 shrink-0" />
        ) : (
          <ChevronUp className="h-3 w-3 text-gray-400 shrink-0" />
        )}
      </button>

      {/* BODY */}
      {expanded && (
        <div className="px-4 pb-3 pt-2 max-h-56 overflow-y-auto space-y-2 border-t border-gray-200 dark:border-zinc-800">
          {sorted.map((policy, i) => {
            const isActive = policy.version === currentPolicyId;

            return (
              <button
                key={policy.version}
                onClick={() => onSelectVersion(policy.version)}
                className={cn(
                  "w-full text-left rounded-md px-2.5 py-2 transition-colors border",
                  isActive
                    ? "bg-white dark:bg-zinc-900 border-primary/30"
                    : "bg-transparent border-transparent hover:bg-gray-100/60 dark:hover:bg-zinc-800/40",
                )}
              >
                <div className="flex items-start gap-2">
                  {/* timeline dot */}
                  <div
                    className={cn(
                      "mt-1 h-2 w-2 rounded-full shrink-0",
                      isActive
                        ? "bg-primary animate-pulse"
                        : "bg-gray-300 dark:bg-zinc-600",
                    )}
                  />

                  <div className="flex-1 min-w-0">
                    {/* top row */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={cn(
                          "text-xs font-medium",
                          isActive
                            ? "text-gray-900 dark:text-gray-100"
                            : "text-gray-600 dark:text-gray-400",
                        )}
                      >
                        v{policy.version}
                      </span>

                      {/* status badge */}
                      <span
                        className={cn(
                          "text-[10px] px-2 py-0.5 rounded-full border",
                          STATUS_STYLES[policy.status],
                        )}
                      >
                        {policy.status.replace("_", " ")}
                      </span>

                      {/* active indicator */}
                      {isActive && (
                        <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                      )}
                    </div>

                    {/* change note */}
                    {policy.changeNote && (
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate mt-0.5">
                        {policy.changeNote}
                      </p>
                    )}

                    {/* date */}
                    <div className="flex items-center gap-1 mt-0.5 text-[10px] text-gray-400">
                      <Clock className="h-3 w-3" />
                      {policy.createdAt.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
