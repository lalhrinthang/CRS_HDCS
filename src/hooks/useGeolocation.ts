import { useState, useEffect } from "react";

export interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  error: string | null;
  loading: boolean;
}

export interface MockLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
}

const MOCK_LOCATION_KEY = "mock-geolocation";

// Get mock location from localStorage
export function getMockLocation(): MockLocation | null {
  try {
    const stored = localStorage.getItem(MOCK_LOCATION_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return null;
}

// Set mock location in localStorage
export function setMockLocation(location: MockLocation | null) {
  if (location === null) {
    localStorage.removeItem(MOCK_LOCATION_KEY);
  } else {
    localStorage.setItem(MOCK_LOCATION_KEY, JSON.stringify(location));
  }
}

/**
 * Custom hook that tracks the user's GPS location.
 * Supports mock location override via localStorage for testing.
 * 
 * @param enabled - Whether to actively track location
 * @param interval - How often to re-check (milliseconds)
 */
export function useGeolocation(
  enabled: boolean = false,
  interval: number = 30000  // Default: every 30 seconds
): GeolocationState {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    error: null,
    loading: false,
  });

  useEffect(() => {
    // Don't do anything if not enabled
    if (!enabled) {
      return;
    }

    // First, check if there's a mock location set (for testing)
    const mockLocation = getMockLocation();
    if (mockLocation) {
      console.log("📍 Mock Location Detected:", mockLocation);
      setState({
        latitude: mockLocation.latitude,
        longitude: mockLocation.longitude,
        accuracy: mockLocation.accuracy,
        error: null,
        loading: false,
      });
      // Still update periodically even with mock location to maintain consistency
      const intervalId = setInterval(() => {
        const updated = getMockLocation();
        if (updated) {
          setState({
            latitude: updated.latitude,
            longitude: updated.longitude,
            accuracy: updated.accuracy,
            error: null,
            loading: false,
          });
        }
      }, interval);
      return () => clearInterval(intervalId);
    }

    // Use real geolocation if mock location not set
    if (!navigator.geolocation) {
      console.warn("⚠️ Geolocation API not supported");
      setState((prev) => ({
        ...prev,
        error: "Geolocation is not supported by your browser",
      }));
      return;
    }

    setState((prev) => ({ ...prev, loading: true }));

    // Success callback — called when we get a position
    const onSuccess = (position: GeolocationPosition) => {
      console.log("📍 Real Geolocation Detected:", {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      });
      setState({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        error: null,
        loading: false,
      });
    };

    // Error callback
    const onError = (error: GeolocationPositionError) => {
      console.error("❌ Geolocation Error:", error.message);
      setState((prev) => ({
        ...prev,
        error: error.message,
        loading: false,
      }));
    };

    const options: PositionOptions = {
      enableHighAccuracy: true,  // Use GPS if available (more accurate but slower)
      timeout: 10000,            // Give up after 10 seconds
      maximumAge: 0,             // Don't use cached position
    };

    // Get position immediately
    navigator.geolocation.getCurrentPosition(onSuccess, onError, options);

    // Then set up periodic updates
    const intervalId = setInterval(() => {
      navigator.geolocation.getCurrentPosition(onSuccess, onError, options);
    }, interval);

    // Cleanup: stop tracking when component unmounts or enabled changes
    return () => clearInterval(intervalId);
  }, [enabled, interval]);

  return state;
}
