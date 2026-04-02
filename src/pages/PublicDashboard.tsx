// src/pages/PublicDashboard.tsx
import { useMemo } from "react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  AlertTriangle,
  TrendingUp,
  MapPin,
  Clock,
  CheckCircle,
  Activity,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Layout from "@/components/layout/Layout";
import { CATEGORY_LABELS } from "@/types/report";
import { useReports } from "@/hooks/useReports";
import { mapApiReport } from "@/lib/mapReport";

interface PublicDashboardProps {
  isAuthenticated?: boolean;
  onLogout?: () => void;
}

const CHART_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(var(--muted))",
];

const PublicDashboard = ({
  isAuthenticated,
  onLogout,
}: PublicDashboardProps) => {
  // ✅ Fetch from API instead of mockReports
  const { data: apiReports, isLoading, error } = useReports();

  const stats = useMemo(() => {
    const reports = (apiReports || []).map(mapApiReport);

    const activeReports = reports.filter((r) => r.status === "active");
    const verifiedReports = reports.filter((r) => r.status === "verified");

    // Category breakdown
    const categoryData = Object.entries(CATEGORY_LABELS)
      .map(([key, label], index) => ({
        name: label,
        value: reports.filter((r) => r.category === key).length,
        color: CHART_COLORS[index],
      }))
      .filter((item) => item.value > 0); // Only show categories with reports

    // Township breakdown (top 8)
    const townshipCounts = reports.reduce(
      (acc, report) => {
        acc[report.township] = (acc[report.township] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const townshipData = Object.entries(townshipCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, count]) => ({ name, count }));

    // Reports by month (last 3 months)
    const monthlyData = [];
    const now = new Date();
    for (let i = 2; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = monthDate.toLocaleString("default", { month: "short" });
      const monthReports = reports.filter((r) => {
        const reportDate = new Date(r.createdAt);
        return (
          reportDate.getMonth() === monthDate.getMonth() &&
          reportDate.getFullYear() === monthDate.getFullYear()
        );
      });

      monthlyData.push({
        name: monthName,
        reports: monthReports.length,
        verified: monthReports.filter((r) => r.status === "verified").length,
      });
    }

    // Reports by time interval (4-hour blocks)
    const timeIntervalCounts = {
      "0-4": 0,
      "4-8": 0,
      "8-12": 0,
      "12-16": 0,
      "16-20": 0,
      "20-0": 0,
    };

    reports.forEach((r) => {
      const reportDate = new Date(r.createdAt);
      const hour = reportDate.getHours();

      if (hour >= 0 && hour < 4) timeIntervalCounts["0-4"]++;
      else if (hour >= 4 && hour < 8) timeIntervalCounts["4-8"]++;
      else if (hour >= 8 && hour < 12) timeIntervalCounts["8-12"]++;
      else if (hour >= 12 && hour < 16) timeIntervalCounts["12-16"]++;
      else if (hour >= 16 && hour < 20) timeIntervalCounts["16-20"]++;
      else timeIntervalCounts["20-0"]++;
    });

    const timeIntervalData = Object.entries(timeIntervalCounts).map(
      ([interval, count]) => ({
        name: `${interval} hrs`,
        value: count,
      })
    );

    return {
      total: reports.length,
      active: activeReports.length,
      verified: verifiedReports.length,
      townships: Object.keys(townshipCounts).length,
      categoryData,
      townshipData,
      monthlyData,
      timeIntervalData,
    };
  }, [apiReports]);

  // Loading state
  if (isLoading) {
    return (
      <Layout isAuthenticated={isAuthenticated} onLogout={onLogout}>
        <div className="flex-1 flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">
            Loading dashboard data...
          </span>
        </div>
      </Layout>
    );
  }

  // Error state
  if (error) {
    return (
      <Layout isAuthenticated={isAuthenticated} onLogout={onLogout}>
        <div className="flex-1 flex items-center justify-center py-20">
          <div className="text-center">
            <AlertTriangle className="mx-auto h-10 w-10 text-destructive mb-2" />
            <p className="text-destructive font-medium">
              Failed to load dashboard data
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Please check if the server is running and try again.
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout isAuthenticated={isAuthenticated} onLogout={onLogout}>
      <div className="container py-6 md:py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-2xl font-bold text-foreground md:text-3xl">
            Public Safety Dashboard
          </h1>
          <p className="text-muted-foreground">
            Community safety analytics for the Yangon metropolitan area
          </p>
        </div>

        {/* Stats Grid */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Activity className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Reports</p>
                  <p className="text-2xl font-bold text-foreground">
                    {stats.total}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-destructive/10">
                  <AlertTriangle className="h-6 w-6 text-destructive" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active</p>
                  <p className="text-2xl font-bold text-foreground">
                    {stats.active}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-chart-2/20">
                  <CheckCircle className="h-6 w-6 text-chart-2" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Verified</p>
                  <p className="text-2xl font-bold text-foreground">
                    {stats.verified}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary/50">
                  <MapPin className="h-6 w-6 text-secondary-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Townships</p>
                  <p className="text-2xl font-bold text-foreground">
                    {stats.townships}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Category Distribution */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Reports by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] sm:h-[350px] md:h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={stats.categoryData.sort((a, b) => b.value - a.value)}
                    layout="vertical"
                    margin={{ left: 100, right: 20, top: 10, bottom: 10 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="hsl(var(--border))"
                    />
                    <XAxis type="number" allowDecimals={false} />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={90}
                      tick={{ fontSize: 11 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="value" fill="hsl(var(--primary))">
                      {stats.categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Township Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Most Reported Townships</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] sm:h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.townshipData} layout="vertical">
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="hsl(var(--border))"
                    />
                    <XAxis type="number" allowDecimals={false} />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={100}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar
                      dataKey="count"
                      fill="hsl(var(--primary))"
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Time Interval Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Reports by Time Interval</CardTitle>
              <p className="text-sm text-muted-foreground">Most active time periods</p>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] sm:h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.timeIntervalData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="hsl(var(--border))"
                    />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar
                      dataKey="value"
                      fill="hsl(var(--primary))"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Monthly Trend */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="h-5 w-5" />
                Monthly Report Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] sm:h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.monthlyData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="hsl(var(--border))"
                    />
                    <XAxis dataKey="name" allowDecimals={false} />
                    <YAxis allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Bar
                      dataKey="reports"
                      name="Total Reports"
                      fill="hsl(var(--chart-1))"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="verified"
                      name="Verified"
                      fill="hsl(var(--chart-2))"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Disclaimer */}
        <Card className="mt-8 border-primary/20 bg-primary/5">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <Clock className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div>
                <p className="font-medium text-foreground">Data Information</p>
                <p className="text-sm text-muted-foreground">
                  This dashboard displays aggregated, anonymized data from
                  community safety reports. All information is reviewed by
                  trusted moderators before publication. Individual report
                  details do not include personal information.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default PublicDashboard;