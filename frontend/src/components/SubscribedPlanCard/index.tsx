import { Ionicons } from '@expo/vector-icons';
import { Pressable, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/use-theme-color';
import { PlanSummary } from '@/services/plan';
import { formatDateInTimezone, formatTimeInTimezone } from '@/utils/date';

import { styles } from './styles';

export type SubscribedPlanCardProps = {
    plan: PlanSummary;
    onPress: (planId: number) => void;
};

export function SubscribedPlanCard({ plan, onPress }: SubscribedPlanCardProps) {
    const cardBg = useThemeColor({}, 'surface');
    const border = useThemeColor({}, 'border');
    const tint = useThemeColor({}, 'tint');
    const mutedText = useThemeColor({}, 'mutedText');

    const statusLabel =
        plan.accepted === true ? 'Accepted' : plan.accepted === false ? 'Pending' : 'Public';
    const statusColor =
        plan.accepted === true ? '#1E9E63' : plan.accepted === false ? '#D9822B' : mutedText;

    const formatDate = (dateString: string) =>
        formatDateInTimezone(dateString, plan.timezone);

    const formatTime = (dateString: string) =>
        formatTimeInTimezone(dateString, plan.timezone);

    return (
        <Pressable
            onPress={() => onPress(plan.id)}
            style={({ pressed }) => [
                styles.subscribedCard,
                { backgroundColor: cardBg, borderColor: border },
                pressed && styles.cardPressed,
            ]}
        >
            <ThemedText type="subtitle" style={styles.subscribedTitle} numberOfLines={1}>
                {plan.title}
            </ThemedText>
            {plan.accepted !== null && (
                <View style={[styles.statusBadge, { borderColor: statusColor, backgroundColor: statusColor + '1A' }]}>
                    <ThemedText type="label" style={[styles.statusText, { color: statusColor }]}>
                        {statusLabel}
                    </ThemedText>
                </View>
            )}
            <View style={styles.subscribedMeta}>
                <View style={styles.metaRow}>
                    <Ionicons name="calendar-outline" size={12} color={mutedText} />
                    <ThemedText type="label" style={[styles.metaTextSmall, { color: mutedText }]}>
                        {formatDate(plan.startDateTime)}
                    </ThemedText>
                </View>
                <View style={styles.metaRow}>
                    <Ionicons name="time-outline" size={12} color={mutedText} />
                    <ThemedText type="label" style={[styles.metaTextSmall, { color: mutedText }]}>
                        {formatTime(plan.startDateTime)}
                    </ThemedText>
                </View>
                <View style={styles.metaRow}>
                    <Ionicons name="location-outline" size={12} color={mutedText} />
                    <ThemedText
                        type="label"
                        style={[styles.metaTextSmall, { color: mutedText }]}
                        numberOfLines={1}
                    >
                        {plan.location}
                    </ThemedText>
                </View>
            </View>
            {plan.minAge && (
                <View style={[styles.ageBadge, { backgroundColor: tint + '20' }]}>
                    <ThemedText type="label" style={[styles.ageBadgeText, { color: tint }]}>
                        +{plan.minAge}
                    </ThemedText>
                </View>
            )}
        </Pressable>
    );
}
