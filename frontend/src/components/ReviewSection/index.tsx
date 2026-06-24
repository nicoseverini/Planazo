import { ReviewCard } from '@/components/ReviewCard';
import { ReviewForm } from '@/components/ReviewForm';
import { ThemedText } from '@/components/ThemedText';
import { decodeJwt, useToken } from '@/context/token-context';
import { useAppTheme } from '@/hooks/use-app-theme';
import { ReviewResponse, ReviewTarget, useReviews } from '@/services/review';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';

export interface ReviewSectionProps {
    targetType: ReviewTarget;
    targetId: number;
    onStatsUpdated?: (averageRating: number, reviewCount: number) => void;
}

export function ReviewSection({ targetType, targetId, onStatsUpdated }: ReviewSectionProps) {
    const router = useRouter();
    const { getAccessToken, tokenData } = useToken();
    const { tint, tintText, border, mutedText, surface, text } = useAppTheme();
    const { fetchReviews, create, remove } = useReviews();

    const [reviews, setReviews] = useState<ReviewResponse[]>([]);
    const [selectedRatingFilter, setSelectedRatingFilter] = useState<number | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);

    const isAuthenticated = !!getAccessToken();

    let currentUserId: number | undefined;
    if (tokenData.state === 'LOGGED_IN') {
        const decoded = decodeJwt(tokenData.accessToken);
        currentUserId = decoded.id;
    }

    const userReview = currentUserId
        ? reviews.find((r) => r.author.id === currentUserId)
        : undefined;

    // You cannot review yourself, so don't offer the form on your own profile.
    const isSelfTarget = targetType === 'USER' && currentUserId === targetId;

    const loadData = useCallback(async () => {
        try {
            const reviewsData = await fetchReviews(targetType, targetId);
            setReviews(reviewsData);
            if (onStatsUpdated) {
                // Stats are derived from the full review list (the backend returns every
                // review, unpaginated), so they match the backend's AVG/COUNT exactly.
                // This avoids a redundant /stats request and keeps the summary in sync
                // after creating, editing or deleting a review.
                const reviewCount = reviewsData.length;
                const averageRating = reviewCount
                    ? reviewsData.reduce((sum, r) => sum + r.rating, 0) / reviewCount
                    : 0;
                onStatsUpdated(averageRating, reviewCount);
            }
        } catch (err) {
            console.error('Failed to load reviews data:', err);
        } finally {
            setInitialLoading(false);
        }
    }, [targetType, targetId, fetchReviews, onStatsUpdated]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleReviewSubmit = async (rating: number, comment: string) => {
        setSubmitting(true);
        try {
            await create(targetType, targetId, { rating, comment });
            setIsEditing(false);
            // Reload reviews and stats
            await loadData();
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteReview = () => {
        Alert.alert(
            'Delete Review',
            'Are you sure you want to delete your review? This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await remove(targetType, targetId);
                            // Reload reviews and stats
                            await loadData();
                        } catch (err) {
                            Alert.alert('Error', err instanceof Error ? err.message : 'Failed to delete review');
                        }
                    },
                },
            ]
        );
    };

    if (initialLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={tint} />
                <ThemedText type="body" style={{ color: mutedText, marginTop: 8 }}>
                    Loading reviews...
                </ThemedText>
            </View>
        );
    }

    const filteredReviews = selectedRatingFilter === null
        ? reviews
        : reviews.filter((r) => r.rating === selectedRatingFilter);

    const otherReviews = filteredReviews.filter((r) => r.author.id !== currentUserId);

    const filterOptions = [
        { label: 'All', value: null },
        { label: '5 ★', value: 5 },
        { label: '4 ★', value: 4 },
        { label: '3 ★', value: 3 },
        { label: '2 ★', value: 2 },
        { label: '1 ★', value: 1 },
    ];

    return (
        <View style={styles.container}>
            {isSelfTarget ? null : isAuthenticated ? (
                userReview ? (
                    isEditing ? (
                        <ReviewForm
                            key={userReview.id}
                            onSubmit={handleReviewSubmit}
                            submitting={submitting}
                            initialRating={userReview.rating}
                            initialComment={userReview.comment}
                            onCancel={() => setIsEditing(false)}
                        />
                    ) : (
                        <View style={[styles.userReviewContainer, { borderColor: border }]}>
                            <ThemedText type="subtitle" style={styles.userReviewHeader}>
                                Your Review
                            </ThemedText>
                            <ReviewCard review={userReview} />
                            <View style={styles.actionButtonRow}>
                                <Pressable
                                    onPress={() => setIsEditing(true)}
                                    style={({ pressed }) => [
                                        styles.actionButton,
                                        { borderColor: tint, backgroundColor: surface, flex: 1 },
                                        pressed && styles.disabled,
                                    ]}
                                >
                                    <ThemedText type="body" style={[styles.actionButtonText, { color: tint }]}>
                                        Edit Review
                                    </ThemedText>
                                </Pressable>
                                <Pressable
                                    onPress={handleDeleteReview}
                                    style={({ pressed }) => [
                                        styles.actionButton,
                                        { borderColor: '#ef4444', backgroundColor: surface, flex: 1 },
                                        pressed && styles.disabled,
                                    ]}
                                >
                                    <ThemedText type="body" style={[styles.actionButtonText, { color: '#ef4444' }]}>
                                        Delete Review
                                    </ThemedText>
                                </Pressable>
                            </View>
                        </View>
                    )
                ) : (
                    <ReviewForm onSubmit={handleReviewSubmit} submitting={submitting} />
                )
            ) : (
                <View style={[styles.loginPrompt, { backgroundColor: surface, borderColor: border }]}>
                    <ThemedText type="body" style={{ color: mutedText, textAlign: 'center', marginBottom: 12 }}>
                        You must be signed in to leave a review.
                    </ThemedText>
                    <Pressable
                        onPress={() => router.push('/')}
                        style={[styles.loginButton, { backgroundColor: tint }]}
                    >
                        <ThemedText type="body" style={{ color: tintText, fontWeight: '700' }}>
                            Sign In / Sign Up
                        </ThemedText>
                    </Pressable>
                </View>
            )}

            <ThemedText type="subtitle" style={styles.sectionHeader}>
                User Reviews ({otherReviews.length})
            </ThemedText>

            {reviews.length > 0 && (
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.filterRow}
                    contentContainerStyle={styles.filterRowContent}
                >
                    {filterOptions.map((opt) => {
                        const isSelected = selectedRatingFilter === opt.value;
                        return (
                            <Pressable
                                key={opt.label}
                                onPress={() => setSelectedRatingFilter(opt.value)}
                                style={[
                                    styles.filterPill,
                                    {
                                        backgroundColor: isSelected ? tint : surface,
                                        borderColor: isSelected ? tint : border,
                                    },
                                ]}
                            >
                                <ThemedText
                                    style={[
                                        styles.filterText,
                                        {
                                            color: isSelected ? tintText : text,
                                        },
                                    ]}
                                >
                                    {opt.label}
                                </ThemedText>
                            </Pressable>
                        );
                    })}
                </ScrollView>
            )}

            {reviews.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <ThemedText type="body" style={{ color: mutedText, fontStyle: 'italic' }}>
                        No reviews yet. Be the first to leave one!
                    </ThemedText>
                </View>
            ) : otherReviews.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <ThemedText type="body" style={{ color: mutedText, fontStyle: 'italic' }}>
                        {selectedRatingFilter !== null 
                            ? `No other reviews match the ${selectedRatingFilter}-star rating filter.` 
                            : "No other reviews yet."}
                    </ThemedText>
                </View>
            ) : (
                otherReviews.map((item) => (
                    <ReviewCard key={item.id} review={item} />
                ))
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: 8,
    },
    loadingContainer: {
        paddingVertical: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sectionHeader: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 12,
        marginTop: 8,
    },
    filterRow: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    filterRowContent: {
        paddingRight: 16,
    },
    filterPill: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        marginRight: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    filterText: {
        fontSize: 13,
        fontWeight: '600',
    },
    emptyContainer: {
        paddingVertical: 24,
        alignItems: 'center',
    },
    loginPrompt: {
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        alignItems: 'center',
        marginBottom: 20,
    },
    loginButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
    },
    userReviewContainer: {
        borderWidth: 1,
        borderRadius: 16,
        padding: 16,
        marginBottom: 24,
        borderStyle: 'dashed',
    },
    userReviewHeader: {
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 12,
    },
    actionButtonRow: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 12,
    },
    actionButton: {
        height: 40,
        borderRadius: 8,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionButtonText: {
        fontWeight: '600',
        fontSize: 14,
    },
    disabled: {
        opacity: 0.7,
    },
});
