"use client";

import { useState } from "react";

type RiskTier = "PROHIBITED" | "HIGH_RISK" | "LIMITED_RISK" | "MINIMAL_RISK";

type RiskClassification = {
  systemName: string;
  tier: RiskTier;
  tierLevel: 1 | 2 | 3 | 4;
  reasoning: string;
  article: string;
  annexDomain?: string;
  requirements?: string[];
};

type ClassificationResult = {
  systems: RiskClassification[];
  summary: {
    total: number;
    prohibited: number;
    highRisk: number;
    limitedRisk: number;
    minimalRisk: number;
  };
};

const TIER_CONFIG = {
  PROHIBITED: {
    label: "Prohibited",
    article: "Art. 5",
    bg: "bg-red-600",
    bgLight: "bg-red-500/10",
    border: "border-red-500/30",
    text: "text-red-400",
    badge: "bg-red-500/20 text-red-300 border-red-500/30",
    width: "w-[45%]",
  },
  HIGH_RISK: {
    label: "High Risk",
    article: "Art. 6, Annex III",
    bg: "bg-orange-500",
    bgLight: "bg-orange-500/10",
    border: "border-orange-500/30",
    text: "text-orange-400",
    badge: "bg-orange-500/20 text-orange-300 border-orange-500/30",
    width: "w-[62%]",
  },
  LIMITED_RISK: {
    label: "Limited Risk",
    article: "Art. 52",
    bg: "bg-amber-400",
    bgLight: "bg-amber-400/10",
    border: "border-amber-400/30",
    text: "text-amber-400",
    badge: "bg-amber-400/20 text-amber-300 border-amber-400/30",
    width: "w-[79%]",
  },
  MINIMAL_RISK: {
    label: "Minimal Risk",
    article: "No specific obligation",
    bg: "bg-emerald-500",
    bgLight: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    text: "text-emerald-400",
    badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    width: "w-full",
  },
} as const;

const TIER_ORDER: RiskTier[] = ["PROHIBITED", "HIGH_RISK", "LIMITED_RISK", "MINIMAL_RISK"];

export default function RiskPyramid({ classifications }: { classifications: ClassificationResult }) {
  const [expandedSystem, setExpandedSystem] = useState<string | null>(null);

  const systemsByTier = TIER_ORDER.map((tier) => ({
    tier,
    config: TIER_CONFIG[tier],
    systems: classifications.systems.filter((s) => s.tier === tier),
  }));

  return (
    <div className="mb-6 rounded-xl border border-white/10 bg-[oklch(15%_0.02_250)] p-5 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-white font-bold text-lg">EU AI Act Risk Classification</h3>
          <p className="text-white/50 text-sm mt-0.5">
            {classifications.summary.total} system{classifications.summary.total !== 1 ? "s" : ""} classified
          </p>
        </div>
        <div className="flex gap-2">
          {classifications.summary.prohibited > 0 && (
            <span className="px-2 py-0.5 rounded text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/30">
              {classifications.summary.prohibited} Prohibited
            </span>
          )}
          {classifications.summary.highRisk > 0 && (
            <span className="px-2 py-0.5 rounded text-xs font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30">
              {classifications.summary.highRisk} High Risk
            </span>
          )}
        </div>
      </div>

      {/* Pyramid */}
      <div className="flex flex-col items-center gap-1.5 mb-5">
        {systemsByTier.map(({ tier, config, systems }, i) => (
          <div
            key={tier}
            className={`${config.width} transition-all duration-500`}
            style={{
              animationDelay: `${i * 150}ms`,
              clipPath: i === 0
                ? "polygon(15% 0%, 85% 0%, 92% 100%, 8% 100%)"
                : i === 3
                  ? "polygon(3% 0%, 97% 0%, 100% 100%, 0% 100%)"
                  : `polygon(${8 - i * 2}% 0%, ${92 + i * 2}% 0%, ${95 + i * 2}% 100%, ${5 - i * 2}% 100%)`,
            }}
          >
            <div className={`${config.bg} px-4 py-2.5 text-center relative`}>
              <div className="flex items-center justify-center gap-2">
                <span className="text-white font-bold text-sm">{config.label}</span>
                <span className="text-white/60 text-xs">({config.article})</span>
              </div>
              {systems.length > 0 && (
                <div className="flex flex-wrap justify-center gap-1 mt-1.5">
                  {systems.map((s) => (
                    <button
                      key={s.systemName}
                      onClick={() => setExpandedSystem(expandedSystem === s.systemName ? null : s.systemName)}
                      className="px-2 py-0.5 rounded-full text-xs bg-black/20 text-white/90 hover:bg-black/30 transition-colors cursor-pointer border border-white/10"
                    >
                      {s.systemName}
                    </button>
                  ))}
                </div>
              )}
              {systems.length === 0 && (
                <p className="text-white/40 text-xs mt-1">No systems</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Detail Cards */}
      <div className="space-y-2">
        {classifications.systems.map((system) => {
          const config = TIER_CONFIG[system.tier];
          const isExpanded = expandedSystem === system.systemName;
          return (
            <div
              key={system.systemName}
              className={`rounded-lg border ${config.border} ${config.bgLight} overflow-hidden transition-all duration-300`}
            >
              <button
                onClick={() => setExpandedSystem(isExpanded ? null : system.systemName)}
                className="w-full px-4 py-3 flex items-center justify-between text-left cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className="text-white font-medium text-sm">{system.systemName}</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium border ${config.badge}`}>
                    {config.label}
                  </span>
                </div>
                <span className="text-white/40 text-xs">{isExpanded ? "▲" : "▼"}</span>
              </button>
              {isExpanded && (
                <div className="px-4 pb-4 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div>
                    <span className="text-white/50 text-xs font-medium">Article: </span>
                    <span className={`text-xs font-mono ${config.text}`}>{system.article}</span>
                  </div>
                  {system.annexDomain && (
                    <div>
                      <span className="text-white/50 text-xs font-medium">Domain: </span>
                      <span className="text-white/80 text-xs">{system.annexDomain}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-white/50 text-xs font-medium">Reasoning: </span>
                    <span className="text-white/70 text-xs leading-relaxed">{system.reasoning}</span>
                  </div>
                  {system.requirements && system.requirements.length > 0 && (
                    <div>
                      <span className="text-white/50 text-xs font-medium block mb-1">Compliance Requirements:</span>
                      <ul className="space-y-1">
                        {system.requirements.map((req) => (
                          <li key={req} className="flex items-start gap-2 text-xs text-white/60">
                            <span className="text-orange-400 mt-0.5">○</span>
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
