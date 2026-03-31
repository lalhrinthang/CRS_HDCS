import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Report } from "@/types/report";
import { haversineDistance } from "@/lib/haversine";
import { useGeolocation } from "./useGeolocation";
import { formatDistanceToNow } from "date-fns";

// Extended NotificationOptions to include vibrate (part of spec but missing from TypeScript types)
interface NotificationOptionsWithVibration extends NotificationOptions {
  vibrate?: VibratePattern;
}

// An alert = a report + how far away it is
export interface ProximityAlert {
  report: Report;
  distance: number;    // in meters
  timestamp: Date;
}

// User's alert preferences
export interface ProximitySettings {
  enabled: boolean;
  radius: number;       // in meters (e.g., 1000 = 1km)
  pushEnabled: boolean;
}

const SETTINGS_KEY = "proximity-alert-settings";
const ALERTED_KEY = "proximity-alerted-ids";

// Load settings from localStorage (or return defaults)
function loadSettings(): ProximitySettings {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return { enabled: false, radius: 1000, pushEnabled: false };
}

// Save settings to localStorage
function saveSettings(settings: ProximitySettings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function useProximityAlerts(reports: Report[]) {
  // Initialize state with defaults
  const [settings, setSettings] = useState<ProximitySettings>(() => ({
    enabled: false,
    radius: 1000,
    pushEnabled: false,
  }));
  const [alerts, setAlerts] = useState<ProximityAlert[]>([]);
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(() => new Set());

  // Load settings from localStorage after hydration
  useEffect(() => {
    const stored = loadSettings();
    setSettings(stored);
  }, []);

  // Track which reports we've already sent push notifications for
  // useRef (not useState) because we don't want to trigger re-renders when this changes
  const alertedIdsRef = useRef<Set<string>>(new Set());

  // Use our geolocation hook — only active when alerts are enabled
  const geo = useGeolocation(settings.enabled, 30000);

  // Load previously alerted IDs from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(ALERTED_KEY);
      if (stored) alertedIdsRef.current = new Set(JSON.parse(stored));
    } catch {}
  }, []);

  // Update settings (partial update — only change what's passed)
  const updateSettings = useCallback((partial: Partial<ProximitySettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...partial };
      saveSettings(next);
      return next;
    });
  }, []);

  // Dismiss a single alert
  const dismissAlert = useCallback((reportId: string) => {
    setDismissedAlerts((prev) => new Set(prev).add(reportId));
  }, []);

  // Dismiss all alerts
  const dismissAll = useCallback(() => {
    setDismissedAlerts((prev) => new Set([...prev, ...alerts.map((a) => a.report.id)]));
  }, [alerts]);

  // THE CORE LOGIC: Check proximity whenever location or reports change
  useEffect(() => {
    // If alerts are disabled or we don't have a location, clear alerts
    if (!settings.enabled || geo.latitude === null || geo.longitude === null) {
      if (settings.enabled) {
        console.warn("Alerts enabled but location not available:", { enabled: settings.enabled, lat: geo.latitude, lng: geo.longitude });
      }
      setAlerts([]);
      return;
    }

    console.log("🔍 Checking proximity alerts from location:", { lat: geo.latitude, lng: geo.longitude });

    const nearbyAlerts: ProximityAlert[] = [];

    // Check every report
    for (const report of reports) {
      // Skip archived reports
      if (report.status === "archived") continue;

      // Calculate distance from user to this report
      const distance = haversineDistance(
        geo.latitude,
        geo.longitude,
        report.latitude,
        report.longitude
      );

      // Log each report being checked
      console.log(`📍 Report "${report.title}" in ${report.township}: ${Math.round(distance)}m away (radius: ${settings.radius}m)`);

      // If within radius, it's an alert!
      if (distance <= settings.radius) {
        console.log(`✅ WITHIN RADIUS: "${report.title}" (${Math.round(distance)}m)`);
        nearbyAlerts.push({
          report,
          distance,
          timestamp: new Date(),
        });

        // Send push notification for NEW alerts only
        if (settings.pushEnabled && !alertedIdsRef.current.has(report.id)) {
          console.log(`📢 Sending push notification for "${report.title}"`);
          alertedIdsRef.current.add(report.id);
          sendPushNotification(report, distance);
        }
      }
    }

    // Sort by closest first
    nearbyAlerts.sort((a, b) => a.distance - b.distance);
    setAlerts(nearbyAlerts);
    console.log(`Found ${nearbyAlerts.length} nearby alerts`);

    // Remember which reports we've alerted about
    localStorage.setItem(
      ALERTED_KEY,
      JSON.stringify([...alertedIdsRef.current])
    );
  }, [geo.latitude, geo.longitude, reports, settings.enabled, settings.radius, settings.pushEnabled]);

  // Filter out dismissed alerts for the "active" list
  const activeAlerts = useMemo(
    () => alerts.filter((a) => !dismissedAlerts.has(a.report.id)),
    [alerts, dismissedAlerts]
  );

  // Memoize the return object to prevent unnecessary re-renders in the parent component
  const returnValue = useMemo(
    () => ({
      settings,
      updateSettings,
      alerts: activeAlerts,    // Alerts minus dismissed ones
      allAlerts: alerts,       // All alerts (for the Alerts page)
      dismissAlert,
      dismissAll,
      geolocation: geo,
    }),
    [settings, updateSettings, activeAlerts, alerts, dismissAlert, dismissAll, geo]
  );

  return returnValue;
}

// Send a browser push notification
async function sendPushNotification(report: Report, distance: number) {
  // Check if Notification API is supported
  if (!("Notification" in window)) {
    console.warn("Notification API not supported in this browser");
    return;
  }

  // Request permission if not already granted
  if (Notification.permission === "default") {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.warn("Notification permission denied by user");
      return;
    }
  }

  // Don't send if permission is denied
  if (Notification.permission !== "granted") {
    console.warn("Notification permission not granted");
    return;
  }

  const notificationOptions: NotificationOptionsWithVibration = {
    body: `${report.title} - ${Math.round(distance)}m away in ${report.township}. Reported ${formatDistanceToNow(new Date(report.createdAt), { addSuffix: true })}.`,
    icon: "/favicon.ico",
    badge: "/favicon.ico",
    tag: `proximity-${report.id}`,  // Prevents duplicate notifications
    vibrate: [200, 100, 200, 100, 200], // Vibration pattern (milliseconds)
    data: { reportId: report.id },
  };

  try {
    // Try service worker notification first (works even when tab is in background)
    // This only works if a service worker is registered
    if (navigator.serviceWorker?.ready) {
      try {
        const reg = await navigator.serviceWorker.ready;
        console.log("Sending notification via service worker", report.id);
        await reg.showNotification("🚨 Nearby Safety Alert", notificationOptions);
        return;
      } catch (swError) {
        console.warn("Service worker notification failed, falling back:", swError);
      }
    }
  } catch (error) {
    console.warn("Service worker check failed:", error);
  }

  // Fallback to regular notification (works when tab is active)
  try {
    console.log("Sending fallback notification", report.id, "- Title:", notificationOptions.body);
    new Notification("🚨 Nearby Safety Alert", notificationOptions);
  } catch (error) {
    console.error("Fallback notification failed:", error);
  }
}
