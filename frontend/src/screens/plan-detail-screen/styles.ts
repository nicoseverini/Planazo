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
    headerTitleContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    headerTitle: {
        flexShrink: 1,
    },
    visibilityBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    starContainer: {
        flexDirection: 'row',
        gap: 2,
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
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: Layout.buttonRadius,
        borderWidth: 1,
        marginTop: 8,
        marginBottom: 16,
    },
    imageSection: {
        marginBottom: 16,
    },
    planImage: {
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
    infoSection: {
        padding: 16,
        borderRadius: Layout.buttonRadius,
        borderWidth: 1,
        marginTop: 16,
    },
    infoList: {
        gap: 8,
    },
    infoListItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    infoDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    subscribersSection: {
        marginTop: 24,
    },
    subscribersList: {
        flexDirection: 'row',
        gap: 8,
    },
    subscriberAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        borderWidth: 2,
        overflow: 'hidden',
    },
    subscriberImage: {
        width: '100%',
        height: '100%',
    },
    subscriberPlaceholder: {
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    subscribeInfo: {
        padding: 16,
        borderRadius: Layout.buttonRadius,
        borderWidth: 1,
        gap: 12,
    },
    pendingSection: {
        padding: 16,
        borderRadius: Layout.buttonRadius,
        borderWidth: 1,
        marginBottom: 16,
        gap: 12,
    },
    pendingList: {
        gap: 10,
    },
    pendingCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        padding: 12,
        borderWidth: 1,
        borderRadius: Layout.buttonRadius,
    },
    pendingTextBlock: {
        flex: 1,
        gap: 2,
    },
    subscribeInfoRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    reviewCard: {
        padding: 16,
        borderRadius: Layout.buttonRadius,
        borderWidth: 1,
        marginBottom: 12,
    },
    reviewHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    reviewInfo: {
        flex: 1,
        gap: 4,
    },
    subscribeButtonContainer: {
        marginTop: 8,
        marginBottom: 16,
    },
    subscribeButton: {
        paddingVertical: 16,
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
    disabled: {
        opacity: 0.5,
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeButton: {
        position: 'absolute',
        top: 50,
        right: 20,
        zIndex: 10,
        padding: 10,
    },
    scrollView: {
        flex: 1,
        width: '100%',
    },
    indicatorContainer: {
        position: 'absolute',
        bottom: 50,
        alignSelf: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        paddingVertical: 6,
        paddingHorizontal: 16,
        borderRadius: 20,
    },
});
