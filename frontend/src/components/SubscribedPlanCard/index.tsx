import { Ionicons } from '@expo/vector-icons';
import { Pressable, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/use-theme-color';
import { PlanSummary } from '@/services/plan';

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

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'short',
        });
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

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
            <View style={styles.subscribedMeta}>
                <View style={styles.metaRow}>
                    <Ionicons name="calendar-outline" size={12} color={mutedText} />
                    <ThemedText type="label" style={[styles.metaTextSmall, { color: mutedText }]}>
                        {formatDate(plan.dateTime)}
                    </ThemedText>
                </View>
                <View style={styles.metaRow}>
                    <Ionicons name="time-outline" size={12} color={mutedText} />
                    <ThemedText type="label" style={[styles.metaTextSmall, { color: mutedText }]}>
                        {formatTime(plan.dateTime)}
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
