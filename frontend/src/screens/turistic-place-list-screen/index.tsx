import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator, Alert, FlatList, Modal, Pressable,
    RefreshControl, ScrollView, TextInput, View,
} from 'react-native';

import { CategoryFilterSelector } from '@/components/CategoryFilterSelector';
import { DistanceSlider } from '@/components/DistanceSlider';
import { ThemedText } from '@/components/ThemedText';
import { TuristicPlaceCard } from '@/components/TuristicPlaceCard';
import { AppScreen } from '@/components/ui';
import { useToken } from '@/context/token-context';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useProximityFilter } from '@/hooks/use-proximity-filter';
import { INTEREST_OPTIONS, TuristicPlaceSummary, useTuristicPlaces } from '@/services/turistic-place';
import { filterPlaces } from '@/utils/place-filters';
import { normalizeSearch } from '@/utils/search';

import { styles } from './styles';

export default function TuristicPlaceListScreen() {
    const router = useRouter();
    const { tokenData } = useToken();
    const { fetchAll } = useTuristicPlaces();

    const { tint, tintText, surface, border, mutedText, text: textColor } = useAppTheme();

    const isLoggedIn = tokenData.state === 'LOGGED_IN';

    const [allPlaces, setAllPlaces] = useState<TuristicPlaceSummary[]>([]);
    const [filteredPlaces, setFilteredPlaces] = useState<TuristicPlaceSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const refreshingRef = useRef(false);

    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [locationFilter, setLocationFilter] = useState('');

    const { radius, userLocation, handleRadiusChange, clearRadius } = useProximityFilter();

    const hasActiveFilters = selectedCategories.length > 0 || !!locationFilter || !!radius;

    const loadPlaces = useCallback(async () => {
        try {
            setAllPlaces(await fetchAll());
        } catch {
            Alert.alert('Error', 'Unable to load tourist places.');
        } finally {
            setLoading(false);
        }
    }, [fetchAll]);

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

    // Client-side filtering: shared filter (categories AND + location + proximity) then name search.
    useEffect(() => {
        let result = filterPlaces(
            allPlaces,
            { categories: selectedCategories, location: locationFilter, radius },
            userLocation,
        );

        if (searchQuery.trim()) {
            const q = normalizeSearch(searchQuery);
            result = result.filter((p) => normalizeSearch(p.name).includes(q));
        }

        setFilteredPlaces(result);
    }, [allPlaces, selectedCategories, locationFilter, radius, userLocation, searchQuery]);

    const clearFilters = () => {
        setSelectedCategories([]);
        setLocationFilter('');
        clearRadius();
    };

    const activeChipStyle = {
        backgroundColor: tint, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4,
    } as const;

    const emptyMessage =
        hasActiveFilters || searchQuery.trim()
            ? 'No tourist places match your search.'
            : 'No tourist places found.';

    return (
        <AppScreen contentStyle={styles.appScreenContent}>
            {/* Header */}
            <View style={styles.header}>
                <ThemedText type="title">Tourist Places</ThemedText>
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
                    {selectedCategories.map((value) => {
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
                    <View style={{ marginBottom: 24 }}>
                        <CategoryFilterSelector
                            selected={selectedCategories}
                            onChange={setSelectedCategories}
                        />
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
                    <View style={{ marginBottom: 24 }}>
                        <DistanceSlider radius={radius} onChange={handleRadiusChange} />
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
