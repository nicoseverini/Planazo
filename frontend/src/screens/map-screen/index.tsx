import { useRouter, useFocusEffect } from 'expo-router';
import { useCallback, useState, useEffect, useRef} from 'react';
import { View, ScrollView, Pressable, ActivityIndicator, StyleSheet, Dimensions } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';

import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/use-theme-color';
import { usePlans, PlanSummary } from '@/services/plan';
import * as Location from 'expo-location';

import { styles } from './styles';
import {AppScreen} from "@/components/ui";

const CATEGORY_MAP: Record<string, string> = {
    'Todos':         'ALL',
    'Gastronomia':   'FOOD',
    'Cultura':       'CULTURE',
    'Naturaleza':    'NATURE',
    'Playa':         'BEACH',
    'Aventura':      'ADVENTURE',
    'Fiesta': 'NIGHTLIFE',
    'Shopping':      'SHOPPING',
    'Historia':      'HISTORY',
    'Montañas':      'MOUNTAINS',
    'Otro':          'OTHER',
};

export default function MapScreen() {
    const router = useRouter();
    const { fetchPublicPlans, loading } = usePlans();
    const mapRef = useRef<MapView>(null);

    const tint = useThemeColor({}, 'tint');
    const tintText = useThemeColor({}, 'tintText');
    const surface = useThemeColor({}, 'surface');
    const border = useThemeColor({}, 'border');
    const text = useThemeColor({}, 'text');

    const [plans, setPlans] = useState<PlanSummary[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
    const [mapRegion, setMapRegion] = useState({
        latitude: -34.6037,
        longitude: -58.3816,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
    });

    const centerOnUser = async () => {
        try {

            let { status } = await Location.requestForegroundPermissionsAsync();

            if (status !== 'granted') {
                console.log('El usuario denegó el permiso de ubicación');
                return;
            }

            let location = await Location.getCurrentPositionAsync({});

            mapRef.current?.animateToRegion({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
            }, 1000);

        } catch (error) {
            console.log("Error al centrar en el usuario:", error);
        }
    };

    useEffect(() => {
        centerOnUser();
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchPublicPlans()
                .then(setPlans)
                .catch(console.error);
        }, [fetchPublicPlans])
    );

    const filteredPlans = plans.filter((plan) => {
        if (selectedCategory === 'Todos') return true;
        return plan.interest === CATEGORY_MAP[selectedCategory];
    });

    return (
        <AppScreen>
        <View style={styles.container}>
            <MapView
                ref={mapRef}
                style={styles.map}
                initialRegion={mapRegion}
                showsUserLocation={true}
                showsMyLocationButton={false}
            >
                {filteredPlans.map((plan) => {

                    if (!plan.latitude || !plan.longitude) return null;

                    return (
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
                                        Ver detalles &rarr;
                                    </ThemedText>
                                </View>
                            </Callout>
                        </Marker>
                    );
                })}
            </MapView>

            <View style={styles.filterContainer}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filterScroll}
                >
                    {Object.keys(CATEGORY_MAP).map((catName) => {
                        const isSelected = selectedCategory === catName;
                        return (
                            <Pressable
                                key={catName}
                                onPress={() => setSelectedCategory(catName)}
                                style={[
                                    styles.filterChip,
                                    { backgroundColor: surface, borderColor: border },
                                    isSelected && { backgroundColor: tint, borderColor: tintText }
                                ]}
                            >
                                <ThemedText
                                    type="label"
                                    style={{ color: isSelected ? tintText : text }}
                                >
                                    {catName}
                                </ThemedText>
                            </Pressable>
                        );
                    })}
                </ScrollView>
            </View>

            <Pressable
                style={[
                    styles.myLocationButton,
                    { backgroundColor: surface, borderColor: border }
                ]}
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
        </AppScreen>

    );
}