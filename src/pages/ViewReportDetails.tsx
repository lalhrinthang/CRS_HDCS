// src/pages/ViewReportDetails.tsx
import { useEffect, useMemo } from "react";
import { Navigate, useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, MapPin, Calendar, Clock, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Layout from "@/components/layout/Layout";
import YangonMap from "@/components/map/YangonMap";
import { useReports } from "@/hooks/useReports";
import { mapApiReport } from "@/lib/mapReport";
import { CATEGORY_LABELS, CATEGORY_COLORS } from "@/types/report";
import { format } from "date-fns";

interface ViewReportDetailsProps {
  isAuthenticated: boolean;
  onLogout: () => void;
}

const ViewReportDetails = ({ isAuthenticated, onLogout }: ViewReportDetailsProps) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Fetch all reports and find the one matching the ID
  const { data: apiReports, isLoading } = useReports();

  const report = useMemo(() => {
    if (!apiReports || !id) return null;
    const found = apiReports.find((r) => r.id === id);
    return found ? mapApiReport(found) : null;
  }, [apiReports, id]);

  // Show loading state
  if (isLoading) {
    return (
      <Layout isAuthenticated={isAuthenticated} onLogout={onLogout}>
        <div className="container py-8 flex items-center justify-center">
          Loading report...
        </div>
      </Layout>
    );
  }

  // Show not found if report doesn't exist
  if (!report) {
    return (
      <Layout isAuthenticated={isAuthenticated} onLogout={onLogout}>
        <div className="container py-8">
          <Link
            to="/admin"
            className="mb-6 inline-flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
          <div className="text-center py-12">
            <p className="text-muted-foreground">Report not found</p>
          </div>
        </div>
      </Layout>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-orange-100 text-orange-800";
      case "verified":
        return "bg-green-100 text-green-800";
      case "archived":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Layout isAuthenticated={isAuthenticated} onLogout={onLogout}>
      <div className="container max-w-4xl py-6 md:py-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            to="/admin"
            className="mb-4 inline-flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">
            {report.title}
          </h1>
          <p className="text-muted-foreground mt-2">
            Report ID: {report.id}
          </p>
        </div>

        {/* Report Details */}
        <div className="space-y-6">
          {/* Main Info */}
          <Card>
            <CardHeader>
              <CardTitle>Report Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Title and Description */}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Title</label>
                  <p className="text-lg font-medium mt-1">{report.title}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Township</label>
                  <p className="text-lg font-medium mt-1">{report.township}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Description</label>
                <p className="text-base mt-2 whitespace-pre-wrap">{report.description}</p>
              </div>

              {/* Category and Status */}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Category</label>
                  <div className="mt-2">
                    <Badge style={{ backgroundColor: CATEGORY_COLORS[report.category], color: "white" }}>
                      {CATEGORY_LABELS[report.category]}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <div className="mt-2">
                    <Badge className={getStatusColor(report.status)}>{report.status}</Badge>
                  </div>
                </div>
              </div>

              {/* Date and Time */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Date</label>
                    <p className="text-base mt-1">
                      {format(new Date(report.createdAt), "MMMM d, yyyy")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Time</label>
                    <p className="text-base mt-1">
                      {format(new Date(report.createdAt), "h:mm a")}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Location
              </CardTitle>
              <CardDescription>
                Latitude: {report.latitude.toFixed(4)}, Longitude: {report.longitude.toFixed(4)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96 rounded-lg border overflow-hidden">
                <YangonMap reports={[report]} selectedLocation={{ lat: report.latitude, lng: report.longitude }} />
              </div>
            </CardContent>
          </Card>

          {/* Photo */}
          {report.photoUrl && (
            <Card>
              <CardHeader>
                <CardTitle>Photo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative inline-block max-w-full">
                  <img
                    src={report.photoUrl}
                    alt="Report photo"
                    className="max-h-96 rounded-lg border"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex gap-3 justify-between">
            <Button variant="outline" onClick={() => navigate("/admin")}>
              Close
            </Button>
            <Link to={`/admin/report/${report.id}/edit`}>
              <Button>Edit Report</Button>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ViewReportDetails;
