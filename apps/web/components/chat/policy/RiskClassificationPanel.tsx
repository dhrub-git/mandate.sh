"use client";

import { useState } from "react";
import type { MandateClassificationResult as ClassificationResult } from "@repo/agents";

const TIER_STYLES = {
  PROHIBITED: {
    label: "Prohibited",
    bar: "bg-red-600",
    badge: "bg-red-50 text-red-700 border-red-200",
  },
  HIGH_RISK: {
    label: "High Risk",
    bar: "bg-orange-500",
    badge: "bg-orange-50 text-orange-800 border-orange-200",
  },
  LIMITED_RISK: {
    label: "Limited Risk",
    bar: "bg-amber-400",
    badge: "bg-amber-50 text-amber-800 border-amber-200",
  },
  MINIMAL_RISK: {
    label: "Minimal Risk",
    bar: "bg-emerald-500",
    badge: "bg-emerald-50 text-emerald-800 border-emerald-200",
  },
} as const;

type Tier = keyof typeof TIER_STYLES;

export default function RiskClassificationPanel({
  classifications,
}: {
  classifications: ClassificationResult;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const { summary, systems } = classifications;

  if (!systems.length) return null;

  return (
    <div className="mx-4 mt-4 mb-2 rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900 print:hidden">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            EU AI Act risk tiers
          </h3>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
            {summary.total} system{summary.total === 1 ? "" : "s"} classified
            after inventory
          </p>
        </div>
        <div className="flex flex-wrap justify-end gap-1">
          {summary.prohibited > 0 && (
            <span className="rounded border border-red-200 bg-red-50 px-1.5 py-0.5 text-[10px] font-semibold text-red-700">
              {summary.prohibited} prohibited
            </span>
          )}
          {summary.highRisk > 0 && (
            <span className="rounded border border-orange-200 bg-orange-50 px-1.5 py-0.5 text-[10px] font-semibold text-orange-800">
              {summary.highRisk} high
            </span>
          )}
        </div>
      </div>

      <div className="mb-3 flex h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-zinc-800">
        {(
          [
            ["PROHIBITED", summary.prohibited],
            ["HIGH_RISK", summary.highRisk],
            ["LIMITED_RISK", summary.limitedRisk],
            ["MINIMAL_RISK", summary.minimalRisk],
          ] as const
        ).map(([tier, count]) =>
          count > 0 ? (
            <div
              key={tier}
              className={`${TIER_STYLES[tier].bar} transition-all`}
              style={{ width: `${(count / summary.total) * 100}%` }}
              title={`${TIER_STYLES[tier].label}: ${count}`}
            />
          ) : null,
        )}
      </div>

      <ul className="space-y-1.5">
        {systems.map((system) => {
          const tier = system.tier as Tier;
          const style = TIER_STYLES[tier] ?? TIER_STYLES.MINIMAL_RISK;
          const open = expanded === system.systemName;
          return (
            <li key={system.systemName}>
              <button
                type="button"
                onClick={() =>
                  setExpanded(open ? null : system.systemName)
                }
                className="flex w-full items-center justify-between gap-2 rounded-lg border border-gray-100 px-2.5 py-2 text-left hover:bg-gray-50 dark:border-zinc-800 dark:hover:bg-zinc-800/60"
              >
                <span className="truncate text-xs font-medium text-gray-800 dark:text-gray-100">
                  {system.systemName}
                </span>
                <span
                  className={`shrink-0 rounded border px-1.5 py-0.5 text-[10px] font-medium ${style.badge}`}
                >
                  {style.label}
                </span>
              </button>
              {open && (
                <div className="mt-1 space-y-1 rounded-lg bg-slate-50 px-3 py-2 text-[11px] text-gray-600 dark:bg-zinc-800/50 dark:text-gray-300">
                  <p>
                    <span className="font-medium text-gray-500">Article: </span>
                    {system.article}
                  </p>
                  <p className="leading-relaxed">{system.reasoning}</p>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
