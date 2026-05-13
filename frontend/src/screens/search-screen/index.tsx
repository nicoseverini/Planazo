import { View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { AppScreen } from '@/components/ui';

import { styles } from './styles';

export default function SearchScreen() {
  return (
    <AppScreen centered>
      <View style={styles.center}>
        <ThemedText type="heading">Buscar</ThemedText>
        <ThemedText type="body" style={styles.subtitle}>
          Pantalla vacia.
        </ThemedText>
      </View>
    </AppScreen>
  );
}

