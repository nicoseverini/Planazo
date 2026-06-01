import { ReactNode } from 'react';
import { View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/use-theme-color';

import { styles } from './styles';

type AuthCardProps = {
  kicker: string;
  title: string;
  body: string;
  children: ReactNode;
};

export function AuthCard({ kicker, title, body, children }: AuthCardProps) {
  const surface = useThemeColor({}, 'surface');
  const border = useThemeColor({}, 'border');
  const tint = useThemeColor({}, 'tint');

  return (
    <View style={[styles.card, { backgroundColor: surface, borderColor: border }]}
    >
      <ThemedText type="kicker" lightColor={tint} darkColor={tint}>
        {kicker}
      </ThemedText>
      <ThemedText type="title">{title}</ThemedText>
      <ThemedText type="body" style={styles.body}>
        {body}
      </ThemedText>
      <View style={styles.stack}>{children}</View>
    </View>
  );
}

