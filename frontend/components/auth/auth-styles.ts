import { StyleSheet } from 'react-native';

export const authStyles = StyleSheet.create({
  shell: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 20,
  },
  wrapper: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 20,
  },
  error: {
    color: '#dc2626',
    textAlign: 'center',
  },
  forgotPasswordLink: {
    alignItems: 'center',
    marginTop: 12,
    padding: 8,
  },
  forgotPasswordText: {
    textDecorationLine: 'underline',
    fontSize: 14,
  },
  backLink: {
    textAlign: 'center',
    marginTop: 20,
    textDecorationLine: 'underline',
  },
});
