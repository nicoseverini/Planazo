import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator, Alert, FlatList, Modal, Platform,
    Pressable, RefreshControl, ScrollView, TextInput, View,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

import { CategoryFilterSelector } from '@/components/CategoryFilterSelector';
import { DistanceSlider } from '@/components/DistanceSlider';
import { PlanCard } from '@/components/PlanCard';
import { ThemedText } from '@/components/ThemedText';
import { AppScreen } from '@/components/ui';
import { decodeJwt, useToken } from '@/context/token-context';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useProximityFilter } from '@/hooks/use-proximity-filter';
import { useRefreshControl } from '@/hooks/use-refresh-control';
import { PlanFilters, PlanSummary, PlanVisibility, usePlans } from '@/services/plan';
import { normalizeSearch } from '@/utils/search';
import { formatInterest } from '@/utils/interests';
import { styles } from './styles';

const VISIBILITY_OPTIONS: { label: string; value: PlanVisibility | null }[] = [
    { label: 'Both', value: null },
    { label: 'Public', value: 'PUBLIC' },
    { label: 'Private', value: 'PRIVATE' },
];

const fmt = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export function SearchPlansScreen() {
    const router = useRouter();
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
                'Error',
                hasActiveFilters
                    ? 'Unable to apply filters. Please try again.'
                    : 'Unable to load plans. Please try again.',
            );
        }
    }, [fetchPublicPlans, fetchFilteredPlans, fetchMyJoinedPlans, hasActiveFilters, buildFilters, tokenData.state]);

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

    const activeChipStyle = { backgroundColor: tint, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 };

    return (
        <AppScreen contentStyle={styles.appScreenContent}>
            {/* Header */}
            <View style={[styles.header, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
                <ThemedText type="title">Plans</ThemedText>
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
                    {selectedCategories.map((cat) => (
                        <View key={cat} style={activeChipStyle}>
                            <ThemedText type="label" style={{ color: tintText }}>{formatInterest(cat)}</ThemedText>
                        </View>
                    ))}
                    {locationFilter && (
                        <View style={activeChipStyle}>
                            <ThemedText type="label" style={{ color: tintText }}>📍 {locationFilter}</ThemedText>
                        </View>
                    )}
                    {dateFrom && (
                        <View style={activeChipStyle}>
                            <ThemedText type="label" style={{ color: tintText }}>From {fmt(dateFrom)}</ThemedText>
                        </View>
                    )}
                    {dateTo && (
                        <View style={activeChipStyle}>
                            <ThemedText type="label" style={{ color: tintText }}>Until {fmt(dateTo)}</ThemedText>
                        </View>
                    )}
                    {radius && (
                        <View style={activeChipStyle}>
                            <ThemedText type="label" style={{ color: tintText }}>Dist: {radius}km</ThemedText>
                        </View>
                    )}
                    {visibility && (
                        <View style={activeChipStyle}>
                            <ThemedText type="label" style={{ color: tintText }}>
                                {visibility === 'PUBLIC' ? '🌐 Public' : '🔒 Private'}
                            </ThemedText>
                        </View>
                    )}
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
                                There are no plans for these filters
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

                    {/* Visibility */}
                    <ThemedText type="subtitle" style={{ marginBottom: 12 }}>Visibility</ThemedText>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
                        {VISIBILITY_OPTIONS.map((opt) => {
                            const active = visibility === opt.value;
                            return (
                                <Pressable
                                    key={opt.label}
                                    onPress={() => setVisibility(opt.value)}
                                    style={{
                                        paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
                                        backgroundColor: active ? tint : 'transparent',
                                        borderWidth: 1, borderColor: active ? tint : border,
                                    }}
                                >
                                    <ThemedText type="label" style={{ color: active ? tintText : textColor }}>
                                        {opt.label}
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
                            placeholder="E.g.: Buenos Aires, Obelisco..."
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
                    <ThemedText type="subtitle" style={{ marginBottom: 12 }}>Start Date</ThemedText>
                    <Pressable
                        onPress={() => setShowDateFrom(true)}
                        style={[styles.searchContainer, { backgroundColor: surface, borderColor: border, marginBottom: 24 }]}
                    >
                        <Ionicons name="calendar-outline" size={18} color={mutedText} />
                        <ThemedText type="body" style={{ flex: 1, color: dateFrom ? textColor : mutedText }}>
                            {dateFrom ? fmt(dateFrom) : 'Select date'}
                        </ThemedText>
                        {dateFrom && (
                            <Pressable onPress={() => setDateFrom(null)}>
                                <Ionicons name="close-circle" size={18} color={mutedText} />
                            </Pressable>
                        )}
                    </Pressable>
                    {showDateFrom && (
                        <DateTimePicker
                            value={dateFrom ?? new Date()}
                            mode="date"
                            display={Platform.OS === 'ios' ? 'inline' : 'default'}
                            onChange={(_, date) => {
                                setShowDateFrom(Platform.OS === 'ios');
                                if (date) setDateFrom(date);
                            }}
                        />
                    )}

                    {/* End date */}
                    <ThemedText type="subtitle" style={{ marginBottom: 12 }}>End Date</ThemedText>
                    <Pressable
                        onPress={() => setShowDateTo(true)}
                        style={[styles.searchContainer, { backgroundColor: surface, borderColor: border, marginBottom: 24 }]}
                    >
                        <Ionicons name="calendar-outline" size={18} color={mutedText} />
                        <ThemedText type="body" style={{ flex: 1, color: dateTo ? textColor : mutedText }}>
                            {dateTo ? fmt(dateTo) : 'Select date'}
                        </ThemedText>
                        {dateTo && (
                            <Pressable onPress={() => setDateTo(null)}>
                                <Ionicons name="close-circle" size={18} color={mutedText} />
                            </Pressable>
                        )}
                    </Pressable>
                    {showDateTo && (
                        <DateTimePicker
                            value={dateTo ?? new Date()}
                            mode="date"
                            minimumDate={dateFrom ?? undefined}
                            display={Platform.OS === 'ios' ? 'inline' : 'default'}
                            onChange={(_, date) => {
                                setShowDateTo(Platform.OS === 'ios');
                                if (date) setDateTo(date);
                            }}
                        />
                    )}

                    {/* Proximity */}
                    <ThemedText type="subtitle" style={{ marginTop: 24, marginBottom: 12 }}>Proximity (Distance)</ThemedText>
                    <View style={{ marginBottom: 24 }}>
                        <DistanceSlider radius={radius} onChange={handleRadiusChange} />
                    </View>

                    {/* Actions */}
                    <View style={{ gap: 12 }}>
                        <Pressable
                            onPress={() => { setShowFilters(false); loadPlans(); }}
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
