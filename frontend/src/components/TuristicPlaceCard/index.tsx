import { Ionicons } from '@expo/vector-icons';
import { Pressable, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/use-theme-color';
import { TuristicPlaceSummary } from '@/services/turistic-place';

import { styles } from './styles';

export type TuristicPlaceCardProps = {
    place: TuristicPlaceSummary;
    onPress: (id: number) => void;
};

const CATEGORY_BY_INTEREST: Record<string, string> = {
    FOOD:      'Food',
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

export function TuristicPlaceCard({ place, onPress }: TuristicPlaceCardProps) {
    const cardBg = useThemeColor({}, 'surface');
    const border = useThemeColor({}, 'border');
    const tint = useThemeColor({}, 'tint');
    const mutedText = useThemeColor({}, 'mutedText');

    return (
        <Pressable
            onPress={() => onPress(place.id)}
            style={({ pressed }) => [
                styles.card,
                { backgroundColor: cardBg, borderColor: border },
                pressed && styles.buttonPressed,
            ]}
        >
            <View style={styles.cardContent}>
                <View style={styles.infoSection}>
                    <View style={styles.titleRow}>
                        <ThemedText type="subtitle" style={styles.titleText} numberOfLines={1}>
                            {place.name}
                        </ThemedText>
                    </View>
                    <ThemedText type="label" style={[styles.categoryText, { color: tint }]}>
                        {CATEGORY_BY_INTEREST[place.interest] || place.interest}
                    </ThemedText>
                    <View style={styles.metaSection}>
                        <View style={styles.metaRow}>
                            <Ionicons name="location-outline" size={14} color={mutedText} />
                            <ThemedText type="label" style={[styles.metaText, { color: mutedText }]} numberOfLines={1}>
                                {place.location || 'Argentina'}
                            </ThemedText>
                        </View>
                    </View>
                </View>

                <View style={[styles.priceButton, { backgroundColor: tint }]}>
                    <ThemedText type="label" style={styles.priceButtonText}>
                        {place.cost === 0 ? 'FREE' : `$${place.cost}`}
                    </ThemedText>
                </View>
            </View>
        </Pressable>
    );
}
