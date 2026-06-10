import { Ionicons } from '@expo/vector-icons';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/use-theme-color';
import { INTEREST_OPTIONS } from '@/services/turistic-place';

export type ActivityFilter = 'ALL' | 'PLANS' | 'PLACES';
export type VisibilityFilter = 'ANY' | 'PUBLIC' | 'PRIVATE';

export type MapFilters = {
    activity: ActivityFilter;
    category: string | null;
    visibility: VisibilityFilter;
};

export const DEFAULT_MAP_FILTERS: MapFilters = {
    activity: 'ALL',
    category: null,
    visibility: 'ANY',
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

    const chipStyle = (active: boolean) => [
        styles.chip,
        { backgroundColor: active ? tint : 'transparent', borderColor: active ? tint : border },
    ];

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
                <View style={[styles.chips, styles.lastSection]}>
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
    actions: {
        gap: 12,
    },
    actionButton: {
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
    },
});
