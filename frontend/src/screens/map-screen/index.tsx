import { useRouter, useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState, useEffect, useRef } from 'react';
import { View, Pressable, ActivityIndicator } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';

import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/use-theme-color';
import { usePlans, PlanSummary } from '@/services/plan';
import * as Location from 'expo-location';

import { styles } from './styles';
import { AppScreen } from '@/components/ui';
import { TuristicPlaceSummary } from '@/services/turistic-place';

function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
}
import { MapFilterModal, MapFilters, DEFAULT_MAP_FILTERS } from './MapFilterModal';

const MAP_INITIAL_REGION = {
    latitude: -34.6037,
    longitude: -58.3816,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
};

export default function MapScreen() {
    const router = useRouter();
    const { fetchPublicPlans, loading, fetchTouristicPlaces } = usePlans();
    const mapRef = useRef<MapView>(null);

    const tint = useThemeColor({}, 'tint');
    const tintText = useThemeColor({}, 'tintText');
    const surface = useThemeColor({}, 'surface');
    const border = useThemeColor({}, 'border');
    const text = useThemeColor({}, 'text');

    const [plans, setPlans] = useState<PlanSummary[]>([]);
    const [places, setPlaces] = useState<TuristicPlaceSummary[]>([]);
    const [filters, setFilters] = useState<MapFilters>(DEFAULT_MAP_FILTERS);
    const [showFilters, setShowFilters] = useState(false);
    const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);

    const centerOnUser = async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') return;
            const location = await Location.getCurrentPositionAsync({});
            setUserLocation({ latitude: location.coords.latitude, longitude: location.coords.longitude });
            mapRef.current?.animateToRegion(
                {
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05,
                },
                1000
            );
        } catch (error) {
            console.log('Error al centrar en el usuario:', error);
        }
    };

    useEffect(() => {
        centerOnUser();
    }, []);

    useFocusEffect(
        useCallback(() => {
            Promise.all([fetchPublicPlans(), fetchTouristicPlaces()])
                .then(([plansData, placesData]) => {
                    setPlans(plansData);
                    setPlaces(placesData);
                })
                .catch(console.error);
        }, [])
    );

    const visiblePlans = useMemo(() => {
        if (filters.activity === 'PLACES') return [];
        return plans.filter((plan) => {
            if (!plan.latitude || !plan.longitude) return false;
            if (filters.category && !plan.interests?.includes(filters.category)) return false;
            if (filters.visibility !== 'ANY' && plan.visibility !== filters.visibility) return false;
            if (filters.radius !== null && userLocation) {
                const distance = getDistanceFromLatLonInKm(userLocation.latitude, userLocation.longitude, plan.latitude, plan.longitude);
                if (distance > filters.radius) return false;
            }
            return true;
        });
    }, [plans, filters, userLocation]);

    const visiblePlaces = useMemo(() => {
        if (filters.activity === 'PLANS') return [];
        return places.filter((place) => {
            if (!place.latitude || !place.longitude) return false;
            if (filters.category && place.interest !== filters.category) return false;
            if (filters.radius !== null && userLocation) {
                const distance = getDistanceFromLatLonInKm(userLocation.latitude, userLocation.longitude, place.latitude!, place.longitude!);
                if (distance > filters.radius) return false;
            }
            return true;
        });
    }, [places, filters, userLocation]);

    const activeFilterCount = useMemo(() => {
        let count = 0;
        if (filters.activity !== 'ALL') count++;
        if (filters.category !== null) count++;
        if (filters.visibility !== 'ANY') count++;
        if (filters.radius !== null) count++;
        return count;
    }, [filters]);

    return (
        <AppScreen
            contentStyle={styles.appScreenContent}
            safeAreaEdges={['top', 'bottom']}
        >
            <View style={styles.container}>
                <MapView
                    ref={mapRef}
                    style={styles.map}
                    initialRegion={MAP_INITIAL_REGION}
                    showsUserLocation={true}
                    showsMyLocationButton={false}
                >
                    {visiblePlans.map((plan) => (
                        <Marker
                            key={plan.id}
                            coordinate={{ latitude: plan.latitude, longitude: plan.longitude }}
                            pinColor={tint}
                        >
                            <Callout
                                tooltip
                                onPress={() => router.push(`/plan/${plan.id}`)}
                            >
                                <View style={[styles.calloutContainer, { backgroundColor: surface, borderColor: border }]}>
                                    <ThemedText type="subtitle" style={{ fontSize: 14 }} numberOfLines={1}>
                                        {plan.title}
                                    </ThemedText>
                                    <ThemedText type="label" style={{ fontSize: 12, marginTop: 4 }} numberOfLines={1}>
                                        📍 {plan.location}
                                    </ThemedText>
                                    <ThemedText type="label" style={{ fontSize: 12, color: tint, marginTop: 4, fontWeight: 'bold' }}>
                                        View details &rarr;
                                    </ThemedText>
                                </View>
                            </Callout>
                        </Marker>
                    ))}

                    {visiblePlaces.map((place) => (
                        <Marker
                            key={`place-${place.id}`}
                            coordinate={{ latitude: place.latitude!, longitude: place.longitude! }}
                            pinColor="green"
                        >
                            <Callout
                                tooltip
                                onPress={() => router.push(`/turistic-place/${place.id}`)}
                            >
                                <View style={[styles.calloutContainer, { backgroundColor: surface, borderColor: border }]}>
                                    <ThemedText type="subtitle" style={{ fontSize: 14 }} numberOfLines={1}>
                                        {place.name}
                                    </ThemedText>
                                    <ThemedText type="label" style={{ fontSize: 12, marginTop: 4 }} numberOfLines={1}>
                                        📍 {place.location}
                                    </ThemedText>
                                    <ThemedText type="label" style={{ fontSize: 12, color: tint, marginTop: 4, fontWeight: 'bold' }}>
                                        View details &rarr;
                                    </ThemedText>
                                </View>
                            </Callout>
                        </Marker>
                    ))}
                </MapView>

                {/* Floating filter button — bottom-left */}
                <Pressable
                    style={[styles.filtersButton, { backgroundColor: surface, borderColor: border }]}
                    onPress={() => setShowFilters(true)}
                >
                    <Ionicons
                        name={activeFilterCount > 0 ? 'options' : 'options-outline'}
                        size={24}
                        color={activeFilterCount > 0 ? tint : text}
                    />
                    {activeFilterCount > 0 && (
                        <View style={[styles.filterBadge, { backgroundColor: tint }]}>
                            <ThemedText style={{ color: tintText, fontSize: 10, fontWeight: '700', lineHeight: 14 }}>
                                {activeFilterCount}
                            </ThemedText>
                        </View>
                    )}
                </Pressable>

                {/* Floating location button — bottom-right */}
                <Pressable
                    style={[styles.myLocationButton, { backgroundColor: surface, borderColor: border }]}
                    onPress={centerOnUser}
                >
                    <Ionicons name="locate" size={24} color={tint} />
                </Pressable>

                {loading && (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={tint} />
                    </View>
                )}
            </View>

            <MapFilterModal
                visible={showFilters}
                filters={filters}
                onFiltersChange={setFilters}
                onReset={() => setFilters(DEFAULT_MAP_FILTERS)}
                onClose={() => setShowFilters(false)}
            />
        </AppScreen>
    );
}