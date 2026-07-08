"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { ChevronLeft, CheckCheck, Search } from "lucide-react";
import { Header } from "@/components/header";
import { AlertFeed } from "@/components/alert-feed";
import { useAlerts } from "@/hooks/use-alerts";
import { useLanguage } from "@/hooks/use-language";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ContactSheet } from "@/components/contact-sheet";

export default function AlertsPage() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isContactOpen, setContactOpen] = useState(false);

  const {
    alerts,
    unreadCount,
    markRead,
    markUnread,
    markAllRead,
    deleteAlert,
  } = useAlerts();

  // Search & Filtering states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSeverity, setSelectedSeverity] = useState<string>("ALL");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  // Sync category filter with query parameter if present
  useEffect(() => {
    const catParam = searchParams.get("category");
    if (catParam) {
      setSelectedCategory(catParam);
    }
  }, [searchParams]);

  // Alert Filtering Logic
  const filteredAlerts = alerts.filter((alert) => {
    // 1. Search Query Filter
    const transTitle = t(alert.title, alert.params).toLowerCase();
    const transMsg = t(alert.message, alert.params).toLowerCase();
    const transRec = t(alert.recommendation, alert.params).toLowerCase();
    const matchesSearch =
      searchQuery === "" ||
      transTitle.includes(searchQuery.toLowerCase()) ||
      transMsg.includes(searchQuery.toLowerCase()) ||
      transRec.includes(searchQuery.toLowerCase());

    // 2. Severity Filter
    const matchesSeverity =
      selectedSeverity === "ALL" || alert.severity === selectedSeverity;

    // 3. Category Filter
    const matchesCategory =
      selectedCategory === "ALL" || alert.category === selectedCategory;

    return matchesSearch && matchesSeverity && matchesCategory;
  });

  const categories = [
    "ALL",
    "Water",
    "Weather",
    "Crop",
    "Disease",
    "Flood",
    "Drought",
    "Yield",
    "Advisory",
  ];

  const severities = ["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW"];

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedSeverity("ALL");
    setSelectedCategory("ALL");
    router.replace("/alerts");
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />

      <main className="flex-1 container px-4 py-8 max-w-5xl space-y-6">
        {/* Navigation & Header Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              asChild
              className="h-12 w-12 rounded-xl shadow-sm hover:bg-muted"
            >
              <Link href="/kisan" aria-label="Back to Farmer Cockpit">
                <ChevronLeft className="h-6 w-6" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-black text-foreground tracking-tight sm:text-4xl">
                {t("kisan.alerts.title")}
              </h1>
              <p className="text-base text-muted-foreground font-semibold">
                {t("kisan.alerts.unreadCount", { count: unreadCount })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="lg"
                onClick={markAllRead}
                className="h-12 px-5 font-bold gap-2 text-base rounded-xl shadow hover:scale-[1.01] active:scale-[0.99] transition-transform"
              >
                <CheckCheck className="h-5 w-5" />
                <span>{t("kisan.button.allRead")}</span>
              </Button>
            )}
          </div>
        </div>

        {/* Filter & Search Bar */}
        <section className="bg-card border rounded-2xl p-5 shadow-sm space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder={t("kisan.search.placeholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 text-base rounded-xl border-muted bg-background focus:ring-4 focus:ring-primary/20"
            />
          </div>

          <div className="space-y-3">
            {/* Category Filter */}
            <div className="space-y-1.5">
              <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider block">
                {t("kisan.filter.category")}
              </span>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => {
                  const isSelected = selectedCategory === cat;
                  const label = cat === "ALL" ? t("kisan.filter.all") : cat;
                  return (
                    <Button
                      key={cat}
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setSelectedCategory(cat);
                        // Clean url query param if manual filter click
                        if (cat === "ALL") {
                          router.replace("/alerts");
                        } else {
                          router.replace(`/alerts?category=${cat}`);
                        }
                      }}
                      className="h-10 px-4 text-sm font-bold rounded-lg transition-transform active:scale-95"
                    >
                      {label}
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Severity Filter */}
            <div className="space-y-1.5">
              <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider block">
                {t("kisan.filter.severity")}
              </span>
              <div className="flex flex-wrap gap-2">
                {severities.map((sev) => {
                  const isSelected = selectedSeverity === sev;
                  const label =
                    sev === "ALL"
                      ? t("kisan.filter.all")
                      : t(`kisan.badge.${sev.toLowerCase()}`) || sev;
                  return (
                    <Button
                      key={sev}
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedSeverity(sev)}
                      className="h-10 px-4 text-sm font-bold rounded-lg transition-transform active:scale-95"
                    >
                      {label}
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>

          {(searchQuery || selectedSeverity !== "ALL" || selectedCategory !== "ALL") && (
            <div className="pt-2 flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="text-primary hover:bg-primary/10 font-bold"
              >
                Clear All Filters
              </Button>
            </div>
          )}
        </section>

        {/* Alerts Feed */}
        <section className="space-y-2">
          <AlertFeed
            alerts={filteredAlerts}
            onMarkRead={markRead}
            onMarkUnread={markUnread}
            onDelete={deleteAlert}
          />
        </section>
      </main>

      {/* Footer */}
      <footer id="contact" className="py-8 w-full border-t bg-muted/10 mt-12">
        <div className="container max-w-5xl px-4 flex flex-col sm:flex-row items-center justify-between gap-6">
          <nav className="flex gap-6 font-semibold">
            <Link href="/#about" className="hover:underline text-muted-foreground">
              {t("footer.about")}
            </Link>
            <button
              onClick={() => setContactOpen(true)}
              className="hover:underline text-muted-foreground text-left"
            >
              {t("footer.contact")}
            </button>
          </nav>
          <p className="text-sm text-muted-foreground text-center font-medium">
            {t("footer.copyright")}
          </p>
        </div>
      </footer>

      <ContactSheet open={isContactOpen} onOpenChange={setContactOpen} />
    </div>
  );
}
