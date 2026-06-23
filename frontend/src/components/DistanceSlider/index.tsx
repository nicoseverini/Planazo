import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/use-theme-color';

// Developer-configurable default maximum distance in km
export const DISTANCE_SLIDER_MAX_KM = 100;

type Props = {
    radius: number | null;
    onChange: (radius: number | null) => void;
    /** Maximum selectable distance in km. Defaults to DISTANCE_SLIDER_MAX_KM. */
    maxKm?: number;
};

export function DistanceSlider({ radius, onChange, maxKm = DISTANCE_SLIDER_MAX_KM }: Props) {
    const border = useThemeColor({}, 'border');
    const tint = useThemeColor({}, 'tint');
    const text = useThemeColor({}, 'text');
    const mutedText = useThemeColor({}, 'mutedText');
    const [containerWidth, setContainerWidth] = useState(0);

    const handleSliderTouch = (event: any) => {
        if (containerWidth === 0) return;
        const x = event.nativeEvent.locationX;
        const pct = Math.max(0, Math.min(1, x / containerWidth));
        if (pct > 0.95) {
            onChange(null);
        } else {
            onChange(Math.max(1, Math.round(pct * maxKm)));
        }
    };

    const isAny = radius === null;
    const pct = isAny ? 1 : Math.max(0, Math.min(1, radius! / maxKm));

    return (
        <View>
            <View style={styles.header}>
                <ThemedText type="label" style={{ color: text }}>Distance range</ThemedText>
                <ThemedText type="label" style={{ color: tint, fontWeight: 'bold' }}>
                    {isAny ? 'Any distance' : `Up to ${radius} km`}
                </ThemedText>
            </View>
            <View
                style={styles.container}
                onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
                onStartShouldSetResponder={() => true}
                onResponderGrant={handleSliderTouch}
                onResponderMove={handleSliderTouch}
            >
                <View style={[styles.track, { backgroundColor: border }]}>
                    <View style={[styles.fill, { width: `${pct * 100}%` as any, backgroundColor: tint }]} />
                </View>
                {containerWidth > 0 && (
                    <View
                        style={[styles.thumb, { left: pct * containerWidth - 12, backgroundColor: tint }]}
                    />
                )}
                <View style={styles.labels}>
                    <ThemedText type="label" style={{ fontSize: 12, color: mutedText }}>1 km</ThemedText>
                    <ThemedText type="label" style={{ fontSize: 12, color: mutedText }}>Any</ThemedText>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    container: {
        height: 50,
        justifyContent: 'center',
        paddingHorizontal: 12,
    },
    track: {
        height: 6,
        borderRadius: 3,
        overflow: 'hidden',
    },
    fill: {
        height: '100%',
    },
    thumb: {
        position: 'absolute',
        width: 24,
        height: 24,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 5,
        pointerEvents: 'none',
    },
    labels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 12,
    },
});
