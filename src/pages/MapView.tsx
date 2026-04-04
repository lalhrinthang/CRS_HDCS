// src/pages/MapView.tsx
import { useState, useMemo } from "react";
import { X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Layout from "@/components/layout/Layout";
import YangonMap from "@/components/map/YangonMap";
import { useReports } from "@/hooks/useReports";
import { mapApiReport } from "@/lib/mapReport";
import { Report, CATEGORY_LABELS, CATEGORY_COLORS, ReportCategory } from "@/types/report";
import { useProximityAlerts } from "@/hooks/useProximityAlerts";
import { formatDistanceToNow } from "date-fns";

const MapView = () => {

  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  // ✅ Fetch from API instead of mockReports
  const { data: apiReports, isLoading, error } = useReports();

  // Map API data to frontend Report type
  const reports = useMemo(
    () => (apiReports || []).map(mapApiReport),
    [apiReports]
  );

  const { settings, geolocation } = useProximityAlerts(reports);

  // Filter reports (Exclude archived)
  const filteredReports = useMemo(() => {
    return reports.filter((report) => report.status !== "archived");
  }, [reports]);

  // Loading state
  if (isLoading) {
    return (
      <Layout>
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading reports...</span>
        </div>
      </Layout>
    );
  }

  // Error state
  if (error) {
    return (
      <Layout>
        <div className="flex-1 flex items-center justify-center text-destructive">
          Failed to load reports. Is the server running?
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex-1 relative">
        {/* TOP BAR */}
        <div className="absolute top-4 right-4 z-[1000] flex items-center gap-2">
          <Badge variant="secondary" className="shadow-md">
            {filteredReports.length} Reports
          </Badge>
        </div>

        {/* MAP */}
        <YangonMap
          reports={filteredReports}
          onReportClick={setSelectedReport}
          userLocation={
            geolocation.latitude && geolocation.longitude
              ? { lat: geolocation.latitude, lng: geolocation.longitude }
              : undefined
          }
          alertRadius={settings.enabled ? settings.radius : undefined}
          className="h-[calc(100vh-3.5rem-4rem)] md:h-[calc(100vh-3.5rem)]"
        />

        {/* SELECTED REPORT CARD */}
        {selectedReport && (
          <div className="absolute bottom-20 md:bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 z-[1000]">
            <Card className="shadow-lg">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base">{selectedReport.title}</CardTitle>
                  <Button variant="ghost" size="icon" className="h-6 w-6 -mt-1 -mr-2" onClick={() => setSelectedReport(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <p className="text-muted-foreground">{selectedReport.description}</p>
                  <div className="flex items-center gap-2">
                    <Badge style={{ backgroundColor: CATEGORY_COLORS[selectedReport.category], color: "white" }}>
                      {CATEGORY_LABELS[selectedReport.category]}
                    </Badge>
                    <Badge variant="outline">{selectedReport.status}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {selectedReport.township} • {formatDistanceToNow(new Date(selectedReport.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* LEGEND */}
        <div className="absolute bottom-20 md:bottom-4 left-4 z-[1000]">
          {!selectedReport && (
            <Card className="shadow-md">
              <CardContent className="p-2 md:p-3 max-w-[150px] md:max-w-[200px]">
                <p className="text-[10px] md:text-xs font-medium mb-1.5 md:mb-2 text-muted-foreground uppercase tracking-wider">Categories</p>
                <div className="space-y-1.5 md:space-y-1 max-h-[120px] md:max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                  {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                    <div key={key} className="flex items-center gap-1.5 md:gap-2">
                      <div className="w-2 h-2 md:w-3 md:h-3 shrink-0 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[key as ReportCategory] }} />
                      <span className="text-[9px] md:text-xs leading-tight truncate" title={label}>{label}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default MapView;