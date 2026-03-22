import { useState, useEffect } from "react";

interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  error: string | null;
  loading: boolean;
}

/**
 * Custom hook that tracks the user's GPS location.
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
    // Don't do anything if not enabled or browser doesn't support geolocation
    if (!enabled || !navigator.geolocation) {
      if (!navigator.geolocation) {
        setState((prev) => ({
          ...prev,
          error: "Geolocation is not supported by your browser",
        }));
      }
      return;
    }

    setState((prev) => ({ ...prev, loading: true }));

    // Success callback — called when we get a position
    const onSuccess = (position: GeolocationPosition) => {
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
