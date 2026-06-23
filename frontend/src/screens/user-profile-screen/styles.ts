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
    infoGrid: {
        gap: 12,
        marginTop: Layout.sectionGap,
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
