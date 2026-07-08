"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Header } from "@/components/header";
import { KisanHomeCards } from "@/components/kisan-home-cards";
import { useAlerts } from "@/hooks/use-alerts";
import { useLanguage } from "@/hooks/use-language";
import { AlertBadge } from "@/components/alert-badge";
import { Button } from "@/components/ui/button";
import { textToSpeechAction } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import { 
  Volume2, 
  VolumeX, 
  Bell, 
  ShieldAlert, 
  Sprout
} from "lucide-react";
import { ContactSheet } from "@/components/contact-sheet";

export default function KisanPage() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const { alerts, unreadCount, markRead } = useAlerts();
  const [isContactOpen, setContactOpen] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  // Find the primary advisory alert: highest severity among unread alerts.
  // Fallback to the latest alert overall if all are read.
  const primaryAlert = (() => {
    const unread = alerts.filter(a => !a.read);
    const listToSearch = unread.length > 0 ? unread : alerts;
    if (listToSearch.length === 0) return null;

    const severityScore = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
    return [...listToSearch].sort((a, b) => {
      // Sort by severity score desc, then by timestamp desc
      const diff = severityScore[b.severity] - severityScore[a.severity];
      if (diff !== 0) return diff;
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    })[0];
  })();

  // Cleanup TTS on unmount
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

  const getPrimaryAlertBorder = (severity?: string) => {
    switch (severity) {
      case "CRITICAL":
        return "border-red-500 bg-red-50/50 dark:bg-red-950/10";
      case "HIGH":
        return "border-orange-500 bg-orange-50/50 dark:bg-orange-950/10";
      case "MEDIUM":
        return "border-yellow-500 bg-yellow-50/50 dark:bg-yellow-950/10";
      default:
        return "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/10";
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      
      <main className="flex-1 container px-4 py-8 max-w-5xl space-y-8">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-emerald-600 to-teal-700 dark:from-emerald-800 dark:to-teal-900 rounded-3xl p-6 md:p-8 text-white shadow-md">
          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl">
              Namaste & Hello!
            </h1>
            <p className="text-lg md:text-xl font-medium text-emerald-100">
              Welcome back to your farm advisory cockpit.
            </p>
          </div>
          <Link
            href="/alerts"
            className="inline-flex items-center justify-center h-14 px-6 bg-white text-emerald-900 hover:bg-emerald-50 active:scale-95 transition-transform text-lg font-bold rounded-2xl shadow-sm self-start md:self-auto gap-2"
          >
            <Bell className="h-5 w-5" />
            <span>{t("kisan.alerts.title")}</span>
            {unreadCount > 0 && (
              <span className="ml-1 px-2.5 py-0.5 bg-red-600 text-white rounded-full text-sm font-bold animate-pulse">
                {unreadCount}
              </span>
            )}
          </Link>
        </div>

        {/* Primary Advisory Banner */}
        <section className="space-y-4">
          <h2 className="text-2xl font-black text-foreground tracking-tight uppercase flex items-center gap-2">
            <ShieldAlert className="h-6 w-6 text-red-500" />
            <span>{t("kisan.home.advisory.primary")}</span>
          </h2>

          {primaryAlert ? (
            <div
              className={`p-6 border-3 rounded-3xl shadow-sm space-y-4 md:space-y-6 ${getPrimaryAlertBorder(
                primaryAlert.severity
              )}`}
            >
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <AlertBadge severity={primaryAlert.severity} className="text-sm px-3 py-1 font-black" />
                  <span className="text-sm font-black px-3 py-1 bg-muted rounded-lg text-muted-foreground uppercase tracking-wider">
                    {primaryAlert.category}
                  </span>
                </div>
                <span className="text-sm text-muted-foreground font-semibold">
                  Source: {primaryAlert.source}
                </span>
              </div>

              <div className="space-y-3">
                <h3 className="text-2xl sm:text-3xl font-black text-foreground leading-tight">
                  {t(primaryAlert.title, primaryAlert.params)}
                </h3>
                <p className="text-lg sm:text-xl text-muted-foreground font-medium leading-relaxed">
                  {t(primaryAlert.message, primaryAlert.params)}
                </p>
              </div>

              {/* Recommendation Panel */}
              <div className="p-4 bg-background border border-muted rounded-2xl shadow-inner space-y-1">
                <span className="text-xs sm:text-sm font-black text-primary uppercase tracking-widest block">
                  {t("dashboard.insight.action")}
                </span>
                <p className="text-xl sm:text-2xl font-bold text-foreground leading-snug">
                  {t(primaryAlert.recommendation, primaryAlert.params)}
                </p>
              </div>

              {/* Interaction Panel */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button
                  variant={playing ? "default" : "outline"}
                  size="lg"
                  onClick={handleListenPrimary}
                  className="h-14 px-6 text-lg font-bold gap-3 rounded-2xl flex-1 shadow hover:scale-[1.01] active:scale-[0.99] transition-transform"
                >
                  {playing ? (
                    <>
                      <VolumeX className="h-6 w-6 animate-pulse text-red-500" />
                      <span>{t("kisan.button.listening")}</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="h-6 w-6" />
                      <span>{t("kisan.button.listen")}</span>
                    </>
                  )}
                </Button>

                {!primaryAlert.read && (
                  <Button
                    variant="secondary"
                    size="lg"
                    onClick={() => markRead(primaryAlert.id)}
                    className="h-14 px-6 text-lg font-bold rounded-2xl flex-1 shadow hover:scale-[1.01] active:scale-[0.99] transition-transform"
                  >
                    {t("kisan.button.read")}
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="p-8 border-2 border-dashed rounded-3xl text-center bg-muted/20">
              <Sprout className="h-12 w-12 mx-auto text-emerald-600 dark:text-emerald-500 mb-3" />
              <p className="text-lg font-bold text-muted-foreground">
                {t("kisan.home.advisory.no_alerts")}
              </p>
            </div>
          )}
        </section>

        {/* Home Navigation Cards */}
        <section className="space-y-4">
          <h2 className="text-2xl font-black text-foreground tracking-tight uppercase">
            Farm Operations & Planning
          </h2>
          <KisanHomeCards unreadAlertsCount={unreadCount} />
        </section>
      </main>

      {/* Footer */}
      <footer id="contact" className="py-8 w-full border-t bg-muted/10 mt-12">
        <div className="container max-w-5xl px-4 flex flex-col sm:flex-row items-center justify-between gap-6">
          <nav className="flex gap-6 font-semibold">
            <Link href="/#about" className="hover:underline text-muted-foreground">{t("footer.about")}</Link>
            <button onClick={() => setContactOpen(true)} className="hover:underline text-muted-foreground text-left">
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
