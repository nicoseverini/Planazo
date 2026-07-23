import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as Location from 'expo-location';

export type Coords = {
  latitude: number;
  longitude: number;
};

type LocationContextValue = {
  coords: Coords | null;
  locationPermission: Location.PermissionStatus | null;
  loading: boolean;
  requestPermission: () => Promise<Location.PermissionStatus>;
  refreshLocation: () => Promise<Coords | null>;
};

const LocationContext = createContext<LocationContextValue | null>(null);

export const DEFAULT_COORDS: Coords = {
  latitude: -34.6037, // Buenos Aires Center / FIUBA fallback
  longitude: -58.3816,
};

export function LocationProvider({ children }: React.PropsWithChildren) {
  const [coords, setCoords] = useState<Coords | null>(null);
  const [locationPermission, setLocationPermission] = useState<Location.PermissionStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchLocationData = async (): Promise<Coords | null> => {
    // Check last known position first to resolve instantly
    const lastKnown = await Location.getLastKnownPositionAsync({});
    if (lastKnown) {
      const lastCoords = {
        latitude: lastKnown.coords.latitude,
        longitude: lastKnown.coords.longitude,
      };
      setCoords(lastCoords);
      // Trigger background update
      void Location.getCurrentPositionAsync({}).then((loc) => {
        setCoords({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });
      }).catch((err) => {
        console.warn('[LocationContext] Background position update failed:', err);
      });
      return lastCoords;
    }

    // Fallback to active search
    const loc = await Location.getCurrentPositionAsync({});
    const currentCoords = {
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
    };
    setCoords(currentCoords);
    return currentCoords;
  };

  const refreshLocation = useCallback(async (): Promise<Coords | null> => {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      setLocationPermission(status);
      if (status !== Location.PermissionStatus.GRANTED) {
        return null;
      }
      return await fetchLocationData();
    } catch (err) {
      console.warn('[LocationContext] Error refreshing location:', err);
      return null;
    }
  }, []);

  const requestPermission = useCallback(async (): Promise<Location.PermissionStatus> => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(status);
      if (status === Location.PermissionStatus.GRANTED) {
        await fetchLocationData();
      }
      return status;
    } catch (err) {
      console.warn('[LocationContext] Error requesting location permission:', err);
      return Location.PermissionStatus.UNDETERMINED;
    }
  }, []);

  useEffect(() => {
    const initializeLocation = async () => {
      try {
        const { status } = await Location.getForegroundPermissionsAsync();
        setLocationPermission(status);
        if (status === Location.PermissionStatus.GRANTED) {
          await fetchLocationData();
        }
      } catch (err) {
        console.warn('[LocationContext] Error initializing location context:', err);
      } finally {
        setLoading(false);
      }
    };

    void initializeLocation();
  }, []);

  return (
    <LocationContext.Provider
      value={{
        coords,
        locationPermission,
        loading,
        requestPermission,
        refreshLocation,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (context === null) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
}
