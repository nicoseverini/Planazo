import { Pressable } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/use-theme-color';

import { styles } from './styles';

type AuthButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
};

export function AuthButton({ label, onPress, disabled }: AuthButtonProps) {
  const tint = useThemeColor({}, 'tint');
  const tintText = useThemeColor({}, 'tintText');

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: tint },
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      <ThemedText type="buttonLarge" lightColor={tintText} darkColor={tintText} style={styles.buttonText}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

