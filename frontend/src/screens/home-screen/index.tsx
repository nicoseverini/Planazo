import { View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { AppScreen } from '@/components/ui';

import { styles } from './styles';

export default function HomeScreen() {

  return (
    <AppScreen centered>
      <View style={styles.center}>
        <ThemedText type="heading">¡Bienvenido!</ThemedText>
        <ThemedText type="body" style={styles.subtitle}>
          Estás dentro de la app.
        </ThemedText>
      </View>
    </AppScreen>
  );
}
