import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    appScreenContent: {
        padding: 0,
        paddingTop: 0,
        paddingBottom: 0,
        paddingLeft: 0,
        paddingRight: 0,
        paddingHorizontal: 0,
        maxWidth: '100%',
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 24,
        paddingBottom: 16,
    },

    // Tab switcher
    tabs: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        gap: 8,
        marginBottom: 12,
    },
    tab: {
        flex: 1,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        alignItems: 'center',
    },
    tabText: {
        fontSize: 13,
        fontWeight: '600',
    },

    // Tab content
    tabContent: {
        flex: 1,
    },
    filterBar: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        paddingHorizontal: 20,
        marginBottom: 8,
    },
    filterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        padding: 4,
    },
    activeChips: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        marginHorizontal: 20,
        marginBottom: 8,
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 120,
        gap: 12,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 40,
    },

    // Empty state
    emptyContainer: {
        alignItems: 'center',
        paddingTop: 60,
        gap: 12,
    },
    emptyText: {
        textAlign: 'center',
    },
    emptyCta: {
        marginTop: 4,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 10,
        borderWidth: 1,
    },

    // Filter modal
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    modalLabel: {
        marginBottom: 12,
    },
    filterDateField: {
        marginBottom: 24,
    },
    chipRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 24,
    },
    choiceChip: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
    },
    modalInput: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        gap: 12,
        marginBottom: 24,
    },
    modalInputText: {
        flex: 1,
        fontSize: 16,
        padding: 0,
    },

    // Floating action button
    fab: {
        position: 'absolute',
        right: 20,
        bottom: 24,
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 8,
    },
    fabPressed: {
        opacity: 0.9,
        transform: [{ scale: 0.95 }],
    },
});
