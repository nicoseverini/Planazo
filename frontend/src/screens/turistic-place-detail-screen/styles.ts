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
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 16,
    },
    headerButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
    },
    badge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 10,
    },
    infoCard: {
        borderRadius: Layout.buttonRadius,
        borderWidth: 1,
        padding: 16,
        marginBottom: 16,
        gap: 10,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    locationCard: {
        borderRadius: Layout.buttonRadius,
        borderWidth: 1,
        marginBottom: 16,
        overflow: 'hidden',
    },
    locationHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        gap: 8,
    },
    imageSection: {
        marginBottom: 16,
    },
    placeImage: {
        height: 200,
        borderRadius: Layout.buttonRadius,
        marginRight: 8,
    },
    imageIndicators: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 6,
        marginTop: 8,
    },
    indicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    actionRow: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 8,
        marginBottom: 24,
    },
    actionButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: Layout.buttonRadius,
        alignItems: 'center',
        justifyContent: 'center',
    },
    backButton: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: Layout.buttonRadius,
        alignItems: 'center',
    },
    pressed: {
        opacity: 0.7,
    },
});
