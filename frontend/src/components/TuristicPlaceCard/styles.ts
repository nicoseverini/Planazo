import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    card: {
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: 16,
        overflow: 'hidden',
    },
    cardContent: {
        padding: 16,
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 12,
    },
    infoSection: {
        flex: 1,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 4,
    },
    titleText: {
        fontSize: 18,
        fontWeight: '600',
        flexShrink: 1,
    },
    categoryText: {
        fontSize: 14,
        marginBottom: 12,
    },
    metaSection: {
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
    priceButton: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
        minWidth: 90,
        alignItems: 'center',
        justifyContent: 'center',
    },
    priceButtonText: {
        color: '#ffffff',
        fontWeight: '600',
        fontSize: 14,
    },
    buttonPressed: {
        opacity: 0.8,
    },
});
