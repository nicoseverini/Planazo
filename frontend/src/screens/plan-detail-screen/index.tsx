import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Image,
    Modal,
    Pressable,
    RefreshControl,
    ScrollView,
    StyleSheet,
    View,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';

import { decodeJwt, useToken } from '@/context/token-context';
import { AppScreen } from '@/components/ui';
import { MemberRow } from '@/components/MemberRow';
import { ThemedText } from '@/components/ThemedText';
import { StatusBadgeColors } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';
import { PendingSubscriber, PlanDetail, PlanMember, usePlans } from '@/services/plan';
import { formatAgeRestriction } from '@/utils/age-restriction';
import { formatInterest } from '@/utils/interests';
import { formatDateTimeInTimezone } from '@/utils/date';
import { openInMaps } from '@/utils/navigation';
import { ReportModal } from '@/components/ReportModal';
import { TranslationButton } from '@/components/TranslationButton';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/components/Toast';
import { orderPlanMembers } from '@/utils/plan-members';

import { styles } from './styles';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type TabType = 'description' | 'members';

const parsePlanId = (value?: string | string[]): number | null => {
    const raw = Array.isArray(value) ? value[0] : value;
    if (!raw) return null;
    const parsed = Number.parseInt(raw, 10);
    return Number.isNaN(parsed) ? null : parsed;
};

const formatDateTime = (value: string, timezone: string | undefined | null) =>
    formatDateTimeInTimezone(value, timezone);

export default function PlanDetailScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
    const { fetchPlanDetail, fetchMyJoinedPlans, fetchPendingSubscribers, fetchPlanMembers, join, leave, remove, accept, reject, removeMember } = usePlans();
    const { getAccessToken } = useToken();

    const { tint, tintText, surface, border, mutedText, text } = useAppTheme();

    const [plan, setPlan] = useState<PlanDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const refreshingRef = useRef(false);
    const [subscribing, setSubscribing] = useState(false);
    const [activeTab, setActiveTab] = useState<TabType>('description');
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [pendingSubscribers, setPendingSubscribers] = useState<PendingSubscriber[]>([]);
    const [pendingLoading, setPendingLoading] = useState(false);
    const [members, setMembers] = useState<PlanMember[]>([]);
    const [membersLoading, setMembersLoading] = useState(false);
    const [membersError, setMembersError] = useState<string | null>(null);
    const [membersSubTab, setMembersSubTab] = useState<'members' | 'requests'>('members');
    const [isImageModalVisible, setIsImageModalVisible] = useState(false);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [isReportModalVisible, setIsReportModalVisible] = useState(false);
    const [isMenuVisible, setIsMenuVisible] = useState(false);

    const { t, i18n } = useTranslation();
    const { showToast } = useToast();
    const [translatedDescription, setTranslatedDescription] = useState<string | null>(null);

    const interestLabel = (plan?.interests ?? [])
        .map(formatInterest)
        .join(' · ');

    const loadPlan = useCallback(async () => {
        const planId = parsePlanId(id);
        if (!planId) {
            setLoading(false);
            Alert.alert(t('error'), t('plan_invalid_id'));
            return;
        }

        try {
            const data = await fetchPlanDetail(planId);
            setPlan(data);
            setTranslatedDescription(null);

            const token = getAccessToken();
            if (token) {
                const joinedPlans = await fetchMyJoinedPlans();
                setIsSubscribed(joinedPlans.some((joinedPlan) => joinedPlan.id === planId));
            } else {
                setIsSubscribed(false);
            }
        } catch (err) {
            Alert.alert(t('error'), t('unable_load_plan'));
        } finally {
            setLoading(false);
        }
    }, [id, fetchMyJoinedPlans, fetchPlanDetail, getAccessToken, t]);

    const handleRefresh = useCallback(async () => {
        if (refreshingRef.current) return;
        refreshingRef.current = true;
        setRefreshing(true);

        const planId = parsePlanId(id);
        if (!planId) {
            setRefreshing(false);
            refreshingRef.current = false;
            return;
        }

        try {
            const data = await fetchPlanDetail(planId);
            setPlan(data);
            setTranslatedDescription(null);

            const token = getAccessToken();
            if (token) {
                const joinedPlans = await fetchMyJoinedPlans();
                setIsSubscribed(joinedPlans.some((jp) => jp.id === planId));
            } else {
                setIsSubscribed(false);
            }
        } catch (err) {
            const message = err instanceof Error ? t(err.message) : t('unable_refresh_plan');
            Alert.alert(t('error'), message);
        } finally {
            setRefreshing(false);
            refreshingRef.current = false;
        }
    }, [id, fetchPlanDetail, fetchMyJoinedPlans, getAccessToken, t]);



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
            setPendingSubscribers([]);
            Alert.alert(t('error'), t('unable_load_plan'));
        } finally {
            setPendingLoading(false);
        }
    }, [fetchPendingSubscribers, isCreator, isPrivatePlan, plan]);

    const loadMembers = useCallback(async () => {
        if (!plan) return;

        try {
            setMembersLoading(true);
            setMembersError(null);
            const data = await fetchPlanMembers(plan.id);
            setMembers(data);
        } catch (err) {
            setMembers([]);
            setMembersError(t('unable_load_plan'));
            Alert.alert(t('error'), t('unable_load_plan'));
        } finally {
            setMembersLoading(false);
        }
    }, [fetchPlanMembers, plan]);

    useEffect(() => {
        if (activeTab !== 'members' || !plan) {
            setPendingSubscribers([]);
            return;
        }

        loadMembers();

        if (isCreator && isPrivatePlan) {
            loadPendingSubscribers();
        } else {
            setPendingSubscribers([]);
        }
    }, [activeTab, isCreator, isPrivatePlan, plan, loadMembers, loadPendingSubscribers]);

    const handleJoin = async () => {
        if (!plan) return;

        if (plan.isFull && !isSubscribed) {
            Alert.alert(t('plan_full'), t('plan_full_message'));
            return;
        }

        setSubscribing(true);
        try {
            if (isSubscribed) {
                await leave(plan.id);
                await handleRefresh();
            } else {
                await join(plan.id);
                await handleRefresh();
                if (isPrivatePlan) {
                    showToast({ message: t('request_sent_message'), type: 'info' });
                } else {
                    showToast({ message: t('joined_success'), type: 'success' });
                }
            }
        } catch (err) {
            const message = err instanceof Error ? t(err.message) : t('could_not_process_request');
            Alert.alert(t('error'), message);
        } finally {
            setSubscribing(false);
        }
    };

    const handleImageScroll = (event: any) => {
        const offsetX = event.nativeEvent.contentOffset.x;
        const index = Math.round(offsetX / SCREEN_WIDTH);
        setCurrentImageIndex(index);
    };

    const openProfile = (userId: number) => router.push(`/user/${userId}`);

    const handleRemoveMember = (userId: number) => {
        Alert.alert(
            t('remove_member'),
            t('remove_member_confirm'),
            [
                { text: t('cancel'), style: 'cancel' },
                {
                    text: t('remove'),
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setMembersLoading(true);
                            await removeMember(plan!.id, userId);
                            await Promise.all([handleRefresh(), loadMembers()]);
                        } catch (err) {
                            const message = err instanceof Error ? t(err.message) : t('error_remove_member_failed');
                            Alert.alert(t('error'), message);
                            setMembersLoading(false);
                        }
                    },
                },
            ]
        );
    };

    const handleAcceptUser = async (id: number) => {
        const subscriber = pendingSubscribers.find((s) => s.id === id);
        const name = subscriber ? subscriber.name : 'the user';
        try {
            setPendingLoading(true);
            await accept(plan!.id, id);
            await Promise.all([handleRefresh(), loadPendingSubscribers(), loadMembers()]);
            Alert.alert(t('request_accepted'), t('accepted_user', { name }));
        } catch (err) {
            const message = err instanceof Error ? t(err.message) : t('unexpected_error');
            Alert.alert(t('error'), message);
            setPendingLoading(false);
        }
    };

    const handleRejectUser = async (id: number) => {
        const subscriber = pendingSubscribers.find((s) => s.id === id);
        const name = subscriber ? subscriber.name : 'the user';
        try {
            setPendingLoading(true);
            await reject(plan!.id, id);
            await loadPendingSubscribers();
            Alert.alert(t('request_rejected'), t('rejected_user', { name }));
        } catch (err) {
            const message = err instanceof Error ? t(err.message) : t('unexpected_error');
            Alert.alert(t('error'), message);
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
                        {t('plan_not_found')}
                    </ThemedText>
                    <Pressable
                        onPress={() => router.back()}
                        style={[styles.backButton, { backgroundColor: tint, marginTop: 24 }]}
                    >
                        <ThemedText type="body" style={{ color: tintText }}>{t('back')}</ThemedText>
                    </Pressable>
                </View>
            </AppScreen>
        );
    }

    const images = plan.images || [];
    const { dateLabel, timeLabel } = formatDateTime(plan.startDateTime, plan.timezone);
    const { dateLabel: endDateLabel, timeLabel: endTimeLabel } = formatDateTime(plan.endDateTime, plan.timezone);
    const isPublic = plan.visibility === 'PUBLIC';
    const isExpired = plan.endDateTime ? new Date(plan.endDateTime) <= new Date() : false;
    const participantsLabel = plan.maxSubscribers != null
        ? t('participants_max', { count: plan.subscriberCount, max: plan.maxSubscribers })
        : t('participants', { count: plan.subscriberCount });
    const budgetLabel = plan.budget > 0
        ? `$${plan.budget.toLocaleString()}`
        : t('free');
    const canUseSubscriptionButton = !isExpired && (!plan.isFull || isSubscribed);

    const handleDelete = () => {
        Alert.alert(
            t('delete_plan'),
            t('delete_plan_confirm'),
            [
                { text: t('cancel'), style: 'cancel' },
                {
                    text: t('delete'),
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setLoading(true);
                            await remove(plan.id);
                            Alert.alert(t('success'), t('plan_deleted'), [
                                { text: 'OK', onPress: () => router.back() },
                            ]);
                        } catch (err) {
                            const message = err instanceof Error ? t(err.message) : t('could_not_delete_plan');
                            Alert.alert(t('error'), message);
                            setLoading(false);
                        }
                    },
                },
            ]
        );
    };

    return (
        <AppScreen
            scrollable
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={handleRefresh}
                    tintColor={tint}
                    colors={[tint]}
                />
            }
        >
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
                                {isPublic ? t('public') : t('private')}
                            </ThemedText>
                        </View>
                        {isExpired && (
                            <View style={[styles.visibilityBadge, { backgroundColor: '#fef2f2', marginTop: 4 }]}>
                                <ThemedText type="label" style={{ color: '#ef4444', fontSize: 11 }}>
                                    {t('ended').toUpperCase()}
                                </ThemedText>
                            </View>
                        )}
                    </View>
                </View>
                {!isCreator && (
                    <View style={{ position: 'relative' }}>
                        <Pressable
                            onPress={() => setIsMenuVisible(!isMenuVisible)}
                            style={({ pressed }) => [
                                styles.headerButton,
                                { backgroundColor: surface, borderColor: border },
                                pressed && styles.pressed,
                            ]}
                        >
                            <Ionicons name="ellipsis-vertical" size={24} color={text} />
                        </Pressable>
                        {isMenuVisible && (
                            <View style={[styles.dropdownMenu, { backgroundColor: surface, borderColor: border }]}>
                                <Pressable
                                    style={styles.dropdownItem}
                                    onPress={() => {
                                        setIsMenuVisible(false);
                                        setIsReportModalVisible(true);
                                    }}
                                >
                                    <Ionicons name="flag-outline" size={18} color={text} />
                                    <ThemedText type="body" style={{ color: text, marginLeft: 8 }}>{t('report')}</ThemedText>
                                </Pressable>
                            </View>
                        )}
                    </View>
                )}
            </View>

            <View style={styles.infoRow}>
                <ThemedText type="label" style={{ color: mutedText, fontWeight: '600', minWidth: 36 }}>{t('start')}</ThemedText>
                <View style={styles.infoItem}>
                    <Ionicons name="calendar-outline" size={16} color={mutedText} />
                    <ThemedText type="body" style={{ color: mutedText, marginLeft: 4 }}>{dateLabel}</ThemedText>
                </View>
                {timeLabel ? (
                    <View style={styles.infoItem}>
                        <Ionicons name="time-outline" size={16} color={mutedText} />
                        <ThemedText type="body" style={{ color: mutedText, marginLeft: 4 }}>{timeLabel}</ThemedText>
                    </View>
                ) : null}
            </View>
            <View style={styles.infoRow}>
                <ThemedText type="label" style={{ color: mutedText, fontWeight: '600', minWidth: 36 }}>{t('end')}</ThemedText>
                <View style={styles.infoItem}>
                    <Ionicons name="calendar-outline" size={16} color={mutedText} />
                    <ThemedText type="body" style={{ color: mutedText, marginLeft: 4 }}>{endDateLabel}</ThemedText>
                </View>
                {endTimeLabel ? (
                    <View style={styles.infoItem}>
                        <Ionicons name="time-outline" size={16} color={mutedText} />
                        <ThemedText type="body" style={{ color: mutedText, marginLeft: 4 }}>{endTimeLabel}</ThemedText>
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

            <View style={styles.infoRow}>
                <View style={styles.infoItem}>
                    <Ionicons name="person-outline" size={16} color={mutedText} />
                    <ThemedText type="body" style={{ color: mutedText, marginLeft: 4 }}>
                        {participantsLabel}
                    </ThemedText>
                </View>
            </View>

            <View style={styles.infoRow}>
                <View style={styles.infoItem}>
                    <Ionicons name="cash-outline" size={16} color={mutedText} />
                    <ThemedText type="body" style={{ color: mutedText, marginLeft: 4 }}>
                        {budgetLabel}
                    </ThemedText>
                </View>
            </View>

            {interestLabel ? (
                <View style={styles.infoRow}>
                    <View style={styles.infoItem}>
                        <Ionicons name="pricetag-outline" size={16} color={mutedText} />
                        <ThemedText type="body" style={{ color: mutedText, marginLeft: 4 }}>
                            {interestLabel}
                        </ThemedText>
                    </View>
                </View>
            ) : null}

            <View style={[styles.locationCard, { backgroundColor: surface, borderColor: border, flexDirection: 'column', alignItems: 'stretch', padding: 0, overflow: 'hidden' }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', padding: 12, gap: 8 }}>
                    <Ionicons name="location-outline" size={20} color={tint} />
                    <ThemedText type="body" style={{ flex: 1, fontWeight: '500' }}>
                        {plan.location}
                    </ThemedText>
                    {plan.latitude != null && plan.longitude != null ? (
                        <Pressable
                            onPress={() => openInMaps(plan.latitude, plan.longitude, plan.title)}
                            style={({ pressed }) => [
                                {
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    backgroundColor: tint,
                                    paddingVertical: 6,
                                    paddingHorizontal: 12,
                                    borderRadius: 8,
                                    gap: 4,
                                },
                                pressed && { opacity: 0.8 }
                            ]}
                        >
                            <Ionicons name="map-outline" size={14} color={tintText} />
                            <ThemedText type="label" style={{ color: tintText, fontWeight: '700', fontSize: 11 }}>
                                {t('directions')}
                            </ThemedText>
                        </Pressable>
                    ) : null}
                </View>

                {plan.latitude && plan.longitude ? (
                    <Pressable
                        onPress={() => openInMaps(plan.latitude, plan.longitude, plan.title)}
                        style={{ height: 160, width: '100%', borderTopWidth: 1, borderColor: border }}
                    >
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
                    </Pressable>
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
                            <Pressable
                                key={index}
                                onPress={() => {
                                    setSelectedImageIndex(index);
                                    setIsImageModalVisible(true);
                                }}
                            >
                                <Image
                                    source={{ uri: img }}
                                    style={[styles.planImage, { width: SCREEN_WIDTH - 32 }]}
                                    resizeMode="cover"
                                />
                            </Pressable>
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
                        {t('tab_description').toUpperCase()}
                    </ThemedText>
                </Pressable>
                <Pressable
                    onPress={() => setActiveTab('members')}
                    style={[
                        styles.tab,
                        activeTab === 'members' && { borderBottomColor: tint, borderBottomWidth: 2 },
                    ]}
                >
                    <ThemedText
                        type="body"
                        style={[styles.tabText, { color: activeTab === 'members' ? tint : mutedText }]}
                    >
                        {t('tab_members').toUpperCase()}
                    </ThemedText>
                </Pressable>
            </View>

            {activeTab === 'description' && (
                <View style={styles.tabContent}>
                    <ThemedText type="subtitle" style={{ marginBottom: 12 }}>{t('tab_description')}</ThemedText>
                    <ThemedText type="body" style={{ color: mutedText, lineHeight: 22 }}>
                        {translatedDescription || (plan.description || t('no_description_available'))}
                    </ThemedText>

                    {plan.description && (
                        <TranslationButton
                            originalText={plan.description}
                            onTranslationRowReceived={setTranslatedDescription}
                        />
                    )}
                </View>
            )}

            {activeTab === 'members' && (
                <View style={styles.tabContent}>
                    {isCreator && isPrivatePlan ? (
                        <View style={[styles.segmentContainer, { backgroundColor: surface, borderColor: border, marginBottom: 16 }]}>
                            <Pressable
                                onPress={() => setMembersSubTab('members')}
                                style={[styles.segment, membersSubTab === 'members' && { backgroundColor: tint }]}
                            >
                                <ThemedText
                                    type="label"
                                    style={{ color: membersSubTab === 'members' ? tintText : mutedText, fontWeight: '600' }}
                                >
                                    {`Members${members.length ? ` (${members.length})` : ''}`}
                                </ThemedText>
                            </Pressable>
                            <Pressable
                                onPress={() => setMembersSubTab('requests')}
                                style={[styles.segment, membersSubTab === 'requests' && { backgroundColor: tint }]}
                            >
                                <ThemedText
                                    type="label"
                                    style={{ color: membersSubTab === 'requests' ? tintText : mutedText, fontWeight: '600' }}
                                >
                                    {`Requests${pendingSubscribers.length ? ` (${pendingSubscribers.length})` : ''}`}
                                </ThemedText>
                            </Pressable>
                        </View>
                    ) : (
                        <ThemedText type="subtitle" style={{ marginBottom: 12 }}>{t('membership')}</ThemedText>
                    )}

                    {(!isCreator || !isPrivatePlan || membersSubTab === 'members') && (
                        membersLoading ? (
                            <ActivityIndicator size="small" color={tint} />
                        ) : membersError ? (
                            <ThemedText type="body" style={{ color: '#ef4444' }}>{membersError}</ThemedText>
                        ) : members.length > 0 ? (
                            <View style={styles.memberList}>
                                {orderPlanMembers(members, plan.creatorId).map((member) => (
                                    <MemberRow
                                        key={member.id}
                                        id={member.id}
                                        name={member.name}
                                        lastname={member.lastname}
                                        photo={member.photo}
                                        subtitle={member.id === plan.creatorId ? t('organizer') : undefined}
                                        onPress={openProfile}
                                        rightSlot={
                                            isCreator && member.id !== plan.creatorId ? (
                                                <Pressable
                                                    onPress={() => handleRemoveMember(member.id)}
                                                    hitSlop={8}
                                                    style={({ pressed }) => [styles.memberActionButton, pressed && styles.pressed]}
                                                >
                                                    <Ionicons name="person-remove-outline" size={20} color="#ef4444" />
                                                </Pressable>
                                            ) : undefined
                                        }
                                    />
                                ))}
                            </View>
                        ) : (
                            <ThemedText type="body" style={{ color: mutedText }}>
                                {t('no_members_yet')}.
                            </ThemedText>
                        )
                    )}

                    {isCreator && isPrivatePlan && membersSubTab === 'requests' && (
                        pendingLoading ? (
                            <ActivityIndicator size="small" color={tint} />
                        ) : pendingSubscribers.length > 0 ? (
                            <View style={styles.memberList}>
                                {pendingSubscribers.map((subscriber) => (
                                    <MemberRow
                                        key={subscriber.id}
                                        id={subscriber.id}
                                        name={subscriber.name}
                                        lastname={subscriber.lastname}
                                        photo={subscriber.photo}
                                        onPress={openProfile}
                                        rightSlot={
                                            <>
                                                <Pressable
                                                    onPress={() => handleAcceptUser(subscriber.id)}
                                                    style={[styles.memberActionButton, { backgroundColor: tint }]}
                                                >
                                                    <Ionicons name="checkmark" size={18} color={tintText} />
                                                </Pressable>
                                                <Pressable
                                                    onPress={() => handleRejectUser(subscriber.id)}
                                                    style={[styles.memberActionButton, { backgroundColor: '#ef4444' }]}
                                                >
                                                    <Ionicons name="close" size={18} color="#ffffff" />
                                                </Pressable>
                                            </>
                                        }
                                    />
                                ))}
                            </View>
                        ) : (
                            <ThemedText type="body" style={{ color: mutedText }}>
                                {t('no_pending_requests')}
                            </ThemedText>
                        )
                    )}
                </View>
            )}

            <View style={styles.subscribeButtonContainer}>
                {isCreator ? (
                    <View style={{ flexDirection: 'row', gap: 12, width: '100%' }}>
                        <Pressable
                            onPress={() => router.push(`/plan/edit/${plan.id}`)}
                            disabled={isExpired}
                            style={({ pressed }) => [
                                styles.subscribeButton,
                                { flex: 1, backgroundColor: surface, borderColor: tint, borderWidth: 1 },
                                pressed && !isExpired && styles.pressed,
                                isExpired && styles.disabled,
                            ]}
                        >
                            <ThemedText type="body" style={{ color: tint, fontWeight: '600' }}>
                                {t('edit').toUpperCase()}
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
                                {t('delete').toUpperCase()}
                            </ThemedText>
                        </Pressable>
                    </View>
                ) : (
                    <Pressable
                        onPress={handleJoin}
                        disabled={subscribing || !canUseSubscriptionButton}
                        style={({ pressed }) => [
                            styles.subscribeButton,
                            { backgroundColor: isExpired ? '#6b7280' : (isSubscribed ? '#ef4444' : tint) },
                            pressed && styles.pressed,
                            (subscribing || !canUseSubscriptionButton) && styles.disabled,
                        ]}
                    >
                        {subscribing ? (
                            <ActivityIndicator size="small" color={tintText} />
                        ) : (
                            <ThemedText type="body" style={{ color: tintText, fontWeight: '600' }}>
                                {isExpired
                                    ? t('plan_ended').toUpperCase()
                                    : (isSubscribed ? t('leave').toUpperCase() : (plan.isFull ? t('plan_full').toUpperCase() : t('join').toUpperCase()))}
                            </ThemedText>
                        )}
                    </Pressable>
                )}
            </View>

            <Modal
                visible={isImageModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setIsImageModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <Pressable
                        style={styles.closeButton}
                        onPress={() => setIsImageModalVisible(false)}
                    >
                        <Ionicons name="close" size={30} color="#ffffff" />
                    </Pressable>

                    {isImageModalVisible && (
                        <ScrollView
                            horizontal
                            pagingEnabled
                            showsHorizontalScrollIndicator={false}
                            contentOffset={{ x: selectedImageIndex * SCREEN_WIDTH, y: 0 }}
                            onScroll={(e) => {
                                const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
                                setSelectedImageIndex(idx);
                            }}
                            scrollEventThrottle={16}
                            style={styles.scrollView}
                        >
                            {images.map((img, index) => (
                                <View key={index} style={{ width: SCREEN_WIDTH, justifyContent: 'center', alignItems: 'center' }}>
                                    <Image
                                        source={{ uri: img }}
                                        style={{ width: '100%', height: '80%' }}
                                        resizeMode="contain"
                                    />
                                </View>
                            ))}
                        </ScrollView>
                    )}

                    {images.length > 1 && (
                        <View style={styles.indicatorContainer}>
                            <ThemedText style={{ color: '#ffffff', fontWeight: '600' }}>
                                {`${selectedImageIndex + 1} / ${images.length}`}
                            </ThemedText>
                        </View>
                    )}
                </View>
            </Modal>

            <ReportModal
                visible={isReportModalVisible}
                onClose={() => setIsReportModalVisible(false)}
                planId={plan.id}
                reportedUserId={plan.creatorId}
            />
        </AppScreen>
    );
}