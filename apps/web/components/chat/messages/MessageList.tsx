"use client";

import { useRef, useEffect } from "react";
import { Skeleton } from "@repo/ui/skeleton";
import { Bot } from "lucide-react";
import { ChatMessageAI, Message } from "@/utils/types";
import MessageItem from "./MessageItem";

type Props = {
  messages: (Message | ChatMessageAI)[];
  isStreaming: boolean;
  error?: string;
};

export default function MessageList({
  messages,
  isStreaming,
  error,
}: Props) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50/50 dark:bg-zinc-950/50">
      <div className="px-4 py-6 lg:px-8 lg:py-8 space-y-6">
        {messages.map((msg) => (
          <MessageItem key={msg.id} message={msg} />
        ))}

        {/* Streaming UI */}
        {isStreaming && (
          <div className="flex gap-4 animate-in fade-in-50">
            <div className="flex h-10 w-10 lg:h-12 lg:w-12 shrink-0 items-center justify-center rounded-full bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 shadow-md">
              <Bot className="h-5 w-5 lg:h-6 lg:w-6 text-gray-700 dark:text-gray-300 animate-pulse" />
            </div>

            <div className="space-y-3 flex-1 max-w-[75%] bg-white dark:bg-zinc-800 p-4 rounded-3xl rounded-bl-sm border border-gray-100 dark:border-zinc-700 shadow-sm">
              <Skeleton className="h-4 w-3/4 rounded-full" />
              <Skeleton className="h-4 w-2/3 rounded-full" />
              <Skeleton className="h-4 w-1/2 rounded-full" />
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="max-w-2xl mx-auto bg-red-50 border-l-4 border-red-500 text-red-900 px-6 py-4 rounded-r-xl shadow-md">
            <strong>Error: </strong>
            <span>{error}</span>
          </div>
        )}

        <div ref={endRef} />
      </div>
    </div>
  );
}