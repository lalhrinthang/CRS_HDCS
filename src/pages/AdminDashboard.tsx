// src/pages/AdminDashboard.tsx
import { useState, useMemo } from "react";
import { Navigate, Link } from "react-router-dom";
import {
  Search, Plus, BarChart3, AlertTriangle, Archive,
  Trash2, Table, Map, Loader2, Eye, Edit2, MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Layout from "@/components/layout/Layout";
import YangonMap from "@/components/map/YangonMap";
import { MockLocationManager } from "@/components/admin/MockLocationManager";
import { useReports, useUpdateReport, useDeleteReport } from "@/hooks/useReports";
import { mapApiReport } from "@/lib/mapReport";
import { CATEGORY_LABELS, CATEGORY_COLORS, ReportStatus } from "@/types/report";
import { format } from "date-fns";

interface AdminDashboardProps {
  isAuthenticated: boolean;
  onLogout: () => void;
}

const AdminDashboard = ({ isAuthenticated, onLogout }: AdminDashboardProps) => {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // ✅ Real API data
  const { data: apiReports, isLoading } = useReports();
  const updateReport = useUpdateReport();
  const deleteReport = useDeleteReport();

  const reports = useMemo(
    () => (apiReports || []).map(mapApiReport),
    [apiReports]
  );

  // Filter
  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      if (search) {
        const q = search.toLowerCase();
        const matchesSearch =
          report.title.toLowerCase().includes(q) ||
          report.township.toLowerCase().includes(q) ||
          report.description.toLowerCase().includes(q);
        if (!matchesSearch) return false;
      }
      if (statusFilter !== "all" && report.status !== statusFilter) return false;
      if (categoryFilter !== "all" && report.category !== categoryFilter) return false;
      return true;
    });
  }, [reports, search, statusFilter, categoryFilter]);

  // Stats
  const stats = useMemo(() => ({
    total: reports.length,
    active: reports.filter((r) => r.status === "active").length,
    // verified: reports.filter((r) => r.status === "verified").length,
    archived: reports.filter((r) => r.status === "archived").length,
  }), [reports]);

  // ✅ Real API actions
  const handleStatusChange = (reportId: string, newStatus: ReportStatus) => {
    updateReport.mutate({ id: reportId, data: { status: newStatus } });
  };
  const handleArchive = (reportId: string) => {
    handleStatusChange(reportId, "archived");
  };
  const handleDelete = (reportId: string) => {
    deleteReport.mutate(reportId);
  };

  const getStatusColor = (status: ReportStatus) => {
    switch (status) {
      case "active": return "bg-orange-100 text-orange-800";
      case "archived": return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <Layout isAuthenticated={isAuthenticated} onLogout={onLogout}>
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading reports...</span>
        </div>
      </Layout>
    );
  }

  return (
    <Layout isAuthenticated={isAuthenticated} onLogout={onLogout}>
      <div className="container py-6 space-y-6 mb-16 md:mb-0">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage community safety reports</p>
          </div>
          <Link to="/admin/add-report">
            <Button className="gap-2"><Plus className="h-4 w-4" /> Add Report</Button>
          </Link>
        </div>

        {/* Mock Location Manager for Testing */}
        <MockLocationManager />

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Card><CardContent className="pt-6 flex items-center gap-2"><BarChart3 className="h-5 w-5 text-primary" /><div><p className="text-2xl font-bold">{stats.total}</p><p className="text-xs text-muted-foreground">Total</p></div></CardContent></Card>
          <Card><CardContent className="pt-6 flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-orange-500" /><div><p className="text-2xl font-bold">{stats.active}</p><p className="text-xs text-muted-foreground">Active</p></div></CardContent></Card>
          <Card><CardContent className="pt-6 flex items-center gap-2"><Archive className="h-5 w-5 text-gray-500" /><div><p className="text-2xl font-bold">{stats.archived}</p><p className="text-xs text-muted-foreground">Archived</p></div></CardContent></Card>
        </div>

        {/* Search + Filters */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search reports..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <p className="text-sm text-muted-foreground">
          Showing {filteredReports.length} of {reports.length} reports
        </p>

        {/* Table/Map Toggle */}
        <Tabs defaultValue="table">
          <TabsList>
            <TabsTrigger value="table" className="gap-1"><Table className="h-4 w-4" /> Table</TabsTrigger>
            <TabsTrigger value="map" className="gap-1"><Map className="h-4 w-4" /> Map</TabsTrigger>
          </TabsList>

          <TabsContent value="table">
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="px-6 py-3 text-left text-sm font-semibold">Title</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Township</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Category</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Date</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReports.map((report) => (
                      <tr key={report.id} className="border-b hover:bg-muted/50 transition-colors">
                        <td className="px-6 py-4 text-sm">
                          <p className="font-medium truncate">{report.title}</p>
                        </td>
                        <td className="px-6 py-4 text-sm">{report.township}</td>
                        <td className="px-6 py-4 text-sm">
                          <Badge style={{ backgroundColor: CATEGORY_COLORS[report.category], color: "white" }}>
                            {CATEGORY_LABELS[report.category]}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <Badge className={getStatusColor(report.status)}>{report.status}</Badge>
                        </td>
                        <td className="px-6 py-4 text-sm">{format(new Date(report.createdAt), "MMM d, yyyy")}</td>
                        <td className="px-6 py-4 text-sm">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link to={`/admin/report/${report.id}`} className="flex items-center gap-2 cursor-pointer">
                                  <Eye className="h-4 w-4" />
                                  View Details
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link to={`/admin/report/${report.id}/edit`} className="flex items-center gap-2 cursor-pointer">
                                  <Edit2 className="h-4 w-4" />
                                  Edit Report
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleArchive(report.id)}>
                                <Archive className="h-4 w-4 mr-2" />
                                Archive
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  const confirmed = window.confirm(
                                    `Are you sure you want to delete "${report.title}"? This action cannot be undone.`
                                  );
                                  if (confirmed) {
                                    handleDelete(report.id);
                                  }
                                }}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="map">
            <Card>
              <CardContent className="p-0 overflow-hidden rounded-lg">
                <YangonMap reports={filteredReports} className="h-96" />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default AdminDashboard;