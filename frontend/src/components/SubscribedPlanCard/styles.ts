import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    subscribedCard: {
        width: 160,
        borderRadius: 12,
        borderWidth: 1,
        padding: 12,
        marginRight: 12,
    },
    cardPressed: {
        opacity: 0.8,
        transform: [{ scale: 0.98 }],
    },
    subscribedTitle: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
    },
    subscribedMeta: {
        gap: 4,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    metaTextSmall: {
        fontSize: 11,
        flex: 1,
    },
    ageBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    ageBadgeText: {
        fontSize: 10,
        fontWeight: '600',
    },
});
