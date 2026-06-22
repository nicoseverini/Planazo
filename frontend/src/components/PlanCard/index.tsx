import { Ionicons } from '@expo/vector-icons';
import { Pressable, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { StatusBadgeColors } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';
import { PlanSummary } from '@/services/plan';
import { formatDateInTimezone, formatTimeInTimezone } from '@/utils/date';

import { styles } from './styles';

export type PlanCardProps = {
    plan: PlanSummary;
    onPress: (planId: number) => void;
};

const CATEGORY_BY_INTEREST: Record<string, string> = {
    FOOD: 'Food', CULTURE: 'Culture', NATURE: 'Nature', BEACH: 'Beach',
    ADVENTURE: 'Adventure', SPORTS: 'Sports', NIGHTLIFE: 'Nightlife',
    SHOPPING: 'Shopping', HISTORY: 'History', MOUNTAINS: 'Mountains', OTHER: 'Other',
};

export function PlanCard({ plan, onPress }: PlanCardProps) {
    const { surface: cardBg, border, tint, mutedText } = useAppTheme();

    const interestLabel = (plan.interests ?? [])
        .map((i) => CATEGORY_BY_INTEREST[i] || i)
        .join(' · ');

    const isPublic = plan.visibility === 'PUBLIC';

    return (
        <Pressable
            onPress={() => onPress(plan.id)}
            style={({ pressed }) => [
                styles.card,
                { backgroundColor: cardBg, borderColor: border },
                pressed && styles.pressed,
            ]}
        >
            <View style={styles.titleRow}>
                <ThemedText type="subtitle" style={styles.title} numberOfLines={1}>
                    {plan.title}
                </ThemedText>
                <View style={[styles.visibilityBadge, {
                    backgroundColor: isPublic
                        ? StatusBadgeColors.public.background
                        : StatusBadgeColors.private.background,
                }]}>
                    <ThemedText type="label" style={[styles.visibilityBadgeText, {
                        color: isPublic
                            ? StatusBadgeColors.public.text
                            : StatusBadgeColors.private.text,
                    }]}>
                        {isPublic ? 'Public' : 'Private'}
                    </ThemedText>
                </View>
            </View>

            {interestLabel ? (
                <ThemedText type="label" style={[styles.interestLabel, { color: tint }]}>
                    {interestLabel}
                </ThemedText>
            ) : null}

            <View style={styles.meta}>
                <View style={styles.metaRow}>
                    <Ionicons name="calendar-outline" size={14} color={mutedText} />
                    <ThemedText type="label" style={[styles.metaText, { color: mutedText }]}>
                        {formatDateInTimezone(plan.startDateTime, plan.timezone)} · {formatTimeInTimezone(plan.startDateTime, plan.timezone)}
                    </ThemedText>
                </View>
                <View style={styles.metaRow}>
                    <Ionicons name="location-outline" size={14} color={mutedText} />
                    <ThemedText type="label" style={[styles.metaText, { color: mutedText }]} numberOfLines={1}>
                        {plan.location}
                    </ThemedText>
                </View>
                <View style={styles.metaRow}>
                    <Ionicons name="people-outline" size={14} color={mutedText} />
                    <ThemedText type="label" style={[styles.metaText, { color: mutedText }]}>
                        {plan.subscriberCount}/{plan.maxSubscribers} participants
                    </ThemedText>
                </View>
            </View>
        </Pressable>
    );
}
