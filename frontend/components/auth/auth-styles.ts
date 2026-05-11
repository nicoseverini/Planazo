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
  pickerGroup: {
    gap: 8,
  },
  fieldLabel: {
    marginLeft: 2,
  },
  pickerTrigger: {
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 48,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  pressedField: {
    opacity: 0.85,
  },
  pickerValue: {
    flex: 1,
    fontSize: 16,
  },
  placeholderValue: {
    opacity: 0.5,
  },
  pickerChevron: {
    marginLeft: 12,
    fontSize: 14,
    opacity: 0.7,
  },
  inlinePicker: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    padding: 8,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  modalShell: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    gap: 10,
    left: '50%',
    maxWidth: 360,
    padding: 18,
    position: 'absolute',
    top: '50%',
    transform: [{ translateX: -180 }, { translateY: -180 }],
    width: '86%',
  },
  modalTitle: {
    textAlign: 'center',
  },
  optionRow: {
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  optionRowSelected: {
    borderColor: '#3b82f6',
  },
  optionPressed: {
    opacity: 0.85,
  },
  optionText: {
    fontSize: 16,
  },
  optionCheck: {
    fontSize: 16,
    fontWeight: '700',
  },
  modalCancelButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  modalCancelText: {
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
    marginTop: 8,
  },
  modalSecondaryButton: {
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    flex: 1,
    paddingVertical: 12,
  },
  modalSecondaryText: {
    fontSize: 14,
  },
  modalPrimaryButton: {
    alignItems: 'center',
    backgroundColor: '#2563eb',
    borderRadius: 14,
    flex: 1,
    paddingVertical: 12,
  },
  modalPrimaryText: {
    color: '#ffffff',
    fontSize: 14,
  },
  checkboxRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 8,
  },
  checkboxBox: {
    alignItems: 'center',
    borderRadius: 6,
    borderWidth: 1,
    height: 22,
    justifyContent: 'center',
    width: 22,
  },
  checkboxBoxChecked: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  checkboxMark: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 14,
  },
});
