"use client";

import { Textarea } from "@repo/ui/textarea";
import { Button } from "@repo/ui/button";
import { Send } from "lucide-react";
import { cn } from "@repo/ui/lib/utils";
import { useRef } from "react";

type Props = {
  input: string;
  setInput: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
};

export default function ChatInput({
  input,
  setInput,
  onSubmit,
  isSubmitting,
}: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize
  const handleChange = (value: string) => {
    setInput(value);

    const el = textareaRef.current;
    if (!el) return;

    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  };

  // Enter submit / Shift+Enter newline
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!isSubmitting && input.trim()) {
        onSubmit(e as any);
      }
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border-t border-gray-100 dark:border-zinc-800 px-4 py-4 lg:px-6 lg:py-6 z-10 shrink-0">
      <form
        onSubmit={onSubmit}
        className="relative flex items-end gap-2 bg-slate-50 dark:bg-zinc-950 rounded-2xl border border-gray-200 dark:border-zinc-800 pl-5 pr-2 py-2 transition-all hover:shadow-md focus-within:shadow-md"
      >
        {/* TEXTAREA */}
        <Textarea
          variant="chat"
          ref={textareaRef}
          value={input}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your response..."
          disabled={isSubmitting}
          rows={1}
          className="max-h-40 overflow-y-auto resize-none scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-zinc-700"
        />

        {/* SEND BUTTON */}
        <Button
          type="submit"
          disabled={isSubmitting || !input.trim()}
          variant="primary"
          size="icon"
          className={cn(
            "h-10 w-10 lg:h-12 lg:w-12 rounded-full shrink-0",
            "hover:scale-105 active:scale-95 transition-transform duration-200 shadow-md",
            "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
          )}
        >
          <Send className="h-5 w-5" />
        </Button>
      </form>
    </div>
  );
}
