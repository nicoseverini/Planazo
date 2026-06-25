import React from 'react';
import { Pressable, ActivityIndicator, Text, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { styles } from './styles';

type ButtonProps = {
  title: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'accent' | 'outline';
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

export function Button({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
  textStyle,
}: ButtonProps) {
  const { tint, tintText, secondary, accent, border, text: baseTextColor } = useAppTheme();
  const theme = useColorScheme();

  let backgroundColor = tint;
  let textColor = tintText;
  let borderColor = 'transparent';

  if (variant === 'secondary') {
    backgroundColor = secondary;
    textColor = theme === 'dark' ? '#0D1117' : '#FFFFFF';
  } else if (variant === 'accent') {
    backgroundColor = accent;
    textColor = theme === 'dark' ? '#0D1117' : '#FFFFFF';
  } else if (variant === 'outline') {
    backgroundColor = 'transparent';
    textColor = baseTextColor;
    borderColor = border;
  }

  const isInteractionDisabled = disabled || loading;

  return (
    <Pressable
      onPress={isInteractionDisabled ? undefined : onPress}
      disabled={isInteractionDisabled}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor, borderColor },
        pressed && styles.pressed,
        isInteractionDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={textColor} />
      ) : (
        <Text style={[styles.text, { color: textColor }, textStyle]}>
          {title}
        </Text>
      )}
    </Pressable>
  );
}
