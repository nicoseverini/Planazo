import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    View,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';

import { decodeJwt, useToken } from '@/context/token-context';
import { AppScreen } from '@/components/ui';
import { ThemedText } from '@/components/ThemedText';
import { StatusBadgeColors } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { PendingSubscriber, PlanDetail, usePlans } from '@/services/plan';
import { formatAgeRestriction } from '@/utils/age-restriction';

import { styles } from './styles';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type TabType = 'description' | 'subscribe' | 'reviews';

function StarRating({ rating }: { rating: number }) {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
        if (i < fullStars) {
            stars.push(<Ionicons key={i} name="star" size={16} color="#22c55e" />);
        } else if (i === fullStars && hasHalfStar) {
            stars.push(<Ionicons key={i} name="star-half" size={16} color="#22c55e" />);
        } else {
            stars.push(<Ionicons key={i} name="star-outline" size={16} color="#22c55e" />);
        }
    }

    return <View style={styles.starContainer}>{stars}</View>;
}

const parsePlanId = (value?: string | string[]): number | null => {
    const raw = Array.isArray(value) ? value[0] : value;
    if (!raw) return null;
    const parsed = Number.parseInt(raw, 10);
    return Number.isNaN(parsed) ? null : parsed;
};

const formatDateTime = (value: string) => {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
        return { dateLabel: value, timeLabel: '' };
    }

    return {
        dateLabel: parsed.toLocaleDateString(),
        timeLabel: parsed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
};

export default function PlanDetailScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
    const { fetchPlanDetail, fetchMyJoinedPlans, fetchPendingSubscribers, subscribe, unsubscribe, remove, accept, reject} = usePlans();
    const { getAccessToken } = useToken();

    const tint = useThemeColor({}, 'tint');
    const tintText = useThemeColor({}, 'tintText');
    const surface = useThemeColor({}, 'surface');
    const border = useThemeColor({}, 'border');
    const mutedText = useThemeColor({}, 'mutedText');
    const text = useThemeColor({}, 'text');

    const [plan, setPlan] = useState<PlanDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [subscribing, setSubscribing] = useState(false);
    const [activeTab, setActiveTab] = useState<TabType>('description');
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [pendingSubscribers, setPendingSubscribers] = useState<PendingSubscriber[]>([]);
    const [pendingLoading, setPendingLoading] = useState(false);

    const CATEGORY_BY_INTEREST: Record<string, string> = {
        FOOD: 'Gastronomy',
        CULTURE: 'Culture',
        NATURE: 'Nature',
        BEACH: 'Beach',
        ADVENTURE: 'Adventure',
        NIGHTLIFE: 'Nightlife',
        SHOPPING: 'Shopping',
        HISTORY: 'History',
        MOUNTAINS: 'Mountains',
        OTHER: 'Other',
    };

    const interestLabel = (plan?.interests ?? [])
        .map((interest) => CATEGORY_BY_INTEREST[interest] || interest)
        .join(' · ');

    const loadPlan = useCallback(async () => {
        const planId = parsePlanId(id);
        if (!planId) {
            setLoading(false);
            Alert.alert('Error', 'The plan identifier is not valid.');
            return;
        }

        try {
            const data = await fetchPlanDetail(planId);
            setPlan(data);

            const token = getAccessToken();
            if (token) {
                const joinedPlans = await fetchMyJoinedPlans();
                setIsSubscribed(joinedPlans.some((joinedPlan) => joinedPlan.id === planId));
            } else {
                setIsSubscribed(false);
            }
        } catch (err) {
            console.error('[PlanDetailScreen] Error loading plan:', err);
            Alert.alert('Error', 'No se pudo cargar el plan');
        } finally {
            setLoading(false);
        }
    }, [id, fetchMyJoinedPlans, fetchPlanDetail, getAccessToken]);

    useFocusEffect(
        useCallback(() => {
            loadPlan();
        }, [loadPlan])
    );

    const token = getAccessToken();
    let isCreator = false;
    let isPrivatePlan = plan?.visibility === 'PRIVATE';
    if (token && plan) {
        const decoded = decodeJwt(token) as any;
        isCreator = Number(decoded.id) === Number(plan.creatorId);
    }

    const loadPendingSubscribers = useCallback(async () => {
        if (!plan || !isCreator || !isPrivatePlan) return;

        try {
            setPendingLoading(true);
            const data = await fetchPendingSubscribers(plan.id);
            setPendingSubscribers(data);
        } catch (err) {
            console.error('[PlanDetailScreen] Error loading pending subscribers:', err);
            setPendingSubscribers([]);
        } finally {
            setPendingLoading(false);
        }
    }, [fetchPendingSubscribers, isCreator, plan]);

    useEffect(() => {
        if (activeTab === 'subscribe' && isCreator && plan && isPrivatePlan) {
            loadPendingSubscribers();
            return;
        }

        setPendingSubscribers([]);
    }, [activeTab, isCreator, loadPendingSubscribers, plan]);

    const handleSubscribe = async () => {
        if (!plan) return;

        if (plan.isFull && !isSubscribed) {
            Alert.alert('Plan full', 'This plan already reached the maximum number of participants.');
            return;
        }

        setSubscribing(true);
        try {
            if (isSubscribed) {
                await unsubscribe(plan.id);
                setIsSubscribed(false);
                setPlan({
                    ...plan,
                    subscribersCount: Math.max(0, plan.subscriberCount - 1),
                });
            } else {
                await subscribe(plan.id);
                setIsSubscribed(true);
                setPlan({
                    ...plan,
                    subscribersCount: plan.subscriberCount + 1,
                });
            }
        } catch (err) {
            console.error('[PlanDetailScreen] Error subscribing:', err);
            Alert.alert('Error', 'Could not process the subscription');
        } finally {
            setSubscribing(false);
        }
    };

    const handleImageScroll = (event: any) => {
        const offsetX = event.nativeEvent.contentOffset.x;
        const index = Math.round(offsetX / SCREEN_WIDTH);
        setCurrentImageIndex(index);
    };

    const handleAcceptUser = async (id: number) => {
        try {
            setPendingLoading(true);
            await accept(plan!.id, id);
            await loadPendingSubscribers();
        } catch (err) {
            console.error('[PlanDetailScreen] Error accepting subscriber:', err);
            setPendingLoading(false);
        }
    };

    const handleRejectUser = async (id: number) => {
        try {
            setPendingLoading(true);
            await reject(plan!.id, id);
            await loadPendingSubscribers();
        } catch (err) {
            console.error('[PlanDetailScreen] Error rejecting subscriber:', err);
            setPendingLoading(false);
        }
    };

    if (loading) {
        return (
            <AppScreen>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={tint} />
                </View>
            </AppScreen>
        );
    }

    if (!plan) {
        return (
            <AppScreen>
                <View style={styles.loadingContainer}>
                    <Ionicons name="alert-circle-outline" size={48} color={mutedText} />
                    <ThemedText type="body" style={{ color: mutedText, marginTop: 12 }}>
                        Plan not found
                    </ThemedText>
                    <Pressable
                        onPress={() => router.back()}
                        style={[styles.backButton, { backgroundColor: tint, marginTop: 24 }]}
                    >
                        <ThemedText type="body" style={{ color: tintText }}>Back</ThemedText>
                    </Pressable>
                </View>
            </AppScreen>
        );
    }

    const images = plan.images || [];
    const reviewCount = 0;
    const averageRating = 0;
    const { dateLabel, timeLabel } = formatDateTime(plan.startDateTime);
    const { timeLabel: endTimeLabel } = formatDateTime(plan.endDateTime);
    const isPublic = plan.visibility === 'PUBLIC';
    const canSubscribe = !plan.isFull || isSubscribed;

    const handleDelete = () => {
        Alert.alert(
            'Delete Plan',
            'Are you sure you want to delete this plan? This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setLoading(true);
                            await remove(plan.id);
                            Alert.alert('Success', 'Plan deleted successfully.', [
                                { text: 'OK', onPress: () => router.back() },
                            ]);
                        } catch (err) {
                            console.error('[PlanDetailScreen] Error deleting plan:', err);
                            Alert.alert('Error', 'Could not delete the plan. Check your connection.');
                            setLoading(false);
                        }
                    },
                },
            ]
        );
    };

    return (
        <AppScreen scrollable>
            <View style={styles.header}>
                <Pressable
                    onPress={() => router.back()}
                    style={({ pressed }) => [
                        styles.headerButton,
                        { backgroundColor: surface, borderColor: border },
                        pressed && styles.pressed,
                    ]}
                >
                    <Ionicons name="arrow-back" size={24} color={text} />
                </Pressable>
                <View style={styles.headerTitleContainer}>
                    <View style={{ flexDirection: 'row', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                        <ThemedText type="title" style={[styles.headerTitle, { flex: 1 }]}>
                            {plan.title}
                        </ThemedText>
                        <View style={[styles.visibilityBadge, { backgroundColor: isPublic ? StatusBadgeColors.public.background : StatusBadgeColors.private.background, marginTop: 4 }]}>
                            <ThemedText type="label" style={{ color: isPublic ? StatusBadgeColors.public.text : StatusBadgeColors.private.text, fontSize: 11 }}>
                                {isPublic ? 'Public' : 'Private'}
                            </ThemedText>
                        </View>
                    </View>
                </View>
            </View>

            <View style={styles.ratingRow}>
                <ThemedText type="body" style={{ fontWeight: '600' }}>{averageRating.toFixed(1)}</ThemedText>
                <StarRating rating={averageRating} />
                <ThemedText type="body" style={{ color: mutedText }}>
                    ({reviewCount} reviews)
                </ThemedText>
                <Pressable onPress={() => setActiveTab('reviews')}>
                    <ThemedText type="body" style={{ color: tint, marginLeft: 8 }}>
                        View reviews
                    </ThemedText>
                </Pressable>
            </View>

            <View style={styles.infoRow}>
                <View style={styles.infoItem}>
                    <Ionicons name="calendar-outline" size={16} color={mutedText} />
                    <ThemedText type="body" style={{ color: mutedText, marginLeft: 4 }}>
                        {dateLabel}
                    </ThemedText>
                </View>
                {timeLabel ? (
                    <View style={styles.infoItem}>
                        <Ionicons name="time-outline" size={16} color={mutedText} />
                        <ThemedText type="body" style={{ color: mutedText, marginLeft: 4 }}>
                            {timeLabel}{endTimeLabel ? ` – ${endTimeLabel}` : ''}
                        </ThemedText>
                    </View>
                ) : null}
            </View>

            <View style={styles.infoRow}>
                <View style={styles.infoItem}>
                    <Ionicons name="people-outline" size={16} color={mutedText} />
                    <ThemedText type="body" style={{ color: mutedText, marginLeft: 4 }}>
                        {formatAgeRestriction(plan.minAge, plan.maxAge)}
                    </ThemedText>
                </View>
            </View>

            <View style={[styles.locationCard, { backgroundColor: surface, borderColor: border, flexDirection: 'column', alignItems: 'stretch', padding: 0, overflow: 'hidden' }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', padding: 12 }}>
                    <Ionicons name="location-outline" size={20} color={tint} />
                    <ThemedText type="body" style={{ flex: 1, marginLeft: 8, fontWeight: '500' }}>
                        {plan.location}
                    </ThemedText>
                </View>

                {plan.latitude && plan.longitude ? (
                    <View style={{ height: 160, width: '100%', borderTopWidth: 1, borderColor: border }}>
                        <MapView
                            style={{ ...StyleSheet.absoluteFillObject }}
                            initialRegion={{
                                latitude: plan.latitude,
                                longitude: plan.longitude,
                                latitudeDelta: 0.012,
                                longitudeDelta: 0.012,
                            }}
                            scrollEnabled={false}
                            zoomEnabled={false}
                            pitchEnabled={false}
                            rotateEnabled={false}
                        >
                            <Marker
                                coordinate={{ latitude: plan.latitude, longitude: plan.longitude }}
                                pinColor={tint}
                            />
                        </MapView>
                    </View>
                ) : null}
            </View>

            {images.length > 0 && (
                <View style={styles.imageSection}>
                    <ScrollView
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        onScroll={handleImageScroll}
                        scrollEventThrottle={16}
                    >
                        {images.map((img, index) => (
                            <Image
                                key={index}
                                source={{ uri: img }}
                                style={[styles.planImage, { width: SCREEN_WIDTH - 32 }]}
                                resizeMode="cover"
                            />
                        ))}
                    </ScrollView>
                    {images.length > 1 && (
                        <View style={styles.imageIndicators}>
                            {images.map((_, index) => (
                                <View
                                    key={index}
                                    style={[
                                        styles.indicator,
                                        { backgroundColor: index === currentImageIndex ? tint : border },
                                    ]}
                                />
                            ))}
                        </View>
                    )}
                </View>
            )}

            <View style={[styles.tabContainer, { borderColor: border }]}>
                <Pressable
                    onPress={() => setActiveTab('description')}
                    style={[
                        styles.tab,
                        activeTab === 'description' && { borderBottomColor: tint, borderBottomWidth: 2 },
                    ]}
                >
                    <ThemedText
                        type="body"
                        style={[styles.tabText, { color: activeTab === 'description' ? tint : mutedText }]}
                    >
                        DESCRIPCION
                    </ThemedText>
                </Pressable>
                <Pressable
                    onPress={() => setActiveTab('subscribe')}
                    style={[
                        styles.tab,
                        activeTab === 'subscribe' && { borderBottomColor: tint, borderBottomWidth: 2 },
                    ]}
                >
                    <ThemedText
                        type="body"
                        style={[styles.tabText, { color: activeTab === 'subscribe' ? tint : mutedText }]}
                    >
                        SUBSCRIBE
                    </ThemedText>
                </Pressable>
                <Pressable
                    onPress={() => setActiveTab('reviews')}
                    style={[
                        styles.tab,
                        activeTab === 'reviews' && { borderBottomColor: tint, borderBottomWidth: 2 },
                    ]}
                >
                    <ThemedText
                        type="body"
                        style={[styles.tabText, { color: activeTab === 'reviews' ? tint : mutedText }]}
                    >
                        REVIEWS
                    </ThemedText>
                </Pressable>
            </View>

            {activeTab === 'description' && (
                <View style={styles.tabContent}>
                    <ThemedText type="subtitle" style={{ marginBottom: 12 }}>Description</ThemedText>
                    <ThemedText type="body" style={{ color: mutedText, lineHeight: 22 }}>
                        {plan.description || 'No description available'}
                    </ThemedText>

                    <View style={[styles.infoSection, { backgroundColor: surface, borderColor: border }]}>
                        <ThemedText type="subtitle" style={{ marginBottom: 12 }}>INFO</ThemedText>
                        <View style={styles.infoList}>
                            <View style={styles.infoListItem}>
                                <View style={[styles.infoDot, { backgroundColor: tint }]} />
                                <ThemedText type="body">Interests: {interestLabel || 'No interests'}</ThemedText>
                            </View>
                            <View style={styles.infoListItem}>
                                <View style={[styles.infoDot, { backgroundColor: tint }]} />
                                <ThemedText type="body">
                                    Participants: {plan.subscriberCount}/{plan.maxSubscribers}
                                </ThemedText>
                            </View>
                        </View>
                    </View>
                </View>
            )}

            {activeTab === 'subscribe' && (
                <View style={styles.tabContent}>
                    <ThemedText type="subtitle" style={{ marginBottom: 12 }}>Subscription</ThemedText>

                    {isCreator && isPrivatePlan ? (
                        <ThemedText type="body" style={{ color: mutedText, marginBottom: 16 }}>
                            Pending requests for your private plan are listed below.
                        </ThemedText>
                    ) : (
                        <ThemedText type="body" style={{ color: mutedText, marginBottom: 24 }}>
                            {isSubscribed
                                ? 'You are already subscribed to this plan. You can cancel your subscription at any time.'
                                : 'Join this plan and connect with others who share your interests.'}
                        </ThemedText>
                    )}

                    {isCreator && isPrivatePlan ? (
                        <View style={[styles.pendingSection, { backgroundColor: surface, borderColor: border }]}>
                            <ThemedText type="subtitle" style={{ marginBottom: 12 }}>
                                Pending subscriptions
                            </ThemedText>
                            {pendingLoading ? (
                                <ActivityIndicator size="small" color={tint} />
                            ) : pendingSubscribers.length > 0 ? (
                                <View style={styles.pendingList}>
                                    {pendingSubscribers.map((subscriber) => (
                                        <View key={subscriber.id} style={[styles.pendingCard, { borderColor: border }]}>
                                            <Ionicons name="person-outline" size={16} color={tint} />
                                            <View style={styles.pendingTextBlock}>
                                                <ThemedText type="body" style={{ fontWeight: '600' }}>
                                                    {subscriber.name} {subscriber.lastname}
                                                </ThemedText>
                                                
                                                <Pressable 
                                                    onPress={() => handleAcceptUser(subscriber.id)}>
                                                    <ThemedText
                                                        type="body"
                                                        style={{ color: tint, fontWeight: '600' }}>
                                                        Accept
                                                    </ThemedText>
                                                </Pressable>
                                                <Pressable 
                                                    onPress={() => handleRejectUser(subscriber.id)}>
                                                    <ThemedText
                                                        type="body"
                                                        style={{ color: '#ef4444', fontWeight: '600' }}>
                                                        Reject
                                                    </ThemedText>
                                                </Pressable>
                                            </View>
                                        </View>
                                    ))}
                                </View>
                            ) : (
                                <ThemedText type="body" style={{ color: mutedText }}>
                                    No pending subscriptions yet.
                                </ThemedText>
                            )}
                        </View>
                    ) : null}

                    <View style={[styles.subscribeInfo, { backgroundColor: surface, borderColor: border }]}>
                        <View style={styles.subscribeInfoRow}>
                            <Ionicons name="people-outline" size={20} color={mutedText} />
                            <ThemedText type="body" style={{ marginLeft: 8 }}>
                                {plan.subscriberCount} of {plan.maxSubscribers} participants
                            </ThemedText>
                        </View>
                        <View style={styles.subscribeInfoRow}>
                            <Ionicons name="calendar-outline" size={20} color={mutedText} />
                            <ThemedText type="body" style={{ marginLeft: 8 }}>
                                {dateLabel}{timeLabel ? ` a las ${timeLabel}` : ''}{endTimeLabel ? ` – ${endTimeLabel}` : ''}
                            </ThemedText>
                        </View>
                    </View>
                </View>
            )}

            {activeTab === 'reviews' && (
                <View style={styles.tabContent}>
                    <ThemedText type="subtitle" style={{ marginBottom: 12 }}>Reviews</ThemedText>
                    <ThemedText type="body" style={{ color: mutedText }}>
                        No reviews yet. Be the first to leave one!
                    </ThemedText>
                </View>
            )}

            <View style={styles.subscribeButtonContainer}>
                {isCreator ? (
                    <View style={{ flexDirection: 'row', gap: 12, width: '100%' }}>
                        <Pressable
                            onPress={() => router.push(`/plan/edit/${plan.id}`)}
                            style={({ pressed }) => [
                                styles.subscribeButton,
                                { flex: 1, backgroundColor: surface, borderColor: tint, borderWidth: 1 },
                                pressed && styles.pressed,
                            ]}
                        >
                            <ThemedText type="body" style={{ color: tint, fontWeight: '600' }}>
                                EDIT
                            </ThemedText>
                        </Pressable>

                        <Pressable
                            onPress={handleDelete}
                            style={({ pressed }) => [
                                styles.subscribeButton,
                                { flex: 1, backgroundColor: '#ef4444' },
                                pressed && styles.pressed,
                            ]}
                        >
                            <ThemedText type="body" style={{ color: '#ffffff', fontWeight: '600' }}>
                                DELETE
                            </ThemedText>
                        </Pressable>
                    </View>
                ) : (
                    <Pressable
                        onPress={handleSubscribe}
                        disabled={subscribing || !canSubscribe}
                        style={({ pressed }) => [
                            styles.subscribeButton,
                            { backgroundColor: isSubscribed ? '#ef4444' : tint },
                            pressed && styles.pressed,
                            (subscribing || !canSubscribe) && styles.disabled,
                        ]}
                    >
                        {subscribing ? (
                            <ActivityIndicator size="small" color={tintText} />
                        ) : (
                            <ThemedText type="body" style={{ color: tintText, fontWeight: '600' }}>
                                {isSubscribed ? 'CANCEL SUBSCRIPTION' : (plan.isFull ? 'PLAN FULL' : 'SUBSCRIBE')}
                            </ThemedText>
                        )}
                    </Pressable>
                )}
            </View>
        </AppScreen>
    );
}