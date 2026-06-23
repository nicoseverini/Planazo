import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
    ActivityIndicator, Alert, FlatList, Modal,
    Pressable, RefreshControl, ScrollView, TextInput, View,
} from 'react-native';

import { CategoryFilterSelector } from '@/components/CategoryFilterSelector';
import { DistanceSlider } from '@/components/DistanceSlider';
import { ThemedText } from '@/components/ThemedText';
import { TuristicPlaceCard } from '@/components/TuristicPlaceCard';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useProximityFilter } from '@/hooks/use-proximity-filter';
import { TuristicPlaceSummary } from '@/services/turistic-place';
import { formatInterest } from '@/utils/interests';
import {
    EMPTY_PLACE_FILTERS, PlaceClientFilters,
    filterPlaces, hasActivePlaceFilters,
} from '@/utils/place-filters';

import { styles } from './styles';

type EmptyState = {
    icon: keyof typeof Ionicons.glyphMap;
    message: string;
    ctaLabel: string;
    onCta: () => void;
};

type Props = {
    load: () => Promise<TuristicPlaceSummary[]>;
    errorMessage: string;
    empty: EmptyState;
    onPressPlace: (id: number) => void;
};

export function PlaceListTab({ load, errorMessage, empty, onPressPlace }: Props) {
    const { surface, border, tint, tintText, mutedText, text: textColor } = useAppTheme();

    const [places, setPlaces] = useState<TuristicPlaceSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [showFilters, setShowFilters] = useState(false);

    const { radius, userLocation, handleRadiusChange, clearRadius } = useProximityFilter();
    const [filters, setFilters] = useState<Omit<PlaceClientFilters, 'radius'>>(EMPTY_PLACE_FILTERS);

    const fullFilters: PlaceClientFilters = useMemo(() => ({ ...filters, radius }), [filters, radius]);
    const hasFilters = hasActivePlaceFilters(fullFilters);

    const loadPlaces = useCallback(async () => {
        try {
            setPlaces(await load());
        } catch {
            Alert.alert('Error', errorMessage);
        } finally {
            setLoading(false);
        }
    }, [load, errorMessage]);

    useFocusEffect(
        useCallback(() => {
            loadPlaces();
        }, [loadPlaces])
    );

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadPlaces();
        setRefreshing(false);
    }, [loadPlaces]);

    const visiblePlaces = useMemo(
        () => filterPlaces(places, fullFilters, userLocation),
        [places, fullFilters, userLocation],
    );

    const clearFilters = () => {
        setFilters(EMPTY_PLACE_FILTERS);
        clearRadius();
    };

    const activeChipStyle = { backgroundColor: tint, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 };

    return (
        <View style={styles.tabContent}>
            {/* Filter trigger */}
            <View style={styles.filterBar}>
                <Pressable onPress={() => setShowFilters(true)} style={styles.filterButton}>
                    <Ionicons
                        name={hasFilters ? 'filter' : 'filter-outline'}
                        size={22}
                        color={hasFilters ? tint : textColor}
                    />
                    <ThemedText type="label" style={{ color: hasFilters ? tint : textColor }}>Filters</ThemedText>
                </Pressable>
            </View>

            {/* Active filter chips */}
            {hasFilters && (
                <View style={styles.activeChips}>
                    {filters.categories.map((cat) => (
                        <View key={cat} style={activeChipStyle}>
                            <ThemedText type="label" style={{ color: tintText }}>{formatInterest(cat)}</ThemedText>
                        </View>
                    ))}
                    {!!filters.location && (
                        <View style={activeChipStyle}>
                            <ThemedText type="label" style={{ color: tintText }}>📍 {filters.location}</ThemedText>
                        </View>
                    )}
                    {radius && (
                        <View style={activeChipStyle}>
                            <ThemedText type="label" style={{ color: tintText }}>Dist: {radius}km</ThemedText>
                        </View>
                    )}
                    <Pressable onPress={clearFilters} style={{ justifyContent: 'center' }}>
                        <ThemedText type="label" style={{ color: mutedText }}>✕ Clear</ThemedText>
                    </Pressable>
                </View>
            )}

            {/* List */}
            {loading && places.length === 0 ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={tint} />
                </View>
            ) : (
                <FlatList
                    data={visiblePlaces}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => <TuristicPlaceCard place={item} onPress={onPressPlace} />}
                    contentContainerStyle={styles.listContent}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={tint} />}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name={empty.icon} size={48} color={mutedText} />
                            <ThemedText type="body" style={[styles.emptyText, { color: mutedText }]}>
                                {hasFilters ? 'No places match your filters.' : empty.message}
                            </ThemedText>
                            {!hasFilters && (
                                <Pressable onPress={empty.onCta} style={[styles.emptyCta, { borderColor: tint }]}>
                                    <ThemedText type="label" style={{ color: tint, fontWeight: '600' }}>
                                        {empty.ctaLabel}
                                    </ThemedText>
                                </Pressable>
                            )}
                        </View>
                    }
                    showsVerticalScrollIndicator={false}
                />
            )}

            {/* Filter modal */}
            <Modal visible={showFilters} animationType="slide" presentationStyle="pageSheet">
                <ScrollView
                    style={{ flex: 1, backgroundColor: surface }}
                    contentContainerStyle={{ padding: 24, paddingBottom: 60 }}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.modalHeader}>
                        <ThemedText type="heading">Filters</ThemedText>
                        <Pressable onPress={() => setShowFilters(false)}>
                            <Ionicons name="close" size={24} color={textColor} />
                        </Pressable>
                    </View>

                    {/* Category */}
                    <ThemedText type="subtitle" style={styles.modalLabel}>Category</ThemedText>
                    <View style={{ marginBottom: 24 }}>
                        <CategoryFilterSelector
                            selected={filters.categories}
                            onChange={(categories) => setFilters((f) => ({ ...f, categories }))}
                        />
                    </View>

                    {/* Location */}
                    <ThemedText type="subtitle" style={styles.modalLabel}>Location</ThemedText>
                    <View style={[styles.modalInput, { backgroundColor: surface, borderColor: border }]}>
                        <Ionicons name="location-outline" size={18} color={mutedText} />
                        <TextInput
                            style={[styles.modalInputText, { color: textColor }]}
                            placeholder="E.g.: Buenos Aires, Argentina..."
                            placeholderTextColor={mutedText}
                            value={filters.location}
                            onChangeText={(location) => setFilters((f) => ({ ...f, location }))}
                        />
                        {filters.location.length > 0 && (
                            <Pressable onPress={() => setFilters((f) => ({ ...f, location: '' }))}>
                                <Ionicons name="close-circle" size={18} color={mutedText} />
                            </Pressable>
                        )}
                    </View>

                    {/* Proximity */}
                    <ThemedText type="subtitle" style={styles.modalLabel}>Proximity (Distance)</ThemedText>
                    <View style={{ marginBottom: 24 }}>
                        <DistanceSlider radius={radius} onChange={handleRadiusChange} />
                    </View>

                    {/* Actions */}
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
        </View>
    );
}
