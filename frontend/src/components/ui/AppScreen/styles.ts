import { StyleSheet } from 'react-native';

import { Layout } from '@/constants/theme';

export const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  screen: {
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
  scrollContent: {
    paddingBottom: 32,
  },
  scrollContainer: {
    paddingHorizontal: Layout.pagePadding,
    paddingVertical: 20,
    width: '100%',
    maxWidth: Layout.contentWidth,
    alignSelf: 'center',
    flexGrow: 1,
  },
  withNavPadding: {
    paddingBottom: 88,
  },
  centeredContent: {
    justifyContent: 'center',
  },
});
