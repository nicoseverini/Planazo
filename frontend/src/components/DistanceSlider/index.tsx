import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Slider from '@react-native-community/slider';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useTranslation } from 'react-i18next';

// Developer-configurable default maximum distance in km
export const DISTANCE_SLIDER_MAX_KM = 100;
export const DISTANCE_SLIDER_DEFAULT_KM = 10;

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

    const { t: translate } = useTranslation();

    const isAny = radius === null;
    // Map null (Any distance) to maxKm + 5 so there is a clear step at the end of the slider
    const sliderValue = isAny ? maxKm + 5 : radius;

    const [localValue, setLocalValue] = useState(sliderValue);

    useEffect(() => {
        setLocalValue(sliderValue);
    }, [sliderValue]);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <ThemedText type="label" style={{ color: text }}>{translate('distance_range')}</ThemedText>
                <ThemedText type="label" style={{ color: tint, fontWeight: 'bold' }}>
                    {localValue > maxKm ? translate('max_distance') : `${translate('up_to')} ${localValue} km`}
                </ThemedText>
            </View>
            <Slider
                minimumValue={1}
                maximumValue={maxKm + 5}
                step={1}
                value={localValue}
                onValueChange={(val: number) => {
                    setLocalValue(val);
                }}
                onSlidingComplete={(val: number) => {
                    if (val > maxKm) {
                        onChange(null);
                    } else {
                        onChange(val);
                    }
                }}
                minimumTrackTintColor={tint}
                maximumTrackTintColor={border}
                thumbTintColor={tint}
                style={styles.slider}
            />
            <View style={styles.labels}>
                <ThemedText type="label" style={{ fontSize: 12, color: mutedText }}>1 km</ThemedText>
                <ThemedText type="label" style={{ fontSize: 12, color: mutedText }}>{translate('any_distance')}</ThemedText>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginVertical: 8,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    slider: {
        width: '100%',
        height: 40,
    },
    labels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 4,
    },
});