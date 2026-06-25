import { Alert, Linking, Platform } from 'react-native';

/**
 * Opens the native Google Maps application (on both Android and iOS)
 * to provide directions to a destination coordinate and name.
 * Falls back gracefully to standard Google Maps in web browser if the native scheme fails.
 */
export async function openInMaps(latitude: number, longitude: number, label: string) {
  const encodedLabel = encodeURIComponent(label);
  
  const nativeUrl = Platform.select({
    ios: `comgooglemaps://?center=${latitude},${longitude}&q=${latitude},${longitude}(${encodedLabel})`,
    android: `geo:0,0?q=${latitude},${longitude}(${encodedLabel})`,
    default: `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`,
  });

  const webFallbackUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

  try {
    const canOpen = await Linking.canOpenURL(nativeUrl);
    if (canOpen) {
      await Linking.openURL(nativeUrl);
    } else {
      await Linking.openURL(webFallbackUrl);
    }
  } catch (err) {
    try {
      await Linking.openURL(webFallbackUrl);
    } catch (fallbackErr) {
      Alert.alert('Error', 'Could not open maps.');
    }
  }
}
