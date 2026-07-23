import { useCallback, useState } from 'react';
import { Alert } from 'react-native';

import i18n from '@/config/i18n';
import { useLocation } from '@/context/location-context';
import { DISTANCE_SLIDER_DEFAULT_KM } from '@/components/DistanceSlider';

export type UserLocation = { lat: number; lng: number };

/**
 * Encapsulates radius filter state and the location-permission flow.
 *
 * - Consumes shared LocationContext to prevent redundant permission requests.
 * - Once coordinates are fetched globally, radius changes are applied instantly.
 */
export function useProximityFilter() {
    const [radius, setRadius] = useState<number | null>(DISTANCE_SLIDER_DEFAULT_KM);
    const { coords, requestPermission, refreshLocation } = useLocation();

    const handleRadiusChange = useCallback(
        async (r: number | null) => {
            if (r === null) {
                setRadius(null);
                return;
            }
            if (coords !== null) {
                setRadius(r);
                return;
            }
            try {
                const status = await requestPermission();
                if (status !== 'granted') {
                    Alert.alert(i18n.t('permission_denied'), i18n.t('location_permission_required'));
                    return;
                }
                const newCoords = await refreshLocation();
                if (newCoords) {
                    setRadius(r);
                } else {
                    Alert.alert(i18n.t('error'), i18n.t('could_not_get_location'));
                }
            } catch {
                Alert.alert(i18n.t('error'), i18n.t('could_not_get_location'));
            }
        },
        [coords, requestPermission, refreshLocation],
    );

    const clearRadius = useCallback(() => setRadius(null), []);

    return {
        radius,
        userLocation: coords ? { lat: coords.latitude, lng: coords.longitude } : null,
        handleRadiusChange,
        clearRadius,
    };
}
