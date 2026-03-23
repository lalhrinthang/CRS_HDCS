import { useState, useMemo } from "react";
import { Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import Layout from "@/components/layout/Layout";
import YangonMap from "@/components/map/YangonMap";
import { mockReports } from "@/data/mockReports";
import { Report, CATEGORY_LABELS, CATEGORY_COLORS, ReportCategory } from "@/types/report";
import { useProximityAlerts } from "@/hooks/useProximityAlerts";
import { formatDistanceToNow } from "date-fns";

const MapView = () => {
  // Filter state
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [timeFilter, setTimeFilter] = useState<string>("all");

  // Selected report (shown in detail card)
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  // Proximity alerts
  const { settings, geolocation } = useProximityAlerts(mockReports);

  // FILTERED REPORTS — recalculated only when filters change
  const filteredReports = useMemo(() => {
    return mockReports.filter((report) => {
      // Skip archived reports
      if (report.status === "archived") return false;

      // Category filter
      if (categoryFilter !== "all" && report.category !== categoryFilter) {
        return false;
      }

      // Time filter
      if (timeFilter !== "all") {
        const reportDate = new Date(report.createdAt);
        const now = new Date();
        const daysAgo = Math.floor(
          (now.getTime() - reportDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (timeFilter === "7" && daysAgo > 7) return false;
        if (timeFilter === "30" && daysAgo > 30) return false;
        if (timeFilter === "90" && daysAgo > 90) return false;
      }

      return true;
    });
  }, [categoryFilter, timeFilter]);

  // Count active filters
  const activeFilterCount =
    (categoryFilter !== "all" ? 1 : 0) + (timeFilter !== "all" ? 1 : 0);

  return (
    <Layout>
      <div className="flex-1 relative">
        {/* ===== TOP BAR: Filter button + report count ===== */}
        <div className="absolute top-4 left-4 right-4 z-[1000] flex items-center gap-2">
          {/* Filter Sheet (slide-out panel) */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="secondary" size="sm" className="gap-2 shadow-md">
                <Filter className="h-4 w-4" />
                Filters
                {activeFilterCount > 0 && (
                  <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>

            <SheetContent side="left" className="w-80">
              <SheetHeader>
                <SheetTitle>Filter Reports</SheetTitle>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                {/* Category filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger>
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
                </div>

                {/* Time filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Time Period</label>
                  <Select value={timeFilter} onValueChange={setTimeFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="7">Last 7 Days</SelectItem>
                      <SelectItem value="30">Last 30 Days</SelectItem>
                      <SelectItem value="90">Last 90 Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Clear filters button */}
                {activeFilterCount > 0 && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setCategoryFilter("all");
                      setTimeFilter("all");
                    }}
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>

          {/* Report count badge */}
          <Badge variant="secondary" className="shadow-md">
            {filteredReports.length} reports
          </Badge>
        </div>

        {/* ===== THE MAP ===== */}
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

        {/* ===== SELECTED REPORT DETAIL CARD ===== */}
        {selectedReport && (
          <div className="absolute bottom-20 md:bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 z-[1000]">
            <Card className="shadow-lg">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base">{selectedReport.title}</CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 -mt-1 -mr-2"
                    onClick={() => setSelectedReport(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <p className="text-muted-foreground">{selectedReport.description}</p>
                  <div className="flex items-center gap-2">
                    <Badge
                      style={{
                        backgroundColor: CATEGORY_COLORS[selectedReport.category],
                        color: "white",
                      }}
                    >
                      {CATEGORY_LABELS[selectedReport.category]}
                    </Badge>
                    <Badge variant="outline">{selectedReport.status}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {selectedReport.township} •{" "}
                    {formatDistanceToNow(new Date(selectedReport.createdAt), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ===== LEGEND ===== */}
        <div className="absolute bottom-20 md:bottom-4 left-4 z-[1000]">
          {!selectedReport && (
            <Card className="shadow-md">
              <CardContent className="p-3">
                <p className="text-xs font-medium mb-2">Categories</p>
                <div className="space-y-1">
                  {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                    <div key={key} className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: CATEGORY_COLORS[key as ReportCategory] }}
                      />
                      <span className="text-xs">{label}</span>
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