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

import { BottomNavBar } from '@/components/BottomNavBar';
import { useToken } from '@/context/token-context';
import { useThemeColor } from '@/hooks/use-theme-color';

import { styles } from './styles';

type AppScreenProps = {
  children: ReactNode;
  scrollable?: boolean;
  centered?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
  showNavBar?: boolean;
};

export function AppScreen({
  children,
  scrollable = false,
  centered = false,
  contentStyle,
  style,
  showNavBar,
}: AppScreenProps) {
  const { tokenData } = useToken();
  const backgroundColor = useThemeColor({}, 'background');
  const shouldShowNavBar = showNavBar ?? tokenData.state === 'LOGGED_IN';

  if (scrollable) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor }, style]}>
        <View style={styles.screen}>
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
                shouldShowNavBar && styles.withNavPadding,
                contentStyle,
              ]}
              showsVerticalScrollIndicator={false}
            >
              {children}
            </ScrollView>
          </KeyboardAvoidingView>
          {shouldShowNavBar && <BottomNavBar />}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }, style]}>
      <View style={styles.screen}>
        <View
          style={[
            styles.content,
            centered && styles.centeredContent,
            shouldShowNavBar && styles.withNavPadding,
            contentStyle,
          ]}
        >
          {children}
        </View>
        {shouldShowNavBar && <BottomNavBar />}
      </View>
    </SafeAreaView>
  );
}
