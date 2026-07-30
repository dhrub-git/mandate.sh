"use client";

import * as React from "react";
import { cn } from "./lib/utils";
import { Label } from "./label";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-2">
        {label && (
          <Label className="text-base font-semibold text-foreground">
            {label}
          </Label>
        )}
        <input
          type={type}
          className={cn(
            "flex h-11 w-full rounded-md border border-input bg-background px-4 py-3 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent disabled:cursor-not-allowed disabled:opacity-50",
            error &&
              "border-destructive bg-destructive/5 focus-visible:ring-destructive",
            className,
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="text-sm font-medium text-destructive">{error}</p>
        )}
      </div>
    );
  },
);
Input.displayName = "Input";
