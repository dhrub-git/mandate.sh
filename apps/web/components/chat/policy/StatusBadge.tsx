import React from "react";
import clsx from "clsx";
import { PolicyStatus } from "@repo/database";

const STATUS_STYLES: Record<
  PolicyStatus,
  { label: string; className: string }
> = {
  DRAFT: {
    label: "Draft",
    className:
      "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800",
  },
  IN_REVIEW: {
    label: "In Review",
    className:
      "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800",
  },
  APPROVED: {
    label: "Approved",
    className:
      "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800",
  },
  PUBLISHED: {
    label: "Published",
    className:
      "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-900/20 dark:text-teal-300 dark:border-teal-800",
  },
  REJECTED: {
    label: "Rejected",
    className:
      "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800",
  },
};

interface StatusBadgeProps {
  status: PolicyStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = STATUS_STYLES[status];

  if (!config) return null;

  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-medium",
        "transition-colors whitespace-nowrap",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}