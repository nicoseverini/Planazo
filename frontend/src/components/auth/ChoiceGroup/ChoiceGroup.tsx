import { Pressable, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/use-theme-color';

import { styles } from './styles';

type ChoiceOption = {
  label: string;
  value: string;
};

type ChoiceGroupProps = {
  label: string;
  options: ChoiceOption[];
  value: string;
  onChange: (value: string) => void;
};

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

