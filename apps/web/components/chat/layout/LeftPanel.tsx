"use client";

import {
  FileText,
  Loader2,
  Copy,
  Download,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { StageProgressBar } from "../policy/StageProgressBar";
import { DraftPolicy } from "../policy/DraftPolicy";
import { AgentActivityStrip } from "../agent/AgentActivityStrip";
import { Policy } from "@repo/database";
import { useMemo, useState } from "react";
import VersionDropdown from "../policy/VersionDropdown";
import { StatusBadge } from "../policy/StatusBadge";
import { PolicyVersionTimeline } from "../policy/PolicyVersionTimeline";
import { usePolicyAgent } from "@/context/chat/PolicyAgentContext";
import { PolicyActionButtons } from "../policy/ActionButton";

interface PolicyDocuments {
  current: Policy | null;
  versions: Policy[] | never[];
}

export default function LeftPanel(props: {
  policies: PolicyDocuments;
  companyProfile: any;
  isStreaming: boolean;

  activeStage: string | null;
  stagesComplete: Set<string>;
  questionCount: number;

  backendDrafts: Record<string, string>;

  liveEvents: any[];
  currentNode: string | null;
  streamingText: string;

  copiedPolicies: boolean;
  isDownloading: boolean;

  onCopy: () => void;
  onDownload: () => void;
  selectedPolicyVersion: number | null;
  setSelectedPolicyVersion: (version: number | null) => void;
  onGenerateSummary: () => void;
  isGeneratingSummary: boolean;
}) {
  const {
    policies,
    companyProfile,
    isStreaming,
    activeStage,
    stagesComplete,
    questionCount,
    backendDrafts,
    liveEvents,
    currentNode,
    streamingText,
    copiedPolicies,
    isDownloading,
    onCopy,
    onDownload,
    selectedPolicyVersion,
    setSelectedPolicyVersion,
    onGenerateSummary,
    isGeneratingSummary,
  } = props;

  const leftPanelTitle = policies.current
    ? `AI Governance Policies`
    : "Policy Draft";

  const leftPanelSubtitle = policies
    ? "Your final AI governance document"
    : questionCount > 0
      ? `${questionCount} question${questionCount !== 1 ? "s" : ""} answered — draft updates as you go`
      : "Sections fill in as you answer questions";
  const selectedPolicy = useMemo(() => {
    if (!policies || !selectedPolicyVersion) return null;
    return (
      policies.versions.find((v) => v.version === selectedPolicyVersion) ||
      policies.current
    );
  }, [policies, selectedPolicyVersion]);

  return (
    <>
      {/* HEADER */}
      <div className="py-5 px-6 border-b border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shrink-0 print:hidden">
        <div className="flex flex-col gap-3">
          {/* Top row */}
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <FileText className="h-4 w-4 text-primary shrink-0" />

                <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                  {leftPanelTitle}
                </h2>
              </div>

              <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1 truncate">
                {leftPanelSubtitle}
              </p>
            </div>

            {isStreaming && (
              <div className="flex items-center gap-1 text-xs text-primary shrink-0">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Updating...</span>
              </div>
            )}
          </div>

          {/* Actions row */}
          {selectedPolicy && policies.current && (
            <div className="flex items-center justify-between gap-3 flex-wrap">
              {/* Left side (status + version) */}
              <div className="flex items-center gap-3">
                <StatusBadge status={selectedPolicy.status} />
                <VersionDropdown
                  versions={[policies.current, ...policies.versions]}
                  currentVersion={selectedPolicyVersion}
                  onSelectVersion={setSelectedPolicyVersion}
                />
                <PolicyActionButtons
                  status={selectedPolicy.status}
                  policyId={selectedPolicy.id}
                />
              </div>

              {/* Right side (buttons) */}
              <div className="flex items-center gap-2">
                <button
                  onClick={onCopy}
                  className="text-xs font-medium flex items-center gap-1.5 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 border border-gray-200 dark:border-zinc-700 rounded-md px-3 py-1.5 transition-colors"
                >
                  {copiedPolicies ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                  {copiedPolicies ? "Copied" : "Copy"}
                </button>

                <button
                  onClick={onDownload}
                  disabled={isDownloading}
                  className="text-xs font-medium flex items-center gap-1.5 bg-gray-50 dark:bg-zinc-800 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 border border-gray-200 dark:border-zinc-700 rounded-md px-3 py-1.5 transition-colors disabled:opacity-50"
                >
                  {isDownloading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                  ) : (
                    <Download className="h-3.5 w-3.5" />
                  )}
                  {isDownloading ? "Saving..." : "PDF"}
                </button>

                <button
                  onClick={onGenerateSummary}
                  disabled={isGeneratingSummary}
                  className="text-xs font-medium flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 border border-emerald-200 dark:border-emerald-500/30 rounded-md px-3 py-1.5 transition-colors disabled:opacity-50"
                >
                  {isGeneratingSummary ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="h-3.5 w-3.5" />
                  )}
                  {isGeneratingSummary ? "Generating..." : "Summary"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* STAGE BAR */}
      {!policies.current && (
        <StageProgressBar
          activeStage={activeStage}
          stagesComplete={stagesComplete}
        />
      )}

      {/* POLICY */}
      <DraftPolicy
        companyProfile={companyProfile}
        activeStage={activeStage}
        stagesComplete={stagesComplete}
        questionCount={questionCount}
        finalPolicy={selectedPolicy ? selectedPolicy.content : undefined}
        backendDrafts={backendDrafts}
      />

      {/* AGENT STRIP */}
      {!policies.current && (
        <AgentActivityStrip
          liveEvents={liveEvents}
          currentNode={currentNode}
          streamingText={streamingText}
          isStreaming={isStreaming}
        />
      )}

      {policies.current && (
        <PolicyVersionTimeline
          policies={[policies.current, ...policies.versions]}
          currentPolicyId={selectedPolicyVersion}
          onSelectVersion={(p) => setSelectedPolicyVersion(p)}
        />
      )}
    </>
  );
}
