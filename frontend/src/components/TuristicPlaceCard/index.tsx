import { Ionicons } from '@expo/vector-icons';
import { Image, Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import React from 'react';

import { ThemedText } from '@/components/ThemedText';
import { useAppTheme } from '@/hooks/use-app-theme';
import { TuristicPlaceSummary } from '@/services/turistic-place';
import { formatInterest } from '@/utils/interests';

import { styles } from './styles';

export type TuristicPlaceCardProps = {
    place: TuristicPlaceSummary;
    onPress: (placeId: number) => void;
};

export function TuristicPlaceCard({ place, onPress }: TuristicPlaceCardProps) {
    const { t } = useTranslation();
    const { surface: cardBg, border, tint, mutedText } = useAppTheme();

    const categoryLabel = (place.interests ?? []).map(formatInterest).join(' · ');
    const locationLine = [place.address, place.city, place.country].filter(Boolean).join(', ') || place.location;
    const costLabel = place.cost == null ? null : place.cost === 0 ? t('free') : `$${place.cost.toLocaleString()}`;

    const imageUrl = place.images && place.images.length > 0 && place.images[0]
        ? place.images[0]
        : 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=600&auto=format&fit=crop';

    return (
        <Pressable
            onPress={() => onPress(place.id)}
            style={({ pressed }) => [
                styles.card,
                { backgroundColor: cardBg, borderColor: border },
                pressed && styles.buttonPressed,
            ]}
        >
            <View style={styles.imageContainer}>
                <Image
                    source={{ uri: imageUrl }}
                    style={styles.cardImage}
                    resizeMode="cover"
                />
            </View>

            <View style={styles.cardContent}>
                {categoryLabel ? (
                    <ThemedText type="label" style={[styles.categoryLabel, { color: tint }]}>
                        {categoryLabel}
                    </ThemedText>
                ) : null}

                <ThemedText type="subtitle" style={styles.cardTitle} numberOfLines={1}>
                    {place.name}
                </ThemedText>

                <View style={styles.metaSection}>
                    <View style={styles.metaRow}>
                        <Ionicons name="time-outline" size={14} color={mutedText} />
                        <ThemedText type="label" style={[styles.metaText, { color: mutedText }]} numberOfLines={1}>
                            {t('hours_coming_soon')}
                        </ThemedText>
                    </View>

                    {locationLine ? (
                        <View style={styles.metaRow}>
                            <Ionicons name="location-outline" size={14} color={mutedText} />
                            <ThemedText type="label" style={[styles.metaText, { color: mutedText }]} numberOfLines={1}>
                                {locationLine}
                            </ThemedText>
                        </View>
                    ) : null}

                    {costLabel != null && (
                        <View style={styles.metaRow}>
                            <Ionicons name="cash-outline" size={14} color={mutedText} />
                            <ThemedText type="label" style={[styles.metaText, { color: mutedText }]} numberOfLines={1}>
                                {costLabel}
                            </ThemedText>
                        </View>
                    )}
                </View>
            </View>
        </Pressable>
    );
}
