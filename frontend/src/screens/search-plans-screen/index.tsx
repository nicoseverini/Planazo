import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator, Alert, FlatList, Modal, Platform,
    Pressable, RefreshControl, ScrollView, TextInput, View,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTranslation } from 'react-i18next';

import { CategoryFilterSelector } from '@/components/CategoryFilterSelector';
import { DistanceSlider } from '@/components/DistanceSlider';
import { PlanCard } from '@/components/PlanCard';
import { ThemedText } from '@/components/ThemedText';
import { AppScreen } from '@/components/ui';
import { decodeJwt, useToken } from '@/context/token-context';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useProximityFilter } from '@/hooks/use-proximity-filter';
import { useRefreshControl } from '@/hooks/use-refresh-control';
import { PlanFilters, PlanSummary, PlanVisibility, usePlans } from '@/services/plan';
import { normalizeSearch } from '@/utils/search';
import { formatInterest } from '@/utils/interests';
import { styles } from './styles';

const VISIBILITY_OPTIONS: { labelKey: string; value: PlanVisibility | null }[] = [
    { labelKey: 'both', value: null },
    { labelKey: 'public', value: 'PUBLIC' },
    { labelKey: 'private', value: 'PRIVATE' },
];

const fmt = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export function SearchPlansScreen() {
    const router = useRouter();
    const { t } = useTranslation();
    const { fetchPublicPlans, fetchMyJoinedPlans, fetchFilteredPlans, loading } = usePlans();

    const [plans, setPlans] = useState<PlanSummary[]>([]);
    const [filteredPlans, setFilteredPlans] = useState<PlanSummary[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [joinedIds, setJoinedIds] = useState<Set<number>>(new Set());
    const [showFilters, setShowFilters] = useState(false);

    // Filters
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [locationFilter, setLocationFilter] = useState('');
    const [dateFrom, setDateFrom] = useState<Date | null>(null);
    const [dateTo, setDateTo] = useState<Date | null>(null);
    const [visibility, setVisibility] = useState<PlanVisibility | null>(null);

    // Date picker visibility
    const [showDateFrom, setShowDateFrom] = useState(false);
    const [showDateTo, setShowDateTo] = useState(false);

    const { radius, userLocation, handleRadiusChange, clearRadius } = useProximityFilter();

    const { surface, border, tint, tintText, mutedText, text: textColor } = useAppTheme();
    const colorScheme = useColorScheme();

    const hasActiveFilters = !!(
        selectedCategories.length > 0 || locationFilter || dateFrom || dateTo || radius || visibility
    );

    const buildFilters = useCallback((): PlanFilters => {
        const f: PlanFilters = {};
        if (selectedCategories.length > 0) f.interests = selectedCategories;
        if (locationFilter) f.location = locationFilter;
        if (dateFrom) f.dateFrom = `${fmt(dateFrom)}T00:00:00`;
        if (dateTo) f.dateTo = `${fmt(dateTo)}T23:59:59`;
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
            setJoinedIds(myJoinedSet);

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
            setFilteredPlans(visiblePlans);
        } catch {
            Alert.alert(
                t('error'),
                hasActiveFilters
                    ? t('unable_apply_filters')
                    : t('unable_load_plans_try'),
            );
        }
    }, [fetchPublicPlans, fetchFilteredPlans, fetchMyJoinedPlans, hasActiveFilters, buildFilters, tokenData.state, t]);

    const { refreshing, onRefresh } = useRefreshControl(loadPlans);

    useEffect(() => { loadPlans(); }, [loadPlans]);

    useEffect(() => {
        if (!searchQuery.trim()) { setFilteredPlans(plans); return; }
        const q = normalizeSearch(searchQuery);
        setFilteredPlans(plans.filter((p) =>
            normalizeSearch(p.title).includes(q) ||
            (p.location ? normalizeSearch(p.location).includes(q) : false) ||
            (p.interests ?? []).some((interest) => normalizeSearch(interest).includes(q))
        ));
    }, [searchQuery, plans]);

    const clearFilters = () => {
        setSelectedCategories([]);
        setLocationFilter('');
        setDateFrom(null);
        setDateTo(null);
        setVisibility(null);
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
                            <ThemedText type="label" style={{ color: tintText }}>{t('from_date', { date: fmt(dateFrom) })}</ThemedText>
                        </View>
                    )}
                    {dateTo && (
                        <View style={[styles.activeChip, { backgroundColor: tint }]}>
                            <ThemedText type="label" style={{ color: tintText }}>{t('until_date', { date: fmt(dateTo) })}</ThemedText>
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
                    data={filteredPlans}
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
                    <Pressable
                        onPress={() => {
                            const next = !showDateFrom;
                            setShowDateFrom(next);
                            if (next) setShowDateTo(false);
                        }}
                        style={[styles.searchContainer, { backgroundColor: surface, borderColor: border, marginBottom: 24, marginHorizontal: 0 }]}
                    >
                        <Ionicons name="calendar-outline" size={18} color={mutedText} />
                        <ThemedText type="body" style={[styles.flexText, { color: dateFrom ? textColor : mutedText }]}>
                            {dateFrom ? fmt(dateFrom) : t('select_date')}
                        </ThemedText>
                        {dateFrom && (
                            <Pressable onPress={() => setDateFrom(null)}>
                                <Ionicons name="close-circle" size={18} color={mutedText} />
                            </Pressable>
                        )}
                    </Pressable>
                    {showDateFrom && (
                        <View style={[styles.inlinePicker, { backgroundColor: surface, borderColor: border, marginBottom: 24, overflow: 'hidden', alignItems: 'center', padding: 8, borderWidth: 1, borderRadius: 12 }]}>
                            <DateTimePicker
                                value={dateFrom ?? new Date()}
                                mode="date"
                                display={Platform.OS === 'ios' ? 'inline' : 'default'}
                                textColor={textColor}
                                themeVariant={colorScheme}
                                accentColor={tint}
                                onChange={(_, date) => {
                                    setShowDateFrom(Platform.OS === 'ios');
                                    if (date) setDateFrom(date);
                                }}
                            />
                        </View>
                    )}

                    {/* End date */}
                    <ThemedText type="subtitle" style={styles.modalSectionTitle}>{t('end_date')}</ThemedText>
                    <Pressable
                        onPress={() => {
                            const next = !showDateTo;
                            setShowDateTo(next);
                            if (next) setShowDateFrom(false);
                        }}
                        style={[styles.searchContainer, { backgroundColor: surface, borderColor: border, marginBottom: 24, marginHorizontal: 0 }]}
                    >
                        <Ionicons name="calendar-outline" size={18} color={mutedText} />
                        <ThemedText type="body" style={[styles.flexText, { color: dateTo ? textColor : mutedText }]}>
                            {dateTo ? fmt(dateTo) : t('select_date')}
                        </ThemedText>
                        {dateTo && (
                            <Pressable onPress={() => setDateTo(null)}>
                                <Ionicons name="close-circle" size={18} color={mutedText} />
                            </Pressable>
                        )}
                    </Pressable>
                    {showDateTo && (
                        <View style={[styles.inlinePicker, { backgroundColor: surface, borderColor: border, marginBottom: 24, overflow: 'hidden', alignItems: 'center', padding: 8, borderWidth: 1, borderRadius: 12 }]}>
                            <DateTimePicker
                                value={dateTo ?? new Date()}
                                mode="date"
                                minimumDate={dateFrom ?? undefined}
                                display={Platform.OS === 'ios' ? 'inline' : 'default'}
                                textColor={textColor}
                                themeVariant={colorScheme}
                                accentColor={tint}
                                onChange={(_, date) => {
                                    setShowDateTo(Platform.OS === 'ios');
                                    if (date) setDateTo(date);
                                }}
                            />
                        </View>
                    )}

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
