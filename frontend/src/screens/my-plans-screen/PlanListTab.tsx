import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
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
import { useAppTheme } from '@/hooks/use-app-theme';
import { useProximityFilter } from '@/hooks/use-proximity-filter';
import { PlanSummary, PlanVisibility } from '@/services/plan';
import { formatLocalizedDate } from '@/utils/date';
import { formatInterest } from '@/utils/interests';
import { haversineKm } from '@/utils/distance';
import {
    EMPTY_PLAN_FILTERS, ParticipationStatus, PlanClientFilters,
    filterPlans, hasActivePlanFilters,
} from '@/utils/plan-filters';

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
    load: () => Promise<PlanSummary[]>;
    showStatusBadge?: boolean;
    showVisibilityFilter?: boolean;
    showStatusFilter?: boolean;
    errorMessage: string;
    empty: EmptyState;
    action: TabAction;
    onPressPlan: (id: number) => void;
};

const VISIBILITY_OPTIONS: { labelKey: string; value: PlanVisibility | null }[] = [
    { labelKey: 'both', value: null },
    { labelKey: 'public', value: 'PUBLIC' },
    { labelKey: 'private', value: 'PRIVATE' },
];

const STATUS_OPTIONS: { labelKey: string; value: ParticipationStatus | null }[] = [
    { labelKey: 'any', value: null },
    { labelKey: 'pending', value: 'PENDING' },
    { labelKey: 'accepted', value: 'ACCEPTED' },
];

export function PlanListTab({
    load, showStatusBadge, showVisibilityFilter, showStatusFilter, errorMessage, empty, action, onPressPlan,
}: Props) {
    const { t } = useTranslation();
    const { surface, border, tint, tintText, mutedText, text: textColor } = useAppTheme();

    const [plans, setPlans] = useState<PlanSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [showFilters, setShowFilters] = useState(false);

    // Radius + location permission flow is owned by the shared proximity hook.
    const { radius, userLocation, handleRadiusChange, clearRadius } = useProximityFilter();
    // Everything else lives here; combined into PlanClientFilters at filter time.
    const [filters, setFilters] = useState<Omit<PlanClientFilters, 'radius'>>(EMPTY_PLAN_FILTERS);
    const [sortBy, setSortBy] = useState<'nearest' | 'date' | 'title'>('nearest');

    const fullFilters: PlanClientFilters = useMemo(() => ({ ...filters, radius }), [filters, radius]);
    const hasFilters = hasActivePlanFilters(fullFilters) || sortBy !== 'nearest';

    const loadPlans = useCallback(async () => {
        try {
            setPlans(await load());
        } catch {
            Alert.alert(t('error'), errorMessage);
        } finally {
            setLoading(false);
        }
    }, [load, errorMessage, t]);

    useFocusEffect(
        useCallback(() => {
            loadPlans();
        }, [loadPlans])
    );

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadPlans();
        setRefreshing(false);
    }, [loadPlans]);

    const visiblePlans = useMemo(() => {
        const filtered = filterPlans(plans, fullFilters, userLocation);
        
        if (sortBy === 'nearest' && userLocation) {
            filtered.sort((a, b) => {
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
            filtered.sort((a, b) => {
                const dateA = a.startDate ? new Date(a.startDate).getTime() : Infinity;
                const dateB = b.startDate ? new Date(b.startDate).getTime() : Infinity;
                return dateA - dateB;
            });
        } else if (sortBy === 'title') {
            filtered.sort((a, b) => a.title.localeCompare(b.title));
        }

        return filtered;
    }, [plans, fullFilters, userLocation, sortBy]);

    const clearFilters = () => {
        setFilters(EMPTY_PLAN_FILTERS);
        setSortBy('nearest');
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
                    {filters.visibility && (
                        <View style={activeChipStyle}>
                            <ThemedText type="label" style={{ color: tintText }}>
                                {filters.visibility === 'PUBLIC' ? `🌐 ${t('public')}` : `🔒 ${t('private')}`}
                            </ThemedText>
                        </View>
                    )}
                    {filters.status && (
                        <View style={activeChipStyle}>
                            <ThemedText type="label" style={{ color: tintText }}>
                                {filters.status === 'ACCEPTED' ? t('accepted') : t('pending')}
                            </ThemedText>
                        </View>
                    )}
                    {!!filters.location && (
                        <View style={activeChipStyle}>
                            <ThemedText type="label" style={{ color: tintText }}>📍 {filters.location}</ThemedText>
                        </View>
                    )}
                    {filters.dateFrom && (
                        <View style={activeChipStyle}>
                            <ThemedText type="label" style={{ color: tintText }}>{t('from_date', { date: formatLocalizedDate(filters.dateFrom) })}</ThemedText>
                        </View>
                    )}
                    {filters.dateTo && (
                        <View style={activeChipStyle}>
                            <ThemedText type="label" style={{ color: tintText }}>{t('until_date', { date: formatLocalizedDate(filters.dateTo) })}</ThemedText>
                        </View>
                    )}
                    {radius && (
                        <View style={activeChipStyle}>
                            <ThemedText type="label" style={{ color: tintText }}>{t('distance_km', { radius })}</ThemedText>
                        </View>
                    )}
                    {sortBy !== 'nearest' && (
                        <View style={activeChipStyle}>
                            <ThemedText type="label" style={{ color: tintText }}>
                                {sortBy === 'date' ? `📅 ${t('sort_date')}` : `🔤 ${t('sort_title')}`}
                            </ThemedText>
                        </View>
                    )}
                    <Pressable onPress={clearFilters} style={{ justifyContent: 'center' }}>
                        <ThemedText type="label" style={{ color: mutedText }}>✕ {t('clear_all')}</ThemedText>
                    </Pressable>
                </View>
            )}

            {/* List */}
            {loading && plans.length === 0 ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={tint} />
                </View>
            ) : (
                <FlatList
                    data={visiblePlans}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => <PlanCard plan={item} showStatus={showStatusBadge} onPress={onPressPlan} />}
                    contentContainerStyle={styles.listContent}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={tint} />}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name={empty.icon} size={48} color={mutedText} />
                            <ThemedText type="body" style={[styles.emptyText, { color: mutedText }]}>
                                {hasFilters ? t('no_plans_matching_filters') : empty.message}
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
            {(visiblePlans.length > 0 || hasFilters) && (
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

                    {/* Sort By */}
                    <ThemedText type="subtitle" style={styles.modalLabel}>{t('sort_by')}</ThemedText>
                    <View style={[styles.chipRow, { marginBottom: 24 }]}>
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
                                    style={[styles.choiceChip, { backgroundColor: active ? tint : 'transparent', borderColor: active ? tint : border }]}
                                >
                                    <ThemedText type="label" style={{ color: active ? tintText : textColor }}>
                                        {t(opt.labelKey)}
                                    </ThemedText>
                                </Pressable>
                            );
                        })}
                    </View>

                    {/* Category */}
                    <ThemedText type="subtitle" style={styles.modalLabel}>{t('category')}</ThemedText>
                    <View style={{ marginBottom: 24 }}>
                        <CategoryFilterSelector
                            selected={filters.categories}
                            onChange={(categories) => setFilters((f) => ({ ...f, categories }))}
                        />
                    </View>

                    {/* Visibility */}
                    {showVisibilityFilter && (
                        <>
                            <ThemedText type="subtitle" style={styles.modalLabel}>{t('visibility')}</ThemedText>
                            <View style={styles.chipRow}>
                                {VISIBILITY_OPTIONS.map((opt) => {
                                    const active = filters.visibility === opt.value;
                                    return (
                                        <Pressable
                                            key={opt.labelKey}
                                            onPress={() => setFilters((f) => ({ ...f, visibility: opt.value }))}
                                            style={[styles.choiceChip, { backgroundColor: active ? tint : 'transparent', borderColor: active ? tint : border }]}
                                        >
                                            <ThemedText type="label" style={{ color: active ? tintText : textColor }}>
                                                {t(opt.labelKey)}
                                            </ThemedText>
                                        </Pressable>
                                    );
                                })}
                            </View>
                        </>
                    )}

                    {/* Status */}
                    {showStatusFilter && (
                        <>
                            <ThemedText type="subtitle" style={styles.modalLabel}>{t('request_status')}</ThemedText>
                            <View style={styles.chipRow}>
                                {STATUS_OPTIONS.map((opt) => {
                                    const active = filters.status === opt.value;
                                    return (
                                        <Pressable
                                            key={opt.labelKey}
                                            onPress={() => setFilters((f) => ({ ...f, status: opt.value }))}
                                            style={[styles.choiceChip, { backgroundColor: active ? tint : 'transparent', borderColor: active ? tint : border }]}
                                        >
                                            <ThemedText type="label" style={{ color: active ? tintText : textColor }}>
                                                {t(opt.labelKey)}
                                            </ThemedText>
                                        </Pressable>
                                    );
                                })}
                            </View>
                        </>
                    )}

                    {/* Location */}
                    <ThemedText type="subtitle" style={styles.modalLabel}>{t('location')}</ThemedText>
                    <View style={[styles.modalInput, { backgroundColor: surface, borderColor: border }]}>
                        <Ionicons name="location-outline" size={18} color={mutedText} />
                        <TextInput
                            style={[styles.modalInputText, { color: textColor }]}
                            placeholder={t('location_placeholder_plans')}
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

                    {/* Start date */}
                    <ThemedText type="subtitle" style={styles.modalLabel}>{t('start_date')}</ThemedText>
                    <DateField
                        value={filters.dateFrom}
                        onChange={(date) => setFilters((f) => ({ ...f, dateFrom: date }))}
                        onClear={() => setFilters((f) => ({ ...f, dateFrom: null }))}
                        containerStyle={styles.filterDateField}
                    />

                    {/* End date */}
                    <ThemedText type="subtitle" style={styles.modalLabel}>{t('end_date')}</ThemedText>
                    <DateField
                        value={filters.dateTo}
                        onChange={(date) => setFilters((f) => ({ ...f, dateTo: date }))}
                        onClear={() => setFilters((f) => ({ ...f, dateTo: null }))}
                        minimumDate={filters.dateFrom ?? undefined}
                        containerStyle={styles.filterDateField}
                    />

                    {/* Proximity */}
                    <ThemedText type="subtitle" style={[styles.modalLabel, { marginTop: 8 }]}>{t('proximity_distance')}</ThemedText>
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
