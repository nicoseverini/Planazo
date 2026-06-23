import { Ionicons } from '@expo/vector-icons';
import { ComponentProps } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

export interface StarRatingProps {
    rating: number;
    onChange?: (rating: number) => void;
    size?: number;
    color?: string;
}

type IoniconsName = ComponentProps<typeof Ionicons>['name'];

export function StarRating({ rating, onChange, size = 16, color = '#22c55e' }: StarRatingProps) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    return (
        <View style={styles.container}>
            {Array.from({ length: 5 }, (_, i) => {
                const starValue = i + 1;
                let name: IoniconsName = 'star-outline';

                if (i < fullStars) {
                    name = 'star';
                } else if (i === fullStars && hasHalfStar) {
                    name = 'star-half';
                }

                const starIcon = <Ionicons name={name} size={size} color={color} />;

                if (onChange) {
                    return (
                        <Pressable
                            key={i}
                            onPress={() => onChange(starValue)}
                            hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
                        >
                            {starIcon}
                        </Pressable>
                    );
                }

                return <View key={i}>{starIcon}</View>;
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        gap: 2,
    },
});
