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

      <Select
        value={currentVersion ? String(currentVersion) : "current"}
        onValueChange={(value) =>
          onSelectVersion(value === "current" ? null : Number(value))
        }
      >
        <SelectTrigger className="h-16 text-xs px-2.5 border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900">
          <SelectValue placeholder="Select version" />
        </SelectTrigger>

        <SelectContent className="max-w-[320px]">
          {versions.map((version) => (
            <SelectItem
              key={version.id}
              value={String(version.version)}
              className="text-xs py-2 bg-white dark:bg-zinc-900 border-b last:border-0 border-gray-200 dark:border-zinc-700"
            >
              <div className="flex flex-col gap-1 leading-tight">
                {/* Primary */}
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-black dark:text-gray-100">
                    Version {version.version}
                  </span>
                </div>

                {/* Timestamp */}
                <span className="text-[10px] text-gray-400">
                  {new Date(version.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
