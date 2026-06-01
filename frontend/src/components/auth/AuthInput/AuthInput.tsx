import { TextInput, type TextInputProps, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/use-theme-color';

import { styles } from './styles';

type AuthInputProps = TextInputProps & {
  label: string;
};

export function AuthInput({ label, style, ...props }: AuthInputProps) {
  const background = useThemeColor({}, 'elevated');
  const border = useThemeColor({}, 'border');
  const text = useThemeColor({}, 'text');
  const muted = useThemeColor({}, 'mutedText');

  return (
    <View style={styles.fieldGroup}>
      <ThemedText type="defaultSemiBold" style={styles.label}>
        {label}
      </ThemedText>
      <TextInput
        placeholderTextColor={muted}
        style={[styles.input, { backgroundColor: background, borderColor: border, color: text }, style]}
        {...props}
      />
    </View>
  );
}

