import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { ThemedText } from '@/components/ThemedText';
import { AppScreen } from '@/components/ui';
import { useAppTheme } from '@/hooks/use-app-theme';
import { usePlans } from '@/services/plan';
import { useTouristPlaces } from '@/services/tourist-place';

import { PlaceListTab } from './PlaceListTab';
import { PlanListTab } from './PlanListTab';
import { styles } from './styles';

type TabKey = 'created' | 'joined' | 'places';

const TABS: { key: TabKey; labelKey: string }[] = [
    { key: 'created', labelKey: 'my_plans' },
    { key: 'joined', labelKey: 'joined_plans' },
    { key: 'places', labelKey: 'my_places' },
];

export function MyActivitiesScreen() {
    const router = useRouter();
    const { t } = useTranslation();
    const { fetchMyCreatedPlans, fetchMyJoinedPlansButNotMine } = usePlans();
    const { fetchMine: fetchMyPlaces } = useTouristPlaces();

    const { surface, border, tint, tintText, text: textColor } = useAppTheme();

    const [activeTab, setActiveTab] = useState<TabKey>('created');

    const goToPlan = (id: number) => router.push(`/plan/${id}` as any);
    const goToPlace = (id: number) => router.push(`/tourist-place/${id}` as any);

    const renderTab = () => {
        switch (activeTab) {
            case 'created':
                return (
                    <PlanListTab
                        load={fetchMyCreatedPlans}
                        showVisibilityFilter
                        errorMessage={t('unable_load_plans')}
                        empty={{
                            icon: 'create-outline',
                            message: t('no_plans_created'),
                        }}
                        action={{
                            icon: 'add',
                            label: t('create_a_plan'),
                            onPress: () => router.push('/create-plan' as any),
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
                        errorMessage={t('unable_load_joined_plans')}
                        empty={{
                            icon: 'people-outline',
                            message: t('no_plans_joined'),
                        }}
                        action={{
                            icon: 'search',
                            label: t('search'),
                            onPress: () => router.push('/search-plans' as any),
                        }}
                        onPressPlan={goToPlan}
                    />
                );
            case 'places':
                return (
                    <PlaceListTab
                        load={fetchMyPlaces}
                        errorMessage={t('unable_load_places')}
                        empty={{
                            icon: 'location-outline',
                            message: t('no_places_created'),
                        }}
                        action={{
                            icon: 'add',
                            label: t('create_tourist_place'),
                            onPress: () => router.push('/tourist-place/create' as any),
                        }}
                        onPressPlace={goToPlace}
                    />
                );
        }
    };

    return (
        <AppScreen contentStyle={styles.appScreenContent}>
            <View style={styles.header}>
                <ThemedText type="title">{t('my_activities')}</ThemedText>
            </View>

            {/* Tab switcher */}
            <View style={styles.tabs}>
                {TABS.map(({ key, labelKey }) => {
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
                                {t(labelKey)}
                            </ThemedText>
                        </Pressable>
                    );
                })}
            </View>

            {renderTab()}
        </AppScreen>
    );
}
