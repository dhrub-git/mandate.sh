"use client";

import StatusBadge from "../messages/StatusBadge";
import MessageList from "../messages/MessageList";
import ChatInput from "../messages/ChatInput";
import { CompanyProfile, Message, WorkflowStatus } from "@/utils/types";
import { CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@repo/ui/button";
import { usePolicyAgent } from "@/context/chat/PolicyAgentContext";

export default function RightPanel(props: {
  companyProfile: CompanyProfile | undefined;
  status: WorkflowStatus;
  policies: string | undefined;
  messages: Message[];
  input: string;
  setInput: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
  isStreaming: boolean;
  error?: string;
}) {
  const {
    companyProfile,
    status,
    messages,
    input,
    setInput,
    onSubmit,
    isSubmitting,
    isStreaming,
    error,
    policies,
  } = props;
  const [isUpdatingPolicy, setIsUpdatingPolicy] = useState(false);
  const {
    status: policyStatus,
    messages: policyMessages,
    sendMessage: sendPolicyMessage,
    error: policyError,
  } = usePolicyAgent();

  const handleSendPolicyMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendPolicyMessage({
      parts: [{ type: "text", text: input }],
    });
    setInput("");
  };

  return (
    <div className="flex flex-col h-full w-full max-w-5xl mx-auto bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-zinc-800 overflow-hidden">
      {/* HEADER */}
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

            <StatusBadge status={status} />
          </div>
        </div>
      </div>

      {/* MESSAGES */}
      <MessageList
        messages={[...messages, ...policyMessages]} // Combine user and policy messages
        isStreaming={isStreaming || policyStatus === "streaming"}
        error={
          (error ?? policyError)
            ? policyError instanceof Error
              ? policyError.message
              : "An error occurred while generating the policy."
            : undefined
        }
      />

      {/* INPUT */}
      {(status === "interrupt" || isUpdatingPolicy) && (
        <ChatInput
          input={input}
          setInput={setInput}
          onSubmit={isUpdatingPolicy ? handleSendPolicyMessage : onSubmit}
          isSubmitting={isSubmitting || policyStatus === "streaming"}
        />
      )}

      {(status === "completed" || policies) && (
        <div className="border-t border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-6 py-6 z-10 shrink-0">
          <div className="max-w-2xl mx-auto bg-green-50 dark:bg-green-950/30 border-l-4 border-green-500 rounded-r-lg p-5 shadow-sm">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <CheckCircle2 className="h-6 w-6 text-green-500 shrink-0" />
                <p className="text-sm font-medium text-green-900 dark:text-green-200">
                  {isUpdatingPolicy
                    ? "Policy generation complete. Review the document on the left."
                    : "Policy generation complete. Review the document on the left."}
                </p>
              </div>

              {isUpdatingPolicy && (
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm text-green-800 dark:text-green-300">
                    Want to refine or expand it further? Continue editing with
                    our AI agent.
                  </p>

                  <Button
                    onClick={() => setIsUpdatingPolicy(true)}
                    variant="outline"
                    className="border-green-500 text-green-700 hover:bg-green-100 dark:text-green-300 dark:border-green-700 dark:hover:bg-green-900/40"
                  >
                    Continue Editing
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
