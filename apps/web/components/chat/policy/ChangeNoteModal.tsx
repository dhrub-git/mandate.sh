"use client";

import { useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@repo/ui/dialog";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { PolicyStatus } from "@repo/database";
import { Textarea } from "@repo/ui/textarea";
import { Button } from "@repo/ui/button";
import { usePolicyAgent } from "@/context/chat/PolicyAgentContext";
import { changePolicyStatus } from "@/actions/actions";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  policyId: string;
  action: {
    to: PolicyStatus;
    label: string;
    prefix?: string;
  };
}

export function ChangeNoteModal({
  open,
  onOpenChange,
  policyId,
  action,
}: Props) {
  const [note, setNote] = useState("");
  const [isPending, startTransition] = useTransition();
  const { setNewPolicy } = usePolicyAgent();

  const handleSubmit = () => {
    const finalNote = `${action.prefix || ""} ${note}`.trim();

    startTransition(async () => {
      try {
        const updatedPolicy = await changePolicyStatus(
          policyId,
          action.to,
          finalNote,
        );

        setNewPolicy(updatedPolicy);

        toast.success(`Policy ${action.label.toLowerCase()} successfully`);

        onOpenChange(false);
        setNote("");
      } catch (err) {
        toast.error("Failed to update policy");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold">
            {action.label}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">
            Add a change note (will be prefixed with{" "}
            <span className="font-mono text-primary">{action.prefix}</span>)
          </p>

          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Enter change note..."
            className="text-sm"
          />
        </div>

        <DialogFooter>
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>

          <Button size="sm" onClick={handleSubmit} disabled={isPending}>
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              action.label
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
