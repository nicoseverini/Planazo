import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Pressable,
    RefreshControl,
    TextInput,
    View,
} from 'react-native';

import { PlanCard } from '@/components/PlanCard';
import { ThemedText } from '@/components/ThemedText';
import { AppScreen } from '@/components/ui';
import { useThemeColor } from '@/hooks/use-theme-color';
import { PlanSummary, usePlans } from '@/services/plan';

import { styles } from './styles';

export function SearchPlansScreen() {
    const router = useRouter();
    const { fetchPublicPlans, fetchMyJoinedPlans, subscribe, loading } = usePlans();

    const [plans, setPlans] = useState<PlanSummary[]>([]);
    const [filteredPlans, setFilteredPlans] = useState<PlanSummary[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [refreshing, setRefreshing] = useState(false);
    const [subscribingId, setSubscribingId] = useState<number | null>(null);
    const [joinedIds, setJoinedIds] = useState<Set<number>>(new Set());

    const surface = useThemeColor({}, 'surface');
    const border = useThemeColor({}, 'border');
    const tint = useThemeColor({}, 'tint');
    const tintText = useThemeColor({}, 'tintText');
    const mutedText = useThemeColor({}, 'mutedText');
    const textColor = useThemeColor({}, 'text');

    const loadPlans = useCallback(async () => {
        try {
            const [publicPlans, joinedPlans] = await Promise.all([
                fetchPublicPlans(),
                fetchMyJoinedPlans().catch(() => [] as PlanSummary[]),
            ]);
            setPlans(publicPlans);
            setFilteredPlans(publicPlans);
            setJoinedIds(new Set(joinedPlans.map((plan) => plan.id)));
        } catch (err) {
            console.error('Error loading plans:', err);
        }
    }, [fetchPublicPlans, fetchMyJoinedPlans]);

    useEffect(() => {
        loadPlans();
    }, [loadPlans]);

    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredPlans(plans);
        } else {
            const query = searchQuery.toLowerCase();
            setFilteredPlans(
                plans.filter(
                    (plan) =>
                        plan.title.toLowerCase().includes(query) ||
                        plan.location.toLowerCase().includes(query) ||
                        plan.interest.toLowerCase().includes(query)
                )
            );
        }
    }, [searchQuery, plans]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadPlans();
        setRefreshing(false);
    }, [loadPlans]);

    const handleSubscribe = async (planId: number) => {
        setSubscribingId(planId);
        try {
            await subscribe(planId);
            setJoinedIds((prev) => new Set(prev).add(planId));
            await loadPlans();
        } catch (err) {
            console.error('Error subscribing:', err);
        } finally {
            setSubscribingId(null);
        }
    };

    const handleCreatePlan = () => {
        router.push('/create-plan' as any);
    };

    const handlePlanPress = (planId: number) => {
        router.push(`/plan/${planId}` as any);
    };

    return (
        <AppScreen>
            {/* Header */}
            <View style={styles.header}>
                <ThemedText type="title">Planes</ThemedText>
            </View>

            {/* Filter/Search */}
            <View style={[styles.searchContainer, { backgroundColor: surface, borderColor: border }]}>
                <Ionicons name="search-outline" size={20} color={mutedText} />
                <TextInput
                    style={[styles.searchInput, { color: textColor }]}
                    placeholder="Filtrar por..."
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

            {/* Plans List */}
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
                            onPress={handlePlanPress}
                            onSubscribe={handleSubscribe}
                            subscribing={subscribingId === item.id}
                            isSubscribed={joinedIds.has(item.id)}
                        />
                    )}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={tint} />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="calendar-outline" size={48} color={mutedText} />
                            <ThemedText type="body" style={[styles.emptyText, { color: mutedText }]}>
                                No hay planes disponibles
                            </ThemedText>
                        </View>
                    }
                    showsVerticalScrollIndicator={false}
                />
            )}

            {/* FAB - Create Plan */}
            <Pressable
                onPress={handleCreatePlan}
                style={({ pressed }) => [
                    styles.fab,
                    { backgroundColor: tint },
                    pressed && styles.fabPressed,
                ]}
            >
                <Ionicons name="add" size={28} color={tintText} />
            </Pressable>
        </AppScreen>
    );
}
