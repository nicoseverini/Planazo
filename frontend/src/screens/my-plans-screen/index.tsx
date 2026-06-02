import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Pressable,
    RefreshControl,
    ScrollView,
    TextInput,
    View,
} from 'react-native';

import { CreatedPlanCard } from '@/components/CreatedPlanCard';
import { SubscribedPlanCard } from '@/components/SubscribedPlanCard';
import { ThemedText } from '@/components/ThemedText';
import { AppScreen } from '@/components/ui';
import { useThemeColor } from '@/hooks/use-theme-color';
import { PlanSummary, usePlans } from '@/services/plan';

import { styles } from './styles';

export function MyPlansScreen() {
    const router = useRouter();
    const { fetchMyCreatedPlans, fetchMyJoinedPlans, loading } = usePlans();

    const [subscribedPlans, setSubscribedPlans] = useState<PlanSummary[]>([]);
    const [createdPlans, setCreatedPlans] = useState<PlanSummary[]>([]);
    const [filteredCreatedPlans, setFilteredCreatedPlans] = useState<PlanSummary[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [refreshing, setRefreshing] = useState(false);

    const surface = useThemeColor({}, 'surface');
    const border = useThemeColor({}, 'border');
    const tint = useThemeColor({}, 'tint');
    const tintText = useThemeColor({}, 'tintText');
    const mutedText = useThemeColor({}, 'mutedText');
    const textColor = useThemeColor({}, 'text');

    const loadPlans = useCallback(async () => {
        try {
            const [joined, created] = await Promise.all([fetchMyJoinedPlans(), fetchMyCreatedPlans()]);
            setSubscribedPlans(joined);
            setCreatedPlans(created);
            setFilteredCreatedPlans(created);
        } catch (err) {
            console.error('Error loading my plans:', err);
        }
    }, [fetchMyCreatedPlans, fetchMyJoinedPlans]);

    useEffect(() => {
        loadPlans();
    }, [loadPlans]);

    useEffect(() => {
        let filtered = createdPlans;

        if (searchQuery.trim() !== '') {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (plan) =>
                    plan.title.toLowerCase().includes(query) ||
                    plan.location.toLowerCase().includes(query) ||
                    plan.interest.toLowerCase().includes(query)
            );
        }

        setFilteredCreatedPlans(filtered);
    }, [searchQuery, createdPlans]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadPlans();
        setRefreshing(false);
    }, [loadPlans]);

    const handlePlanPress = (planId: number) => {
        router.push(`/plan/${planId}` as any);
    };

    const handleCreatePlan = () => {
        router.push('/create-plan' as any);
    };

    const goToSearchPlans = () => {
        router.push('/search-plans' as any);
    };

    const renderSubscribedSection = () => (
        <View style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
                Planes Subscriptos
            </ThemedText>
            {subscribedPlans.length > 0 ? (
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.subscribedList}
                >
                    {subscribedPlans.map((plan) => (
                        <SubscribedPlanCard key={plan.id} plan={plan} onPress={handlePlanPress} />
                    ))}
                </ScrollView>
            ) : (
                <View style={[styles.emptySubscribed, { backgroundColor: surface, borderColor: border }]}>
                    <Ionicons name="calendar-outline" size={24} color={mutedText} />
                    <ThemedText type="label" style={[styles.emptyText, { color: mutedText }]}>
                        No estas subscripto a ningun plan
                    </ThemedText>
                </View>
            )}
            <View style={styles.sectionAction}>
                <Pressable
                    onPress={goToSearchPlans}
                    style={[styles.browseButton, { borderColor: tint }]}
                >
                    <ThemedText type="label" style={[styles.browseButtonText, { color: tint }]}
                    >
                        Buscar Plan
                    </ThemedText>
                </Pressable>
            </View>
        </View>
    );

    return (
        <AppScreen contentStyle={styles.appScreenContent}>
            {/* Header */}
            <View style={styles.header}>
                <ThemedText type="title">Mis Planes</ThemedText>
            </View>

            <ScrollView
                style={styles.scrollView}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={tint} />
                }
                showsVerticalScrollIndicator={false}
            >
                {/* Subscribed Plans Section */}
                {renderSubscribedSection()}

                {/* Search */}
                <View
                    style={[styles.searchContainer, { backgroundColor: surface, borderColor: border }]}
                >
                    <Ionicons name="search-outline" size={20} color={mutedText} />
                    <TextInput
                        style={[styles.searchInput, { color: textColor }]}
                        placeholder="Buscar plan..."
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

                <ThemedText type="subtitle" style={styles.sectionTitle}>
                    Planes Activos Creados
                </ThemedText>

                {/* Created Plans List */}
                {loading && createdPlans.length === 0 ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={tint} />
                    </View>
                ) : filteredCreatedPlans.length > 0 ? (
                    <View style={styles.createdList}>
                        {filteredCreatedPlans.map((plan) => (
                            <CreatedPlanCard key={plan.id} plan={plan} onPress={handlePlanPress} />
                        ))}
                    </View>
                ) : (
                    <View style={styles.emptyCreated}>
                        <Ionicons name="create-outline" size={48} color={mutedText} />
                        <ThemedText type="body" style={[styles.emptyText, { color: mutedText }]}>
                            No has creado ningun plan
                        </ThemedText>
                    </View>
                )}

                <View style={styles.sectionAction}>
                    <Pressable
                        onPress={handleCreatePlan}
                        style={[styles.browseButton, { borderColor: tint }]}
                    >
                        <ThemedText type="label" style={[styles.browseButtonText, { color: tint }]}
                        >
                            Crear Plan
                        </ThemedText>
                    </Pressable>
                </View>

                {/* Bottom padding */}
                <View style={styles.bottomPadding} />
            </ScrollView>

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
