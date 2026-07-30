"use client";

import { useState } from "react";
import { PolicyStatus } from "@repo/database";
import { ChangeNoteModal } from "./ChangeNoteModal";
import { Button } from "@repo/ui/button";
import { cn } from "@repo/ui/lib/utils";

interface Props {
  status: PolicyStatus;
  policyId: string;
}

export const STATUS_ACTION_CONFIG: Record<
  PolicyStatus,
  {
    to: PolicyStatus;
    label: string;
    prefix?: string;
    className?: string;
  }[]
> = {
  DRAFT: [
    {
      to: "IN_REVIEW",
      label: "Send for Review",
      prefix: "[AUTHOR]",
      className:
        "bg-primary text-white hover:bg-primary/90 border border-primary/20",
    },
  ],
  IN_REVIEW: [
    {
      to: "APPROVED",
      label: "Approve",
      prefix: "[APPROVER]",
      className:
        "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30",
    },
    {
      to: "REJECTED",
      label: "Reject",
      prefix: "[REVIEWER]",
      className:
        "bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/30",
    },
  ],
  REJECTED: [
    {
      to: "DRAFT",
      label: "Move to Draft",
      prefix: "[AUTHOR]",
      className:
        "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200 dark:bg-zinc-800 dark:text-gray-300 dark:border-zinc-700",
    },
  ],
  APPROVED: [
    {
      to: "PUBLISHED",
      label: "Publish",
      prefix: "[APPROVER]",
      className:
        "bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/30",
    },
  ],
  PUBLISHED: [],
};

export function PolicyActionButtons({ status, policyId }: Props) {
  const [selectedAction, setSelectedAction] = useState<{
    to: PolicyStatus;
    label: string;
    prefix?: string;
  } | null>(null);

  const actions = STATUS_ACTION_CONFIG[status] || [];

  if (!actions.length) return null;

  return (
    <>
      <div className="flex items-center gap-2 flex-wrap">
        {actions.map((action) => (
          <Button
            key={action.to}
            size="sm"
            variant={"outline"}
            onClick={() => setSelectedAction(action)}
            className={cn(
              "text-xs px-3 py-1.5",
              "text-xs font-medium flex items-center gap-1.5",
              "rounded-md px-3 py-1.5 transition-colors",
              action.className,
            )}
          >
            {action.label}
          </Button>
        ))}
      </div>

      {selectedAction && (
        <ChangeNoteModal
          open={!!selectedAction}
          onOpenChange={() => setSelectedAction(null)}
          policyId={policyId}
          action={selectedAction}
        />
      )}
    </>
  );
}
