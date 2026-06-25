import { Avatar } from '@/components/Avatar';
import { StarRating } from '@/components/StarRating';
import { ThemedText } from '@/components/ThemedText';
import { useAppTheme } from '@/hooks/use-app-theme';
import { ReviewResponse } from '@/services/review';
import { Image, StyleSheet, View } from 'react-native';
import React, { useState } from 'react';
import { TranslationButton } from '@/components/TranslationButton';

export interface ReviewCardProps {
    review: ReviewResponse;
}

function formatTimeAgo(createdAt: any): string {
    if (!createdAt) return '';

    let date: Date;
    if (typeof createdAt === 'number') {
        // If it's epoch seconds, convert to milliseconds
        const isEpochSeconds = createdAt < 9999999999;
        date = new Date(isEpochSeconds ? createdAt * 1000 : createdAt);
    } else if (typeof createdAt === 'string') {
        // Check if string is a number
        if (/^\d+(\.\d+)?$/.test(createdAt)) {
            const num = parseFloat(createdAt);
            const isEpochSeconds = num < 9999999999;
            date = new Date(isEpochSeconds ? num * 1000 : num);
        } else {
            date = new Date(createdAt);
        }
    } else if (Array.isArray(createdAt)) {
        // Spring sometimes serializes dates as arrays: [year, month, day, hour, minute, second]
        const [year, month, day, hour = 0, minute = 0, second = 0] = createdAt;
        date = new Date(Date.UTC(year, month - 1, day, hour, minute, second));
    } else {
        date = new Date(createdAt);
    }

    if (isNaN(date.getTime())) {
        return '';
    }

    const now = new Date();
    const secondsDiff = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (secondsDiff < 0) return 'Just now';

    const minutes = Math.floor(secondsDiff / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (secondsDiff < 60) {
        return 'Just now';
    } else if (minutes < 60) {
        return `${minutes}m ago`;
    } else if (hours < 24) {
        return `${hours}h ago`;
    } else if (days < 7) {
        return `${days}d ago`;
    } else {
        const month = String(date.getDate()).padStart(2, '0');
        const monthStr = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${monthStr}/${month}/${year}`;
    }
}

export function ReviewCard({ review }: ReviewCardProps) {
    const { surface, border, mutedText, text, tint, tintText } = useAppTheme();
    const [translatedComment, setTranslatedComment] = useState<string | null>(null);

    const fullName = `${review.author.name || 'Anonymous'} ${review.author.lastname || ''}`.trim();

    const formattedDate = formatTimeAgo(review.createdAt);

    return (
        <View style={[styles.card, { backgroundColor: surface, borderColor: border }]}>
            <View style={styles.header}>
                <Avatar name={review.author.name} photo={review.author.photo} size={36} />
                <View style={styles.meta}>
                    <ThemedText type="body" style={[styles.authorName, { color: text }]}>
                        {fullName}
                    </ThemedText>
                    <ThemedText type="label" style={{ color: mutedText }}>
                        {formattedDate}
                    </ThemedText>
                </View>
                <View style={styles.ratingContainer}>
                    <StarRating rating={review.rating} size={14} />
                </View>
            </View>
            <ThemedText type="body" style={[styles.comment, { color: text }]}>
                {translatedComment || review.comment}
            </ThemedText>
            {review.comment ? (
                <TranslationButton
                    originalText={review.comment}
                    onTranslationRowReceived={setTranslatedComment}
                />
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    meta: {
        marginLeft: 12,
        flex: 1,
        justifyContent: 'center',
    },
    authorName: {
        fontWeight: '600',
        fontSize: 14,
        lineHeight: 18,
    },
    ratingContainer: {
        alignSelf: 'flex-start',
        paddingTop: 2,
    },
    comment: {
        fontSize: 14,
        lineHeight: 20,
    },
});
