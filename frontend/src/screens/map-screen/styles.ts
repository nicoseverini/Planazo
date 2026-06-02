import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    appScreenContent: {
        padding: 0,
        paddingBottom: 0,
        paddingTop: 0,
        paddingLeft: 0,
        paddingRight: 0,
        paddingHorizontal: 0,
        maxWidth: '100%',
    },
    container: {
        flex: 1,
    },
    content:{
        flex:1,
    },
    map: {
        flex:1,
    },
    filterContainer: {
        position: 'absolute',
        top: 16,
        left: 0,
        right: 0,
        zIndex: 10,
    },
    filterScroll: {
        paddingHorizontal: 16,
        gap: 8,
    },
    filterChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        elevation: 3, // Sombra en Android
        shadowColor: '#000', // Sombra en iOS
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    calloutContainer: {
        width: 200,
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
    },
    loadingContainer: {
        position: 'absolute',
        bottom: 100,
        alignSelf: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: 12,
        borderRadius: 50,
    },
    myLocationButton: {
        position: 'absolute',
        bottom: 24,
        right: 16,
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        elevation: 5, // Sombra en Android
        shadowColor: '#000', // Sombra en iOS
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
});
