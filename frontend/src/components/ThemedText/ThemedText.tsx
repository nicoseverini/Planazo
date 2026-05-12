import { Text, type TextProps } from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';

import { styles } from './styles';

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

