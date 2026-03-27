"use client";

import { Policy } from "@repo/database";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/select";
import { History } from "lucide-react";

interface VersionDropdownProps {
  versions: Policy[];
  currentVersion: number | null;
  onSelectVersion: (version: number | null) => void;
}

export default function VersionDropdown({
  versions,
  currentVersion,
  onSelectVersion,
}: VersionDropdownProps) {
  return (
    <div className="flex items-center gap-3">
      {/* Icon + Label */}
      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 shrink-0">
        <History className="h-3.5 w-3.5" />
        <span className="font-medium">Version</span>
      </div>

      <Select
        value={currentVersion ? String(currentVersion) : "current"}
        onValueChange={(value) =>
          onSelectVersion(value === "current" ? null : Number(value))
        }
      >
        <SelectTrigger className="h-8 text-xs px-2.5 border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900">
          <SelectValue placeholder="Select version" />
        </SelectTrigger>

        <SelectContent className="max-w-[320px]">
          <SelectItem value="current" className="text-xs">
            Current Version
          </SelectItem>

          {versions.map((version) => (
            <SelectItem
              key={version.id}
              value={String(version.version)}
              className="text-xs py-2"
            >
              <div className="flex flex-col gap-1 leading-tight">
                {/* Primary */}
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    Version {version.version}
                  </span>
                </div>

                {/* Change Notes */}
                {version.changeNote && (
                  <div className="text-[11px] text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-zinc-800/60 border border-gray-200 dark:border-zinc-700 rounded px-2 py-1 leading-snug line-clamp-2">
                    {version.changeNote}
                  </div>
                )}

                {/* Timestamp */}
                <span className="text-[10px] text-gray-400">
                  {new Date(version.createdAt).toLocaleString()}
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}