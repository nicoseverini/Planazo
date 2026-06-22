import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Pressable,
    RefreshControl,
    ScrollView,
    View,
} from 'react-native';

import { CreatedPlanCard } from '@/components/CreatedPlanCard';
import { SubscribedPlanCard } from '@/components/SubscribedPlanCard';
import { ThemedText } from '@/components/ThemedText';
import { AppScreen } from '@/components/ui';
import { StatusBadgeColors } from '@/constants/theme';
import { useToken } from '@/context/token-context';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useRefreshControl } from '@/hooks/use-refresh-control';
import { PlanSummary, usePlans } from '@/services/plan';

import { styles } from './styles';

export function MyPlansScreen() {
    const router = useRouter();
    const { fetchMyCreatedPlans, fetchMyJoinedPlansButNotMine, loading } = usePlans();

    const [subscribedPlans, setSubscribedPlans] = useState<PlanSummary[]>([]);
    const [createdPlans, setCreatedPlans] = useState<PlanSummary[]>([]);
    const [filteredCreatedPlans, setFilteredCreatedPlans] = useState<PlanSummary[]>([]);
    const [visibilityFilter, setVisibilityFilter] = useState<'ALL' | 'PUBLIC' | 'PRIVATE'>('ALL');

    const { surface, border, tint, tintText, mutedText, text: textColor } = useAppTheme();

    const { tokenData } = useToken();

    const loadPlans = useCallback(async () => {
        // Skip loading if user is not logged in (e.g. during logout)
        if (tokenData.state !== 'LOGGED_IN') return;
        try {
            const [joined, created] = await Promise.all([fetchMyJoinedPlansButNotMine(), fetchMyCreatedPlans()]);
            setSubscribedPlans(joined);
            setCreatedPlans(created);
            setFilteredCreatedPlans(created);
        } catch (err) {
            console.error('Error loading my plans:', err);
        }
    }, [tokenData.state, fetchMyCreatedPlans, fetchMyJoinedPlansButNotMine]);

    const { refreshing, onRefresh } = useRefreshControl(loadPlans);

    useEffect(() => {
        loadPlans();
    }, [loadPlans]);

    useEffect(() => {
        const filtered = visibilityFilter === 'ALL'
            ? createdPlans
            : createdPlans.filter((plan) => plan.visibility === visibilityFilter);
        setFilteredCreatedPlans(filtered);
    }, [createdPlans, visibilityFilter]);

    const handlePlanPress = (planId: number) => {
        router.push(`/plan/${planId}` as any);
    };

    const handleCreatePlan = () => {
        router.push('/create-plan' as any);
    };

    const goToSearchPlans = () => {
        router.push('/search-plans' as any);
    };

    const filteredSubscribedPlans = visibilityFilter === 'ALL'
        ? subscribedPlans
        : subscribedPlans.filter((plan) => plan.visibility === visibilityFilter);

    const renderSubscribedSection = () => (
        <View style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
                Joined Plans
            </ThemedText>
            {filteredSubscribedPlans.length > 0 ? (
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.subscribedList}
                >
                    {filteredSubscribedPlans.map((plan) => (
                        <SubscribedPlanCard key={plan.id} plan={plan} onPress={handlePlanPress} />
                    ))}
                </ScrollView>
            ) : (
                <View style={[styles.emptySubscribed, { backgroundColor: surface, borderColor: border }]}>
                    <Ionicons name="calendar-outline" size={24} color={mutedText} />
                    <ThemedText type="label" style={[styles.emptyText, { color: mutedText }]}>
                        You haven't joined any plan yet
                    </ThemedText>
                    {/* Only show Search Plan button when there are no subscribed plans */}
                    <View style={styles.sectionAction}>
                        <Pressable
                            onPress={goToSearchPlans}
                            style={[styles.browseButton, { borderColor: tint }]}
                        >
                            <ThemedText type="label" style={[styles.browseButtonText, { color: tint }]}
                            >
                                Search Plan
                            </ThemedText>
                        </Pressable>
                    </View>
                </View>
            )}
        </View>
    );

    return (
        <AppScreen contentStyle={styles.appScreenContent}>
            {/* Header */}
            <View style={styles.header}>
                <ThemedText type="title">My Plans</ThemedText>
            </View>

            <View style={styles.tabsContainer}>
                <View style={styles.tabs}>
                    {['ALL', 'PUBLIC', 'PRIVATE'].map((value) => {
                        const isActive = visibilityFilter === value;
                        return (
                            <Pressable
                                key={value}
                                onPress={() => setVisibilityFilter(value as 'ALL' | 'PUBLIC' | 'PRIVATE')}
                                style={[
                                    styles.tab,
                                    { backgroundColor: isActive ? tint : surface, borderColor: border, borderWidth: 1 },
                                ]}
                            >
                                <ThemedText
                                    type="label"
                                    style={[styles.tabText, { color: isActive ? tintText : textColor }]}
                                >
                                    {value === 'ALL' ? 'All' : value === 'PUBLIC' ? 'Public' : 'Private'}
                                </ThemedText>
                            </Pressable>
                        );
                    })}
                </View>
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

                <ThemedText type="subtitle" style={styles.sectionTitle}>
                    Active Plans You Created
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
                            You have not created any plan
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
                            Create Plan
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
