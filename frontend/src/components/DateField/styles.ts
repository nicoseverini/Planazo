import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    container: {
        gap: 8,
    },
    label: {
        marginBottom: 0,
    },
    trigger: {
        alignItems: 'center',
        borderRadius: 14,
        borderWidth: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        minHeight: 48,
        paddingHorizontal: 14,
        paddingVertical: 12,
    },
    value: {
        flex: 1,
        fontSize: 16,
    },
    disabled: {
        opacity: 0.5,
    },
    pressed: {
        opacity: 0.7,
    },
    inlinePicker: {
        alignItems: 'center',
        borderRadius: 16,
        borderWidth: 1,
        overflow: 'hidden',
        padding: 8,
    },
    pickerActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignSelf: 'stretch',
        paddingHorizontal: 12,
        paddingTop: 4,
        paddingBottom: 4,
    },
    pickerAction: {
        fontSize: 16,
        fontWeight: '600',
        paddingVertical: 6,
    },
    error: {
        color: '#ef4444',
        fontSize: 13,
    },
});
