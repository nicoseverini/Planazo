import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

export function StarRating({ rating }: { rating: number }) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    return (
        <View style={styles.container}>
            {Array.from({ length: 5 }, (_, i) => {
                if (i < fullStars) return <Ionicons key={i} name="star" size={16} color="#22c55e" />;
                if (i === fullStars && hasHalfStar) return <Ionicons key={i} name="star-half" size={16} color="#22c55e" />;
                return <Ionicons key={i} name="star-outline" size={16} color="#22c55e" />;
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
