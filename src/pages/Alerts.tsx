import { useState, useMemo, useCallback } from "react";
import { Bell, BellOff, MapPin, Settings, AlertTriangle, Wifi, WifiOff, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Layout from "@/components/layout/Layout";
import YangonMap from "@/components/map/YangonMap";
import { useReports } from "@/hooks/useReports";
import { useProximityAlerts } from "@/hooks/useProximityAlerts";
import { CATEGORY_LABELS, CATEGORY_COLORS, Report } from "@/types/report";
import { formatDistanceToNow } from "date-fns";

const Alerts = () => {
  // Fetch reports from API
  const { data: apiReports = [], isLoading, error } = useReports();

  // Transform API reports to match Report type (convert township object to string)
  const reports: Report[] = useMemo(
    () => {
      if (!apiReports || apiReports.length === 0) return [];
      return apiReports.map((apiReport) => ({
        id: apiReport.id,
        title: apiReport.title,
        description: apiReport.description,
        category: apiReport.category as any,
        status: apiReport.status as any,
        latitude: apiReport.latitude,
        longitude: apiReport.longitude,
        township: apiReport.township.name,
        createdAt: apiReport.createdAt,
        updatedAt: apiReport.updatedAt,
        photoUrl: apiReport.photoUrl,
      }));
    },
    [apiReports]
  );

  const {
    settings,
    updateSettings,
    alerts,
    dismissAlert,
    dismissAll,
    geolocation,
  } = useProximityAlerts(reports);

  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // Memoize event handlers to prevent infinite loop issues with Radix UI Switch
  const handleToggleAlerts = useCallback(
    (checked: boolean) => {
      updateSettings({ enabled: checked });
    },
    [updateSettings]
  );

  const handleRadiusChange = useCallback(
    ([value]: number[]) => {
      updateSettings({ radius: value });
    },
    [updateSettings]
  );

  const handleTogglePushNotifications = useCallback(
    (checked: boolean) => {
      if (checked) {
        requestNotificationPermission();
      } else {
        updateSettings({ pushEnabled: false });
      }
    },
    [updateSettings]
  );

  // Filter alerts by category
  const filteredAlerts =
    categoryFilter === "all"
      ? alerts
      : alerts.filter((a) => a.report.category === categoryFilter);

  // Request browser notification permission
  const requestNotificationPermission = useCallback(async () => {
    if (!("Notification" in window)) return;
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      updateSettings({ pushEnabled: true });
    }
  }, [updateSettings]);

  // Send a test notification to verify setup
  const sendTestNotification = useCallback(async () => {
    if (Notification.permission !== "granted") {
      await requestNotificationPermission();
      return;
    }

    const testOptions = {
      body: "This is a test notification - it works! 🎉",
      icon: "/alert.png",
      badge: "/alert.png",
      tag: "test-notification",
      vibrate: [200, 100, 200],
      requireInteraction: true,
    };

    try {
      // Try service worker first
      if ("serviceWorker" in navigator) {
        const registration = await navigator.serviceWorker.ready;
        if (registration) {
          console.log("📢 Sending test notification via Service Worker");
          await registration.showNotification("✅ Test Notification", testOptions);
          return;
        }
      }
    } catch (error) {
      console.warn("Service Worker test notification failed:", error);
    }

    // Fallback
    try {
      console.log("📢 Sending test notification via fallback");
      new Notification("✅ Test Notification", testOptions);
    } catch (error) {
      console.error("Test notification failed:", error);
    }
  }, [requestNotificationPermission]);

  return (
    <Layout>
      <div className="container py-6 space-y-6 mb-16 md:mb-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Bell className="h-6 w-6" />
              Proximity Alerts
            </h1>
            <p className="text-muted-foreground">
              Get notified about safety hazards near your location
            </p>
          </div>
        </div>

        {/* ===== LOADING STATE ===== */}
        {isLoading && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Loading reports...</p>
            </CardContent>
          </Card>
        )}

        {/* ===== ERROR STATE ===== */}
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Failed to load reports: {error.message}
            </AlertDescription>
          </Alert>
        )}

        {/* ===== SETTINGS CARD ===== */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Alert Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Enable/Disable toggle */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Enable Proximity Alerts</p>
                <p className="text-sm text-muted-foreground">
                  Track your location and alert you about nearby hazards
                </p>
              </div>
              <Switch
                checked={settings.enabled}
                onCheckedChange={handleToggleAlerts}
              />
            </div>

            {/* Radius slider — only shown when enabled */}
            {settings.enabled && (
              <>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">Alert Radius</p>
                    <Badge variant="secondary">{settings.radius}m</Badge>
                  </div>
                  <Slider
                    value={[settings.radius]}
                    onValueChange={handleRadiusChange}
                    min={200}
                    max={5000}
                    step={100}
                    disabled={false}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>200m</span>
                    <span>5km</span>
                  </div>
                </div>

                {/* Push notifications toggle */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Push Notifications</p>
                    <p className="text-sm text-muted-foreground">
                      Receive browser notifications for new nearby activity
                    </p>
                  </div>
                  <Switch
                    checked={settings.pushEnabled}
                    onCheckedChange={handleTogglePushNotifications}
                  />
                </div>

                {/* Test notification button */}
                {settings.pushEnabled && (
                  <div className="space-y-2">
                    <Button
                      onClick={sendTestNotification}
                      variant="outline"
                      className="w-full gap-2"
                    >
                      <Send className="h-4 w-4" />
                      Send Test Notification
                    </Button>
                  </div>
                )}
              </>
            )}

            {/* Location status */}
            <div className="flex items-center gap-2 text-sm">
              {geolocation.latitude ? (
                <>
                  <Wifi className="h-4 w-4 text-green-500" />
                  <span className="text-green-600">
                    Location active ({geolocation.latitude.toFixed(4)},{" "}
                    {geolocation.longitude?.toFixed(4)})
                  </span>
                </>
              ) : settings.enabled ? (
                <>
                  <WifiOff className="h-4 w-4 text-orange-500" />
                  <span className="text-orange-600">
                    {geolocation.loading
                      ? "Getting location..."
                      : geolocation.error || "Location unavailable"}
                  </span>
                </>
              ) : (
                <>
                  <WifiOff className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Location tracking disabled</span>
                </>
              )}
            </div>

            {/* Notification permission status */}
            {settings.enabled && (
              <div className="text-sm border-t pt-4">
                <p className="font-medium mb-2">Notification Status:</p>
                <div className="flex items-center gap-2">
                  {Notification.permission === "granted" ? (
                    <>
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                      <span className="text-green-600">Notifications enabled</span>
                    </>
                  ) : Notification.permission === "denied" ? (
                    <>
                      <div className="h-2 w-2 rounded-full bg-red-500" />
                      <span className="text-red-600">Notifications blocked (check browser settings)</span>
                    </>
                  ) : (
                    <>
                      <div className="h-2 w-2 rounded-full bg-yellow-500" />
                      <span className="text-yellow-600">Notifications not requested yet</span>
                    </>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ===== HOW TO TEST NOTIFICATIONS ===== */}
        {/* {settings.enabled && settings.pushEnabled && (
          <Alert className="bg-blue-50 border-blue-200">
            <AlertTriangle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <p className="font-medium mb-2">💡 How to Test Notifications:</p>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>First, test with the "Send Test Notification" button above</li>
                <li>Then, click "Reset Notifications" to prepare for testing with real reports</li>
                <li>Check the "Active Alerts" section below - these are reports within your radius</li>
                <li>When a new report appears in Active Alerts, you should receive a notification</li>
                <li>If no notification appears, check your browser console (F12) for error messages</li>
              </ol>
            </AlertDescription>
          </Alert>
        )} */}

        {/* ===== MAP WITH USER LOCATION ===== */}
        {settings.enabled && geolocation.latitude && geolocation.longitude && (
          <Card>
            <CardContent className="p-0 overflow-hidden rounded-lg">
              <YangonMap
                reports={reports}
                userLocation={{
                  lat: geolocation.latitude,
                  lng: geolocation.longitude,
                }}
                alertRadius={settings.radius}
                className="h-64"
              />
            </CardContent>
          </Card>
        )}

        {/* ===== ALERTS LIST ===== */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">
              Active Alerts ({filteredAlerts.length})
            </h2>
            <div className="flex items-center gap-2">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {alerts.length > 0 && (
                <Button variant="outline" size="sm" onClick={dismissAll}>
                  Dismiss All
                </Button>
              )}
            </div>
          </div>

          {/* Alert cards */}
          {filteredAlerts.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                {settings.enabled ? (
                  <>
                    <BellOff className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="font-medium">No nearby hazards</p>
                    <p className="text-sm text-muted-foreground">
                      No reported hazards within {settings.radius}m of your location
                    </p>
                  </>
                ) : (
                  <>
                    <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="font-medium">Alerts are disabled</p>
                    <p className="text-sm text-muted-foreground">
                      Enable proximity alerts above to get notified about nearby hazards
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredAlerts.map((alert) => (
                <Card key={alert.report.id}>
                  <CardContent className="py-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <AlertTriangle className="h-4 w-4 text-orange-500" />
                          <p className="font-medium">{alert.report.title}</p>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {alert.report.description}
                        </p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge
                            style={{
                              backgroundColor: CATEGORY_COLORS[alert.report.category],
                              color: "white",
                            }}
                          >
                            {CATEGORY_LABELS[alert.report.category]}
                          </Badge>
                          <Badge variant="outline">
                            <MapPin className="h-3 w-3 mr-1" />
                            {Math.round(alert.distance)}m away
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {alert.report.township} •{" "}
                            {formatDistanceToNow(new Date(alert.report.createdAt), {
                              addSuffix: true,
                            })}
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => dismissAlert(alert.report.id)}
                      >
                        Dismiss
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Alerts;