import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { AppScreen } from '@/components/ui/app-screen';
import { Layout } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';

export default function Register() {
  const surface = useThemeColor({}, 'surface');;
  const border = useThemeColor({}, 'border');
  const tint = useThemeColor({}, 'tint');

  return (
    <AppScreen centered scrollable>
      <View style={[styles.card, { backgroundColor: surface, borderColor: border }]}>
        <ThemedText type="kicker" lightColor={tint} darkColor={tint}>Registro</ThemedText>
        <ThemedText type="title">Crear cuenta</ThemedText>
        <ThemedText type="body">
          Este shell ya deja listos espacios, contraste y jerarquía para el formulario.
        </ThemedText>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Layout.cardRadius,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 20,
    gap: 10,
  },
});