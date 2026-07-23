import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    container: {
        gap: 10,
    },
    row: {
        borderRadius: 12,
        borderWidth: 1,
        gap: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
    },
    rowHeader: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    dayName: {
        flex: 1,
        fontWeight: '600',
    },
    toggle: {
        alignItems: 'center',
        borderRadius: 999,
        borderWidth: 1,
        flexDirection: 'row',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    toggleLabel: {
        fontSize: 12,
        fontWeight: '600',
    },
    times: {
        gap: 10,
    },
    closedText: {
        fontStyle: 'italic',
    },
    rowError: {
        color: '#ef4444',
        fontSize: 12,
    },
    pressed: {
        opacity: 0.7,
    },
});
