import { useEffect } from 'react';
import { View, Alert } from 'react-native';
import * as Location from 'expo-location';

import { ThemedText } from '@/components/ThemedText';
import { AppScreen } from '@/components/ui';

import { styles } from './styles';

export default function HomeScreen() {
  useEffect(() => {
    (async () => {
      const { status, canAskAgain } = await Location.getForegroundPermissionsAsync();
      if (status !== 'granted' && canAskAgain) {
        Alert.alert(
          "Location Permission",
          "We need access to your location to show you nearby plans and tourist places on the map. Please grant location access in the following prompt.",
          [
            { text: "Cancel", style: "cancel" },
            { 
              text: "OK", 
              onPress: async () => {
                await Location.requestForegroundPermissionsAsync();
              }
            }
          ]
        );
      }
    })();
  }, []);

  return (
    <AppScreen centered>
      <View style={styles.center}>
        <ThemedText type="heading">Welcome!</ThemedText>
        <ThemedText type="body" style={styles.subtitle}>
          Welcome to the app.
        </ThemedText>
      </View>
    </AppScreen>
  );
}
