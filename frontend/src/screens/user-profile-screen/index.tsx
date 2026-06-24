import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';

import { Avatar } from '@/components/Avatar';
import { ReviewSection } from '@/components/ReviewSection';
import { StarRating } from '@/components/StarRating';
import { ThemedText } from '@/components/ThemedText';
import { AppScreen } from '@/components/ui';
import {
    GENDER_LABELS,
    INTEREST_LABELS,
    TRAVEL_TYPE_LABELS,
} from '@/constants/profile-options';
import { useAppTheme } from '@/hooks/use-app-theme';
import { UserProfile, useProfile } from '@/services/user';

import { styles } from './styles';

function formatList(values: string[] | undefined, labelMap?: Record<string, string>) {
    if (!values || values.length === 0) return 'Not set';
    return values.map((value) => labelMap?.[value] ?? value).join(', ');
}

function formatValue(value?: string, labelMap?: Record<string, string>) {
    if (!value) return 'Not set';
    return labelMap?.[value] ?? value;
}

export default function UserProfileScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
    const { fetchProfileById } = useProfile();
    const { tint, tintText, surface, border, mutedText } = useAppTheme();

    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'profile' | 'reviews'>('profile');
    const [averageRating, setAverageRating] = useState(0);
    const [reviewCount, setReviewCount] = useState(0);

    const handleStatsUpdated = useCallback((average: number, count: number) => {
        setAverageRating(average);
        setReviewCount(count);
    }, []);

    const loadProfile = useCallback(async () => {
        if (!id) {
            setError('User not found.');
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            setError(null);
            const data = await fetchProfileById(id);
            setUser(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unable to load this profile.');
        } finally {
            setLoading(false);
        }
    }, [id, fetchProfileById]);

    useEffect(() => {
        loadProfile();
    }, [loadProfile]);

    if (loading) {
        return (
            <AppScreen>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={tint} />
                </View>
            </AppScreen>
        );
    }

    if (error || !user) {
        return (
            <AppScreen>
                <View style={styles.loadingContainer}>
                    <Ionicons name="person-circle-outline" size={48} color={mutedText} />
                    <ThemedText type="body" style={{ color: mutedText }}>
                        {error ?? 'User not found.'}
                    </ThemedText>
                    <Pressable
                        onPress={() => router.back()}
                        style={[styles.backButton, { backgroundColor: tint }]}
                    >
                        <ThemedText type="body" style={{ color: tintText }}>Back</ThemedText>
                    </Pressable>
                </View>
            </AppScreen>
        );
    }

    const fullName = `${user.name || 'User'} ${user.lastname || ''}`.trim();

    return (
        <AppScreen scrollable>
            <View style={styles.headerBar}>
                <Pressable
                    onPress={() => router.back()}
                    style={({ pressed }) => [
                        styles.headerButton,
                        { backgroundColor: surface, borderColor: border },
                        pressed && styles.pressed,
                    ]}
                >
                    <Ionicons name="arrow-back" size={24} color={mutedText} />
                </Pressable>
                <ThemedText type="subtitle">Profile</ThemedText>
            </View>

            <View style={styles.profileHeader}>
                <Avatar name={user.name} photo={user.photo} size={100} />
                <ThemedText type="title" style={{ marginTop: 8 }}>{fullName}</ThemedText>
            </View>

            <View style={[styles.tabContainer, { borderColor: border }]}>
                <Pressable
                    onPress={() => setActiveTab('profile')}
                    style={[
                        styles.tab,
                        activeTab === 'profile' && { borderBottomColor: tint, borderBottomWidth: 2 },
                    ]}
                >
                    <ThemedText
                        type="body"
                        style={[styles.tabText, { color: activeTab === 'profile' ? tint : mutedText }]}
                    >
                        PROFILE
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

            {activeTab === 'reviews' ? (
                <View>
                    <View style={styles.ratingRow}>
                        <ThemedText type="body" style={{ fontWeight: '600' }}>{averageRating.toFixed(1)}</ThemedText>
                        <StarRating rating={averageRating} />
                        <ThemedText type="body" style={{ color: mutedText }}>
                            ({reviewCount} reviews)
                        </ThemedText>
                    </View>
                    <ReviewSection
                        targetType="USER"
                        targetId={Number(id)}
                        onStatsUpdated={handleStatsUpdated}
                    />
                </View>
            ) : (
            <View style={styles.infoGrid}>
                {user.gender ? (
                    <View style={[styles.infoCard, { backgroundColor: surface, borderColor: border }]}>
                        <Ionicons name="person-outline" size={20} color={mutedText} />
                        <View style={styles.infoContent}>
                            <ThemedText type="label" style={{ color: mutedText }}>Gender</ThemedText>
                            <ThemedText type="body">{formatValue(user.gender, GENDER_LABELS)}</ThemedText>
                        </View>
                    </View>
                ) : null}
                {user.birthDate ? (
                    <View style={[styles.infoCard, { backgroundColor: surface, borderColor: border }]}>
                        <Ionicons name="calendar-outline" size={20} color={mutedText} />
                        <View style={styles.infoContent}>
                            <ThemedText type="label" style={{ color: mutedText }}>Birth date</ThemedText>
                            <ThemedText type="body">{user.birthDate}</ThemedText>
                        </View>
                    </View>
                ) : null}
                <View style={[styles.infoCard, { backgroundColor: surface, borderColor: border }]}>
                    <Ionicons name="heart-outline" size={20} color={mutedText} />
                    <View style={styles.infoContent}>
                        <ThemedText type="label" style={{ color: mutedText }}>Interests</ThemedText>
                        <ThemedText type="body">{formatList(user.interests, INTEREST_LABELS)}</ThemedText>
                    </View>
                </View>
                <View style={[styles.infoCard, { backgroundColor: surface, borderColor: border }]}>
                    <Ionicons name="language-outline" size={20} color={mutedText} />
                    <View style={styles.infoContent}>
                        <ThemedText type="label" style={{ color: mutedText }}>Languages</ThemedText>
                        <ThemedText type="body">{formatList(user.languages)}</ThemedText>
                    </View>
                </View>
                <View style={[styles.infoCard, { backgroundColor: surface, borderColor: border }]}>
                    <Ionicons name="airplane-outline" size={20} color={mutedText} />
                    <View style={styles.infoContent}>
                        <ThemedText type="label" style={{ color: mutedText }}>Travel type</ThemedText>
                        <ThemedText type="body">{formatValue(user.travelType, TRAVEL_TYPE_LABELS)}</ThemedText>
                    </View>
                </View>
            </View>
            )}
        </AppScreen>
    );
}
