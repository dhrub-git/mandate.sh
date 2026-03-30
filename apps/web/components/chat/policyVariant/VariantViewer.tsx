
"use client";
import { format } from "date-fns";
import { MarkdownResponse } from "../messages/MessageMarkdown";
type VariantViewerProps = {
  variant: {
    content: string;
    generatedAt: Date;
    variantType: string;
  };
  isStale: boolean;
  variantsFromVersion: number | null;
  currentPolicyVersion: number;
  onRegenerate: () => void;
  isGenerating: boolean;
};
export default function VariantViewer({ 
  variant, 
  isStale,
  variantsFromVersion,
  currentPolicyVersion,
  onRegenerate, 
  isGenerating 
}: VariantViewerProps) {
  
  // Show version info if variants are from an older version
  const isFromOlderVersion = variantsFromVersion !== null && variantsFromVersion < currentPolicyVersion;
  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex justify-between items-center text-sm text-gray-500">
        <span>Type: {variant.variantType.replace(/_/g, " ")}</span>
        <span>Generated: {format(new Date(variant.generatedAt), "PP pp")}</span>
      </div>
      {isStale && (
        <div className="bg-yellow-100 dark:bg-yellow-900/20 border-l-4 border-yellow-500 text-yellow-700 dark:text-yellow-300 p-4 flex justify-between items-center">
          <div>
            <p className="font-medium">Master Policy has been updated</p>
            {isFromOlderVersion && (
              <p className="text-sm mt-1">
                This variant was generated from v{variantsFromVersion}. Current policy is v{currentPolicyVersion}.
              </p>
            )}
          </div>
          <button 
            onClick={onRegenerate} 
            disabled={isGenerating}
            className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-50 shrink-0 ml-4"
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