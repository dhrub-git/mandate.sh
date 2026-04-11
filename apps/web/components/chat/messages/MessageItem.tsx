"use client";

import { ChatMessageAI, Message } from "@/utils/types";
import { cn } from "@repo/ui/lib/utils";
import { Bot, User, Info } from "lucide-react";
import { MarkdownResponse } from "./MessageMarkdown";
import { memo } from "react";
import { ToolResult } from "./ToolResult";

type Props = {
  message: Message | ChatMessageAI;
};

function isChatMessageAI(msg: Message | ChatMessageAI): msg is ChatMessageAI {
  return "parts" in msg;
}

function getMessageTimestamp(msg: Message | ChatMessageAI): Date | null {
  // ChatMessageAI case
  if ("metadata" in msg && msg.metadata?.createdAt) {
    const date = new Date(msg.metadata.createdAt);
    return isNaN(date.getTime()) ? null : date;
  }

  // Message case
  if ("timestamp" in msg && msg.timestamp) {
    return msg.timestamp;
  }

  return null;
}

const RenderMessageContentComponent = ({
  msg,
}: {
  msg: Message | ChatMessageAI;
}) => {
  if (isChatMessageAI(msg)) {
    return (
      <>
        {msg.parts.map((part, i) => {
          if (part.type === "text") {
            return (
              <div key={i} className="m-0 p-0 w-full">
                <MarkdownResponse>{part.text}</MarkdownResponse>
              </div>
            );
          }

          if (part.type.startsWith("tool-")) {
            return (
              <div className="my-2" key={`tool-part-${i}`}>
                <ToolResult part={part as any} />
              </div>
            );
          }

          return null;
        })}
      </>
    );
  }

  // fallback: simple Message
  return <MarkdownResponse>{msg.content}</MarkdownResponse>;
};

const RenderMessageContent = memo(RenderMessageContentComponent);

export default function MessageItem({ message: msg }: Props) {
  const timestamp = getMessageTimestamp(msg);
  return (
    <div
      className={cn(
        "flex gap-4 animate-in fade-in-50 slide-in-from-bottom-3 duration-500",
        msg.role === "user" && "flex-row-reverse",
        msg.role === "system" && "justify-center",
      )}
    >
      {/* Avatar */}
      {msg.role !== "system" && (
        <div
          className={cn(
            "flex h-10 w-10 lg:h-12 lg:w-12 shrink-0 items-center justify-center rounded-full shadow-md",
            msg.role === "user"
              ? "bg-primary text-primary-foreground"
              : "bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700",
          )}
        >
          {msg.role === "user" ? (
            <User className="h-5 w-5 lg:h-6 lg:w-6" />
          ) : (
            <Bot className="h-5 w-5 lg:h-6 lg:w-6 text-gray-700 dark:text-gray-300" />
          )}
        </div>
      )}

      {/* Message Bubble */}
      <div
        className={cn(
          "max-w-[85%] lg:max-w-[75%] rounded-3xl px-5 py-4 shadow-sm transition-all hover:shadow-md",
          msg.role === "user" &&
            "bg-primary text-primary-foreground rounded-br-sm",
          msg.role === "assistant" &&
            "bg-white dark:bg-zinc-800 text-gray-800 dark:text-gray-200 rounded-bl-sm border border-gray-100 dark:border-zinc-700",
          msg.role === "system" &&
            "bg-blue-50/80 text-blue-900 dark:bg-blue-900/20 dark:text-blue-200 max-w-md mx-auto border border-blue-100 dark:border-blue-900",
        )}
      >
        {/* System Header */}
        {msg.role === "system" && (
          <div className="flex items-center gap-2 mb-2">
            <Info className="h-4 w-4" />
            <span className="text-xs font-bold uppercase tracking-wider">
              System
            </span>
          </div>
        )}

        {/* Markdown Content */}
        <div className="prose prose-sm max-w-none text-[15px] leading-relaxed dark:prose-invert [&>p]:mb-0 [&>p:not(:last-child)]:mb-4">
          <RenderMessageContent msg={msg} />
        </div>

        {/* Timestamp */}
        {timestamp && (
          <span
            className={cn(
              "mt-2.5 block text-xs font-medium",
              msg.role === "user"
                ? "text-primary-foreground/70"
                : "text-gray-400 dark:text-gray-500",
            )}
          >
            {timestamp.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        )}
      </div>
    </div>
  );
}
