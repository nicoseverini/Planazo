import { Ionicons } from '@expo/vector-icons';
import { Pressable, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { StatusBadgeColors } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';
import { PlanSummary } from '@/services/plan';
import { formatDateInTimezone, formatTimeInTimezone } from '@/utils/date';

import { styles } from './styles';

export type CreatedPlanCardProps = {
    plan: PlanSummary;
    onPress: (planId: number) => void;
};

export function CreatedPlanCard({ plan, onPress }: CreatedPlanCardProps) {
    const { surface: cardBg, border, mutedText } = useAppTheme();

    const formatDate = (dateString: string) =>
        formatDateInTimezone(dateString, plan.timezone);

    const formatTime = (dateString: string) =>
        formatTimeInTimezone(dateString, plan.timezone);

    const isPrivate = plan.visibility === 'PRIVATE';

    return (
        <Pressable
            onPress={() => onPress(plan.id)}
            style={({ pressed }) => [
                styles.createdCard,
                { backgroundColor: cardBg, borderColor: border },
                pressed && styles.cardPressed,
            ]}
        >
            <View style={styles.createdCardHeader}>
                <ThemedText type="subtitle" style={styles.createdTitle} numberOfLines={1}>
                    {plan.title}
                </ThemedText>
                <View
                    style={[
                        styles.visibilityBadge,
                        { backgroundColor: isPrivate ? StatusBadgeColors.private.background : StatusBadgeColors.public.background },
                    ]}
                >
                    <ThemedText
                        type="label"
                        style={[styles.visibilityText, { color: isPrivate ? StatusBadgeColors.private.text : StatusBadgeColors.public.text }]}
                    >
                        {isPrivate ? 'Private' : 'Public'}
                    </ThemedText>
                </View>
            </View>

            <View style={styles.createdMeta}>
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
                        {plan.subscriberCount}/{plan.maxSubscribers} Participants
                    </ThemedText>
                </View>
            </View>
        </Pressable>
    );
}
