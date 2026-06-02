import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator, FlatList, Modal, Platform,
    Pressable, RefreshControl, ScrollView, TextInput, View,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

import { PlanCard } from '@/components/PlanCard';
import { ThemedText } from '@/components/ThemedText';
import { AppScreen } from '@/components/ui';
import { useThemeColor } from '@/hooks/use-theme-color';
import { PlanFilters, PlanSummary, usePlans } from '@/services/plan';
import { styles } from './styles';

const INTERESTS = [
    'FOOD','CULTURE','NATURE','BEACH','ADVENTURE','SPORTS',
    'NIGHTLIFE','SHOPPING','HISTORY','MOUNTAINS', 'OTHER',
];
const INTEREST_LABELS: Record<string, string> = {
    FOOD:      'Gastronomia',
    CULTURE:   'Cultura',
    NATURE:    'Naturaleza',
    BEACH:     'Playa',
    ADVENTURE: 'Aventura',
    SPORTS:    'Deporte',
    NIGHTLIFE: 'Fiesta',
    SHOPPING:  'Shopping',
    HISTORY:   'Historia',
    MOUNTAINS: 'Montañas',
    OTHER:     'Otro',
};

const fmt = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;

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
    const [selectedInterest, setSelectedInterest] = useState<string | null>(null);
    const [locationFilter, setLocationFilter] = useState('');
    const [dateFrom, setDateFrom] = useState<Date | null>(null);
    const [dateTo, setDateTo] = useState<Date | null>(null);

    // Date picker state
    const [showDateFrom, setShowDateFrom] = useState(false);
    const [showDateTo, setShowDateTo] = useState(false);

    const surface = useThemeColor({}, 'surface');
    const border = useThemeColor({}, 'border');
    const tint = useThemeColor({}, 'tint');
    const tintText = useThemeColor({}, 'tintText');
    const mutedText = useThemeColor({}, 'mutedText');
    const textColor = useThemeColor({}, 'text');

    const hasActiveFilters = !!(selectedInterest || locationFilter || dateFrom || dateTo);

    const buildFilters = useCallback((): PlanFilters => {
        const f: PlanFilters = {};
        if (selectedInterest) f.interest = selectedInterest;
        if (locationFilter)   f.location = locationFilter;
        if (dateFrom)         f.dateFrom = `${fmt(dateFrom)}T00:00:00`;
        if (dateTo)           f.dateTo   = `${fmt(dateTo)}T23:59:59`;
        return f;
    }, [selectedInterest, locationFilter, dateFrom, dateTo]);

    const loadPlans = useCallback(async () => {
        try {
            const [publicPlans, joinedPlans] = await Promise.all([
                hasActiveFilters ? fetchFilteredPlans(buildFilters()) : fetchPublicPlans(),
                fetchMyJoinedPlans().catch(() => [] as PlanSummary[]),
            ]);
            setPlans(publicPlans);
            setFilteredPlans(publicPlans);
            setJoinedIds(new Set(joinedPlans.map((p) => p.id)));
        } catch (err) {
            console.error('Error loading plans:', err);
        }
    }, [fetchPublicPlans, fetchFilteredPlans, fetchMyJoinedPlans, hasActiveFilters, buildFilters]);

    useEffect(() => { loadPlans(); }, [loadPlans]);

    useEffect(() => {
        if (!searchQuery.trim()) { setFilteredPlans(plans); return; }
        const q = searchQuery.toLowerCase();
        setFilteredPlans(plans.filter(p =>
            p.title.toLowerCase().includes(q) ||
            p.location?.toLowerCase().includes(q) ||
            (p.interests ?? []).some((interest) => interest.toLowerCase().includes(q))
        ));
    }, [searchQuery, plans]);

    const clearFilters = () => {
        setSelectedInterest(null);
        setLocationFilter('');
        setDateFrom(null);
        setDateTo(null);
    };

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadPlans();
        setRefreshing(false);
    }, [loadPlans]);

    const handleSubscribe = async (planId: number) => {
        setSubscribingId(planId);
        try {
            await subscribe(planId);
            setJoinedIds(prev => new Set(prev).add(planId));
            await loadPlans();
        } catch (err) {
            console.error('Error subscribing:', err);
        } finally {
            setSubscribingId(null);
        }
    };

    const activeChipStyle = { backgroundColor: tint, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 };

    return (
        <AppScreen contentStyle={styles.appScreenContent}>
            {/* Header */}
            <View style={[styles.header, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
                <ThemedText type="title">Planes</ThemedText>
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
                    {selectedInterest && (
                        <View style={activeChipStyle}>
                            <ThemedText type="label" style={{ color: tintText }}>
                                {INTEREST_LABELS[selectedInterest]}
                            </ThemedText>
                        </View>
                    )}
                    {locationFilter && (
                        <View style={activeChipStyle}>
                            <ThemedText type="label" style={{ color: tintText }}>📍 {locationFilter}</ThemedText>
                        </View>
                    )}
                    {dateFrom && (
                        <View style={activeChipStyle}>
                            <ThemedText type="label" style={{ color: tintText }}>Desde {fmt(dateFrom)}</ThemedText>
                        </View>
                    )}
                    {dateTo && (
                        <View style={activeChipStyle}>
                            <ThemedText type="label" style={{ color: tintText }}>Hasta {fmt(dateTo)}</ThemedText>
                        </View>
                    )}
                    <Pressable onPress={clearFilters} style={{ justifyContent: 'center' }}>
                        <ThemedText type="label" style={{ color: mutedText }}>✕ Limpiar</ThemedText>
                    </Pressable>
                </View>
            )}

            {/* Search bar */}
            <View style={[styles.searchContainer, { backgroundColor: surface, borderColor: border }]}>
                <Ionicons name="search-outline" size={20} color={mutedText} />
                <TextInput
                    style={[styles.searchInput, { color: textColor }]}
                    placeholder="Buscar por nombre"
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
                                No hay planes para estos filtros
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
                    {/* Título modal */}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                        <ThemedText type="heading">Filtros</ThemedText>
                        <Pressable onPress={() => setShowFilters(false)}>
                            <Ionicons name="close" size={24} color={textColor} />
                        </Pressable>
                    </View>

                    {/* Categoría */}
                    <ThemedText type="subtitle" style={{ marginBottom: 12 }}>Categoría</ThemedText>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
                        {INTERESTS.map((i) => {
                            const active = selectedInterest === i;
                            return (
                                <Pressable
                                    key={i}
                                    onPress={() => setSelectedInterest(active ? null : i)}
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
                    <ThemedText type="subtitle" style={{ marginBottom: 12 }}>Ubicación</ThemedText>
                    <View style={[styles.searchContainer, { backgroundColor: surface, borderColor: border, marginBottom: 24 }]}>
                        <Ionicons name="location-outline" size={18} color={mutedText} />
                        <TextInput
                            style={[styles.searchInput, { color: textColor }]}
                            placeholder="Ej: FIUBA, Paseo Colón..."
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
                    <ThemedText type="subtitle" style={{ marginBottom: 12 }}>Fecha desde</ThemedText>
                    <Pressable
                        onPress={() => setShowDateFrom(true)}
                        style={[styles.searchContainer, { backgroundColor: surface, borderColor: border, marginBottom: 24 }]}
                    >
                        <Ionicons name="calendar-outline" size={18} color={mutedText} />
                        <ThemedText type="body" style={{ flex: 1, color: dateFrom ? textColor : mutedText }}>
                            {dateFrom ? fmt(dateFrom) : 'Seleccionar fecha'}
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
                    <ThemedText type="subtitle" style={{ marginBottom: 12 }}>Fecha hasta</ThemedText>
                    <Pressable
                        onPress={() => setShowDateTo(true)}
                        style={[styles.searchContainer, { backgroundColor: surface, borderColor: border, marginBottom: 24 }]}
                    >
                        <Ionicons name="calendar-outline" size={18} color={mutedText} />
                        <ThemedText type="body" style={{ flex: 1, color: dateTo ? textColor : mutedText }}>
                            {dateTo ? fmt(dateTo) : 'Seleccionar fecha'}
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

                    {/* Precio máximo
                    <ThemedText type="subtitle" style={{ marginBottom: 12 }}>Precio máximo</ThemedText>
                    <View style={[styles.searchContainer, { backgroundColor: surface, borderColor: border, marginBottom: 32 }]}>
                        <Ionicons name="cash-outline" size={18} color={mutedText} />
                        <TextInput
                            style={[styles.searchInput, { color: textColor }]}
                            placeholder="Ej: 5000"
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
                            <ThemedText type="subtitle" style={{ color: tintText }}>Aplicar filtros</ThemedText>
                        </Pressable>
                        <Pressable
                            onPress={() => { clearFilters(); setShowFilters(false); }}
                            style={{ borderWidth: 1, borderColor: border, borderRadius: 12, padding: 16, alignItems: 'center' }}
                        >
                            <ThemedText type="subtitle">Limpiar todo</ThemedText>
                        </Pressable>
                    </View>
                </ScrollView>
            </Modal>
        </AppScreen>
    );
}