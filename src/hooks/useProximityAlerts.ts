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
  // Initialize state with localStorage values or defaults
  const [settings, setSettings] = useState<ProximitySettings>(loadSettings);
  const [alerts, setAlerts] = useState<ProximityAlert[]>([]);
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(() => new Set());

  // Track which reports we've already sent push notifications for
  // useRef (not useState) because we don't want to trigger re-renders when this changes
  const alertedIdsRef = useRef<Set<string>>(new Set());
  const alertsRef = useRef<ProximityAlert[]>([]);

  // Use our geolocation hook — only active when alerts are enabled
  const geo = useGeolocation(settings.enabled, 30000);

  // Load previously alerted IDs from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(ALERTED_KEY);
      if (stored) alertedIdsRef.current = new Set(JSON.parse(stored));
      console.log("📌 Loaded previously alerted reports:", Array.from(alertedIdsRef.current));
    } catch {}
  }, []);

  // Reset alerted IDs when page loads so users get notified again
  useEffect(() => {
    alertedIdsRef.current.clear();
    localStorage.removeItem(ALERTED_KEY);
    console.log("🔄 Page loaded - Reset alerted notifications, will send notifications again for nearby reports");
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

  // Keep alertsRef in sync with alerts state to avoid stale closures
  useEffect(() => {
    alertsRef.current = alerts;
  }, [alerts]);

  // Dismiss all alerts
  const dismissAll = useCallback(() => {
    setDismissedAlerts((prev) => new Set([...prev, ...alertsRef.current.map((a) => a.report.id)]));
  }, []);

  // Reset alerted IDs (for testing) — allows you to send notifications again for the same reports
  const resetAlertedIds = useCallback(() => {
    alertedIdsRef.current.clear();
    localStorage.removeItem(ALERTED_KEY);
    console.log("🔄 Reset alerted notifications - will now send notifications again for nearby reports");
  }, []);

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
        const alreadyAlerted = alertedIdsRef.current.has(report.id);
        const pushEnabled = settings.pushEnabled;
        console.log(`📬 Notification check for "${report.title}":`, {
          pushEnabled,
          alreadyAlerted,
          reportId: report.id,
        });

        if (pushEnabled && !alreadyAlerted) {
          console.log(`✅ CONDITIONS MET - Sending notification for "${report.title}"`);
          alertedIdsRef.current.add(report.id);
          sendPushNotification(report, distance);
        } else if (!pushEnabled) {
          console.warn(`⚠️ Push notifications disabled - skipping notification for "${report.title}"`);
        } else if (alreadyAlerted) {
          console.warn(`⚠️ Already alerted for "${report.title}" - skipping to avoid duplicates`);
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
      resetAlertedIds,         // For testing - resets notifications
      geolocation: geo,
    }),
    [settings, updateSettings, activeAlerts, alerts, dismissAlert, dismissAll, resetAlertedIds, geo]
  );

  return returnValue;
}

// Send a browser push notification
async function sendPushNotification(report: Report, distance: number) {
  console.log(`\n🔔 === NOTIFICATION SENDING STARTED for "${report.title}" ===`);

  // Check if Notification API is supported
  if (!("Notification" in window)) {
    console.error("❌ Notification API not supported in this browser");
    return;
  }
  console.log(`✅ Notification API supported`);

  // Check current permission
  console.log(`🔐 Current Notification permission: ${Notification.permission}`);

  // Request permission if not already granted
  if (Notification.permission === "default") {
    console.log("🔔 Requesting notification permission...");
    const permission = await Notification.requestPermission();
    console.log(`📋 Permission request result: ${permission}`);
    if (permission !== "granted") {
      console.error("❌ Notification permission denied by user");
      return;
    }
  }

  // Don't send if permission is denied
  if (Notification.permission !== "granted") {
    console.error(`❌ Notification permission not granted (current: ${Notification.permission})`);
    return;
  }

  console.log("✅ Notification permission is granted");

  const notificationTitle = "🚨 Nearby Safety Alert";
  const notificationBody = `${report.title} - ${Math.round(distance)}m away in ${report.township}. Reported ${formatDistanceToNow(new Date(report.createdAt), { addSuffix: true })}.`;

  const notificationOptions: NotificationOptionsWithVibration = {
    body: notificationBody,
    icon: "/alert.png",
    badge: "/alert.png",
    tag: `proximity-${report.id}`,
    vibrate: [200, 100, 200, 100, 200],
    data: { reportId: report.id },
    requireInteraction: true,
  };

  let notificationSent = false;

  try {
    // Check if service worker is registered and ready
    if ("serviceWorker" in navigator) {
      console.log("🔍 Service Worker API available");
      try {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          console.log(`✅ Service Worker is ready - attempting to send notification`);
          await registration.showNotification(notificationTitle, notificationOptions);
          console.log(`✅ Notification sent via Service Worker for "${report.title}"`);
          notificationSent = true;
          return;
        } else {
          console.warn("⚠️ Service Worker registration not found");
        }
      } catch (swError) {
        console.warn("⚠️ Service Worker notification failed:", swError);
      }
    } else {
      console.warn("⚠️ Service Worker API not available");
    }
  } catch (error) {
    console.warn("⚠️ Service Worker check failed:", error);
  }

  // Fallback to regular notification (works when tab is active)
  if (!notificationSent) {
    try {
      console.log(`📢 Sending fallback notification for "${report.title}"`);
      new Notification(notificationTitle, notificationOptions);
      console.log(`✅ Fallback notification sent for "${report.title}"`);
    } catch (error) {
      console.error("❌ Fallback notification failed:", error);
    }
  }

  console.log(`🔔 === NOTIFICATION SENDING COMPLETED ===\n`);
}
