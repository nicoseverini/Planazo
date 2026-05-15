import { View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { AppScreen } from '@/components/ui';

import { styles } from './styles';

export default function MapScreen() {

  return (
    <AppScreen centered>
      <View style={styles.center}>
        <ThemedText type="heading">MAP</ThemedText>
        <ThemedText type="body" style={styles.subtitle}>
          (THIS IS A PLACEHOLDER).
        </ThemedText>
      </View>
    </AppScreen>
  );
}
