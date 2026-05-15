import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingVertical: 8,
        paddingBottom: 24,
        borderTopWidth: 1,
    },
    navItem: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 4,
        paddingHorizontal: 8,
        minWidth: 60,
    },
    navLabel: {
        fontSize: 10,
        marginTop: 4,
        textAlign: 'center',
    },
    pressed: {
        opacity: 0.7,
    },
});
