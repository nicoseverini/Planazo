import { StyleSheet } from 'react-native';

import { Layout } from '@/constants/theme';

export const styles = StyleSheet.create({
  wrapper: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: Layout.pagePadding,
    paddingVertical: 32,
  },
  error: {
    color: '#dc2626',
    textAlign: 'center',
  },
});

