import { useState, useEffect } from "react";
import { MapPin, X, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getMockLocation, setMockLocation } from "@/hooks/useGeolocation";

// Yangon townships with coordinates for testing
const YANGON_TOWNSHIPS = [
    { name: "Dagon", lat: 16.8281, lng: 96.1735 },
    { name: "Botataung", lat: 16.7711, lng: 96.1913 },
    { name: "Pazundaung", lat: 16.7826, lng: 96.1807 },
    { name: "Kyauktada", lat: 16.7775, lng: 96.1608 },
    { name: "Lanmadaw", lat: 16.7839, lng: 96.1477 },
    { name: "Latha", lat: 16.7753, lng: 96.1558 },
    { name: "Tamwe", lat: 16.8167, lng: 96.1917 },
    { name: "Bahan", lat: 16.8167, lng: 96.1583 },
    { name: "Sanchaung", lat: 16.8000, lng: 96.1333 },
    { name: "Kamayut", lat: 16.8208, lng: 96.1347 },
    { name: "Hlaing", lat: 16.8458, lng: 96.1194 },
    { name: "Mayangone", lat: 16.8625, lng: 96.1389 },
    { name: "Insein", lat: 16.8994, lng: 96.1003 },
    { name: "Mingaladon", lat: 16.9333, lng: 96.0833 },
    { name: "Thaketa", lat: 16.7792, lng: 96.2208 },
    { name: "Dawbon", lat: 16.8042, lng: 96.2167 },
    { name: "North Okkalapa", lat: 16.8542, lng: 96.1917 },
    { name: "South Okkalapa", lat: 16.8250, lng: 96.2083 },
    { name: "Thingangyun", lat: 16.8417, lng: 96.1833 },
    { name: "Yankin", lat: 16.8333, lng: 96.1667 },
];

const ALLOWED_TOKEN = "crs-ygn-admin-10";

export function MockLocationManager() {
    const [activeMockLocation, setActiveMockLocation] = useState<{ name: string; lat: number; lng: number } | null>(null);
    const [hasAccess, setHasAccess] = useState(false);

    useEffect(() => {
        // Check if user has the required token access
        const token = localStorage.getItem("access_token");
        const hasRequiredAccess = token === ALLOWED_TOKEN;
        setHasAccess(hasRequiredAccess);

        // Load mock location if it exists
        if (hasRequiredAccess) {
            const mock = getMockLocation();
            if (mock) {
                const township = YANGON_TOWNSHIPS.find((t) => t.lat === mock.latitude && t.lng === mock.longitude);
                if (township) {
                    setActiveMockLocation(township);
                }
            }
        }
    }, []);

    // If user doesn't have access, show restricted message
    if (!hasAccess) {
        return (
            <Alert className="bg-red-50 border-red-200">
                <Lock className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                    Mock location testing is restricted to authorized administrators only.
                </AlertDescription>
            </Alert>
        );
    }

    const handleSelectTownship = (township: typeof YANGON_TOWNSHIPS[0]) => {
        setMockLocation({
            latitude: township.lat,
            longitude: township.lng,
            accuracy: 10, // Mock accuracy in meters
        });
        setActiveMockLocation(township);
    };

    const handleClearMockLocation = () => {
        setMockLocation(null);
        setActiveMockLocation(null);
    };

    return (
        <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-900">
                    <MapPin className="h-5 w-5" />
                    Mock Location for Testing
                </CardTitle>
                <CardDescription className="text-blue-700">
                    Select a Yangon township to simulate your location for testing proximity alerts
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {activeMockLocation && (
                    <div className="p-3 bg-blue-100 border border-blue-300 rounded-lg flex items-center justify-between">
                        <div>
                            <p className="font-medium text-blue-900">Active Mock Location</p>
                            <p className="text-sm text-blue-700">
                                {activeMockLocation.name} ({activeMockLocation.lat.toFixed(4)}, {activeMockLocation.lng.toFixed(4)})
                            </p>
                        </div>
                        <Button
                            size="sm"
                            variant="outline"
                            className="border-blue-300 hover:bg-blue-100"
                            onClick={handleClearMockLocation}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {YANGON_TOWNSHIPS.map((township) => (
                        <Button
                            key={township.name}
                            variant={activeMockLocation?.name === township.name ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleSelectTownship(township)}
                            className="text-xs h-auto py-2"
                            title={`${township.lat.toFixed(4)}, ${township.lng.toFixed(4)}`}
                        >
                            {township.name}
                        </Button>
                    ))}
                </div>

                <p className="text-xs text-muted-foreground italic">
                    💡 Tip: Once you select a location, enable proximity alerts in the Alerts page to test notifications as if you were in that township.
                </p>
            </CardContent>
        </Card>
    );
}
