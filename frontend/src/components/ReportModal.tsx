import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '@/hooks/use-app-theme';
import { ReportReason, createReport } from '@/services/report';
import { ThemedText } from '@/components/ThemedText';
import { useToken } from '@/context/token-context';

type ReportModalProps = {
  visible: boolean;
  onClose: () => void;
  planId?: number;
  touristPlaceId?: number;
  reportedUserId?: number;
};

const REPORT_REASONS: { value: ReportReason; labelKey: string }[] = [
  { value: 'INAPPROPRIATE_CONTENT', labelKey: 'report_reason_inappropriate' },
  { value: 'FALSE_DATA', labelKey: 'report_reason_false_data' },
  { value: 'SPAM', labelKey: 'report_reason_spam' },
  { value: 'HARASSMENT', labelKey: 'report_reason_harassment' },
  { value: 'COPYRIGHT_INFRINGEMENT', labelKey: 'report_reason_copyright' },
  { value: 'OTHER', labelKey: 'report_reason_other' },
];

export function ReportModal({
  visible,
  onClose,
  planId,
  touristPlaceId,
  reportedUserId,
}: ReportModalProps) {
  const { tint, tintText, surface, border, text } = useAppTheme();
  const { getAccessToken } = useToken();
  const { t } = useTranslation();
  const [selectedReason, setSelectedReason] = useState<ReportReason | null>(null);
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selectedReason) return;

    try {
      setSubmitting(true);
      const token = getAccessToken();
      if (!token) {
        Alert.alert(t('error'), t('error_submit_report_login'));
        return;
      }
      await createReport({
        reason: selectedReason,
        description: description || undefined,
        planId,
        touristPlaceId,
        reportedUserId,
      }, token);
      Alert.alert('Success', 'Report submitted successfully.');
      onClose();
      setSelectedReason(null);
      setDescription('');
    } catch (error) {
      Alert.alert(t('error'), t('error_submit_report_failed'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    onClose();
    setSelectedReason(null);
    setDescription('');
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={[styles.overlay, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}>
        <View style={[styles.container, { backgroundColor: surface, borderColor: border }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: text }]}>{t('report_content')}</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            <Text style={[styles.label, { color: text }]}>{t('reason_reporting')}</Text>
            {REPORT_REASONS.map((reason) => (
              <TouchableOpacity
                key={reason.value}
                style={[
                  styles.reasonButton,
                  {
                    backgroundColor: selectedReason === reason.value ? tint : surface,
                    borderColor: border,
                  },
                ]}
                onPress={() => setSelectedReason(reason.value)}
              >
                <View style={styles.radioButton}>
                  {selectedReason === reason.value && (
                    <Ionicons name="checkmark-circle" size={20} color={tintText} />
                  )}
                  {selectedReason !== reason.value && (
                    <Ionicons name="ellipse-outline" size={20} color={text} />
                  )}
                </View>
                <Text
                  style={[
                    styles.reasonLabel,
                    { color: selectedReason === reason.value ? tintText : text },
                  ]}
                >
                  {t(reason.labelKey)}
                </Text>
              </TouchableOpacity>
            ))}

            <Text style={[styles.label, { color: text, marginTop: 16 }]}>
              {t('description_optional')}
            </Text>
            <TextInput
              style={[
                styles.textInput,
                { backgroundColor: surface, borderColor: border, color: text },
              ]}
              placeholder={t('add_more_details')}
              placeholderTextColor={text}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
            />
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton, { borderColor: border }]}
              onPress={handleClose}
              disabled={submitting}
            >
              <Text style={[styles.buttonText, { color: text }]}>{t('cancel')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.button,
                styles.submitButton,
                { backgroundColor: tint, opacity: !selectedReason || submitting ? 0.5 : 1 },
              ]}
              onPress={handleSubmit}
              disabled={!selectedReason || submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={[styles.buttonText, { color: tintText }]}>{t('submit_report')}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: 0,
  },
  container: {
    width: '100%',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderWidth: 1,
    borderBottomWidth: 0,
    height: '92%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 12,
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  reasonButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  radioButton: {
    marginRight: 12,
  },
  reasonLabel: {
    fontSize: 15,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    minHeight: 80,
    marginTop: 8,
  },
  footer: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    borderWidth: 1,
  },
  submitButton: {
    borderRadius: 8,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
