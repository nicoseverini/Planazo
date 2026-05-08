import { StyleSheet, Text, type TextProps } from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'heading' | 'body' | 'defaultSemiBold' | 'subtitle' | 'link' | 'buttonLarge' | 'buttonMedium' | 'kicker';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  return (
    <Text
      style={[
        { color },
        type === 'default' ? styles.default : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'heading' ? styles.heading : undefined,
        type === 'body' ? styles.body : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'link' ? styles.link : undefined,
        type === 'buttonLarge' ? styles.buttonLarge : undefined,
        type === 'buttonMedium' ? styles.buttonMedium : undefined,
        type === 'kicker' ? styles.kicker : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 32,
  },
  heading: {
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 28,
  },
  body: {
    fontSize: 14,
    lineHeight: 20,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  link: {
    lineHeight: 30,
    fontSize: 16,
    color: '#000000',
  },
  buttonLarge: {
    fontSize: 16,
    fontWeight: '600',
  },
  buttonMedium: {
    fontSize: 16,
    fontWeight: '500',
  },
  kicker: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
});
