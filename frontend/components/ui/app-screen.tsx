import { ReactNode } from 'react';
import {
    ScrollView,
    StyleSheet,
    View,
    type StyleProp,
    type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Layout } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';

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
        <ScrollView
          contentContainerStyle={[
            styles.content,
            centered && styles.centeredContent,
            contentStyle,
          ]}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
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

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: Layout.pagePadding,
    paddingVertical: 20,
    width: '100%',
    maxWidth: Layout.contentWidth,
    alignSelf: 'center',
  },
  centeredContent: {
    justifyContent: 'center',
  },
});