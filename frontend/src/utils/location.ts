import * as Location from 'expo-location';

export async function canUseLocationServices(): Promise<boolean> {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
        return false;
    }

    return Location.hasServicesEnabledAsync();
}