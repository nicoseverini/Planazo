import * as Location from 'expo-location';
import { useCallback, useRef, useState } from 'react';
import { Alert } from 'react-native';

export type UserLocation = { lat: number; lng: number };

/**
 * Encapsulates radius filter state and the location-permission flow.
 *
 * - First non-null radius triggers a one-shot location permission request.
 * - Once obtained, userLocation is cached; subsequent radius changes are instant.
 * - Concurrent permission requests are guarded via a ref flag.
 */
export function useProximityFilter() {
    const [radius, setRadius] = useState<number | null>(null);
    const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
    const fetchingRef = useRef(false);

    const handleRadiusChange = useCallback(
        async (r: number | null) => {
            if (r === null) {
                setRadius(null);
                return;
            }
            if (userLocation !== null) {
                setRadius(r);
                return;
            }
            if (fetchingRef.current) return;
            fetchingRef.current = true;
            try {
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    Alert.alert('Permission denied', 'Location permission is required for proximity search.');
                    return;
                }
                const loc = await Location.getCurrentPositionAsync({});
                setUserLocation({ lat: loc.coords.latitude, lng: loc.coords.longitude });
                setRadius(r);
            } catch {
                Alert.alert('Error', 'Could not get current location.');
            } finally {
                fetchingRef.current = false;
            }
        },
        [userLocation],
    );

    const clearRadius = useCallback(() => setRadius(null), []);

    return { radius, userLocation, handleRadiusChange, clearRadius };
}
