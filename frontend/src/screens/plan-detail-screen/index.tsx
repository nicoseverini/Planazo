import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Image,
    Pressable,
    ScrollView,
    View,
} from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { AppScreen } from '@/components/ui';
import { useThemeColor } from '@/hooks/use-theme-color';
import { PlanDetail, usePlans } from '@/services/plan';

import { styles } from './styles';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type TabType = 'description' | 'subscribe' | 'reviews';

function StarRating({ rating }: { rating: number }) {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
        if (i < fullStars) {
            stars.push(
                <Ionicons key={i} name="star" size={16} color="#22c55e" />
            );
        } else if (i === fullStars && hasHalfStar) {
            stars.push(
                <Ionicons key={i} name="star-half" size={16} color="#22c55e" />
            );
        } else {
            stars.push(
                <Ionicons key={i} name="star-outline" size={16} color="#22c55e" />
            );
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
    const { fetchPlanDetail, subscribe, unsubscribe } = usePlans();

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

    const loadPlan = useCallback(async () => {
        const planId = parsePlanId(id);
        if (!planId) {
            setLoading(false);
            Alert.alert('Error', 'El identificador del plan no es valido.');
            return;
        }

        try {
            const data = await fetchPlanDetail(planId);
            setPlan(data);
        } catch (err) {
            console.error('[PlanDetailScreen] Error loading plan:', err);
            Alert.alert('Error', 'No se pudo cargar el plan');
        } finally {
            setLoading(false);
        }
    }, [id, fetchPlanDetail]);

    useEffect(() => {
        loadPlan();
    }, [loadPlan]);

    const handleSubscribe = async () => {
        if (!plan) return;

        if (plan.isFull && !isSubscribed) {
            Alert.alert('Plan completo', 'Este plan ya alcanzo el maximo de participantes.');
            return;
        }

        setSubscribing(true);
        try {
            if (isSubscribed) {
                await unsubscribe(plan.id);
                setIsSubscribed(false);
                setPlan({
                    ...plan,
                    subscribersCount: Math.max(0, plan.subscribersCount - 1),
                });
            } else {
                await subscribe(plan.id);
                setIsSubscribed(true);
                setPlan({
                    ...plan,
                    subscribersCount: plan.subscribersCount + 1,
                });
            }
        } catch (err) {
            console.error('[PlanDetailScreen] Error subscribing:', err);
            Alert.alert('Error', 'No se pudo procesar la suscripcion');
        } finally {
            setSubscribing(false);
        }
    };

    const handleImageScroll = (event: any) => {
        const offsetX = event.nativeEvent.contentOffset.x;
        const index = Math.round(offsetX / SCREEN_WIDTH);
        setCurrentImageIndex(index);
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
                        Plan no encontrado
                    </ThemedText>
                    <Pressable
                        onPress={() => router.back()}
                        style={[styles.backButton, { backgroundColor: tint, marginTop: 24 }]}
                    >
                        <ThemedText type="body" style={{ color: tintText }}>Volver</ThemedText>
                    </Pressable>
                </View>
            </AppScreen>
        );
    }

    const images = plan.images?.length ? plan.images : ['https://via.placeholder.com/400x200'];
    const reviewCount = 0;
    const averageRating = 0;
    const { dateLabel, timeLabel } = formatDateTime(plan.dateTime);
    const isPublic = plan.visibility === 'PUBLIC';
    const canSubscribe = !plan.isFull || isSubscribed;

    return (
        <AppScreen scrollable>
            {/* Header con boton volver */}
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
                    <ThemedText type="title" numberOfLines={1}>{plan.title}</ThemedText>
                    <View style={[styles.visibilityBadge, { backgroundColor: isPublic ? '#dcfce7' : '#fef3c7' }]}>
                        <ThemedText type="label" style={{ color: isPublic ? '#166534' : '#92400e', fontSize: 11 }}>
                            {isPublic ? 'Publico' : 'Privado'}
                        </ThemedText>
                    </View>
                </View>
            </View>

            {/* Rating y reviews */}
            <View style={styles.ratingRow}>
                <ThemedText type="body" style={{ fontWeight: '600' }}>{averageRating.toFixed(1)}</ThemedText>
                <StarRating rating={averageRating} />
                <ThemedText type="body" style={{ color: mutedText }}>
                    ({reviewCount} reviews)
                </ThemedText>
                <Pressable onPress={() => setActiveTab('reviews')}>
                    <ThemedText type="body" style={{ color: tint, marginLeft: 8 }}>
                        Ver reviews
                    </ThemedText>
                </Pressable>
            </View>

            {/* Info basica */}
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
                            {timeLabel}
                        </ThemedText>
                    </View>
                ) : null}
            </View>

            <View style={styles.infoRow}>
                <View style={styles.infoItem}>
                    <Ionicons name="person-outline" size={16} color={mutedText} />
                    <ThemedText type="body" style={{ color: mutedText, marginLeft: 4 }}>
                        Edad minima: {plan.minAge ?? 18}
                    </ThemedText>
                </View>
            </View>

            <View style={[styles.locationCard, { backgroundColor: surface, borderColor: border }]}>
                <Ionicons name="location-outline" size={20} color={tint} />
                <ThemedText type="body" style={{ flex: 1, marginLeft: 8 }}>
                    {plan.location}
                </ThemedText>
            </View>

            {/* Carrusel de imagenes */}
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

            {/* Tabs */}
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
                        style={[
                            styles.tabText,
                            { color: activeTab === 'description' ? tint : mutedText },
                        ]}
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
                        style={[
                            styles.tabText,
                            { color: activeTab === 'subscribe' ? tint : mutedText },
                        ]}
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
                        style={[
                            styles.tabText,
                            { color: activeTab === 'reviews' ? tint : mutedText },
                        ]}
                    >
                        REVIEWS
                    </ThemedText>
                </Pressable>
            </View>

            {/* Contenido de tabs */}
            {activeTab === 'description' && (
                <View style={styles.tabContent}>
                    <ThemedText type="subtitle" style={{ marginBottom: 12 }}>Descripcion</ThemedText>
                    <ThemedText type="body" style={{ color: mutedText, lineHeight: 22 }}>
                        {plan.description || 'Sin descripcion disponible'}
                    </ThemedText>

                    {/* Info adicional */}
                    <View style={[styles.infoSection, { backgroundColor: surface, borderColor: border }]}>
                        <ThemedText type="subtitle" style={{ marginBottom: 12 }}>INFO</ThemedText>
                        <View style={styles.infoList}>
                            <View style={styles.infoListItem}>
                                <View style={[styles.infoDot, { backgroundColor: tint }]} />
                                <ThemedText type="body">Interes: {plan.interest}</ThemedText>
                            </View>
                            <View style={styles.infoListItem}>
                                <View style={[styles.infoDot, { backgroundColor: tint }]} />
                                <ThemedText type="body">Tipo de viaje: {plan.travelType}</ThemedText>
                            </View>
                            <View style={styles.infoListItem}>
                                <View style={[styles.infoDot, { backgroundColor: tint }]} />
                                <ThemedText type="body">
                                    Participantes: {plan.subscribersCount}/{plan.maxSubscribers}
                                </ThemedText>
                            </View>
                            {plan.maxAge !== null && (
                                <View style={styles.infoListItem}>
                                    <View style={[styles.infoDot, { backgroundColor: tint }]} />
                                    <ThemedText type="body">Edad maxima: {plan.maxAge}</ThemedText>
                                </View>
                            )}
                        </View>
                    </View>
                </View>
            )}

            {activeTab === 'subscribe' && (
                <View style={styles.tabContent}>
                    <ThemedText type="subtitle" style={{ marginBottom: 12 }}>Suscripcion</ThemedText>
                    <ThemedText type="body" style={{ color: mutedText, marginBottom: 24 }}>
                        {isSubscribed
                            ? 'Ya estas suscrito a este plan. Podes cancelar tu suscripcion en cualquier momento.'
                            : 'Unite a este plan y conecta con otras personas que comparten tus intereses.'}
                    </ThemedText>

                    <View style={[styles.subscribeInfo, { backgroundColor: surface, borderColor: border }]}>
                        <View style={styles.subscribeInfoRow}>
                            <Ionicons name="people-outline" size={20} color={mutedText} />
                            <ThemedText type="body" style={{ marginLeft: 8 }}>
                                {plan.subscribersCount} de {plan.maxSubscribers} participantes
                            </ThemedText>
                        </View>
                        <View style={styles.subscribeInfoRow}>
                            <Ionicons name="calendar-outline" size={20} color={mutedText} />
                            <ThemedText type="body" style={{ marginLeft: 8 }}>
                                {dateLabel}{timeLabel ? ` a las ${timeLabel}` : ''}
                            </ThemedText>
                        </View>
                    </View>
                </View>
            )}

            {activeTab === 'reviews' && (
                <View style={styles.tabContent}>
                    <ThemedText type="subtitle" style={{ marginBottom: 12 }}>Reviews</ThemedText>
                    <ThemedText type="body" style={{ color: mutedText }}>
                        Aun no hay reviews para este plan
                    </ThemedText>
                </View>
            )}

            {/* Boton de subscribe fijo */}
            <View style={styles.subscribeButtonContainer}>
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
                            {isSubscribed ? 'CANCELAR SUSCRIPCION' : (plan.isFull ? 'PLAN COMPLETO' : 'SUSCRIBIRSE')}
                        </ThemedText>
                    )}
                </Pressable>
            </View>
        </AppScreen>
    );
}

