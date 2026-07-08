"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Header } from "@/components/header";
import { useAlerts } from "@/hooks/use-alerts";
import { useLanguage } from "@/hooks/use-language";
import { Button } from "@/components/ui/button";
import { textToSpeechAction } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import {
  Volume2,
  VolumeX,
  Bell,
  ShieldAlert,
  Sprout,
  Droplet,
  CloudSun,
  FileText,
  ArrowRight,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { ContactSheet } from "@/components/contact-sheet";

export default function KisanPage() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const { alerts, unreadCount, markRead } = useAlerts();
  const [isContactOpen, setContactOpen] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  const primaryAlert = (() => {
    const unread = alerts.filter((a) => !a.read);
    const listToSearch = unread.length > 0 ? unread : alerts;
    if (listToSearch.length === 0) return null;

    const severityScore = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
    return [...listToSearch].sort((a, b) => {
      const diff = severityScore[b.severity] - severityScore[a.severity];
      if (diff !== 0) return diff;
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    })[0];
  })();

  useEffect(() => {
    return () => {
      if (audioElement) {
        audioElement.pause();
      }
    };
  }, [audioElement]);

  const handleListenPrimary = async () => {
    if (!primaryAlert) return;

    if (playing && audioElement) {
      audioElement.pause();
      setPlaying(false);
      setAudioElement(null);
      return;
    }

    setPlaying(true);

    try {
      const title = t(primaryAlert.title, primaryAlert.params);
      const message = t(primaryAlert.message, primaryAlert.params);
      const rec = t(primaryAlert.recommendation, primaryAlert.params);
      const speechText = `${title}. ${message}. ${rec}`;

      const res = await textToSpeechAction(speechText);

      if (res.error || !res.data?.audioDataUri) {
        toast({
          title: t("chatbot.error.audio.title") || "Audio Error",
          description: res.error || t("chatbot.error.audio.description") || "Could not generate audio.",
          variant: "destructive",
        });
        setPlaying(false);
        return;
      }

      const audio = new Audio(res.data.audioDataUri);
      audio.onended = () => {
        setPlaying(false);
        setAudioElement(null);
      };
      audio.onerror = () => {
        setPlaying(false);
        setAudioElement(null);
      };
      setAudioElement(audio);
      await audio.play();
    } catch (err) {
      console.error(err);
      setPlaying(false);
      setAudioElement(null);
    }
  };

  const getSeverityConfig = (severity?: string) => {
    switch (severity) {
      case "CRITICAL":
        return {
          border: "border-l-red-500",
          bg: "bg-gradient-to-br from-red-50/80 to-red-100/40 dark:from-red-950/30 dark:to-red-950/10",
          badge: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
          glow: "shadow-red-500/10",
        };
      case "HIGH":
        return {
          border: "border-l-orange-500",
          bg: "bg-gradient-to-br from-orange-50/80 to-amber-100/40 dark:from-orange-950/30 dark:to-amber-950/10",
          badge: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
          glow: "shadow-orange-500/10",
        };
      case "MEDIUM":
        return {
          border: "border-l-yellow-500",
          bg: "bg-gradient-to-br from-yellow-50/80 to-amber-50/40 dark:from-yellow-950/30 dark:to-amber-950/10",
          badge: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
          glow: "shadow-yellow-500/10",
        };
      default:
        return {
          border: "border-l-emerald-500",
          bg: "bg-gradient-to-br from-emerald-50/80 to-teal-100/40 dark:from-emerald-950/30 dark:to-teal-950/10",
          badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
          glow: "shadow-emerald-500/10",
        };
    }
  };

  const quickActions = [
    {
      title: t("kisan.home.water.title"),
      desc: t("kisan.home.water.desc"),
      href: "/alerts?category=Water",
      icon: Droplet,
      metric: "Moisture: 22.4%",
      color: "from-blue-500 to-cyan-500",
      iconBg: "bg-blue-100 dark:bg-blue-900/30",
      iconColor: "text-blue-600 dark:text-blue-400",
    },
    {
      title: t("kisan.home.crop.title"),
      desc: t("kisan.home.crop.desc"),
      href: "/crop-advisor",
      icon: Sprout,
      metric: "NDVI: 0.68",
      color: "from-emerald-500 to-teal-500",
      iconBg: "bg-emerald-100 dark:bg-emerald-900/30",
      iconColor: "text-emerald-600 dark:text-emerald-400",
    },
    {
      title: t("kisan.home.weather.title"),
      desc: t("kisan.home.weather.desc"),
      href: "/predict",
      icon: CloudSun,
      metric: "31\u00B0C | 12.5mm",
      color: "from-amber-500 to-orange-500",
      iconBg: "bg-amber-100 dark:bg-amber-900/30",
      iconColor: "text-amber-600 dark:text-amber-400",
    },
    {
      title: t("kisan.home.advisory.title"),
      desc: t("kisan.home.advisory.desc"),
      href: "/alerts",
      icon: FileText,
      metric: unreadCount > 0 ? `${unreadCount} unread` : "Up to date",
      color: "from-teal-500 to-emerald-500",
      iconBg: "bg-teal-100 dark:bg-teal-900/30",
      iconColor: "text-teal-600 dark:text-teal-400",
    },
  ];

  const severityConfig = primaryAlert ? getSeverityConfig(primaryAlert.severity) : null;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 dark:from-emerald-900 dark:via-teal-900 dark:to-cyan-900" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMS41IiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDUpIi8+PC9zdmc+')] opacity-40" />

          <div className="relative container max-w-5xl mx-auto px-4 py-12 md:py-16">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-emerald-100/80 text-sm font-semibold tracking-wide uppercase">
                  <Sprout className="h-4 w-4" />
                  <span>Farm Operations</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-[1.1]">
                  Welcome back,
                  <br />
                  <span className="text-emerald-200">Farmer</span>
                </h1>
                <p className="text-lg text-emerald-100/70 font-medium max-w-md">
                  Your field intelligence dashboard. Weather, soil, and crop insights at a glance.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/alerts"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/15 hover:bg-white/25 backdrop-blur-sm text-white rounded-xl font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] border border-white/10"
                >
                  <Bell className="h-4 w-4" />
                  <span>Alerts</span>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </Link>
                <Link
                  href="/crop-advisor"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-emerald-700 hover:bg-emerald-50 rounded-xl font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-emerald-900/20"
                >
                  <Sprout className="h-4 w-4" />
                  <span>Crop Advisor</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Content */}
        <div className="container max-w-5xl mx-auto px-4 -mt-6 relative z-10 pb-12 space-y-8">
          {/* Primary Advisory */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <ShieldAlert className="h-5 w-5 text-red-500" />
              <h2 className="text-sm font-bold text-foreground tracking-wide uppercase">
                {t("kisan.home.advisory.primary")}
              </h2>
            </div>

            {primaryAlert ? (
              <div
                className={`rounded-2xl border-l-4 ${severityConfig?.border} ${severityConfig?.bg} p-6 md:p-8 shadow-lg ${severityConfig?.glow} backdrop-blur-sm`}
              >
                <div className="flex flex-wrap items-center gap-3 mb-5">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${severityConfig?.badge}`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                    {primaryAlert.severity}
                  </span>
                  <span className="px-3 py-1 bg-background/60 backdrop-blur-sm rounded-full text-xs font-bold text-muted-foreground uppercase tracking-wider border border-border/30">
                    {primaryAlert.category}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
                    <Clock className="h-3 w-3" />
                    {primaryAlert.source}
                  </span>
                </div>

                <div className="space-y-3 mb-6">
                  <h3 className="text-2xl md:text-3xl font-extrabold text-foreground leading-tight">
                    {t(primaryAlert.title, primaryAlert.params)}
                  </h3>
                  <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                    {t(primaryAlert.message, primaryAlert.params)}
                  </p>
                </div>

                <div className="p-4 bg-background/70 backdrop-blur-sm rounded-xl border border-border/30 mb-6">
                  <span className="text-xs font-bold text-primary uppercase tracking-widest block mb-1">
                    {t("dashboard.insight.action")}
                  </span>
                  <p className="text-lg md:text-xl font-bold text-foreground leading-snug">
                    {t(primaryAlert.recommendation, primaryAlert.params)}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    variant={playing ? "default" : "outline"}
                    size="lg"
                    onClick={handleListenPrimary}
                    className="h-12 px-6 font-bold gap-2.5 rounded-xl hover:scale-[1.01] active:scale-[0.99] transition-transform bg-background/80 backdrop-blur-sm"
                  >
                    {playing ? (
                      <>
                        <VolumeX className="h-5 w-5 animate-pulse text-red-500" />
                        <span>{t("kisan.button.listening")}</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="h-5 w-5" />
                        <span>{t("kisan.button.listen")}</span>
                      </>
                    )}
                  </Button>

                  {!primaryAlert.read && (
                    <Button
                      variant="secondary"
                      size="lg"
                      onClick={() => markRead(primaryAlert.id)}
                      className="h-12 px-6 font-bold rounded-xl gap-2 hover:scale-[1.01] active:scale-[0.99] transition-transform"
                    >
                      <CheckCircle2 className="h-5 w-5" />
                      {t("kisan.button.read")}
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-10 rounded-2xl border-2 border-dashed border-border/50 text-center bg-muted/20">
                <Sprout className="h-10 w-10 mx-auto text-emerald-500 mb-3" />
                <p className="text-base font-semibold text-muted-foreground">
                  {t("kisan.home.advisory.no_alerts")}
                </p>
                <p className="text-sm text-muted-foreground/60 mt-1">
                  All clear. No active advisories for your area.
                </p>
              </div>
            )}
          </section>

          {/* Quick Actions Grid */}
          <section>
            <h2 className="text-sm font-bold text-foreground tracking-wide uppercase mb-4">
              Quick Access
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {quickActions.map((action, idx) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={idx}
                    href={action.href}
                    className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card p-5 hover:shadow-lg hover:border-border transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br opacity-[0.07] group-hover:opacity-[0.12] transition-opacity rounded-bl-[100%] -mr-8 -mt-8"
                      style={{ background: `linear-gradient(135deg, var(--tw-gradient-stops))` }}
                    />

                    <div className="flex items-start gap-4">
                      <div className={`p-2.5 rounded-xl ${action.iconBg} flex-shrink-0`}>
                        <Icon className={`h-6 w-6 ${action.iconColor}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-foreground mb-0.5">
                          {action.title}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {action.desc}
                        </p>
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground/30 group-hover:text-muted-foreground/60 group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-1" />
                    </div>

                    <div className="mt-4 pt-3 border-t border-border/30 flex items-center justify-between">
                      <span className="text-sm font-bold text-muted-foreground">
                        {action.metric}
                      </span>
                      <span className="text-xs font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                        View details
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer id="contact" className="border-t bg-muted/30">
        <div className="container max-w-5xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <nav className="flex gap-5">
            <Link href="/#about" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              {t("footer.about")}
            </Link>
            <button
              onClick={() => setContactOpen(true)}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors text-left"
            >
              {t("footer.contact")}
            </button>
          </nav>
          <p className="text-xs text-muted-foreground">
            {t("footer.copyright")}
          </p>
        </div>
      </footer>

      <ContactSheet open={isContactOpen} onOpenChange={setContactOpen} />
    </div>
  );
}
