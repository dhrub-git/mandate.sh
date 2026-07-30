"use client";

import { WorkflowStatus } from "@/utils/types";
import { cn } from "@repo/ui/lib/utils";
import { ChatStatus } from "ai";

export default function StatusBadge({
  status,
}: {
  status: WorkflowStatus | ChatStatus;
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
        (status === "interrupt" || status === "ready") &&
          "bg-primary/10 text-primary",
        (status === "running" ||
          status === "streaming" ||
          status === "submitted") &&
          "bg-secondary text-secondary-foreground",
        status === "completed" && "bg-green-100 text-green-700",
        status === "error" && "bg-destructive/10 text-destructive",
      )}
    >
      <div
        className={cn(
          "w-2 h-2 rounded-full",
          (status === "running" ||
            status === "streaming" ||
            status === "submitted") &&
            "animate-pulse bg-secondary-foreground",
          (status === "interrupt" || status === "ready") && "bg-primary",
          status === "completed" && "bg-green-600",
          status === "error" && "bg-destructive",
        )}
      />
      {status === "interrupt" || status === "ready"
        ? "Waiting for response"
        : status === "running" ||
            status === "streaming" ||
            status === "submitted"
          ? "Processing..."
          : status === "completed"
            ? "Completed"
            : "Error"}
    </div>
  );
}
