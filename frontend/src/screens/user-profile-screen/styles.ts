import { StyleSheet } from 'react-native';

import { Layout } from '@/constants/theme';

export const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 48,
        gap: 12,
    },
    headerBar: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 8,
    },
    headerButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
    },
    profileHeader: {
        alignItems: 'center',
        paddingVertical: 16,
        gap: 6,
    },
    tabContainer: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        marginTop: Layout.sectionGap,
        marginBottom: 16,
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
    },
    tabText: {
        fontWeight: '600',
        fontSize: 12,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    infoGrid: {
        gap: 12,
    },
    infoCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 16,
        borderRadius: Layout.buttonRadius,
        borderWidth: 1,
    },
    infoContent: {
        flex: 1,
        gap: 2,
    },
    backButton: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: Layout.buttonRadius,
        alignItems: 'center',
        marginTop: 24,
    },
    pressed: {
        opacity: 0.7,
    },
});
