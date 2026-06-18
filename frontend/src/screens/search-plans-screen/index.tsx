import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator, FlatList, Modal, Platform,
    Pressable, RefreshControl, ScrollView, TextInput, View, Alert
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Location from 'expo-location';

import { PlanCard } from '@/components/PlanCard';
import { ThemedText } from '@/components/ThemedText';
import { AppScreen } from '@/components/ui';
import { decodeJwt, useToken } from '@/context/token-context';
import { useThemeColor } from '@/hooks/use-theme-color';
import { PlanFilters, PlanSummary, usePlans } from '@/services/plan';
import { styles } from './styles';

const INTERESTS = [
    'FOOD', 'CULTURE', 'NATURE', 'BEACH', 'ADVENTURE', 'SPORTS',
    'NIGHTLIFE', 'SHOPPING', 'HISTORY', 'MOUNTAINS', 'OTHER',
];
const INTEREST_LABELS: Record<string, string> = {
    FOOD: 'Food',
    CULTURE: 'Culture',
    NATURE: 'Nature',
    BEACH: 'Beach',
    SPORTS: 'Sports',
    ADVENTURE: 'Adventure',
    NIGHTLIFE: 'Nightlife',
    SHOPPING: 'Shopping',
    HISTORY: 'History',
    MOUNTAINS: 'Mountains',
    OTHER: 'Other',
};

const fmt = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export function SearchPlansScreen() {
    const router = useRouter();
    const { fetchPublicPlans, fetchMyJoinedPlans, fetchFilteredPlans, subscribe, loading } = usePlans();

    const [plans, setPlans] = useState<PlanSummary[]>([]);
    const [filteredPlans, setFilteredPlans] = useState<PlanSummary[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [refreshing, setRefreshing] = useState(false);
    const [subscribingId, setSubscribingId] = useState<number | null>(null);
    const [joinedIds, setJoinedIds] = useState<Set<number>>(new Set());
    const [showFilters, setShowFilters] = useState(false);

    // Filtros
    const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
    const [locationFilter, setLocationFilter] = useState('');
    const [dateFrom, setDateFrom] = useState<Date | null>(null);
    const [dateTo, setDateTo] = useState<Date | null>(null);
    const [radius, setRadius] = useState<number | null>(null);
    const [userLocation, setUserLocation] = useState<{ lat: number, lng: number } | null>(null);

    // Date picker state
    const [showDateFrom, setShowDateFrom] = useState(false);
    const [showDateTo, setShowDateTo] = useState(false);

    const surface = useThemeColor({}, 'surface');
    const border = useThemeColor({}, 'border');
    const tint = useThemeColor({}, 'tint');
    const tintText = useThemeColor({}, 'tintText');
    const mutedText = useThemeColor({}, 'mutedText');
    const textColor = useThemeColor({}, 'text');

    const hasActiveFilters = !!(selectedInterests.length > 0 || locationFilter || dateFrom || dateTo || radius);

    const buildFilters = useCallback((): PlanFilters => {
        const f: PlanFilters = {};
        if (selectedInterests.length > 0) f.interests = selectedInterests;
        if (locationFilter) f.location = locationFilter;
        if (dateFrom) f.dateFrom = `${fmt(dateFrom)}T00:00:00`;
        if (dateTo) f.dateTo = `${fmt(dateTo)}T23:59:59`;
        if (radius && userLocation) {
            f.lat = userLocation.lat;
            f.lng = userLocation.lng;
            f.radius = radius;
        }
        return f;
    }, [selectedInterests, locationFilter, dateFrom, dateTo, radius, userLocation]);

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

            // Obtener el id del usuario logueado
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
        } catch (err) {
            console.error('Error loading plans:', err);
            if (hasActiveFilters) {
                Alert.alert('Error', 'Unable to apply filters. Please try again.');
            }
        }
    }, [fetchPublicPlans, fetchFilteredPlans, fetchMyJoinedPlans, hasActiveFilters, buildFilters, tokenData.state]);
    useEffect(() => { loadPlans(); }, [loadPlans]);

    useEffect(() => {
        if (!searchQuery.trim()) { setFilteredPlans(plans); return; }
        const strip = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
        const q = strip(searchQuery);
        setFilteredPlans(plans.filter(p =>
            strip(p.title).includes(q) ||
            (p.location ? strip(p.location).includes(q) : false) ||
            (p.interests ?? []).some((interest) => strip(interest).includes(q))
        ));
    }, [searchQuery, plans]);

    const clearFilters = () => {
        setSelectedInterests([]);
        setLocationFilter('');
        setDateFrom(null);
        setDateTo(null);
        setRadius(null);
    };

    const handleRadiusSelect = async (r: number | null) => {
        if (r === null) {
            setRadius(null);
            return;
        }
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission denied', 'Permission to access location was denied');
                return;
            }
            const location = await Location.getCurrentPositionAsync({});
            setUserLocation({
                lat: location.coords.latitude,
                lng: location.coords.longitude
            });
            setRadius(r);
        } catch (err) {
            console.error('Error getting location:', err);
            Alert.alert('Error', 'Could not get current location');
        }
    };

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadPlans();
        setRefreshing(false);
    }, [loadPlans]);

    const handleSubscribe = async (planId: number) => {
        const isPrivate = filteredPlans.find((p) => p.id === planId)?.visibility === 'PRIVATE';
        setSubscribingId(planId);
        try {
            await subscribe(planId);
            setJoinedIds(prev => new Set(prev).add(planId));
            await loadPlans();
            if (isPrivate) {
                Alert.alert(
                    'Request sent',
                    'Your subscription request was sent. You can check its status in "My Plans".'
                );
            }
        } catch (err) {
            console.error('Error subscribing:', err);
            const message = err instanceof Error ? err.message : 'Could not process the subscription';
            Alert.alert('Error', message);
        } finally {
            setSubscribingId(null);
        }
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

            {/* Chips de filtros activos */}
            {hasActiveFilters && (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginHorizontal: 20, marginBottom: 8 }}>
                    {selectedInterests.map((interest) => (
                        <View key={interest} style={activeChipStyle}>
                            <ThemedText type="label" style={{ color: tintText }}>
                                {INTEREST_LABELS[interest]}
                            </ThemedText>
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
                            onSubscribe={handleSubscribe}
                            subscribing={subscribingId === item.id}
                            isSubscribed={joinedIds.has(item.id)}
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

            {/* ── Modal de filtros ── */}
            <Modal visible={showFilters} animationType="slide" presentationStyle="pageSheet">
                <ScrollView
                    style={{ flex: 1, backgroundColor: surface }}
                    contentContainerStyle={{ padding: 24, paddingBottom: 60 }}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Filter modal */}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                        <ThemedText type="heading">Filters</ThemedText>
                        <Pressable onPress={() => setShowFilters(false)}>
                            <Ionicons name="close" size={24} color={textColor} />
                        </Pressable>
                    </View>

                    {/* Categoría */}
                    <ThemedText type="subtitle" style={{ marginBottom: 12 }}>Category</ThemedText>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
                        {INTERESTS.map((i) => {
                            const active = selectedInterests.includes(i);
                            return (
                                <Pressable
                                    key={i}
                                    onPress={() =>
                                        setSelectedInterests((prev) =>
                                            prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]
                                        )
                                    }
                                    style={{
                                        paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
                                        backgroundColor: active ? tint : 'transparent',
                                        borderWidth: 1, borderColor: active ? tint : border,
                                    }}
                                >
                                    <ThemedText type="label" style={{ color: active ? tintText : textColor }}>
                                        {INTEREST_LABELS[i]}
                                    </ThemedText>
                                </Pressable>
                            );
                        })}
                    </View>

                    {/* Ubicación */}
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

                    {/* Fecha desde */}
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

                    {/* Fecha hasta */}
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

                    {/* Proximity Radius */}
                    <ThemedText type="subtitle" style={{ marginTop: 24, marginBottom: 12 }}>Proximity (Distance)</ThemedText>
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

                    {/* Max Price
                    <ThemedText type="subtitle" style={{ marginBottom: 12 }}>Max Price</ThemedText>
                    <View style={[styles.searchContainer, { backgroundColor: surface, borderColor: border, marginBottom: 32 }]}>
                        <Ionicons name="cash-outline" size={18} color={mutedText} />
                        <TextInput
                            style={[styles.searchInput, { color: textColor }]}
                            placeholder="E.g.: 5000"
                            placeholderTextColor={mutedText}
                            keyboardType="numeric"
                        />
                    </View> */}

                    {/* Botones */}
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