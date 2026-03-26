"use client";

import { Button } from "@repo/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-100 dark:bg-zinc-900 px-4">
      <div className="w-full max-w-xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-xl p-8 animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
        {/* Header */}
        <div className="flex items-start gap-4 mb-6">
          <div className="h-12 w-12 rounded-xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center shrink-0">
            <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Something went wrong
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              An unexpected error occurred while processing your request.
            </p>
          </div>
        </div>

        {/* Error message */}
        <div className="mb-6 rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50/60 dark:bg-red-950/20 px-4 py-3">
          <p className="text-sm text-red-700 dark:text-red-300 font-medium wrap-break-word">
            {error.message}
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={reset}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold bg-primary text-primary-foreground hover:scale-[1.02] active:scale-95 transition-transform shadow-md"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </Button>
          <Button
            asChild
            variant="outline"
            className="
              inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold
              text-red-600! hover:text-red-700!
              dark:text-red-400! dark:hover:text-red-300!
              border-red-200 hover:border-red-300
              dark:border-red-900/50
              bg-transparent hover:bg-red-50
              dark:hover:bg-red-950/30
              transition-colors
            "
          >
            <Link href="/onboarding">Start Over</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
