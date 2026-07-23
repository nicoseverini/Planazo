import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator, Alert, FlatList, Modal,
    Pressable, RefreshControl, ScrollView, TextInput, View,
} from 'react-native';
import { useTranslation } from 'react-i18next';

import { CategoryFilterSelector } from '@/components/CategoryFilterSelector';
import { DateField } from '@/components/DateField';
import { DistanceSlider } from '@/components/DistanceSlider';
import { PlanCard } from '@/components/PlanCard';
import { ThemedText } from '@/components/ThemedText';
import { AppScreen } from '@/components/ui';
import { decodeJwt, useToken } from '@/context/token-context';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useProximityFilter } from '@/hooks/use-proximity-filter';
import { useRefreshControl } from '@/hooks/use-refresh-control';
import { PlanFilters, PlanSummary, PlanVisibility, usePlans } from '@/services/plan';
import { formatLocalizedDate, toISODate } from '@/utils/date';
import { normalizeSearch } from '@/utils/search';
import { formatInterest } from '@/utils/interests';
import { haversineKm } from '@/utils/distance';
import { styles } from './styles';

const VISIBILITY_OPTIONS: { labelKey: string; value: PlanVisibility | null }[] = [
    { labelKey: 'both', value: null },
    { labelKey: 'public', value: 'PUBLIC' },
    { labelKey: 'private', value: 'PRIVATE' },
];

export function SearchPlansScreen() {
    const router = useRouter();
    const { t } = useTranslation();
    const { fetchPublicPlans, fetchMyJoinedPlans, fetchFilteredPlans, loading } = usePlans();

    const [plans, setPlans] = useState<PlanSummary[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    // Filters & Sorting
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [locationFilter, setLocationFilter] = useState('');
    const [dateFrom, setDateFrom] = useState<Date | null>(null);
    const [dateTo, setDateTo] = useState<Date | null>(null);
    const [visibility, setVisibility] = useState<PlanVisibility | null>(null);
    const [sortBy, setSortBy] = useState<'nearest' | 'date' | 'title'>('nearest');

    const { radius, userLocation, handleRadiusChange, clearRadius } = useProximityFilter();

    const { surface, border, tint, tintText, mutedText, text: textColor } = useAppTheme();

    const hasActiveFilters = !!(
        selectedCategories.length > 0 || locationFilter || dateFrom || dateTo || radius || visibility || sortBy !== 'nearest'
    );

    const buildFilters = useCallback((): PlanFilters => {
        const f: PlanFilters = {};
        if (selectedCategories.length > 0) f.interests = selectedCategories;
        if (locationFilter) f.location = locationFilter;
        if (dateFrom) f.dateFrom = `${toISODate(dateFrom)}T00:00:00`;
        if (dateTo) f.dateTo = `${toISODate(dateTo)}T23:59:59`;
        if (radius && userLocation) {
            f.lat = userLocation.lat;
            f.lng = userLocation.lng;
            f.radius = radius;
        }
        if (visibility) f.visibility = visibility;
        return f;
    }, [selectedCategories, locationFilter, dateFrom, dateTo, radius, userLocation, visibility]);

    const { tokenData, getAccessToken } = useToken();

    const loadPlans = useCallback(async () => {
        try {
            const [publicPlans, joinedPlans] = await Promise.all([
                hasActiveFilters ? fetchFilteredPlans(buildFilters()) : fetchPublicPlans(),
                tokenData.state === 'LOGGED_IN'
                    ? fetchMyJoinedPlans().catch(() => [] as PlanSummary[])
                    : Promise.resolve([] as PlanSummary[]),
            ]);

            const myJoinedSet = new Set(joinedPlans.map((p) => p.id));

            let myUserId: number | null = null;
            if (tokenData.state === 'LOGGED_IN') {
                const token = getAccessToken();
                if (token) {
                    const decoded = decodeJwt(token) as any;
                    myUserId = Number(decoded.id);
                }
            }

            const visiblePlans = publicPlans.filter((p) => {
                if (myJoinedSet.has(p.id)) return false;
                if (myUserId !== null && p.creatorId === myUserId) return false;
                return true;
            });

            setPlans(visiblePlans);
        } catch {
            Alert.alert(
                t('error'),
                hasActiveFilters
                    ? t('unable_apply_filters')
                    : t('unable_load_plans_try'),
            );
        }
    }, [fetchPublicPlans, fetchFilteredPlans, fetchMyJoinedPlans, hasActiveFilters, buildFilters, tokenData.state, getAccessToken, t]);

    const { refreshing, onRefresh } = useRefreshControl(loadPlans);

    useEffect(() => { loadPlans(); }, [loadPlans]);

    const processedPlans = React.useMemo(() => {
        let list = [...plans];

        // 1. Search Query filter
        if (searchQuery.trim()) {
            const q = normalizeSearch(searchQuery);
            list = list.filter((p) =>
                normalizeSearch(p.title).includes(q) ||
                (p.location ? normalizeSearch(p.location).includes(q) : false) ||
                (p.interests ?? []).some((interest) => normalizeSearch(interest).includes(q))
            );
        }

        // 2. Sorting logic
        if (sortBy === 'nearest' && userLocation) {
            list.sort((a, b) => {
                const latA = a.latitude;
                const lonA = a.longitude;
                const latB = b.latitude;
                const lonB = b.longitude;

                if (latA == null || lonA == null) return 1;
                if (latB == null || lonB == null) return -1;

                const distA = haversineKm(userLocation.lat, userLocation.lng, latA, lonA);
                const distB = haversineKm(userLocation.lat, userLocation.lng, latB, lonB);
                return distA - distB;
            });
        } else if (sortBy === 'date') {
            list.sort((a, b) => {
                const dateA = a.startDate ? new Date(a.startDate).getTime() : Infinity;
                const dateB = b.startDate ? new Date(b.startDate).getTime() : Infinity;
                return dateA - dateB;
            });
        } else if (sortBy === 'title') {
            list.sort((a, b) => a.title.localeCompare(b.title));
        }

        return list;
    }, [plans, searchQuery, sortBy, userLocation]);

    const clearFilters = () => {
        setSelectedCategories([]);
        setLocationFilter('');
        setDateFrom(null);
        setDateTo(null);
        setVisibility(null);
        setSortBy('nearest');
        clearRadius();
    };

    return (
        <AppScreen contentStyle={styles.appScreenContent}>
            {/* Header */}
            <View style={styles.header}>
                <ThemedText type="title">{t('plans')}</ThemedText>
                <Pressable onPress={() => setShowFilters(true)} style={styles.filterButton}>
                    <Ionicons
                        name={hasActiveFilters ? 'filter' : 'filter-outline'}
                        size={24}
                        color={hasActiveFilters ? tint : textColor}
                    />
                </Pressable>
            </View>

            {/* Active filter chips */}
            {hasActiveFilters && (
                <View style={styles.activeChipsContainer}>
                    {selectedCategories.map((cat) => (
                        <View key={cat} style={[styles.activeChip, { backgroundColor: tint }]}>
                            <ThemedText type="label" style={{ color: tintText }}>{formatInterest(cat)}</ThemedText>
                        </View>
                    ))}
                    {locationFilter && (
                        <View style={[styles.activeChip, { backgroundColor: tint }]}>
                            <ThemedText type="label" style={{ color: tintText }}>📍 {locationFilter}</ThemedText>
                        </View>
                    )}
                    {dateFrom && (
                        <View style={[styles.activeChip, { backgroundColor: tint }]}>
                            <ThemedText type="label" style={{ color: tintText }}>{t('from_date', { date: formatLocalizedDate(dateFrom) })}</ThemedText>
                        </View>
                    )}
                    {dateTo && (
                        <View style={[styles.activeChip, { backgroundColor: tint }]}>
                            <ThemedText type="label" style={{ color: tintText }}>{t('until_date', { date: formatLocalizedDate(dateTo) })}</ThemedText>
                        </View>
                    )}
                    {radius && (
                        <View style={[styles.activeChip, { backgroundColor: tint }]}>
                            <ThemedText type="label" style={{ color: tintText }}>{t('distance_km', { radius })}</ThemedText>
                        </View>
                    )}
                    {visibility && (
                        <View style={[styles.activeChip, { backgroundColor: tint }]}>
                            <ThemedText type="label" style={{ color: tintText }}>
                                {visibility === 'PUBLIC' ? `🌐 ${t('public')}` : `🔒 ${t('private')}`}
                            </ThemedText>
                        </View>
                    )}
                    {sortBy !== 'nearest' && (
                        <View style={[styles.activeChip, { backgroundColor: tint }]}>
                            <ThemedText type="label" style={{ color: tintText }}>
                                {sortBy === 'date' ? `📅 ${t('sort_date')}` : `🔤 ${t('sort_title')}`}
                            </ThemedText>
                        </View>
                    )}
                    <Pressable onPress={clearFilters} style={styles.clearAllButton}>
                        <ThemedText type="label" style={{ color: mutedText }}>✕ {t('clear_all')}</ThemedText>
                    </Pressable>
                </View>
            )}

            {/* Search bar */}
            <View style={[styles.searchContainer, { backgroundColor: surface, borderColor: border }]}>
                <Ionicons name="search-outline" size={20} color={mutedText} />
                <TextInput
                    style={[styles.searchInput, { color: textColor }]}
                    placeholder={t('search_by_name')}
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

            {/* Plans list */}
            {loading && plans.length === 0 ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={tint} />
                </View>
            ) : (
                <FlatList
                    data={processedPlans}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <PlanCard
                            plan={item}
                            onPress={(id) => router.push(`/plan/${id}` as any)}
                        />
                    )}
                    contentContainerStyle={styles.listContent}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={tint} />}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="calendar-outline" size={48} color={mutedText} />
                            <ThemedText type="body" style={[styles.emptyText, { color: mutedText }]}>
                                {t('no_plans_for_filters')}
                            </ThemedText>
                        </View>
                    }
                    showsVerticalScrollIndicator={false}
                />
            )}

            {/* FAB */}
            <Pressable
                onPress={() => router.push('/create-plan' as any)}
                style={({ pressed }) => [styles.fab, { backgroundColor: tint }, pressed && styles.fabPressed]}
            >
                <Ionicons name="add" size={28} color={tintText} />
            </Pressable>

            {/* Filter modal */}
            <Modal visible={showFilters} animationType="slide" presentationStyle="pageSheet">
                <ScrollView
                    style={[styles.modalScrollView, { backgroundColor: surface }]}
                    contentContainerStyle={styles.modalContent}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.modalHeader}>
                        <ThemedText type="heading">{t('filters')}</ThemedText>
                        <Pressable onPress={() => setShowFilters(false)}>
                            <Ionicons name="close" size={24} color={textColor} />
                        </Pressable>
                    </View>

                    {/* Sort By */}
                    <ThemedText type="subtitle" style={styles.modalSectionTitle}>{t('sort_by')}</ThemedText>
                    <View style={styles.visibilityContainer}>
                        {([
                            { labelKey: 'sort_nearest', value: 'nearest' },
                            { labelKey: 'sort_date', value: 'date' },
                            { labelKey: 'sort_title', value: 'title' },
                        ] as const).map((opt) => {
                            const active = sortBy === opt.value;
                            return (
                                <Pressable
                                    key={opt.value}
                                    onPress={() => setSortBy(opt.value)}
                                    style={[
                                        styles.visibilityOption,
                                        {
                                            backgroundColor: active ? tint : 'transparent',
                                            borderColor: active ? tint : border,
                                        },
                                    ]}
                                >
                                    <ThemedText type="label" style={{ color: active ? tintText : textColor }}>
                                        {t(opt.labelKey)}
                                    </ThemedText>
                                </Pressable>
                            );
                        })}
                    </View>

                    {/* Category */}
                    <ThemedText type="subtitle" style={styles.modalSectionTitle}>{t('category')}</ThemedText>
                    <View style={styles.modalSection}>
                        <CategoryFilterSelector
                            selected={selectedCategories}
                            onChange={setSelectedCategories}
                        />
                    </View>

                    {/* Visibility */}
                    <ThemedText type="subtitle" style={styles.modalSectionTitle}>{t('visibility')}</ThemedText>
                    <View style={styles.visibilityContainer}>
                        {VISIBILITY_OPTIONS.map((opt) => {
                            const active = visibility === opt.value;
                            return (
                                <Pressable
                                    key={opt.labelKey}
                                    onPress={() => setVisibility(opt.value)}
                                    style={[
                                        styles.visibilityOption,
                                        {
                                            backgroundColor: active ? tint : 'transparent',
                                            borderColor: active ? tint : border,
                                        },
                                    ]}
                                >
                                    <ThemedText type="label" style={{ color: active ? tintText : textColor }}>
                                        {t(opt.labelKey)}
                                    </ThemedText>
                                </Pressable>
                            );
                        })}
                    </View>

                    {/* Location */}
                    <ThemedText type="subtitle" style={styles.modalSectionTitle}>{t('location')}</ThemedText>
                    <View style={[styles.searchContainer, { backgroundColor: surface, borderColor: border, marginBottom: 24, marginHorizontal: 0 }]}>
                        <Ionicons name="location-outline" size={18} color={mutedText} />
                        <TextInput
                            style={[styles.searchInput, { color: textColor }]}
                            placeholder={t('location_placeholder_plans')}
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

                    {/* Start date */}
                    <ThemedText type="subtitle" style={styles.modalSectionTitle}>{t('start_date')}</ThemedText>
                    <DateField
                        value={dateFrom}
                        onChange={setDateFrom}
                        onClear={() => setDateFrom(null)}
                        containerStyle={styles.filterDateField}
                    />

                    {/* End date */}
                    <ThemedText type="subtitle" style={styles.modalSectionTitle}>{t('end_date')}</ThemedText>
                    <DateField
                        value={dateTo}
                        onChange={setDateTo}
                        onClear={() => setDateTo(null)}
                        minimumDate={dateFrom ?? undefined}
                        containerStyle={styles.filterDateField}
                    />

                    {/* Proximity */}
                    <ThemedText type="subtitle" style={styles.modalSectionTitleWithMargin}>{t('proximity_distance')}</ThemedText>
                    <View style={styles.modalSection}>
                        <DistanceSlider radius={radius} onChange={handleRadiusChange} />
                    </View>

                    {/* Actions */}
                    <View style={styles.actionButtonsContainer}>
                        <Pressable
                            onPress={() => { setShowFilters(false); loadPlans(); }}
                            style={[styles.applyButton, { backgroundColor: tint }]}
                        >
                            <ThemedText type="subtitle" style={{ color: tintText }}>{t('apply_filters')}</ThemedText>
                        </Pressable>
                        <Pressable
                            onPress={() => { clearFilters(); setShowFilters(false); }}
                            style={[styles.clearButton, { borderColor: border }]}
                        >
                            <ThemedText type="subtitle">{t('clear_all')}</ThemedText>
                        </Pressable>
                    </View>
                </ScrollView>
            </Modal>
        </AppScreen>
    );
}
