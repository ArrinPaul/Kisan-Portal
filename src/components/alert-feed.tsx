"use client";

import React, { useState, useEffect } from "react";
import { 
  Droplet, 
  CloudSun, 
  Sprout, 
  Bug, 
  Waves, 
  Flame, 
  TrendingUp, 
  Info, 
  Volume2, 
  VolumeX, 
  Eye, 
  EyeOff, 
  Trash2,
  Clock
} from "lucide-react";
import { KisanAlert } from "@/lib/alerts/types";
import { useLanguage } from "@/hooks/use-language";
import { AlertBadge } from "./alert-badge";
import { Button } from "./ui/button";
import { textToSpeechAction } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface AlertFeedProps {
  alerts: KisanAlert[];
  onMarkRead?: (id: string) => void;
  onMarkUnread?: (id: string) => void;
  onDelete?: (id: string) => void;
  className?: string;
}

export function AlertFeed({ alerts, onMarkRead, onMarkUnread, onDelete, className }: AlertFeedProps) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if (audioElement) {
        audioElement.pause();
      }
    };
  }, [audioElement]);

  const getCategoryIcon = (category: KisanAlert["category"]) => {
    const sizeClass = "h-6 w-6 text-primary-foreground";
    switch (category) {
      case "Water":
        return <div className="p-3 bg-blue-600 rounded-full"><Droplet className={sizeClass} /></div>;
      case "Weather":
        return <div className="p-3 bg-sky-500 rounded-full"><CloudSun className={sizeClass} /></div>;
      case "Crop":
        return <div className="p-3 bg-emerald-600 rounded-full"><Sprout className={sizeClass} /></div>;
      case "Disease":
        return <div className="p-3 bg-red-500 rounded-full"><Bug className={sizeClass} /></div>;
      case "Flood":
        return <div className="p-3 bg-indigo-600 rounded-full"><Waves className={sizeClass} /></div>;
      case "Drought":
        return <div className="p-3 bg-amber-600 rounded-full"><Flame className={sizeClass} /></div>;
      case "Yield":
        return <div className="p-3 bg-purple-600 rounded-full"><TrendingUp className={sizeClass} /></div>;
      case "Advisory":
      default:
        return <div className="p-3 bg-teal-600 rounded-full"><Info className={sizeClass} /></div>;
    }
  };

  const getCategoryLabel = (category: KisanAlert["category"]) => {
    // Return localized category name or standard category
    const key = `kisan.category.${category.toLowerCase()}`;
    const trans = t(key);
    return trans === key ? category : trans;
  };

  const handleListen = async (alert: KisanAlert) => {
    // If already playing this alert, stop it
    if (playingId === alert.id && audioElement) {
      audioElement.pause();
      setPlayingId(null);
      setAudioElement(null);
      return;
    }

    // Stop currently playing audio
    if (audioElement) {
      audioElement.pause();
      setAudioElement(null);
    }

    setPlayingId(alert.id);

    try {
      const title = t(alert.title, alert.params);
      const message = t(alert.message, alert.params);
      const rec = t(alert.recommendation, alert.params);
      const speechText = `${title}. ${message}. ${rec}`;

      const res = await textToSpeechAction(speechText);

      if (res.error || !res.data?.audioDataUri) {
        toast({
          title: t("chatbot.error.audio.title") || "Audio Error",
          description: res.error || t("chatbot.error.audio.description") || "Could not generate audio.",
          variant: "destructive",
        });
        setPlayingId(null);
        return;
      }

      const audio = new Audio(res.data.audioDataUri);
      
      audio.onended = () => {
        setPlayingId(null);
        setAudioElement(null);
      };

      audio.onerror = () => {
        toast({
          title: t("chatbot.error.audio.title") || "Audio Error",
          description: "Playback failed.",
          variant: "destructive",
        });
        setPlayingId(null);
        setAudioElement(null);
      };

      setAudioElement(audio);
      await audio.play();
    } catch (err) {
      console.error("TTS play error:", err);
      setPlayingId(null);
      setAudioElement(null);
      toast({
        title: "Playback Error",
        description: "An unexpected error occurred during playback.",
        variant: "destructive",
      });
    }
  };

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return isoString;
    }
  };

  if (alerts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-card border rounded-lg shadow-sm">
        <Info className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-lg font-medium text-muted-foreground">
          {t("kisan.alerts.empty")}
        </p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className={cn(
            "relative flex flex-col md:flex-row gap-4 p-5 border rounded-xl shadow-sm transition-all bg-card hover:shadow-md",
            !alert.read ? "border-l-4 border-l-primary ring-1 ring-primary/10" : ""
          )}
        >
          {/* Unread dot indicator */}
          {!alert.read && (
            <span className="absolute top-3 right-3 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-primary"></span>
            </span>
          )}

          {/* Left: Category Icon */}
          <div className="flex-shrink-0 flex items-center md:items-start">
            {getCategoryIcon(alert.category)}
          </div>

          {/* Center: Alert Content */}
          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <AlertBadge severity={alert.severity} />
              <span className="text-xs font-semibold px-2 py-0.5 bg-muted rounded text-muted-foreground">
                {getCategoryLabel(alert.category)}
              </span>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatTime(alert.timestamp)}
              </span>
            </div>

            <h3 className="text-xl font-bold tracking-tight text-foreground md:text-2xl">
              {t(alert.title, alert.params)}
            </h3>

            <p className="text-base text-muted-foreground font-medium md:text-lg">
              {t(alert.message, alert.params)}
            </p>

            <div className="p-3 bg-muted/50 rounded-lg border border-muted">
              <span className="text-xs font-bold text-primary block uppercase tracking-wider mb-1">
                {t("dashboard.insight.action")}
              </span>
              <p className="text-base text-foreground font-semibold md:text-lg">
                {t(alert.recommendation, alert.params)}
              </p>
            </div>
            
            <div className="text-xs text-muted-foreground/80 mt-1">
              {t("dashboard.summary.status")}: {alert.source}
            </div>
          </div>

          {/* Right: Actions Section */}
          <div className="flex flex-row md:flex-col justify-end items-center md:items-stretch gap-2 border-t pt-3 md:border-t-0 md:pt-0 md:pl-4 md:border-l border-muted">
            {/* Listen Button (accessibility voice guidance) */}
            <Button
              variant={playingId === alert.id ? "default" : "outline"}
              size="lg"
              onClick={() => handleListen(alert)}
              className="flex-1 md:flex-initial h-12 px-4 gap-2 font-bold min-w-[120px] rounded-lg shadow hover:scale-[1.02] active:scale-[0.98] transition-transform text-base"
              aria-label={playingId === alert.id ? "Stop Listening" : "Listen to Advisory"}
            >
              {playingId === alert.id ? (
                <>
                  <VolumeX className="h-5 w-5 animate-pulse" />
                  <span>{t("kisan.button.listening")}</span>
                </>
              ) : (
                <>
                  <Volume2 className="h-5 w-5" />
                  <span>{t("kisan.button.listen")}</span>
                </>
              )}
            </Button>

            {/* Read/Unread toggles & delete */}
            <div className="flex gap-2">
              {alert.read ? (
                onMarkUnread && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onMarkUnread(alert.id)}
                    className="h-12 w-12 rounded-lg border border-muted hover:bg-muted"
                    title={t("kisan.button.unread")}
                    aria-label="Mark as unread"
                  >
                    <EyeOff className="h-5 w-5" />
                  </Button>
                )
              ) : (
                onMarkRead && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onMarkRead(alert.id)}
                    className="h-12 w-12 rounded-lg border border-muted hover:bg-muted"
                    title={t("kisan.button.read")}
                    aria-label="Mark as read"
                  >
                    <Eye className="h-5 w-5" />
                  </Button>
                )
              )}

              {onDelete && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(alert.id)}
                  className="h-12 w-12 text-destructive hover:bg-destructive/10 rounded-lg border border-destructive/20"
                  title="Delete Alert"
                  aria-label="Delete Alert"
                >
                  <Trash2 className="h-5 w-5" />
                </Button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
