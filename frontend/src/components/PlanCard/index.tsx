import { Ionicons } from '@expo/vector-icons';
import { Image, Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import React from 'react';

import { ThemedText } from '@/components/ThemedText';
import { ParticipationBadgeColors } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';
import { PlanSummary } from '@/services/plan';
import { formatDateInTimezone, formatTimeInTimezone } from '@/utils/date';
import { formatInterest } from '@/utils/interests';
import { planParticipationStatus } from '@/utils/plan-filters';
import { VisibilityBadge } from '@/components/VisibilityBadge';

import { styles } from './styles';

export type PlanCardProps = {
    plan: PlanSummary;
    onPress: (planId: number) => void;
    /**
     * When true, also shows the join-request status (Pending / Accepted) next to
     * the visibility badge. Used in the Joined Plans tab. Visibility is always shown.
     */
     showStatus?: boolean;
};

function StatusBadge({ plan }: { plan: PlanSummary }) {
    const { t } = useTranslation();
    const status = planParticipationStatus(plan);
    if (status === null) return null;
    const color = status === 'ACCEPTED' ? ParticipationBadgeColors.accepted : ParticipationBadgeColors.pending;
    return (
        <View style={[styles.statusBadge, { borderColor: color, backgroundColor: color + '1A' }]}>
            <ThemedText type="label" style={[styles.statusBadgeText, { color }]}>
                {status === 'ACCEPTED' ? t('accepted') : t('pending')}
            </ThemedText>
        </View>
    );
}

export function PlanCard({ plan, onPress, showStatus = false }: PlanCardProps) {
    const { t } = useTranslation();
    const { surface: cardBg, border, tint, mutedText } = useAppTheme();

    const interestLabel = (plan.interests ?? []).map(formatInterest).join(' · ');

    const imageUrl = plan.images && plan.images.length > 0 && plan.images[0]
        ? plan.images[0]
        : 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?q=80&w=600&auto=format&fit=crop';

    return (
        <Pressable
            onPress={() => onPress(plan.id)}
            style={({ pressed }) => [
                styles.card,
                { backgroundColor: cardBg, borderColor: border },
                pressed && styles.pressed,
            ]}
        >
            <View style={styles.imageContainer}>
                <Image
                    source={{ uri: imageUrl }}
                    style={styles.cardImage}
                    resizeMode="cover"
                />
                <View style={styles.badgeOverlay}>
                    {showStatus && <StatusBadge plan={plan} />}
                    <VisibilityBadge type={plan.visibility} />
                </View>
            </View>

            <View style={styles.infoContainer}>
                {interestLabel ? (
                    <ThemedText type="label" style={[styles.interestLabel, { color: tint }]}>
                        {interestLabel}
                    </ThemedText>
                ) : null}

                <ThemedText type="subtitle" style={styles.title} numberOfLines={1}>
                    {plan.title}
                </ThemedText>

                <View style={styles.meta}>
                    <View style={styles.metaRow}>
                        <Ionicons name="calendar-outline" size={14} color={mutedText} />
                        <ThemedText type="label" style={[styles.metaText, { color: mutedText }]} numberOfLines={1}>
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
                        <ThemedText type="label" style={[styles.metaText, { color: mutedText }]} numberOfLines={1}>
                            {t('participants_max', { count: plan.subscriberCount, max: plan.maxSubscribers })}
                        </ThemedText>
                    </View>
                </View>
            </View>
        </Pressable>
    );
}
