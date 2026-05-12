import { StyleSheet } from 'react-native';

import { Layout } from '@/constants/theme';

export const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  subtitle: {
    textAlign: 'center',
    opacity: 0.6,
  },
  bottom: {
    paddingBottom: 100,
    gap: 12,
  },
  button: {
    paddingVertical: 14,
    borderRadius: Layout.buttonRadius,
  },
  buttonSecondary: {
    paddingVertical: 14,
    borderRadius: Layout.buttonRadius,
    borderWidth: StyleSheet.hairlineWidth,
  },
  buttonText: {
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
});

