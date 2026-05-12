import { StyleSheet } from 'react-native';

import { Layout } from '@/constants/theme';

export const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 300,
    height: 300,
    marginBottom: 2,
  },
  titleContainer: {
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    maxWidth: 260,
  },
  bottom: {
    paddingBottom: 100,
    gap: 12,
  },
  buttonPrimary: {
    paddingVertical: 14,
    borderRadius: Layout.buttonRadius,
  },
  buttonSecondary: {
    paddingVertical: 14,
    borderRadius: Layout.buttonRadius,
    borderWidth: StyleSheet.hairlineWidth,
  },
  buttonPrimaryText: {
    textAlign: 'center',
  },
  buttonSecondaryText: {
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
});

