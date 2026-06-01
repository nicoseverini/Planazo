import { Pressable, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/use-theme-color';

import { styles } from './styles';

type ChoiceOption = {
  label: string;
  value: string;
};

type MultiChoiceGroupProps = {
  label: string;
  options: ChoiceOption[];
  value: string[];
  onChange: (value: string[]) => void;
};

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

