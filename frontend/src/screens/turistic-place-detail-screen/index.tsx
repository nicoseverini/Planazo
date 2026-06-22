import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
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

import { ThemedText } from '@/components/ThemedText';
import { AppScreen } from '@/components/ui';
import { useToken, decodeJwt } from '@/context/token-context';
import { useThemeColor } from '@/hooks/use-theme-color';
import { INTEREST_LABEL, TuristicPlaceDetail, useTuristicPlaces } from '@/services/turistic-place';
import { formatAgeRestriction } from '@/utils/age-restriction';
import { openInMaps } from '@/utils/navigation';

import { styles } from './styles';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const loadPlace = useCallback(async () => {
        const placeId = parseInt(id ?? '', 10);
        if (isNaN(placeId)) {
            setLoading(false);
            return;
        }
        try {
            const data = await fetchById(placeId);
            setPlace(data);
        } catch {
            Alert.alert('Error', 'Could not load the place.');
        } finally {
            setLoading(false);
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
                        Place not found
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
                            Alert.alert('Error', 'Could not delete the place.');
                            setLoading(false);
                        }
                    },
                },
            ]
        );
    };

    const images = place.images ?? [];

    return (
        <AppScreen scrollable>
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
                <ThemedText type="title" style={{ flex: 1 }} numberOfLines={1}>
                    {place.name}
                </ThemedText>
                <View style={[styles.badge, { backgroundColor: `${tint}20` }]}>
                    <ThemedText type="label" style={{ color: tint, fontSize: 11 }}>
                        {INTEREST_LABEL[place.interest] ?? place.interest}
                    </ThemedText>
                </View>
            </View>

            {/* Info card */}
            <View style={[styles.infoCard, { backgroundColor: surface, borderColor: border }]}>
                <View style={styles.infoRow}>
                    <Ionicons name="cash-outline" size={18} color={mutedText} />
                    <ThemedText type="body">Cost: ${place.cost}</ThemedText>
                </View>
                <View style={styles.infoRow}>
                    <Ionicons name="people-outline" size={18} color={mutedText} />
                    <ThemedText type="body">
                        {formatAgeRestriction(place.minAge, place.maxAge)}
                    </ThemedText>
                </View>
            </View>

            {/* Description */}
            {!!place.description && (
                <View style={[styles.infoCard, { backgroundColor: surface, borderColor: border }]}>
                    <ThemedText type="subtitle" style={{ marginBottom: 8 }}>About this place</ThemedText>
                    <ThemedText type="body" style={{ color: mutedText, lineHeight: 22 }}>
                        {place.description}
                    </ThemedText>
                </View>
            )}

            {/* Location + map */}
            {(place.location || (place.latitude && place.longitude)) && (
                <View style={[styles.locationCard, { borderColor: border }]}>
                    {place.location && (
                        <View style={[styles.locationHeader, { borderBottomWidth: place.latitude && place.longitude ? 1 : 0, borderColor: border, flexDirection: 'row', alignItems: 'center', gap: 8 }]}>
                            <Ionicons name="location-outline" size={20} color={tint} />
                            <ThemedText type="body" style={{ flex: 1, fontWeight: '500' }}>
                                {place.location}
                            </ThemedText>
                            {place.latitude && place.longitude ? (
                                <Pressable
                                    onPress={() => openInMaps(place.latitude, place.longitude, place.name)}
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
                                        Directions
                                    </ThemedText>
                                </Pressable>
                            ) : null}
                        </View>
                    )}
                    {place.latitude && place.longitude && (
                        <Pressable
                            onPress={() => openInMaps(place.latitude, place.longitude, place.name)}
                            style={{ height: 160 }}
                        >
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
