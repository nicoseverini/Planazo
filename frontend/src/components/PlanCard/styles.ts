import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    planCard: {
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: 16,
        overflow: 'hidden',
    },
    createdCard: {
        borderRadius: 16,
        borderWidth: 1,
        padding: 16,
        marginBottom: 12,
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
    createdMeta: {
        gap: 6,
    },
    planCardContent: {
        padding: 16,
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 12,
    },
    planInfo: {
        flex: 1,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 4,
    },
    planTitle: {
        fontSize: 18,
        fontWeight: '600',
        flexShrink: 1,
    },
    planDescription: {
        fontSize: 14,
        marginBottom: 12,
    },
    planMeta: {
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
    subscribeButton: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
        minWidth: 90,
        alignItems: 'center',
        justifyContent: 'center',
    },
    subscribeButtonText: {
        color: '#ffffff',
        fontWeight: '600',
        fontSize: 14,
    },
    buttonPressed: {
        opacity: 0.8,
    },
    visibilityBadge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
    },
    visibilityBadgeText: {
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
});
