import { ChatTools } from "@/utils/types";
import {
  DynamicToolUIPart,
  FileUIPart,
  ReasoningUIPart,
  SourceDocumentUIPart,
  SourceUrlUIPart,
  StepStartUIPart,
  ToolUIPart,
} from "ai";
import { MarkdownResponse } from "./MessageMarkdown";

type ToolParts =
  | ReasoningUIPart
  | DynamicToolUIPart
  | SourceUrlUIPart
  | SourceDocumentUIPart
  | FileUIPart
  | StepStartUIPart
  | {
      type: `data-${string}`;
      id?: string;
      data: unknown;
    }
  | ToolUIPart<ChatTools>;

export function ToolResult({ part }: { part: ToolParts }) {
  switch (part.type) {
    /**
     * 🧠 Reasoning (hidden-ish, subtle like system text)
     */
    case "reasoning":
      return (
        <div className="text-xs text-gray-400 dark:text-gray-500 italic my-2">
          {part.text}
        </div>
      );

    /**
     * ⚙️ Tool execution start
     */
    case "step-start":
      return (
        <div className="my-3 text-xs font-medium text-emerald-600 dark:text-emerald-400">
          Running step...
        </div>
      );

    /**
     * 🔗 Source URL
     */
    case "source-url":
      return (
        <a
          href={part.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-sm text-emerald-600 dark:text-emerald-400 hover:underline break-all my-2"
        >
          {part.url}
        </a>
      );

    /**
     * 📄 Source Document
     */
    case "source-document":
      return (
        <div className="my-3 p-4 rounded-lg border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
            Source Document
          </p>
          <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
            {part.title}
          </p>
        </div>
      );

    /**
     * 📁 File
     */
    case "file":
      return (
        <div className="my-3 flex items-center gap-3 p-3 border rounded-lg border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <div className="text-sm font-medium text-gray-800 dark:text-gray-200">
            {part.filename}
          </div>
        </div>
      );

    /**
     * 🧩 Dynamic tool (fallback)
     */
    case "dynamic-tool":
      return (
        <div className="my-3 p-4 rounded-lg border border-dashed border-emerald-300 dark:border-emerald-700 bg-emerald-50/40 dark:bg-emerald-900/10 text-sm text-gray-700 dark:text-gray-300">
          <pre className="whitespace-pre-wrap wrap-break-word">
            {JSON.stringify(part, null, 2)}
          </pre>
        </div>
      );

    /**
     * 🛠️ Typed tool (your actual tools)
     */
    /**
     * 🛠️ Typed tool (your actual tools)
     */
    default:
      {
        if (part.type.startsWith("tool-")) {
          const tool = part as ToolUIPart<ChatTools>;

          switch (tool.type) {
            /**
             * 🔍 Find Section Context
             */
            case "tool-findSectionContext": {
              const { output, input } = tool;

              return (
                <div className="my-5 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden">
                  {/* Header */}
                  <div className="px-4 py-2.5 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between">
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      Context Retrieval
                    </span>
                    <span className="text-[10px] text-gray-400">Tool</span>
                    {input && (
                      <span className="text-[10px] text-gray-500 dark:text-gray-400">
                        Updating: {input.sectionId}
                      </span>
                    )}
                  </div>

                  {/* Body */}
                  <div className="p-4 text-sm text-gray-700 dark:text-gray-300 space-y-3">
                    {!output ? (
                      <span className="italic text-gray-400">
                        Searching documents for relevant sections...
                      </span>
                    ) : (
                      <>
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                            Method
                          </p>
                          <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                            {output.method}
                          </p>
                        </div>

                        <div className="space-y-1">
                          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                            Required Inputs
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {output.inputs?.map((input: string, i: number) => (
                              <span
                                key={i}
                                className="px-2 py-1 text-xs rounded-md bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                              >
                                {input}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-1">
                          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                            Generation Details
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                            {output.generation_details}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            }

            /**
             * ✍️ Rewrite Section
             */
            case "tool-rewriteForSection": {
              const { output } = tool;

              return (
                <div className="my-5 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden">
                  {/* Header */}
                  <div className="px-4 py-2.5 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between">
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      Section Rewrite
                    </span>
                    <span className="text-[10px] text-gray-400">AI Edit</span>
                  </div>

                  {/* Body */}
                  <div className="p-4 space-y-4">
                    {!output ? (
                      <span className="italic text-sm text-gray-400">
                        Applying AI edits to the section...
                      </span>
                    ) : (
                      <>
                        {/* Change Notes */}
                        {output.changeNotes && (
                          <div className="rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-900/20 p-3">
                            <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 mb-1">
                              What changed
                            </p>
                            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                              {output.changeNotes}
                            </p>
                          </div>
                        )}

                        {/* Markdown Content */}
                        <div className="prose prose-sm max-w-none dark:prose-invert">
                          <MarkdownResponse>{output.text}</MarkdownResponse>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            }
          }
        }
      }
      /**
       * 📦 data-* fallback
       */
      if (part.type.startsWith("data-")) {
        return (
          <div className="my-3 p-4 rounded-lg border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900 text-sm">
            <pre className="whitespace-pre-wrap wrap-break-word text-gray-700 dark:text-gray-300">
              {JSON.stringify((part as { data: unknown }).data, null, 2)}
            </pre>
          </div>
        );
      }

      return null;
  }
}
