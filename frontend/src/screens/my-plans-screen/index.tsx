import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { AppScreen } from '@/components/ui';
import { useAppTheme } from '@/hooks/use-app-theme';
import { usePlans } from '@/services/plan';
import { useTuristicPlaces } from '@/services/turistic-place';

import { PlaceListTab } from './PlaceListTab';
import { PlanListTab } from './PlanListTab';
import { styles } from './styles';

type TabKey = 'created' | 'joined' | 'places';

const TABS: { key: TabKey; label: string }[] = [
    { key: 'created', label: 'My Plans' },
    { key: 'joined', label: 'Joined Plans' },
    { key: 'places', label: 'My Places' },
];

export function MyActivitiesScreen() {
    const router = useRouter();
    const { fetchMyCreatedPlans, fetchMyJoinedPlansButNotMine } = usePlans();
    const { fetchMine: fetchMyPlaces } = useTuristicPlaces();

    const { surface, border, tint, tintText, text: textColor } = useAppTheme();

    const [activeTab, setActiveTab] = useState<TabKey>('created');

    const goToPlan = (id: number) => router.push(`/plan/${id}` as any);
    const goToPlace = (id: number) => router.push(`/turistic-place/${id}` as any);

    const renderTab = () => {
        switch (activeTab) {
            case 'created':
                return (
                    <PlanListTab
                        load={fetchMyCreatedPlans}
                        showVisibilityFilter
                        errorMessage="Unable to load your plans."
                        empty={{
                            icon: 'create-outline',
                            message: "You haven't created any plans yet.",
                            ctaLabel: 'Create a plan',
                            onCta: () => router.push('/create-plan' as any),
                        }}
                        onPressPlan={goToPlan}
                    />
                );
            case 'joined':
                return (
                    <PlanListTab
                        load={fetchMyJoinedPlansButNotMine}
                        showStatusBadge
                        showStatusFilter
                        errorMessage="Unable to load participating plans."
                        empty={{
                            icon: 'people-outline',
                            message: "You're not participating in any plans yet.",
                            ctaLabel: 'Search plans',
                            onCta: () => router.push('/search-plans' as any),
                        }}
                        onPressPlan={goToPlan}
                    />
                );
            case 'places':
                return (
                    <PlaceListTab
                        load={fetchMyPlaces}
                        errorMessage="Unable to load your places."
                        empty={{
                            icon: 'location-outline',
                            message: "You haven't created any places yet.",
                            ctaLabel: 'Create a tourist place',
                            onCta: () => router.push('/turistic-place/create' as any),
                        }}
                        onPressPlace={goToPlace}
                    />
                );
        }
    };

    return (
        <AppScreen contentStyle={styles.appScreenContent}>
            <View style={styles.header}>
                <ThemedText type="title">My Activities</ThemedText>
            </View>

            {/* Tab switcher */}
            <View style={styles.tabs}>
                {TABS.map(({ key, label }) => {
                    const isActive = activeTab === key;
                    return (
                        <Pressable
                            key={key}
                            onPress={() => setActiveTab(key)}
                            style={[
                                styles.tab,
                                { backgroundColor: isActive ? tint : surface, borderColor: isActive ? tint : border },
                            ]}
                        >
                            <ThemedText type="label" style={[styles.tabText, { color: isActive ? tintText : textColor }]}>
                                {label}
                            </ThemedText>
                        </Pressable>
                    );
                })}
            </View>

            {renderTab()}
        </AppScreen>
    );
}
