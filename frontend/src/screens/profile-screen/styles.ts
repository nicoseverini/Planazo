import { StyleSheet } from 'react-native';

import { Layout } from '@/constants/theme';

export const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 48,
    },
    header: {
        alignItems: 'center',
        paddingVertical: 24,
        gap: 8,
    },
    avatarContainer: {
        position: 'relative',
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 3,
        overflow: 'visible',
        marginBottom: 8,
    },
    avatar: {
        width: '100%',
        height: '100%',
        borderRadius: 50,
    },
    avatarPlaceholder: {
        width: '100%',
        height: '100%',
        borderRadius: 50,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarInitial: {
        fontSize: 36,
        fontWeight: '600',
    },
    cameraIcon: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    userName: {
        marginTop: 4,
    },
    roleBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        marginTop: 4,
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
    menuSection: {
        marginTop: Layout.sectionGap,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 8,
        marginLeft: 4,
    },
    menuGroup: {
        gap: 8,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: Layout.buttonRadius,
        borderWidth: 1,
    },
    menuItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    menuItemLabel: {
        fontSize: 16,
    },
    pressed: {
        opacity: 0.7,
    },
    // Edit form styles
    editForm: {
        marginTop: Layout.sectionGap,
        gap: 16,
    },
    editTitle: {
        marginBottom: 8,
    },
    inputGroup: {
        gap: 6,
    },
    input: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: Layout.buttonRadius,
        borderWidth: 1,
        fontSize: 16,
    },
    disabledInput: {
        opacity: 0.6,
    },
    selectContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        padding: 8,
        borderRadius: Layout.buttonRadius,
        borderWidth: 1,
    },
    selectOption: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
    },
    errorContainer: {
        padding: 12,
        backgroundColor: '#fef2f2',
        borderRadius: Layout.buttonRadius,
    },
    formActions: {
        gap: 12,
        marginTop: 8,
    },
    primaryButton: {
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: Layout.buttonRadius,
        alignItems: 'center',
        justifyContent: 'center',
    },
    secondaryButton: {
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: Layout.buttonRadius,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
    },
});
