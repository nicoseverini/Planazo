import { Ionicons } from '@expo/vector-icons';
import { Pressable, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { StatusBadgeColors } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { PlanSummary } from '@/services/plan';

import { styles } from './styles';

export type CreatedPlanCardProps = {
    plan: PlanSummary;
    onPress: (planId: number) => void;
};

export function CreatedPlanCard({ plan, onPress }: CreatedPlanCardProps) {
    const cardBg = useThemeColor({}, 'surface');
    const border = useThemeColor({}, 'border');
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
                        {formatDate(plan.dateTime)} - {formatTime(plan.dateTime)}
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
                        {plan.subscribersCount}/{plan.maxSubscribers} Participants
                    </ThemedText>
                </View>
            </View>
        </Pressable>
    );
}
