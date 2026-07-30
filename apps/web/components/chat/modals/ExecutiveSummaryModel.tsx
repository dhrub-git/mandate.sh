"use client";
import { useState, useRef } from "react";
import { X, Download, Loader2, FileText, Copy, CheckCircle2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { SummaryOutput } from "@/actions/summary-actions";
interface ExecutiveSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  summary: SummaryOutput | null;
  isLoading: boolean;
  error: string | null;
  companyName?: string;
}
export function ExecutiveSummaryModal({
  isOpen,
  onClose,
  summary,
  isLoading,
  error,
  companyName,
}: ExecutiveSummaryModalProps) {
  const [isCopied, setIsCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  if (!isOpen) return null;
  const handleCopy = async () => {
    if (summary?.summary) {
      await navigator.clipboard.writeText(summary.summary);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };
  const handleDownloadPdf = async () => {
    // if (!contentRef.current) return;
    // setIsDownloading(true);
    // try {
    //   const html2pdf = (await import("html2pdf.js")).default;
    //   const fileName = companyName
    //     ? `${companyName.replace(/\s+/g, "_")}_Executive_Summary.pdf`
    //     : "AI_Policy_Executive_Summary.pdf";
    //   const opt = {
    //     margin: [15, 15, 15, 15] as [number, number, number, number],
    //     filename: fileName,
    //     image: { type: "jpeg" as const, quality: 0.98 },
    //     html2canvas: {
    //       scale: 2,
    //       useCORS: true,
    //       logging: false,
    //       windowWidth: 800,
    //     },
    //     jsPDF: {
    //       unit: "mm" as const,
    //       format: "a4" as const,
    //       orientation: "portrait" as const,
    //     },
    //   };
    //   await html2pdf().set(opt).from(contentRef.current).save();
    // } catch (err) {
    //   console.error("Error generating PDF:", err);
    // } finally {
    //   setIsDownloading(false);
    // }
    window.print();
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[85vh] mx-4 bg-white dark:bg-zinc-900 rounded-xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
              <FileText className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Executive Summary
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Overview of your policy
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {summary && !isLoading && (
              <>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 border border-gray-200 dark:border-zinc-700 rounded-lg transition-colors"
                >
                  {isCopied ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                  {isCopied ? "Copied" : "Copy"}
                </button>
                <button
                  onClick={handleDownloadPdf}
                  disabled={isDownloading}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  {isDownloading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Download className="h-3.5 w-3.5" />
                  )}
                  {isDownloading ? "Saving..." : "Download PDF"}
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Generating executive summary...
              </p>
            </div>
          )}
          {error && (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <div className="h-12 w-12 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center">
                <X className="h-6 w-6 text-red-500" />
              </div>
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}
          {summary && !isLoading && (
            <div ref={contentRef} className="space-y-6">
              {/* Key Highlights Pills */}
              {summary.keyHighlights && summary.keyHighlights.length > 0 && (
                <div className="flex flex-wrap gap-2 pb-4 border-b border-gray-100 dark:border-zinc-800">
                  {summary.keyHighlights.map((highlight, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center px-3 py-1 text-xs font-medium bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 rounded-full"
                    >
                      {highlight}
                    </span>
                  ))}
                </div>
              )}
              {/* Summary Content */}
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({ node, ...props }) => (
                      <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-6 mb-3" {...props} />
                    ),
                    h2: ({ node, ...props }) => (
                      <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mt-5 mb-2" {...props} />
                    ),
                    h3: ({ node, ...props }) => (
                      <h3 className="text-base font-semibold text-gray-800 dark:text-gray-300 mt-4 mb-2" {...props} />
                    ),
                    p: ({ node, ...props }) => (
                      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-3" {...props} />
                    ),
                    ul: ({ node, ...props }) => (
                      <ul className="list-disc pl-5 mb-4 space-y-1.5 text-sm text-gray-600 dark:text-gray-400" {...props} />
                    ),
                    li: ({ node, ...props }) => (
                      <li className="leading-relaxed" {...props} />
                    ),
                    strong: ({ node, ...props }) => (
                      <strong className="font-semibold text-gray-900 dark:text-gray-200" {...props} />
                    ),
                  }}
                >
                  {summary.summary}
                </ReactMarkdown>
              </div>
              {/* Word Count Footer */}
              <div className="pt-4 border-t border-gray-100 dark:border-zinc-800">
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  ~{summary.wordCount} words • Generated with AI
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}