"use client";

import React from "react";
import Link from "next/link";
import { Droplet, Sprout, CloudSun, FileText, ArrowRight } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { cn } from "@/lib/utils";

interface KisanHomeCardsProps {
  className?: string;
  soilMoisture?: number; // Optional dynamic values
  ndvi?: number;
  temperature?: number;
  precipitation?: number;
  unreadAlertsCount?: number;
}

export function KisanHomeCards({
  className,
  soilMoisture = 22.4,
  ndvi = 0.68,
  temperature = 31,
  precipitation = 12.5,
  unreadAlertsCount = 3,
}: KisanHomeCardsProps) {
  const { t } = useLanguage();

  const cards = [
    {
      title: t("kisan.home.water.title"),
      desc: t("kisan.home.water.desc"),
      href: "/alerts?category=Water",
      icon: <Droplet className="h-10 w-10 text-blue-600 dark:text-blue-400" />,
      bgClass: "bg-blue-50 hover:bg-blue-100 border-blue-200 dark:bg-blue-950/20 dark:hover:bg-blue-950/30 dark:border-blue-900/50",
      status: `Moisture: ${soilMoisture}%`,
      statusColor: "text-blue-700 dark:text-blue-300 font-bold",
    },
    {
      title: t("kisan.home.crop.title"),
      desc: t("kisan.home.crop.desc"),
      href: "/crop-advisor",
      icon: <Sprout className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />,
      bgClass: "bg-emerald-50 hover:bg-emerald-100 border-emerald-200 dark:bg-emerald-950/20 dark:hover:bg-emerald-950/30 dark:border-emerald-900/50",
      status: `NDVI: ${ndvi} (Healthy)`,
      statusColor: "text-emerald-700 dark:text-emerald-300 font-bold",
    },
    {
      title: t("kisan.home.weather.title"),
      desc: t("kisan.home.weather.desc"),
      href: "/predict",
      icon: <CloudSun className="h-10 w-10 text-amber-600 dark:text-amber-400" />,
      bgClass: "bg-amber-50 hover:bg-amber-100 border-amber-200 dark:bg-amber-950/20 dark:hover:bg-amber-950/30 dark:border-amber-900/50",
      status: `${temperature}°C | Rain: ${precipitation}mm`,
      statusColor: "text-amber-700 dark:text-amber-300 font-bold",
    },
    {
      title: t("kisan.home.advisory.title"),
      desc: t("kisan.home.advisory.desc"),
      href: "/alerts",
      icon: <FileText className="h-10 w-10 text-teal-600 dark:text-teal-400" />,
      bgClass: "bg-teal-50 hover:bg-teal-100 border-teal-200 dark:bg-teal-950/20 dark:hover:bg-teal-950/30 dark:border-teal-900/50",
      status: unreadAlertsCount > 0 
        ? `${unreadAlertsCount} Unread Alerts`
        : "Advisories Up to Date",
      statusColor: unreadAlertsCount > 0 
        ? "text-red-600 dark:text-red-400 font-bold animate-pulse" 
        : "text-teal-700 dark:text-teal-300 font-bold",
    },
  ];

  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 gap-6", className)}>
      {cards.map((card, idx) => (
        <Link
          key={idx}
          href={card.href}
          className={cn(
            "flex flex-col justify-between p-6 border-2 rounded-2xl transition-all hover:scale-[1.01] active:scale-[0.99] focus:outline-none focus:ring-4 focus:ring-primary/30 min-h-[180px] shadow-sm select-none",
            card.bgClass
          )}
          aria-label={`${card.title}. ${card.desc}. Status: ${card.status}. Tap to open.`}
        >
          <div className="flex items-start gap-4">
            <div className="p-3 bg-background rounded-xl shadow-sm flex-shrink-0">
              {card.icon}
            </div>
            <div className="space-y-1">
              <h2 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                {card.title}
              </h2>
              <p className="text-base text-muted-foreground font-medium md:text-lg">
                {card.desc}
              </p>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-muted-foreground/10 flex items-center justify-between">
            <span className={cn("text-lg", card.statusColor)}>
              {card.status}
            </span>
            <div className="flex items-center gap-1 text-primary font-bold text-lg">
              <span>Open</span>
              <ArrowRight className="h-5 w-5" />
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
