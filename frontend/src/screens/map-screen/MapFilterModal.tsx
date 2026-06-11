import { Ionicons } from '@expo/vector-icons';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useState } from 'react';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/use-theme-color';
import { INTEREST_OPTIONS } from '@/services/turistic-place';

export type ActivityFilter = 'ALL' | 'PLANS' | 'PLACES';
export type VisibilityFilter = 'ANY' | 'PUBLIC' | 'PRIVATE';

export type MapFilters = {
    activity: ActivityFilter;
    category: string | null;
    visibility: VisibilityFilter;
    radius: number | null;
};

export const DEFAULT_MAP_FILTERS: MapFilters = {
    activity: 'ALL',
    category: null,
    visibility: 'ANY',
    radius: null,
};

const ACTIVITY_OPTIONS: { label: string; value: ActivityFilter }[] = [
    { label: 'Both', value: 'ALL' },
    { label: 'Plans only', value: 'PLANS' },
    { label: 'Tourist places only', value: 'PLACES' },
];

const VISIBILITY_OPTIONS: { label: string; value: VisibilityFilter }[] = [
    { label: 'Any', value: 'ANY' },
    { label: 'Public', value: 'PUBLIC' },
    { label: 'Private', value: 'PRIVATE' },
];

const CATEGORY_OPTIONS = INTEREST_OPTIONS;

type Props = {
    visible: boolean;
    filters: MapFilters;
    onFiltersChange: (filters: MapFilters) => void;
    onReset: () => void;
    onClose: () => void;
};

export function MapFilterModal({ visible, filters, onFiltersChange, onReset, onClose }: Props) {
    const surface = useThemeColor({}, 'surface');
    const border = useThemeColor({}, 'border');
    const tint = useThemeColor({}, 'tint');
    const tintText = useThemeColor({}, 'tintText');
    const text = useThemeColor({}, 'text');
    const mutedText = useThemeColor({}, 'mutedText');
    const [containerWidth, setContainerWidth] = useState(0);

    const chipStyle = (active: boolean) => [
        styles.chip,
        { backgroundColor: active ? tint : 'transparent', borderColor: active ? tint : border },
    ];

    const handleSliderTouch = (event: any) => {
        if (containerWidth === 0) return;
        const x = event.nativeEvent.locationX;
        let newPercentage = x / containerWidth;
        newPercentage = Math.max(0, Math.min(1, newPercentage));
        if (newPercentage > 0.95) {
            onFiltersChange({ ...filters, radius: null });
        } else {
            const val = Math.max(1, Math.round(newPercentage * 100));
            onFiltersChange({ ...filters, radius: val });
        }
    };

    const isRadiusAny = filters.radius === null;
    const radiusPercentage = isRadiusAny ? 1 : Math.max(0, Math.min(1, filters.radius! / 100));

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <ScrollView
                style={{ flex: 1, backgroundColor: surface }}
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >
                {/* Header */}
                <View style={styles.header}>
                    <ThemedText type="heading">Filters</ThemedText>
                    <Pressable onPress={onClose} hitSlop={8}>
                        <Ionicons name="close" size={24} color={text} />
                    </Pressable>
                </View>

                {/* Activity Type */}
                <ThemedText type="subtitle" style={styles.sectionTitle}>Activity Type</ThemedText>
                <View style={styles.chips}>
                    {ACTIVITY_OPTIONS.map((opt) => {
                        const active = filters.activity === opt.value;
                        return (
                            <Pressable
                                key={opt.value}
                                onPress={() => onFiltersChange({ ...filters, activity: opt.value })}
                                style={chipStyle(active)}
                            >
                                <ThemedText type="label" style={{ color: active ? tintText : text }}>
                                    {opt.label}
                                </ThemedText>
                            </Pressable>
                        );
                    })}
                </View>

                {/* Category */}
                <ThemedText type="subtitle" style={styles.sectionTitle}>Category</ThemedText>
                <View style={styles.chips}>
                    <Pressable
                        onPress={() => onFiltersChange({ ...filters, category: null })}
                        style={chipStyle(filters.category === null)}
                    >
                        <ThemedText type="label" style={{ color: filters.category === null ? tintText : text }}>
                            Any
                        </ThemedText>
                    </Pressable>
                    {CATEGORY_OPTIONS.map((opt) => {
                        const active = filters.category === opt.value;
                        return (
                            <Pressable
                                key={opt.value}
                                onPress={() => onFiltersChange({ ...filters, category: opt.value })}
                                style={chipStyle(active)}
                            >
                                <ThemedText type="label" style={{ color: active ? tintText : text }}>
                                    {opt.label}
                                </ThemedText>
                            </Pressable>
                        );
                    })}
                </View>

                {/* Plan Visibility */}
                <ThemedText type="subtitle" style={styles.sectionTitle}>Plan Visibility</ThemedText>
                <ThemedText type="label" style={[styles.sectionHint, { color: mutedText }]}>
                    Does not affect tourist places.
                </ThemedText>
                <View style={styles.chips}>
                    {VISIBILITY_OPTIONS.map((opt) => {
                        const active = filters.visibility === opt.value;
                        return (
                            <Pressable
                                key={opt.value}
                                onPress={() => onFiltersChange({ ...filters, visibility: opt.value })}
                                style={chipStyle(active)}
                            >
                                <ThemedText type="label" style={{ color: active ? tintText : text }}>
                                    {opt.label}
                                </ThemedText>
                            </Pressable>
                        );
                    })}
                </View>

                {/* Proximity Filter */}
                <ThemedText type="subtitle" style={[styles.sectionTitle, { marginTop: 16 }]}>Proximity</ThemedText>
                <View style={styles.sliderHeader}>
                    <ThemedText type="label" style={{ color: text }}>Distance range</ThemedText>
                    <ThemedText type="label" style={{ color: tint, fontWeight: 'bold' }}>
                        {isRadiusAny ? 'Any distance' : `Up to ${filters.radius} km`}
                    </ThemedText>
                </View>
                <View
                    style={[styles.sliderContainer, styles.lastSection]}
                    onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
                    onStartShouldSetResponder={() => true}
                    onResponderGrant={handleSliderTouch}
                    onResponderMove={handleSliderTouch}
                >
                    <View style={[styles.sliderTrack, { backgroundColor: border }]}>
                        <View style={[styles.sliderFill, { width: `${radiusPercentage * 100}%`, backgroundColor: tint }]} />
                    </View>
                    {containerWidth > 0 && (
                        <View style={[styles.sliderThumb, {
                            left: radiusPercentage * containerWidth - 12,
                            backgroundColor: tint,
                        }]} />
                    )}
                    <View style={styles.sliderLabels}>
                        <ThemedText type="label" style={{ fontSize: 12, color: mutedText }}>1 km</ThemedText>
                        <ThemedText type="label" style={{ fontSize: 12, color: mutedText }}>Any</ThemedText>
                    </View>
                </View>

                {/* Actions */}
                <View style={styles.actions}>
                    <Pressable
                        onPress={onClose}
                        style={[styles.actionButton, { backgroundColor: tint }]}
                    >
                        <ThemedText type="subtitle" style={{ color: tintText }}>Apply</ThemedText>
                    </Pressable>
                    <Pressable
                        onPress={onReset}
                        style={[styles.actionButton, { borderWidth: 1, borderColor: border }]}
                    >
                        <ThemedText type="subtitle">Reset Filters</ThemedText>
                    </Pressable>
                </View>
            </ScrollView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    scrollContent: {
        padding: 24,
        paddingBottom: 60,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 28,
    },
    sectionTitle: {
        marginBottom: 12,
    },
    sectionHint: {
        marginBottom: 12,
    },
    chips: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 28,
    },
    lastSection: {
        marginBottom: 36,
    },
    chip: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
    },
    sliderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    sliderContainer: {
        height: 50,
        justifyContent: 'center',
        paddingHorizontal: 12,
    },
    sliderTrack: {
        height: 6,
        borderRadius: 3,
        overflow: 'hidden',
    },
    sliderFill: {
        height: '100%',
    },
    sliderThumb: {
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
    sliderLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 12,
    },
    actions: {
        gap: 12,
    },
    actionButton: {
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
    },
});
