import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  shell: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 20,
  },
  backButtonWrapper: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  error: {
    color: '#dc2626',
    textAlign: 'center',
    marginTop: 16,
    fontSize: 14,
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
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    gap: 8,
  },
  link: {
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});

