import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    createdCard: {
        borderRadius: 16,
        borderWidth: 1,
        padding: 16,
        marginBottom: 12,
    },
    cardPressed: {
        opacity: 0.8,
        transform: [{ scale: 0.98 }],
    },
    createdCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
        gap: 8,
    },
    createdTitle: {
        fontSize: 16,
        fontWeight: '600',
        flex: 1,
    },
    visibilityBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    visibilityText: {
        fontSize: 11,
        fontWeight: '600',
    },
    createdMeta: {
        gap: 6,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    metaText: {
        fontSize: 13,
    },
});
