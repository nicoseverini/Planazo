import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    appScreenContent: {
        padding: 0,
        paddingBottom: 0,
        paddingTop: 0,
        paddingLeft: 0,
        paddingRight: 0,
        paddingHorizontal: 0,
        maxWidth: '100%',
    },
    container: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 24,
        paddingBottom: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    filterButton: {
        padding: 4,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 20,
        marginBottom: 16,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        gap: 12,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        padding: 0,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 100,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 100,
        gap: 12,
    },
    emptyText: {
        textAlign: 'center',
    },
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
    filterDateField: {
        marginBottom: 24,
    },
    activeChip: {
        borderRadius: 12,
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    activeChipsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        marginHorizontal: 20,
        marginBottom: 8,
    },
    clearAllButton: {
        justifyContent: 'center',
    },
    modalScrollView: {
        flex: 1,
    },
    modalContent: {
        padding: 24,
        paddingBottom: 60,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    modalSectionTitle: {
        marginBottom: 12,
    },
    modalSectionTitleWithMargin: {
        marginTop: 24,
        marginBottom: 12,
    },
    modalSection: {
        marginBottom: 24,
    },
    visibilityContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 24,
    },
    visibilityOption: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
    },
    flexText: {
        flex: 1,
    },
    actionButtonsContainer: {
        gap: 12,
    },
    applyButton: {
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
    },
    clearButton: {
        borderWidth: 1,
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
    },
});
