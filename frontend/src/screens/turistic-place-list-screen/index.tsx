import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator, Alert, FlatList, Modal, Pressable,
    RefreshControl, ScrollView, TextInput, View,
} from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { TuristicPlaceCard } from '@/components/TuristicPlaceCard';
import { AppScreen } from '@/components/ui';
import { useToken } from '@/context/token-context';
import { useThemeColor } from '@/hooks/use-theme-color';
import { INTEREST_OPTIONS, TuristicPlaceSummary, useTuristicPlaces } from '@/services/turistic-place';
import { normalizeSearch } from '@/utils/search';

import { styles } from './styles';

type Tab = 'all' | 'mine';

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function TuristicPlaceListScreen() {
    const router = useRouter();
    const { tokenData } = useToken();
    const { fetchAll, fetchMine } = useTuristicPlaces();

    const tint = useThemeColor({}, 'tint');
    const tintText = useThemeColor({}, 'tintText');
    const surface = useThemeColor({}, 'surface');
    const border = useThemeColor({}, 'border');
    const mutedText = useThemeColor({}, 'mutedText');
    const textColor = useThemeColor({}, 'text');

    const isLoggedIn = tokenData.state === 'LOGGED_IN';

    const [tab, setTab] = useState<Tab>('all');
    const [allPlaces, setAllPlaces] = useState<TuristicPlaceSummary[]>([]);
    const [myPlaces, setMyPlaces] = useState<TuristicPlaceSummary[]>([]);
    const [filteredPlaces, setFilteredPlaces] = useState<TuristicPlaceSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const refreshingRef = useRef(false);

    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
    const [locationFilter, setLocationFilter] = useState('');
    const [radius, setRadius] = useState<number | null>(null);
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

    const hasActiveFilters = selectedInterests.length > 0 || !!locationFilter || !!radius;

    const loadPlaces = useCallback(async () => {
        try {
            const [all, mine] = await Promise.all([
                fetchAll(),
                isLoggedIn ? fetchMine() : Promise.resolve([] as TuristicPlaceSummary[]),
            ]);
            setAllPlaces(all);
            setMyPlaces(mine);
        } catch {
            Alert.alert('Error', 'Unable to load tourist places.');
        } finally {
            setLoading(false);
        }
    }, [fetchAll, fetchMine, isLoggedIn]);

    useFocusEffect(
        useCallback(() => {
            loadPlaces();
        }, [loadPlaces])
    );

    const onRefresh = useCallback(async () => {
        if (refreshingRef.current) return;
        refreshingRef.current = true;
        setRefreshing(true);
        await loadPlaces();
        setRefreshing(false);
        refreshingRef.current = false;
    }, [loadPlaces]);

    // Client-side filtering: categories + location + proximity + search query
    useEffect(() => {
        const base = tab === 'mine' ? myPlaces : allPlaces;
        let result = base;

        if (selectedInterests.length > 0) {
            result = result.filter((p) =>
                (p.interests ?? []).some((i) => selectedInterests.includes(i))
            );
        }

        if (locationFilter.trim()) {
            const q = normalizeSearch(locationFilter);
            result = result.filter((p) => {
                const loc = [p.address, p.city, p.country, p.location].filter(Boolean).join(' ');
                return normalizeSearch(loc).includes(q);
            });
        }

        if (radius && userLocation) {
            result = result.filter((p) => {
                if (!p.latitude || !p.longitude) return false;
                return haversineKm(userLocation.lat, userLocation.lng, p.latitude, p.longitude) <= radius;
            });
        }

        if (searchQuery.trim()) {
            const q = normalizeSearch(searchQuery);
            result = result.filter((p) => normalizeSearch(p.name).includes(q));
        }

        setFilteredPlaces(result);
    }, [tab, allPlaces, myPlaces, selectedInterests, locationFilter, radius, userLocation, searchQuery]);

    const clearFilters = () => {
        setSelectedInterests([]);
        setLocationFilter('');
        setRadius(null);
    };

    const handleRadiusSelect = async (r: number | null) => {
        if (r === null) { setRadius(null); return; }
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
        }
    };

    const activeChipStyle = {
        backgroundColor: tint, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4,
    } as const;

    const emptyMessage =
        hasActiveFilters || searchQuery.trim()
            ? 'No tourist places match your search.'
            : tab === 'mine'
            ? 'You have no places yet.'
            : 'No tourist places found.';

    return (
        <AppScreen contentStyle={styles.appScreenContent}>
            {/* Header */}
            <View style={styles.header}>
                <ThemedText type="title">Turistic Places</ThemedText>
                <Pressable onPress={() => setShowFilters(true)} style={{ padding: 4 }}>
                    <Ionicons
                        name={hasActiveFilters ? 'filter' : 'filter-outline'}
                        size={24}
                        color={hasActiveFilters ? tint : textColor}
                    />
                </Pressable>
            </View>

            {/* Active filter chips */}
            {hasActiveFilters && (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginHorizontal: 20, marginBottom: 8 }}>
                    {selectedInterests.map((value) => {
                        const label = INTEREST_OPTIONS.find((o) => o.value === value)?.label ?? value;
                        return (
                            <View key={value} style={activeChipStyle}>
                                <ThemedText type="label" style={{ color: tintText }}>{label}</ThemedText>
                            </View>
                        );
                    })}
                    {locationFilter ? (
                        <View style={activeChipStyle}>
                            <ThemedText type="label" style={{ color: tintText }}>📍 {locationFilter}</ThemedText>
                        </View>
                    ) : null}
                    {radius ? (
                        <View style={activeChipStyle}>
                            <ThemedText type="label" style={{ color: tintText }}>Dist: {radius}km</ThemedText>
                        </View>
                    ) : null}
                    <Pressable onPress={clearFilters} style={{ justifyContent: 'center' }}>
                        <ThemedText type="label" style={{ color: mutedText }}>✕ Clear</ThemedText>
                    </Pressable>
                </View>
            )}

            {/* Search bar */}
            <View style={[styles.searchContainer, { backgroundColor: surface, borderColor: border }]}>
                <Ionicons name="search-outline" size={20} color={mutedText} />
                <TextInput
                    style={[styles.searchInput, { color: textColor }]}
                    placeholder="Search by name"
                    placeholderTextColor={mutedText}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
                {searchQuery.length > 0 && (
                    <Pressable onPress={() => setSearchQuery('')}>
                        <Ionicons name="close-circle" size={20} color={mutedText} />
                    </Pressable>
                )}
            </View>

            {/* All / Mine tabs */}
            {isLoggedIn && (
                <View style={styles.tabRow}>
                    {(['all', 'mine'] as Tab[]).map((t) => (
                        <Pressable
                            key={t}
                            onPress={() => setTab(t)}
                            style={[
                                styles.tabButton,
                                { borderColor: border },
                                tab === t && { backgroundColor: tint, borderColor: tint },
                            ]}
                        >
                            <ThemedText type="label" style={{ color: tab === t ? tintText : mutedText }}>
                                {t === 'all' ? 'All' : 'My Places'}
                            </ThemedText>
                        </Pressable>
                    ))}
                </View>
            )}

            {/* List */}
            {loading && allPlaces.length === 0 ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={tint} />
                </View>
            ) : (
                <FlatList
                    data={filteredPlaces}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <TuristicPlaceCard
                            place={item}
                            onPress={() => router.push(`/turistic-place/${item.id}` as any)}
                        />
                    )}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            tintColor={tint}
                            colors={[tint]}
                        />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="location-outline" size={48} color={mutedText} />
                            <ThemedText type="body" style={[styles.emptyText, { color: mutedText }]}>
                                {emptyMessage}
                            </ThemedText>
                        </View>
                    }
                    showsVerticalScrollIndicator={false}
                />
            )}

            {/* FAB: create new place */}
            {isLoggedIn && (
                <Pressable
                    onPress={() => router.push('/turistic-place/create' as any)}
                    style={({ pressed }) => [
                        styles.fab,
                        { backgroundColor: tint },
                        pressed && styles.fabPressed,
                    ]}
                >
                    <Ionicons name="add" size={28} color={tintText} />
                </Pressable>
            )}

            {/* Filter modal */}
            <Modal visible={showFilters} animationType="slide" presentationStyle="pageSheet">
                <ScrollView
                    style={{ flex: 1, backgroundColor: surface }}
                    contentContainerStyle={{ padding: 24, paddingBottom: 60 }}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                        <ThemedText type="heading">Filters</ThemedText>
                        <Pressable onPress={() => setShowFilters(false)}>
                            <Ionicons name="close" size={24} color={textColor} />
                        </Pressable>
                    </View>

                    {/* Category */}
                    <ThemedText type="subtitle" style={{ marginBottom: 12 }}>Category</ThemedText>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
                        {INTEREST_OPTIONS.map(({ value, label }) => {
                            const active = selectedInterests.includes(value);
                            return (
                                <Pressable
                                    key={value}
                                    onPress={() =>
                                        setSelectedInterests((prev) =>
                                            prev.includes(value)
                                                ? prev.filter((x) => x !== value)
                                                : [...prev, value]
                                        )
                                    }
                                    style={{
                                        paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
                                        backgroundColor: active ? tint : 'transparent',
                                        borderWidth: 1, borderColor: active ? tint : border,
                                    }}
                                >
                                    <ThemedText type="label" style={{ color: active ? tintText : textColor }}>
                                        {label}
                                    </ThemedText>
                                </Pressable>
                            );
                        })}
                    </View>

                    {/* Location */}
                    <ThemedText type="subtitle" style={{ marginBottom: 12 }}>Location</ThemedText>
                    <View style={[styles.searchContainer, { backgroundColor: surface, borderColor: border, marginBottom: 24 }]}>
                        <Ionicons name="location-outline" size={18} color={mutedText} />
                        <TextInput
                            style={[styles.searchInput, { color: textColor }]}
                            placeholder="E.g.: Buenos Aires, Argentina..."
                            placeholderTextColor={mutedText}
                            value={locationFilter}
                            onChangeText={setLocationFilter}
                        />
                        {locationFilter.length > 0 && (
                            <Pressable onPress={() => setLocationFilter('')}>
                                <Ionicons name="close-circle" size={18} color={mutedText} />
                            </Pressable>
                        )}
                    </View>

                    {/* Proximity */}
                    <ThemedText type="subtitle" style={{ marginBottom: 12 }}>Proximity (Distance)</ThemedText>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
                        {[5, 10, 20, 50, 100].map((r) => {
                            const active = radius === r;
                            return (
                                <Pressable
                                    key={r}
                                    onPress={() => handleRadiusSelect(active ? null : r)}
                                    style={{
                                        paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
                                        backgroundColor: active ? tint : 'transparent',
                                        borderWidth: 1, borderColor: active ? tint : border,
                                    }}
                                >
                                    <ThemedText type="label" style={{ color: active ? tintText : textColor }}>
                                        {r} km
                                    </ThemedText>
                                </Pressable>
                            );
                        })}
                    </View>

                    {/* Buttons */}
                    <View style={{ gap: 12 }}>
                        <Pressable
                            onPress={() => setShowFilters(false)}
                            style={{ backgroundColor: tint, borderRadius: 12, padding: 16, alignItems: 'center' }}
                        >
                            <ThemedText type="subtitle" style={{ color: tintText }}>Apply filters</ThemedText>
                        </Pressable>
                        <Pressable
                            onPress={() => { clearFilters(); setShowFilters(false); }}
                            style={{ borderWidth: 1, borderColor: border, borderRadius: 12, padding: 16, alignItems: 'center' }}
                        >
                            <ThemedText type="subtitle">Clear all</ThemedText>
                        </Pressable>
                    </View>
                </ScrollView>
            </Modal>
        </AppScreen>
    );
}
