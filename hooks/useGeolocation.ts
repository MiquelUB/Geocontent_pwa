
import { useState, useEffect } from 'react';

interface Location {
  latitude: number;
  longitude: number;
}

interface GeolocationState {
  location: Location | null;
  error: string | null;
  loading: boolean;
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    location: null,
    error: null,
    loading: true,
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setState(prev => ({ ...prev, error: "Geolocation is not supported by your browser", loading: false }));
      return;
    }

    const handleSuccess = (position: GeolocationPosition) => {
      setState({
        location: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        },
        error: null,
        loading: false,
      });
    };

    const handleError = (error: GeolocationPositionError) => {
      setState(prev => ({ ...prev, error: error.message, loading: false }));
    };

    const options = {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 0
    };

    const watchId = navigator.geolocation.watchPosition(handleSuccess, handleError, options);

    return () => {
        navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  return state;
}
