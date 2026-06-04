import { StyleSheet } from 'react-native';
import { Layout } from '@/constants/theme';

export const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    createButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: Layout.buttonRadius,
    },
    tabRow: {
        flexDirection: 'row',
        marginBottom: 16,
        gap: 8,
    },
    tabButton: {
        flex: 1,
        paddingVertical: 8,
        borderRadius: Layout.buttonRadius,
        borderWidth: 1,
        alignItems: 'center',
    },
    card: {
        borderRadius: Layout.buttonRadius,
        borderWidth: 1,
        padding: 16,
        marginBottom: 12,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 10,
    },
    cardMeta: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 4,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 48,
        gap: 12,
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 48,
    },
    pressed: {
        opacity: 0.7,
    },
});
