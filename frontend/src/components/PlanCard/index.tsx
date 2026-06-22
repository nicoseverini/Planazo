import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { StatusBadgeColors } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';
import { PlanSummary } from '@/services/plan';
import { formatDateInTimezone, formatTimeInTimezone } from '@/utils/date';

import { styles } from './styles';

export type PlanCardProps = {
    plan: PlanSummary;
    onPress: (planId: number) => void;
    variant?: 'browse' | 'created';
    onSubscribe?: (planId: number) => void;
    subscribing?: boolean;
    isSubscribed?: boolean;
};

export function PlanCard({ plan, onPress, variant = 'browse', onSubscribe, subscribing = false, isSubscribed }: PlanCardProps) {
    const { surface: cardBg, border, tint, mutedText, tintText } = useAppTheme();

    const formatDate = (dateString: string) => formatDateInTimezone(dateString, plan.timezone);
    const formatTime = (dateString: string) => formatTimeInTimezone(dateString, plan.timezone);

    const CATEGORY_BY_INTEREST: Record<string, string> = {
        FOOD: 'Food', CULTURE: 'Culture', NATURE: 'Nature', BEACH: 'Beach',
        ADVENTURE: 'Adventure', SPORTS: 'Sports', NIGHTLIFE: 'Nightlife',
        SHOPPING: 'Shopping', HISTORY: 'History', MOUNTAINS: 'Mountains', OTHER: 'Other',
    };

    const interestLabel = (plan.interests ?? []).map((i) => CATEGORY_BY_INTEREST[i] || i).join(' · ');
    const isPublic = plan.visibility === 'PUBLIC';
    const isFull = plan.maxSubscribers != null && plan.subscriberCount >= plan.maxSubscribers;

    const visibilityBadge = (
        <View style={[styles.visibilityBadge, {
            backgroundColor: isPublic ? StatusBadgeColors.public.background : StatusBadgeColors.private.background,
        }]}>
            <ThemedText type="label" style={[styles.visibilityBadgeText, {
                color: isPublic ? StatusBadgeColors.public.text : StatusBadgeColors.private.text,
            }]}>
                {isPublic ? 'Public' : 'Private'}
            </ThemedText>
        </View>
    );

    const metaRows = (
        <>
            <View style={styles.metaRow}>
                <Ionicons name="calendar-outline" size={14} color={mutedText} />
                <ThemedText type="label" style={[styles.metaText, { color: mutedText }]}>
                    {formatDate(plan.startDateTime)} - {formatTime(plan.startDateTime)}
                </ThemedText>
            </View>
            <View style={styles.metaRow}>
                <Ionicons name="location-outline" size={14} color={mutedText} />
                <ThemedText type="label" style={[styles.metaText, { color: mutedText }]}>
                    {plan.location}
                </ThemedText>
            </View>
            <View style={styles.metaRow}>
                <Ionicons name="people-outline" size={14} color={mutedText} />
                <ThemedText type="label" style={[styles.metaText, { color: mutedText }]}>
                    {plan.subscriberCount}/{plan.maxSubscribers}{variant === 'created' ? ' Participants' : ''}
                </ThemedText>
            </View>
        </>
    );

    if (variant === 'created') {
        return (
            <Pressable
                onPress={() => onPress(plan.id)}
                style={({ pressed }) => [
                    styles.createdCard,
                    { backgroundColor: cardBg, borderColor: border },
                    pressed && styles.buttonPressed,
                ]}
            >
                <View style={styles.createdCardHeader}>
                    <ThemedText type="subtitle" style={styles.createdTitle} numberOfLines={1}>
                        {plan.title}
                    </ThemedText>
                    {visibilityBadge}
                </View>
                <View style={styles.createdMeta}>
                    {metaRows}
                </View>
            </Pressable>
        );
    }

    return (
        <Pressable
            onPress={() => onPress(plan.id)}
            style={({ pressed }) => [
                styles.planCard,
                { backgroundColor: cardBg, borderColor: border },
                pressed && styles.buttonPressed,
            ]}
        >
            <View style={styles.planCardContent}>
                <View style={styles.planInfo}>
                    <View style={styles.titleRow}>
                        <ThemedText type="subtitle" style={styles.planTitle} numberOfLines={1}>
                            {plan.title}
                        </ThemedText>
                        {visibilityBadge}
                    </View>
                    <ThemedText type="label" style={[styles.planDescription, { color: tint }]}>
                        {interestLabel}
                    </ThemedText>
                    <View style={styles.planMeta}>
                        {metaRows}
                    </View>
                </View>

                {!isSubscribed && (
                    isFull ? (
                        <View style={[styles.subscribeButton, { backgroundColor: tint, opacity: 0.5 }]}>
                            <ThemedText type="label" style={[styles.subscribeButtonText, { color: tintText }]}>
                                PLAN FULL
                            </ThemedText>
                        </View>
                    ) : (
                        <Pressable
                            onPress={() => onSubscribe?.(plan.id)}
                            disabled={subscribing}
                            style={({ pressed }) => [
                                styles.subscribeButton,
                                { backgroundColor: tint },
                                pressed && styles.buttonPressed,
                            ]}
                        >
                            {subscribing ? (
                                <ActivityIndicator size="small" color={tintText} />
                            ) : (
                                <ThemedText type="label" style={[styles.subscribeButtonText, { color: tintText }]}>
                                    SUBSCRIBE
                                </ThemedText>
                            )}
                        </Pressable>
                    )
                )}
            </View>
        </Pressable>
    );
}
