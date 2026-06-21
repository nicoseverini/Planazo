import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
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
import { useToken, decodeJwt } from '@/context/token-context';
import { useThemeColor } from '@/hooks/use-theme-color';
import { TuristicPlaceDetail, useTuristicPlaces } from '@/services/turistic-place';
import { formatAgeRestriction } from '@/utils/age-restriction';
import { formatInterest } from '@/utils/interests';

import { styles } from './styles';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type TabType = 'description' | 'hours' | 'reviews';

const parsePlaceId = (value?: string | string[]): number | null => {
    const raw = Array.isArray(value) ? value[0] : value;
    if (!raw) return null;
    const parsed = Number.parseInt(raw, 10);
    return Number.isNaN(parsed) ? null : parsed;
};

export default function TuristicPlaceDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { getAccessToken } = useToken();
    const { fetchById, remove } = useTuristicPlaces();

    const tint = useThemeColor({}, 'tint');
    const tintText = useThemeColor({}, 'tintText');
    const surface = useThemeColor({}, 'surface');
    const border = useThemeColor({}, 'border');
    const mutedText = useThemeColor({}, 'mutedText');
    const text = useThemeColor({}, 'text');

    const [place, setPlace] = useState<TuristicPlaceDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const refreshingRef = useRef(false);
    const [activeTab, setActiveTab] = useState<TabType>('description');
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const loadPlace = useCallback(async () => {
        const placeId = parsePlaceId(id);
        if (!placeId) {
            Alert.alert('Error', 'The place identifier is not valid.');
            setLoading(false);
            return;
        }
        try {
            const data = await fetchById(placeId);
            setPlace(data);
        } catch (err) {
            // 404 → place stays null → empty state renders "not found", no redundant Alert needed
            const isNotFound = (err as any)?.status === 404;
            if (!isNotFound) {
                Alert.alert('Error', err instanceof Error ? err.message : 'Unable to load tourist place information.');
            }
        } finally {
            setLoading(false);
        }
    }, [id, fetchById]);

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
            const data = await fetchById(placeId);
            setPlace(data);
        } catch (err) {
            Alert.alert('Error', 'Unable to refresh. Please try again.');
        } finally {
            setRefreshing(false);
            refreshingRef.current = false;
        }
    }, [id, fetchById]);

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
                        Tourist place not found.
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

    const token = getAccessToken();
    let isCreator = false;
    if (token && place.creatorId != null) {
        const decoded = decodeJwt(token) as any;
        isCreator = Number(decoded.id) === Number(place.creatorId);
    }

    const handleDelete = () => {
        Alert.alert(
            'Delete Place',
            'Are you sure you want to delete this place? This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setLoading(true);
                            await remove(place.id);
                            Alert.alert('Success', 'Place deleted.', [
                                { text: 'OK', onPress: () => router.back() },
                            ]);
                        } catch {
                            Alert.alert('Error', 'Could not delete the place. Check your connection.');
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
    const costLabel = place.cost == null ? null : place.cost === 0 ? 'Free' : `$${place.cost.toLocaleString()}`;
    const interestLabel = interests.map(formatInterest).join(' · ');

    const reviewCount = 0;
    const averageRating = 0;

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
            </View>

            {/* Rating row (static — ready for real reviews integration) */}
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
            {(locationLine || (place.latitude && place.longitude)) ? (
                <View style={[styles.locationCard, { backgroundColor: surface, borderColor: border }]}>
                    {locationLine ? (
                        <View style={{ flexDirection: 'row', alignItems: 'center', padding: 12 }}>
                            <Ionicons name="location-outline" size={20} color={tint} />
                            <ThemedText type="body" style={{ flex: 1, marginLeft: 8, fontWeight: '500' }}>
                                {locationLine}
                            </ThemedText>
                        </View>
                    ) : null}
                    {place.latitude && place.longitude ? (
                        <View style={{ height: 160, width: '100%', borderTopWidth: locationLine ? 1 : 0, borderColor: border }}>
                            <MapView
                                style={{ ...StyleSheet.absoluteFillObject }}
                                initialRegion={{
                                    latitude: place.latitude,
                                    longitude: place.longitude,
                                    latitudeDelta: 0.012,
                                    longitudeDelta: 0.012,
                                }}
                                scrollEnabled={false}
                                zoomEnabled={false}
                                pitchEnabled={false}
                                rotateEnabled={false}
                            >
                                <Marker
                                    coordinate={{ latitude: place.latitude, longitude: place.longitude }}
                                    pinColor={tint}
                                />
                            </MapView>
                        </View>
                    ) : null}
                </View>
            ) : null}

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
                        DESCRIPTION
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
                        HOURS
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

            {/* Tab content */}
            {activeTab === 'description' && (
                <View style={styles.tabContent}>
                    <ThemedText type="subtitle" style={{ marginBottom: 12 }}>Description</ThemedText>
                    <ThemedText type="body" style={{ color: mutedText, lineHeight: 22 }}>
                        {place.description || 'No description available.'}
                    </ThemedText>
                </View>
            )}

            {activeTab === 'hours' && (
                <View style={styles.tabContent}>
                    <ThemedText type="subtitle" style={{ marginBottom: 12 }}>Opening Hours</ThemedText>
                    <ThemedText type="body" style={{ color: mutedText }}>
                        Opening hours coming soon.
                    </ThemedText>
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

            {/* Owner actions */}
            {isCreator && (
                <View style={styles.actionRow}>
                    <Pressable
                        onPress={() => router.push(`/turistic-place/edit/${place.id}`)}
                        style={({ pressed }) => [
                            styles.actionButton,
                            { backgroundColor: surface, borderColor: tint, borderWidth: 1 },
                            pressed && styles.pressed,
                        ]}
                    >
                        <ThemedText type="body" style={{ color: tint, fontWeight: '600' }}>EDIT</ThemedText>
                    </Pressable>
                    <Pressable
                        onPress={handleDelete}
                        style={({ pressed }) => [
                            styles.actionButton,
                            { backgroundColor: '#ef4444' },
                            pressed && styles.pressed,
                        ]}
                    >
                        <ThemedText type="body" style={{ color: '#ffffff', fontWeight: '600' }}>DELETE</ThemedText>
                    </Pressable>
                </View>
            )}
        </AppScreen>
    );
}
