// src/pages/EditReport.tsx
import { useMemo, useRef, useState, useEffect } from "react";
import { Navigate, useNavigate, useParams, Link } from "react-router-dom";
import {
  ArrowLeft, Calendar, Clock, MapPin, Image, X, Save, AlertCircle, Upload,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Layout from "@/components/layout/Layout";
import YangonMap from "@/components/map/YangonMap";
import { useReports, useUpdateReport, useTownships } from "@/hooks/useReports";
import { mapApiReport } from "@/lib/mapReport";
import { CATEGORY_LABELS, CATEGORY_COLORS, ReportCategory, ReportStatus } from "@/types/report";
import { toast } from "sonner";

interface EditReportProps {
  isAuthenticated: boolean;
  onLogout: () => void;
}

const EditReport = ({ isAuthenticated, onLogout }: EditReportProps) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const updateReportMutation = useUpdateReport();

  // Fetch all reports and find the one matching the ID
  const { data: apiReports, isLoading } = useReports();
  
  // ✅ Fetch townships from API instead of hardcoded list
  const { data: townships } = useTownships();
  const townshipNames = useMemo(
    () => (townships || []).map((t) => t.name).sort(),
    [townships]
  );

  const existingReport = useMemo(() => {
    if (!apiReports || !id) return null;
    const found = apiReports.find((r) => r.id === id);
    return found ? mapApiReport(found) : null;
  }, [apiReports, id]);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "" as ReportCategory | "",
    township: "",
    status: "active" as ReportStatus,
    date: new Date().toISOString().split("T")[0],
    time: new Date().toTimeString().slice(0, 5),
  });

  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form with existing report data
  useEffect(() => {
    if (existingReport) {
      const reportDate = new Date(existingReport.createdAt);
      setFormData({
        title: existingReport.title,
        description: existingReport.description,
        category: existingReport.category,
        township: existingReport.township,
        status: existingReport.status,
        date: reportDate.toISOString().split("T")[0],
        time: reportDate.toTimeString().slice(0, 5),
      });
      setSelectedLocation({ lat: existingReport.latitude, lng: existingReport.longitude });
      if (existingReport.photoUrl) {
        setPhotoPreview(existingReport.photoUrl);
      }
    }
  }, [existingReport]);

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

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
  if (!existingReport) {
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

  const handleMapClick = (lat: number, lng: number) => {
    setSelectedLocation({ lat, lng });
    setErrors((prev) => ({ ...prev, location: "" }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }
      setSelectedPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setSelectedPhoto(null);
    setPhotoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }
    if (!formData.category) {
      newErrors.category = "Category is required";
    }
    if (!formData.township) {
      newErrors.township = "Township is required";
    }
    if (!selectedLocation) {
      newErrors.location = "Please click on the map to select a location";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      await updateReportMutation.mutateAsync({
        id: existingReport.id,
        data: {
          title: formData.title,
          description: formData.description,
          category: formData.category as string,
          township: formData.township,
          latitude: selectedLocation!.lat,
          longitude: selectedLocation!.lng,
          status: formData.status,
          photoUrl: photoPreview || undefined,
        },
      });

      navigate("/admin");
    } catch {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate("/admin");
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
            Edit Report
          </h1>
          <p className="text-muted-foreground">
            Update the safety or hazard report for the Yangon area
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Report Details</CardTitle>
              <CardDescription>
                Edit the basic information about the incident
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">
                  Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  placeholder="Brief summary of the issue"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  className={errors.title ? "border-destructive" : ""}
                />
                {errors.title && (
                  <p className="text-sm text-destructive">{errors.title}</p>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="category">
                    Category <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        category: value as ReportCategory,
                      }))
                    }
                  >
                    <SelectTrigger
                      className={errors.category ? "border-destructive" : ""}
                    >
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.category && (
                    <p className="text-sm text-destructive">
                      {errors.category}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        status: value as ReportStatus,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="verified">Verified</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Provide additional details about the incident..."
                  rows={4}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="date" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Date
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, date: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time" className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Time
                  </Label>
                  <Input
                    id="time"
                    type="time"
                    value={formData.time}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, time: e.target.value }))
                    }
                  />
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
                Select the township and click on the map to pinpoint the exact location
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="township">
                  Township <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.township}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, township: value }))
                  }
                >
                  <SelectTrigger
                    className={errors.township ? "border-destructive" : ""}
                  >
                    <SelectValue placeholder="Select township" />
                  </SelectTrigger>
                  {/* ✅ Townships from API */}
                  <SelectContent position="popper" className="z-[9999] max-h-60">
                    {townshipNames.map((township) => (
                      <SelectItem key={township} value={township}>
                        {township}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.township && (
                  <p className="text-sm text-destructive">{errors.township}</p>
                )}
              </div>

              {errors.location && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{errors.location}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">
                  Click on the map to update the location
                </Label>
                <div className="relative overflow-hidden rounded-lg border border-border">
                  <div className="h-[300px] w-full">
                    <YangonMap
                      reports={[]}
                      onMapClick={handleMapClick}
                      selectedLocation={selectedLocation}
                    />
                  </div>
                </div>
              </div>

              {selectedLocation && (
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-sm font-medium">Selected Coordinates</p>
                  <p className="text-sm text-muted-foreground">
                    Lat: {selectedLocation.lat.toFixed(6)}, Lng:{" "}
                    {selectedLocation.lng.toFixed(6)}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Photo Upload (Optional) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="h-5 w-5" />
                Photo (Optional)
              </CardTitle>
              <CardDescription>
                Upload a photo of the incident. Metadata will be stripped for privacy.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />

              {photoPreview ? (
                <div className="relative">
                  <img
                    src={photoPreview}
                    alt="Selected photo"
                    className="max-h-64 w-full rounded-lg object-contain"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute right-2 top-2"
                    onClick={handleRemovePhoto}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  {selectedPhoto && (
                    <p className="mt-2 text-sm text-muted-foreground">
                      {selectedPhoto.name} (
                      {((selectedPhoto?.size ?? 0) / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex w-full cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-border p-8 transition-colors hover:border-primary/50 hover:bg-muted/50"
                >
                  <div className="text-center">
                    <Upload className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Click to browse and upload an image
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Max file size: 5MB
                    </p>
                  </div>
                </button>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-col-reverse gap-4 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="gap-2"
            >
              <X className="h-4 w-4" />
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="gap-2">
              <Save className="h-4 w-4" />
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>

        {/* Security Notice */}
        <Card className="mt-6 border-primary/20 bg-primary/5">
          <CardContent className="py-4">
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">Privacy Notice:</strong> This
              form does not collect any personal information. All reports are
              anonymous. Uploaded images will have metadata (including location
              data) automatically removed.
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default EditReport;
