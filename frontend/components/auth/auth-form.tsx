import { ReactNode } from 'react';
import {
  Pressable,
  StyleSheet,
  TextInput,
  type TextInputProps,
  View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Layout } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';

type ChoiceOption = {
  label: string;
  value: string;
};

type AuthCardProps = {
  kicker: string;
  title: string;
  body: string;
  children: ReactNode;
};

type AuthInputProps = TextInputProps & {
  label: string;
};

type ChoiceGroupProps = {
  label: string;
  options: ChoiceOption[];
  value: string;
  onChange: (value: string) => void;
};

type MultiChoiceGroupProps = {
  label: string;
  options: ChoiceOption[];
  value: string[];
  onChange: (value: string[]) => void;
};

export function AuthCard({ kicker, title, body, children }: AuthCardProps) {
  const surface = useThemeColor({}, 'surface');
  const border = useThemeColor({}, 'border');
  const tint = useThemeColor({}, 'tint');

  return (
    <View style={[styles.card, { backgroundColor: surface, borderColor: border }]}>
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

export function ChoiceGroup({ label, options, value, onChange }: ChoiceGroupProps) {
  const border = useThemeColor({}, 'border');
  const surface = useThemeColor({}, 'surface');
  const tint = useThemeColor({}, 'tint');
  const tintText = useThemeColor({}, 'tintText');
  const text = useThemeColor({}, 'text');

  return (
    <View style={styles.fieldGroup}>
      <ThemedText type="defaultSemiBold" style={styles.label}>
        {label}
      </ThemedText>
      <View style={styles.chips}>
        {options.map((option) => {
          const selected = value === option.value;

          return (
            <Pressable
              key={option.value}
              onPress={() => onChange(option.value)}
              style={[
                styles.chip,
                { borderColor: border, backgroundColor: selected ? tint : surface },
              ]}
            >
              <ThemedText
                type="buttonMedium"
                lightColor={selected ? tintText : text}
                darkColor={selected ? tintText : text}
              >
                {option.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export function MultiChoiceGroup({ label, options, value, onChange }: MultiChoiceGroupProps) {
  const border = useThemeColor({}, 'border');
  const surface = useThemeColor({}, 'surface');
  const tint = useThemeColor({}, 'tint');
  const tintText = useThemeColor({}, 'tintText');
  const text = useThemeColor({}, 'text');

  const toggle = (selectedValue: string) => {
    if (value.includes(selectedValue)) {
      onChange(value.filter((entry) => entry !== selectedValue));
      return;
    }

    onChange([...value, selectedValue]);
  };

  return (
    <View style={styles.fieldGroup}>
      <ThemedText type="defaultSemiBold" style={styles.label}>
        {label}
      </ThemedText>
      <View style={styles.chips}>
        {options.map((option) => {
          const selected = value.includes(option.value);

          return (
            <Pressable
              key={option.value}
              onPress={() => toggle(option.value)}
              style={[
                styles.chip,
                { borderColor: border, backgroundColor: selected ? tint : surface },
              ]}
            >
              <ThemedText
                type="buttonMedium"
                lightColor={selected ? tintText : text}
                darkColor={selected ? tintText : text}
              >
                {option.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export function AuthButton({ label, onPress, disabled }: { label: string; onPress: () => void; disabled?: boolean }) {
  const tint = useThemeColor({}, 'tint');
  const tintText = useThemeColor({}, 'tintText');

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [styles.button, { backgroundColor: tint }, pressed && !disabled && styles.pressed, disabled && styles.disabled]}
    >
      <ThemedText type="buttonLarge" lightColor={tintText} darkColor={tintText} style={styles.buttonText}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Layout.cardRadius,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 20,
    gap: 10,
  },
  body: {
    opacity: 0.8,
  },
  stack: {
    gap: 12,
  },
  fieldGroup: {
    gap: 8,
  },
  label: {
    marginLeft: 2,
  },
  input: {
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  button: {
    alignItems: 'center',
    borderRadius: Layout.buttonRadius,
    paddingVertical: 14,
  },
  buttonText: {
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.99 }],
  },
  disabled: {
    opacity: 0.5,
  },
});