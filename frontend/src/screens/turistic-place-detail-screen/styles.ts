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
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        marginBottom: 8,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    locationCard: {
        borderRadius: Layout.buttonRadius,
        borderWidth: 1,
        marginTop: 8,
        marginBottom: 16,
        overflow: 'hidden',
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
    tabContainer: {
        flexDirection: 'row',
        borderBottomWidth: 1,
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
    tabContent: {
        marginBottom: 24,
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
