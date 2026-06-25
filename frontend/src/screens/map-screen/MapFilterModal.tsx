import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { CategoryFilterSelector } from '@/components/CategoryFilterSelector';
import { DistanceSlider } from '@/components/DistanceSlider';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/use-theme-color';

export type ActivityFilter = 'ALL' | 'PLANS' | 'PLACES';
export type VisibilityFilter = 'ANY' | 'PUBLIC' | 'PRIVATE';

export type MapFilters = {
    activity: ActivityFilter;
    /** Selected category values. Empty array means "Any" (no category filter). */
    categories: string[];
    visibility: VisibilityFilter;
    radius: number | null;
};

export const DEFAULT_MAP_FILTERS: MapFilters = {
    activity: 'ALL',
    categories: [],
    visibility: 'ANY',
    radius: null,
};

const ACTIVITY_OPTIONS: { translationKey: string; value: ActivityFilter }[] = [
    { translationKey: 'both_activities', value: 'ALL' },
    { translationKey: 'plans_only', value: 'PLANS' },
    { translationKey: 'tourist_places_only', value: 'PLACES' },
];

const VISIBILITY_OPTIONS: { translationKey: string; value: VisibilityFilter }[] = [
    { translationKey: 'any', value: 'ANY' },
    { translationKey: 'public', value: 'PUBLIC' },
    { translationKey: 'private', value: 'PRIVATE' },
];

type Props = {
    visible: boolean;
    filters: MapFilters;
    onFiltersChange: (filters: MapFilters) => void | Promise<void>;
    onReset: () => void;
    onClose: () => void;
};

export function MapFilterModal({ visible, filters, onFiltersChange, onReset, onClose }: Props) {
    const { t } = useTranslation();
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
                    <ThemedText type="heading">{t('filters')}</ThemedText>
                    <Pressable onPress={onClose} hitSlop={8}>
                        <Ionicons name="close" size={24} color={text} />
                    </Pressable>
                </View>

                {/* Activity Type */}
                <ThemedText type="subtitle" style={styles.sectionTitle}>{t('activity_type')}</ThemedText>
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
                                    {t(opt.translationKey)}
                                </ThemedText>
                            </Pressable>
                        );
                    })}
                </View>

                {/* Category */}
                <ThemedText type="subtitle" style={styles.sectionTitle}>{t('category')}</ThemedText>
                <View style={styles.chips}>
                    <CategoryFilterSelector
                        selected={filters.categories}
                        onChange={(categories) => onFiltersChange({ ...filters, categories })}
                    />
                </View>

                {/* Plan Visibility */}
                <ThemedText type="subtitle" style={styles.sectionTitle}>{t('plan_visibility')}</ThemedText>
                <ThemedText type="label" style={[styles.sectionHint, { color: mutedText }]}>
                    {t('visibility_hint')}
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
                                    {t(opt.translationKey)}
                                </ThemedText>
                            </Pressable>
                        );
                    })}
                </View>

                {/* Proximity */}
                <ThemedText type="subtitle" style={[styles.sectionTitle, { marginTop: 16 }]}>{t('proximity')}</ThemedText>
                <View style={styles.lastSection}>
                    <DistanceSlider
                        radius={filters.radius}
                        onChange={(r) => onFiltersChange({ ...filters, radius: r })}
                    />
                </View>

                {/* Actions */}
                <View style={styles.actions}>
                    <Pressable
                        onPress={onClose}
                        style={[styles.actionButton, { backgroundColor: tint }]}
                    >
                        <ThemedText type="subtitle" style={{ color: tintText }}>{t('apply')}</ThemedText>
                    </Pressable>
                    <Pressable
                        onPress={onReset}
                        style={[styles.actionButton, { borderWidth: 1, borderColor: border }]}
                    >
                        <ThemedText type="subtitle">{t('reset_filters')}</ThemedText>
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
