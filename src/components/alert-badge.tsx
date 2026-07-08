"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/hooks/use-language";
import { cn } from "@/lib/utils";

interface AlertBadgeProps {
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  className?: string;
}

export function AlertBadge({ severity, className }: AlertBadgeProps) {
  const { t } = useLanguage();

  const getSeverityLabel = (sev: string) => {
    const key = `kisan.badge.${sev.toLowerCase()}`;
    const trans = t(key);
    if (trans === key) {
      // Fallback if translations are not loaded
      return sev.charAt(0) + sev.slice(1).toLowerCase();
    }
    return trans;
  };

  const getBadgeStyles = (sev: string) => {
    switch (sev) {
      case "CRITICAL":
        return "bg-red-600 hover:bg-red-600 text-white font-bold border-transparent dark:bg-red-700 dark:text-white";
      case "HIGH":
        return "bg-orange-500 hover:bg-orange-500 text-white font-bold border-transparent dark:bg-orange-600 dark:text-white";
      case "MEDIUM":
        return "bg-yellow-400 hover:bg-yellow-400 text-black font-bold border-transparent dark:bg-yellow-500 dark:text-black";
      case "LOW":
      default:
        return "bg-emerald-600 hover:bg-emerald-600 text-white font-bold border-transparent dark:bg-emerald-700 dark:text-white";
    }
  };

  return (
    <Badge
      className={cn(
        "px-2.5 py-1 text-xs uppercase tracking-wider rounded-md shadow-sm",
        getBadgeStyles(severity),
        className
      )}
    >
      {getSeverityLabel(severity)}
    </Badge>
  );
}
