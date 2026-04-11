"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "./lib/utils";

export interface SelectionCardProps {
  title: string;
  description?: string;
  selected: boolean;
  onClick: () => void;
  type?: "radio" | "checkbox";
  className?: string;
}

export const SelectionCard: React.FC<SelectionCardProps> = ({
  title,
  description,
  selected,
  onClick,
  type = "radio",
  className,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative flex w-full items-start gap-4 rounded-md border-2 bg-background p-4 text-left transition-all hover:border-primary/50 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
        selected ? "border-primary bg-primary/5" : "border-border",
        className,
      )}
    >
      {/* Radio/Checkbox Indicator */}
      <div className="flex-shrink-0 mt-0.5">
        <div
          className={cn(
            "flex h-5 w-5 items-center justify-center border-2 transition-all",
            type === "radio" ? "rounded-full" : "rounded",
            selected
              ? "border-primary bg-primary"
              : "border-muted-foreground group-hover:border-primary",
          )}
        >
          {selected && <Check className="h-3 w-3 text-primary-foreground" />}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h3
          className={cn(
            "text-sm font-semibold leading-tight",
            selected ? "text-primary" : "text-foreground",
          )}
        >
          {title}
        </h3>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>
        )}
      </div>
    </button>
  );
};
