import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
    ActivityIndicator, Alert, FlatList, Modal,
    Pressable, RefreshControl, ScrollView, TextInput, View,
} from 'react-native';
import { useTranslation } from 'react-i18next';

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
};

/** Primary action for this tab, shared by the empty-state CTA and the floating button. */
type TabAction = {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    onPress: () => void;
};

type Props = {
    load: () => Promise<TuristicPlaceSummary[]>;
    errorMessage: string;
    empty: EmptyState;
    action: TabAction;
    onPressPlace: (id: number) => void;
};

export function PlaceListTab({ load, errorMessage, empty, action, onPressPlace }: Props) {
    const { t } = useTranslation();
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
            Alert.alert(t('error'), errorMessage);
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
                    <ThemedText type="label" style={{ color: hasFilters ? tint : textColor }}>{t('filters')}</ThemedText>
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
                            <ThemedText type="label" style={{ color: tintText }}>{t('distance_km', { radius })}</ThemedText>
                        </View>
                    )}
                    <Pressable onPress={clearFilters} style={{ justifyContent: 'center' }}>
                        <ThemedText type="label" style={{ color: mutedText }}>✕ {t('clear_all')}</ThemedText>
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
                                {hasFilters ? t('no_places_matching_filters') : empty.message}
                            </ThemedText>
                            {!hasFilters && (
                                <Pressable onPress={action.onPress} style={[styles.emptyCta, { borderColor: tint }]}>
                                    <ThemedText type="label" style={{ color: tint, fontWeight: '600' }}>
                                        {action.label}
                                    </ThemedText>
                                </Pressable>
                            )}
                        </View>
                    }
                    showsVerticalScrollIndicator={false}
                />
            )}

            {/* Persistent action button — visible without scrolling whenever the list isn't pristine-empty */}
            {(visiblePlaces.length > 0 || hasFilters) && (
                <Pressable
                    onPress={action.onPress}
                    style={({ pressed }) => [styles.fab, { backgroundColor: tint }, pressed && styles.fabPressed]}
                >
                    <Ionicons name={action.icon} size={28} color={tintText} />
                </Pressable>
            )}

            {/* Filter modal */}
            <Modal visible={showFilters} animationType="slide" presentationStyle="pageSheet">
                <ScrollView
                    style={{ flex: 1, backgroundColor: surface }}
                    contentContainerStyle={{ padding: 24, paddingBottom: 60 }}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.modalHeader}>
                        <ThemedText type="heading">{t('filters')}</ThemedText>
                        <Pressable onPress={() => setShowFilters(false)}>
                            <Ionicons name="close" size={24} color={textColor} />
                        </Pressable>
                    </View>

                    {/* Category */}
                    <ThemedText type="subtitle" style={styles.modalLabel}>{t('category')}</ThemedText>
                    <View style={{ marginBottom: 24 }}>
                        <CategoryFilterSelector
                            selected={filters.categories}
                            onChange={(categories) => setFilters((f) => ({ ...f, categories }))}
                        />
                    </View>

                    {/* Location */}
                    <ThemedText type="subtitle" style={styles.modalLabel}>{t('location')}</ThemedText>
                    <View style={[styles.modalInput, { backgroundColor: surface, borderColor: border }]}>
                        <Ionicons name="location-outline" size={18} color={mutedText} />
                        <TextInput
                            style={[styles.modalInputText, { color: textColor }]}
                            placeholder={t('location_placeholder_places')}
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
                    <ThemedText type="subtitle" style={styles.modalLabel}>{t('proximity_distance')}</ThemedText>
                    <View style={{ marginBottom: 24 }}>
                        <DistanceSlider radius={radius} onChange={handleRadiusChange} />
                    </View>

                    {/* Actions */}
                    <View style={{ gap: 12 }}>
                        <Pressable
                            onPress={() => setShowFilters(false)}
                            style={{ backgroundColor: tint, borderRadius: 12, padding: 16, alignItems: 'center' }}
                        >
                            <ThemedText type="subtitle" style={{ color: tintText }}>{t('apply_filters')}</ThemedText>
                        </Pressable>
                        <Pressable
                            onPress={() => { clearFilters(); setShowFilters(false); }}
                            style={{ borderWidth: 1, borderColor: border, borderRadius: 12, padding: 16, alignItems: 'center' }}
                        >
                            <ThemedText type="subtitle">{t('clear_all')}</ThemedText>
                        </Pressable>
                    </View>
                </ScrollView>
            </Modal>
        </View>
    );
}
