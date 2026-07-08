"use client";

import { useState, useEffect, useCallback } from "react";
import type { KisanAlert } from "@/lib/alerts/types";
import { getAggregatedAlerts } from "@/lib/alerts/aggregate";

const STORAGE_KEY = "kisan-alerts";
const HISTORY_STORAGE_KEY = "earth-insights.dashboard-history";

// Default alerts for initial onboarding/fallback
export const defaultAlerts: KisanAlert[] = [
  {
    id: "default-flood",
    severity: "CRITICAL",
    category: "Flood",
    title: "alerts.rules.flood_warning.title",
    message: "alerts.rules.flood_warning.message",
    recommendation: "alerts.rules.flood_warning.recommendation",
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 hours ago
    source: "Climate Risk Engine",
    read: false,
  },
  {
    id: "default-moisture",
    severity: "HIGH",
    category: "Water",
    title: "alerts.rules.soil_moisture_low.title",
    message: "alerts.rules.soil_moisture_low.message",
    recommendation: "alerts.rules.soil_moisture_low.recommendation",
    timestamp: new Date(Date.now() - 3600000 * 5).toISOString(), // 5 hours ago
    source: "Soil Moisture Predictor",
    read: false,
    params: { moisture: 18.5 },
  },
  {
    id: "default-rain",
    severity: "MEDIUM",
    category: "Weather",
    title: "alerts.rules.heavy_rain.title",
    message: "alerts.rules.heavy_rain.message",
    recommendation: "alerts.rules.heavy_rain.recommendation",
    timestamp: new Date(Date.now() - 3600000 * 24).toISOString(), // 1 day ago
    source: "Weather Forecast API",
    read: true,
    params: { rain: 15.0 },
  },
  {
    id: "default-advisory",
    severity: "LOW",
    category: "Advisory",
    title: "alerts.rules.crop_advisory.title",
    message: "alerts.rules.crop_advisory.message",
    recommendation: "alerts.rules.crop_advisory.recommendation",
    timestamp: new Date(Date.now() - 3600000 * 48).toISOString(), // 2 days ago
    source: "AI Advisor",
    read: false,
  }
];

const showNotification = async (title: string, options: NotificationOptions) => {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission !== "granted") return;

  if ("serviceWorker" in navigator) {
    try {
      const reg = await navigator.serviceWorker.ready;
      await reg.showNotification(title, options);
      return;
    } catch (e) {
      console.warn("Failed to show notification via service worker, falling back to standard notification:", e);
    }
  }

  try {
    new Notification(title, options);
  } catch (e) {
    console.error("Standard Notification creation failed:", e);
  }
};

const getReadableMessage = (key: string, params?: Record<string, string | number>) => {
  if (key.includes("soil_moisture_low")) {
    return `Soil moisture is extremely low (${params?.moisture || "N/A"}% VWC). Please irrigate.`;
  }
  if (key.includes("soil_moisture_high")) {
    return `Soil moisture is high (${params?.moisture || "N/A"}% VWC). Watch for waterlogging.`;
  }
  if (key.includes("heavy_rain")) {
    return `Heavy rain forecasted (${params?.rain || "N/A"} mm). Adjust scheduling.`;
  }
  if (key.includes("flood_warning")) {
    return "Critical flood risk detected in your area.";
  }
  if (key.includes("drought_warning")) {
    return "Critical drought risk detected in your area.";
  }
  if (key.includes("extreme_heat")) {
    return `Extreme heat forecasted (${params?.temp || "N/A"}°C). Protect crops.`;
  }
  if (key.includes("strong_winds")) {
    return `Strong winds forecasted (${params?.wind || "N/A"} km/h). Secure structures.`;
  }
  return key;
};

export function useAlerts(customLat?: number, customLon?: number) {
  const [alerts, setAlerts] = useState<KisanAlert[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>("default");

  const loadAlerts = useCallback(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setAlerts(JSON.parse(stored));
      } catch {
        setAlerts(defaultAlerts);
      }
    } else {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultAlerts));
      setAlerts(defaultAlerts);
    }
  }, []);

  useEffect(() => {
    loadAlerts();

    if (typeof window !== "undefined" && "Notification" in window) {
      setPermissionStatus(Notification.permission);
    }

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        loadAlerts();
      }
    };

    const handleCustomChange = () => {
      loadAlerts();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("kisan-alerts-changed", handleCustomChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("kisan-alerts-changed", handleCustomChange);
    };
  }, [loadAlerts]);

  // Request browser notification permission
  const requestPermission = useCallback(async (): Promise<NotificationPermission> => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return "default";
    }
    const permission = await Notification.requestPermission();
    setPermissionStatus(permission);
    return permission;
  }, []);

  // Register service worker on mount
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          console.log("Service Worker registered successfully with scope:", reg.scope);
        })
        .catch((err) => {
          console.error("Service Worker registration failed:", err);
        });
    }
  }, []);

  const triggerBrowserNotification = useCallback((alert: KisanAlert) => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission !== "granted") return;

    const title = `Kisan Alert: ${alert.severity}`;
    const body = getReadableMessage(alert.message, alert.params);

    const options: NotificationOptions = {
      body,
      icon: "/logo.png",
      badge: "/badge.png",
      tag: alert.id,
      data: alert,
    };

    showNotification(title, options);
  }, []);

  // Fetch alerts and merge
  const refresh = useCallback(async () => {
    if (typeof window === "undefined") return;

    let latitude = customLat;
    let longitude = customLon;

    // If coordinates are not provided, try to extract them from dashboard history
    if (latitude === undefined || longitude === undefined) {
      const historyRaw = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (historyRaw) {
        try {
          const parsed = JSON.parse(historyRaw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const latest = parsed[0];
            if (latest.lat && latest.lon) {
              latitude = parseFloat(latest.lat);
              longitude = parseFloat(latest.lon);
            }
          }
        } catch (e) {
          console.error("Failed to parse history for alerts location", e);
        }
      }
    }

    // Default coordinates: Central/North Indian agricultural belt if none found (e.g., Lucknow area)
    if (latitude === undefined || longitude === undefined || isNaN(latitude) || isNaN(longitude)) {
      latitude = 26.8467;
      longitude = 80.9462;
    }

    setLoading(true);
    setError(null);

    try {
      const fetched = await getAggregatedAlerts(latitude, longitude);

      setAlerts((prevAlerts) => {
        const existingMap = new Map(prevAlerts.map((a) => [a.id, a]));
        const mergedMap = new Map<string, KisanAlert>();

        // Add existing alerts to map
        prevAlerts.forEach((a) => mergedMap.set(a.id, a));

        // Add or update fetched alerts
        fetched.forEach((newAlert) => {
          const existing = existingMap.get(newAlert.id);
          if (existing) {
            // Keep the read status of existing alerts
            mergedMap.set(newAlert.id, { ...newAlert, read: existing.read });
          } else {
            // New alert detected!
            mergedMap.set(newAlert.id, newAlert);
            if (newAlert.severity === "HIGH" || newAlert.severity === "CRITICAL") {
              triggerBrowserNotification(newAlert);
            }
          }
        });

        const finalAlerts = Array.from(mergedMap.values()).sort(
          (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );

        // Defer side-effects outside the state updater execution context
        setTimeout(() => {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(finalAlerts));
          window.dispatchEvent(new Event("kisan-alerts-changed"));
        }, 0);

        return finalAlerts;
      });
    } catch (err) {
      console.error("Error aggregating alerts:", err);
      setError(err instanceof Error ? err.message : "An error occurred while aggregating alerts.");
    } finally {
      setLoading(false);
    }
  }, [customLat, customLon, triggerBrowserNotification]);

  // Periodic polling every 30 seconds
  useEffect(() => {
    refresh();

    const intervalId = setInterval(() => {
      refresh();
    }, 30000);

    return () => clearInterval(intervalId);
  }, [refresh]);

  const markRead = useCallback((id: string) => {
    setAlerts((prev) => {
      const updated = prev.map((a) => (a.id === id ? { ...a, read: true } : a));
      setTimeout(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        window.dispatchEvent(new Event("kisan-alerts-changed"));
      }, 0);
      return updated;
    });
  }, []);

  const markUnread = useCallback((id: string) => {
    setAlerts((prev) => {
      const updated = prev.map((a) => (a.id === id ? { ...a, read: false } : a));
      setTimeout(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        window.dispatchEvent(new Event("kisan-alerts-changed"));
      }, 0);
      return updated;
    });
  }, []);

  const markAllRead = useCallback(() => {
    setAlerts((prev) => {
      const updated = prev.map((a) => ({ ...a, read: true }));
      setTimeout(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        window.dispatchEvent(new Event("kisan-alerts-changed"));
      }, 0);
      return updated;
    });
  }, []);

  const deleteAlert = useCallback((id: string) => {
    setAlerts((prev) => {
      const updated = prev.filter((a) => a.id !== id);
      setTimeout(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        window.dispatchEvent(new Event("kisan-alerts-changed"));
      }, 0);
      return updated;
    });
  }, []);

  const addAlert = useCallback((alert: Omit<KisanAlert, "read" | "timestamp">) => {
    const fullAlert: KisanAlert = {
      ...alert,
      read: false,
      timestamp: new Date().toISOString(),
    };
    setAlerts((prev) => {
      const updated = [fullAlert, ...prev];
      setTimeout(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        window.dispatchEvent(new Event("kisan-alerts-changed"));
      }, 0);
      return updated;
    });
  }, []);

  const unreadCount = alerts.filter((a) => !a.read).length;

  // Sync unreadCount with app badge if supported
  useEffect(() => {
    if (typeof window !== "undefined" && "setAppBadge" in navigator) {
      if (unreadCount > 0) {
        navigator.setAppBadge(unreadCount).catch((err) => console.error("Error setting app badge:", err));
      } else {
        navigator.clearAppBadge().catch((err) => console.error("Error clearing app badge:", err));
      }
    }
  }, [unreadCount]);

  return {
    alerts,
    unreadCount,
    loading,
    error,
    refresh,
    markRead,
    markUnread,
    markAllRead,
    deleteAlert,
    addAlert,
    permissionStatus,
    requestPermission,
  };
}
