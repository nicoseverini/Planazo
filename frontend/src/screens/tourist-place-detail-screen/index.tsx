import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import React, { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Image,
    Pressable,
    RefreshControl,
    ScrollView,
    StyleSheet,
    View,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';

import { ThemedText } from '@/components/ThemedText';
import { AppScreen } from '@/components/ui';
import { StarRating } from '@/components/StarRating';
import { ReviewSection } from '@/components/ReviewSection';
import { useToken, decodeJwt } from '@/context/token-context';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useReviews } from '@/services/review';
import { TouristPlaceDetail, useTouristPlaces } from '@/services/tourist-place';
import { formatAgeRestriction } from '@/utils/age-restriction';
import { formatInterest } from '@/utils/interests';
import { openInMaps } from '@/utils/navigation';
import { buildWeekSchedule, currentWeekday, formatDayRange, WEEKDAY_LABEL_KEY } from '@/utils/schedule';
import { ReportModal } from '@/components/ReportModal';
import { TranslationButton } from '@/components/TranslationButton';

import { styles } from './styles';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type TabType = 'description' | 'hours' | 'reviews';

const parsePlaceId = (value?: string | string[]): number | null => {
    const raw = Array.isArray(value) ? value[0] : value;
    if (!raw) return null;
    const parsed = Number.parseInt(raw, 10);
    return Number.isNaN(parsed) ? null : parsed;
};

export default function TouristPlaceDetailScreen() {
    const { t } = useTranslation();
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { getAccessToken } = useToken();
    const { fetchById, remove } = useTouristPlaces();
    const { fetchStats } = useReviews();

    const { tint, tintText, surface, border, mutedText, text } = useAppTheme();

    const [place, setPlace] = useState<TouristPlaceDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const refreshingRef = useRef(false);
    const [activeTab, setActiveTab] = useState<TabType>('description');
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [averageRating, setAverageRating] = useState(0);
    const [reviewCount, setReviewCount] = useState(0);
    const [isReportModalVisible, setIsReportModalVisible] = useState(false);
    const [isMenuVisible, setIsMenuVisible] = useState(false);
    const [translatedDescription, setTranslatedDescription] = useState<string | null>(null);

    const handleStatsUpdated = useCallback((avg: number, count: number) => {
        setAverageRating(avg);
        setReviewCount(count);
    }, []);

    const loadPlace = useCallback(async () => {
        const placeId = parsePlaceId(id);
        if (!placeId) {
            Alert.alert(t('error'), t('place_invalid_id'));
            setLoading(false);
            return;
        }
        // Load the place and its review summary in parallel so the rating and review
        // count at the top of the screen are correct immediately, without needing to
        // open the Reviews tab. Stats are independent: a stats failure must not block
        // the place from rendering.
        const [placeResult, statsResult] = await Promise.allSettled([
            fetchById(placeId),
            fetchStats('VENUE', placeId),
        ]);

        if (placeResult.status === 'fulfilled') {
            setPlace(placeResult.value);
        } else {
            // 404 → place stays null → empty state renders "not found", no redundant Alert needed
            const err = placeResult.reason;
            const isNotFound = (err as any)?.status === 404;
            if (!isNotFound) {
                Alert.alert(t('error'), err instanceof Error ? t(err.message) : t('unable_load_place'));
            }
        }

        if (statsResult.status === 'fulfilled') {
            handleStatsUpdated(statsResult.value.averageRating, statsResult.value.reviewCount);
        } else {
            // Non-blocking: keep the place visible and the last known summary.
            Alert.alert(t('error'), t('unable_load_place'));
        }

        setLoading(false);
    }, [id, fetchById, fetchStats, handleStatsUpdated]);

    const handleRefresh = useCallback(async () => {
        if (refreshingRef.current) return;
        refreshingRef.current = true;
        setRefreshing(true);
        const placeId = parsePlaceId(id);
        if (!placeId) {
            setRefreshing(false);
            refreshingRef.current = false;
            return;
        }
        try {
            const [placeResult, statsResult] = await Promise.allSettled([
                fetchById(placeId),
                fetchStats('VENUE', placeId),
            ]);
            if (placeResult.status === 'fulfilled') {
                setPlace(placeResult.value);
                setTranslatedDescription(null);
            } else {
                Alert.alert(t('error'), t('unable_refresh_try'));
            }
            if (statsResult.status === 'fulfilled') {
                handleStatsUpdated(statsResult.value.averageRating, statsResult.value.reviewCount);
            }
        } finally {
            setRefreshing(false);
            refreshingRef.current = false;
        }
    }, [id, fetchById, fetchStats, handleStatsUpdated, t]);

    useFocusEffect(
        useCallback(() => {
            loadPlace();
        }, [loadPlace])
    );

    if (loading) {
        return (
            <AppScreen>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={tint} />
                </View>
            </AppScreen>
        );
    }

    if (!place) {
        return (
            <AppScreen>
                <View style={styles.loadingContainer}>
                    <Ionicons name="alert-circle-outline" size={48} color={mutedText} />
                    <ThemedText type="body" style={{ color: mutedText, marginTop: 12 }}>
                        {t('tourist_place_not_found')}
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

    const token = getAccessToken();
    let isCreator = false;
    if (token && place.creatorId != null) {
        const decoded = decodeJwt(token);
        isCreator = Number(decoded.id) === Number(place.creatorId);
    }

    const handleDelete = () => {
        Alert.alert(
            t('delete_place'),
            t('delete_place_confirm'),
            [
                { text: t('cancel'), style: 'cancel' },
                {
                    text: t('delete'),
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setLoading(true);
                            await remove(place.id);
                            Alert.alert(t('success'), t('place_deleted'), [
                                { text: 'OK', onPress: () => router.back() },
                            ]);
                        } catch {
                            Alert.alert(t('error'), t('could_not_delete_place'));
                            setLoading(false);
                        }
                    },
                },
            ]
        );
    };

    const images = place.images ?? [];
    const interests = place.interests ?? [];
    const locationLine = [place.address, place.city, place.country].filter(Boolean).join(', ') || place.location;
    const costLabel = place.cost == null ? null : place.cost === 0 ? t('free') : `$${place.cost.toLocaleString()}`;
    const interestLabel = interests.map(formatInterest).join(' · ');
    const lat = place.latitude;
    const lng = place.longitude;
    const hasCoords = lat != null && lng != null;
    const weekSchedule = buildWeekSchedule(place.openingHours);
    const todayWeekday = currentWeekday();

    // Handled by state via ReviewSection

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
            {/* Header */}
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
                <ThemedText type="title" style={{ flex: 1 }}>
                    {place.name}
                </ThemedText>
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

            {/* Rating row (static — ready for real reviews integration) */}
            <View style={styles.ratingRow}>
                <ThemedText type="body" style={{ fontWeight: '600' }}>{averageRating.toFixed(1)}</ThemedText>
                <StarRating rating={averageRating} />
                <ThemedText type="body" style={{ color: mutedText }}>
                    {t('reviews_count', { count: reviewCount })}
                </ThemedText>
                <Pressable onPress={() => setActiveTab('reviews')}>
                    <ThemedText type="body" style={{ color: tint, marginLeft: 8 }}>
                        {t('view_reviews')}
                    </ThemedText>
                </Pressable>
            </View>

            {/* Info rows */}
            <View style={styles.infoRow}>
                <View style={styles.infoItem}>
                    <Ionicons name="people-outline" size={16} color={mutedText} />
                    <ThemedText type="body" style={{ color: mutedText, marginLeft: 4 }}>
                        {formatAgeRestriction(place.minAge, place.maxAge)}
                    </ThemedText>
                </View>
            </View>

            {costLabel != null && (
                <View style={styles.infoRow}>
                    <View style={styles.infoItem}>
                        <Ionicons name="cash-outline" size={16} color={mutedText} />
                        <ThemedText type="body" style={{ color: mutedText, marginLeft: 4 }}>
                            {costLabel}
                        </ThemedText>
                    </View>
                </View>
            )}

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

            {/* Location + map */}
            {(place.location || hasCoords) && (
                <View style={[styles.locationCard, { borderColor: border }]}>
                    {place.location && (
                        <View style={[styles.locationHeader, { borderBottomWidth: hasCoords ? 1 : 0, borderColor: border, flexDirection: 'row', alignItems: 'center', gap: 8 }]}>
                            <Ionicons name="location-outline" size={20} color={tint} />
                            <ThemedText type="body" style={{ flex: 1, marginLeft: 8, fontWeight: '500' }}>
                                {locationLine}
                            </ThemedText>
                            {hasCoords ? (
                                <Pressable
                                    onPress={() => openInMaps(lat!, lng!, place.name)}
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
                    )}
                    {hasCoords && (
                        <Pressable
                            onPress={() => openInMaps(lat!, lng!, place.name)}
                            style={{ height: 160 }}
                        >
                            <MapView
                                style={{ ...StyleSheet.absoluteFillObject }}
                                initialRegion={{
                                    latitude: lat!,
                                    longitude: lng!,
                                    latitudeDelta: 0.012,
                                    longitudeDelta: 0.012,
                                }}
                                scrollEnabled={false}
                                zoomEnabled={false}
                                pitchEnabled={false}
                                rotateEnabled={false}
                            >
                                <Marker
                                    coordinate={{ latitude: lat!, longitude: lng! }}
                                    pinColor={tint}
                                />
                            </MapView>
                        </Pressable>
                    )}
                </View>
            )}

            {/* Image carousel */}
            {images.length > 0 && (
                <View style={styles.imageSection}>
                    <ScrollView
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        onScroll={(e) => {
                            const idx = Math.round(e.nativeEvent.contentOffset.x / (SCREEN_WIDTH - 32));
                            setCurrentImageIndex(idx);
                        }}
                        scrollEventThrottle={16}
                    >
                        {images.map((img, i) => (
                            <Image
                                key={i}
                                source={{ uri: img }}
                                style={[styles.placeImage, { width: SCREEN_WIDTH - 32 }]}
                                resizeMode="cover"
                            />
                        ))}
                    </ScrollView>
                    {images.length > 1 && (
                        <View style={styles.imageIndicators}>
                            {images.map((_, i) => (
                                <View
                                    key={i}
                                    style={[
                                        styles.indicator,
                                        { backgroundColor: i === currentImageIndex ? tint : border },
                                    ]}
                                />
                            ))}
                        </View>
                    )}
                </View>
            )}

            {/* Tab navigation */}
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
                    onPress={() => setActiveTab('hours')}
                    style={[
                        styles.tab,
                        activeTab === 'hours' && { borderBottomColor: tint, borderBottomWidth: 2 },
                    ]}
                >
                    <ThemedText
                        type="body"
                        style={[styles.tabText, { color: activeTab === 'hours' ? tint : mutedText }]}
                    >
                        {t('tab_hours').toUpperCase()}
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
                        {t('tab_reviews').toUpperCase()}
                    </ThemedText>
                </Pressable>
            </View>

            {/* Tab content */}
            {activeTab === 'description' && (
                <View style={styles.tabContent}>
                    <ThemedText type="subtitle" style={{ marginBottom: 12 }}>{t('tab_description')}</ThemedText>
                    <ThemedText type="body" style={{ color: mutedText, lineHeight: 22 }}>
                        {translatedDescription || (place.description || t('no_description_available'))}
                    </ThemedText>
                    {place.description && (
                        <TranslationButton
                            originalText={place.description}
                            onTranslationRowReceived={setTranslatedDescription}
                        />
                    )}
                </View>
            )}

            {activeTab === 'hours' && (
                <View style={styles.tabContent}>
                    <ThemedText type="subtitle" style={{ marginBottom: 12 }}>{t('opening_hours')}</ThemedText>
                    {weekSchedule.map((day) => {
                        const range = formatDayRange(day);
                        const isToday = day.day === todayWeekday;
                        return (
                            <View
                                key={day.day}
                                style={[
                                    styles.hoursRow,
                                    { borderColor: isToday ? tint : border, backgroundColor: isToday ? surface : 'transparent' },
                                ]}
                            >
                                <ThemedText type="body" style={{ color: text, fontWeight: isToday ? '700' : '500' }}>
                                    {t(WEEKDAY_LABEL_KEY[day.day])}
                                </ThemedText>
                                <ThemedText type="body" style={{ color: range ? text : mutedText }}>
                                    {range ?? t('closed')}
                                </ThemedText>
                            </View>
                        );
                    })}
                </View>
            )}

            {activeTab === 'reviews' && (
                <View style={styles.tabContent}>
                    <ReviewSection
                        targetType="VENUE"
                        targetId={place.id}
                        onStatsUpdated={handleStatsUpdated}
                    />
                </View>
            )}

            {/* Owner actions */}
            {isCreator && (
                <View style={styles.actionRow}>
                    <Pressable
                        onPress={() => router.push(`/tourist-place/edit/${place.id}`)}
                        style={({ pressed }) => [
                            styles.actionButton,
                            { backgroundColor: surface, borderColor: tint, borderWidth: 1 },
                            pressed && styles.pressed,
                        ]}
                    >
                        <ThemedText type="body" style={{ color: tint, fontWeight: '600' }}>{t('edit').toUpperCase()}</ThemedText>
                    </Pressable>
                    <Pressable
                        onPress={handleDelete}
                        style={({ pressed }) => [
                            styles.actionButton,
                            { backgroundColor: '#ef4444' },
                            pressed && styles.pressed,
                        ]}
                    >
                        <ThemedText type="body" style={{ color: '#ffffff', fontWeight: '600' }}>{t('delete').toUpperCase()}</ThemedText>
                    </Pressable>
                </View>
            )}

            <ReportModal
                visible={isReportModalVisible}
                onClose={() => setIsReportModalVisible(false)}
                touristPlaceId={place.id}
                reportedUserId={place.creatorId ?? undefined}
            />
        </AppScreen>
    );
}
