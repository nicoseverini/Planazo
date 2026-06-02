import { View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { AppScreen } from '@/components/ui';

import { styles } from './styles';

export default function HomeScreen() {

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
