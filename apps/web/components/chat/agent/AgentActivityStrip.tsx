"use client";

import { LiveEvent } from "@/utils/types";
import { useState } from "react";
import { CheckCircle2, ChevronDown, ChevronUp, Loader2, Search } from "lucide-react";
import { cn } from "@repo/ui/lib/utils";


export function AgentActivityStrip({
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
