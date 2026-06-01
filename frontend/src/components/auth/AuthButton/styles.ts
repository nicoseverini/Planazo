import { StyleSheet } from 'react-native';

import { Layout } from '@/constants/theme';

export const styles = StyleSheet.create({
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

