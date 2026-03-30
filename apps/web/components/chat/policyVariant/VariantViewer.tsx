"use client";

import ReactMarkdown from "react-markdown";
import { format } from "date-fns";
import { MarkdownResponse } from "../messages/MessageMarkdown";

type VariantViewerProps = {
  variant: {
    content: string;
    generatedAt: Date;
    variantType: string;
  };
  policyCreatedAt: Date;
  onRegenerate: () => void;
  isGenerating: boolean;
};

export default function VariantViewer({ variant, policyCreatedAt, onRegenerate, isGenerating }: VariantViewerProps) {
  const isStale = new Date(variant.generatedAt) < new Date(policyCreatedAt);

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex justify-between items-center text-sm text-gray-500">
        <span>Type: {variant.variantType.replace(/_/g, " ")}</span>
        <span>Generated: {format(new Date(variant.generatedAt), "PP pp")}</span>
      </div>

      {isStale && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 flex justify-between items-center">
          <p>⚠️ The Master Policy has been updated since this variant was generated.</p>
          <button 
            onClick={onRegenerate} 
            disabled={isGenerating}
            className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-50"
          >
            Regenerate
          </button>
        </div>
      )}

   <div className="prose prose-sm dark:prose-invert max-w-none">
        <MarkdownResponse>{variant.content}</MarkdownResponse>
      </div>
    </div>
  );
}