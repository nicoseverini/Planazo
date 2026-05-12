import { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  ScrollView,
  View,
  Platform,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useThemeColor } from '@/hooks/use-theme-color';

import { styles } from './styles';

type AppScreenProps = {
  children: ReactNode;
  scrollable?: boolean;
  centered?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
};

export function AppScreen({
  children,
  scrollable = false,
  centered = false,
  contentStyle,
  style,
}: AppScreenProps) {
  const backgroundColor = useThemeColor({}, 'background');

  if (scrollable) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor }, style]}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            contentContainerStyle={[
              styles.scrollContainer,
              centered && styles.centeredContent,
              contentStyle,
            ]}
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }, style]}>
      <View style={[styles.content, centered && styles.centeredContent, contentStyle]}>
        {children}
      </View>
    </SafeAreaView>
  );
}

