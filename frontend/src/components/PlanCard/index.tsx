import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/use-theme-color';
import { PlanSummary } from '@/services/plan';

import { styles } from './styles';

export type PlanCardProps = {
    plan: PlanSummary;
    onSubscribe: (planId: number) => void;
    onPress: (planId: number) => void;
    subscribing: boolean;
    isSubscribed?: boolean;
};

export function PlanCard({ plan, onSubscribe, onPress, subscribing, isSubscribed }: PlanCardProps) {
    const cardBg = useThemeColor({}, 'surface');
    const border = useThemeColor({}, 'border');
    const tint = useThemeColor({}, 'tint');
    const mutedText = useThemeColor({}, 'mutedText');
    const tintText = useThemeColor({}, 'tintText');

    const CATEGORY_BY_INTEREST: Record<string, string> = {
        FOOD:      'Gastronomy',
        CULTURE:   'Culture',
        NATURE:    'Nature',
        BEACH:     'Beach',
        ADVENTURE: 'Adventure',
        SPORTS:    'Sports',
        NIGHTLIFE: 'Nightlife',
        SHOPPING:  'Shopping',
        HISTORY:   'History',
        MOUNTAINS: 'Mountains',
        OTHER:     'Other',
    };

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

    const interestLabel = (plan.interests ?? [])
        .map((interest) => CATEGORY_BY_INTEREST[interest] || interest)
        .join(' · ');

    const isPublic = plan.visibility === 'PUBLIC';

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
                    {/* Title row with inline visibility badge */}
                    <View style={styles.titleRow}>
                        <ThemedText type="subtitle" style={styles.planTitle} numberOfLines={1}>
                            {plan.title}
                        </ThemedText>
                        <View style={[styles.visibilityBadge, {
                            backgroundColor: isPublic ? '#22c55e' : '#f59e0b',
                        }]}>
                            <ThemedText type="label" style={styles.visibilityBadgeText}>
                                {isPublic ? 'PUBLIC' : 'PRIVATE'}
                            </ThemedText>
                        </View>
                    </View>
                    <ThemedText type="label" style={[styles.planDescription, { color: tint }]}>
                        {interestLabel}
                    </ThemedText>
                    <View style={styles.planMeta}>
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
                                {plan.subscribersCount}/{plan.maxSubscribers}
                            </ThemedText>
                        </View>
                    </View>
                </View>

                {!isSubscribed && (
                    <Pressable
                        onPress={() => onSubscribe(plan.id)}
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
                )}
            </View>
        </Pressable>
    );
}
