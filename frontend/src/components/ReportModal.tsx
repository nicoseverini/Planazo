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
import { useAppTheme } from '@/hooks/use-app-theme';
import { ReportReason, createReport } from '@/services/report';
import { ThemedText } from '@/components/ThemedText';
import { useToken } from '@/context/token-context';

type ReportModalProps = {
  visible: boolean;
  onClose: () => void;
  planId?: number;
  turisticPlaceId?: number;
  reportedUserId?: number;
};

const REPORT_REASONS: { value: ReportReason; label: string }[] = [
  { value: 'INAPPROPRIATE_CONTENT', label: 'Inappropriate content' },
  { value: 'FALSE_DATA', label: 'False data' },
  { value: 'SPAM', label: 'Spam' },
  { value: 'HARASSMENT', label: 'Harassment' },
  { value: 'COPYRIGHT_INFRINGEMENT', label: 'Copyright infringement' },
  { value: 'OTHER', label: 'Other' },
];

export function ReportModal({
  visible,
  onClose,
  planId,
  turisticPlaceId,
  reportedUserId,
}: ReportModalProps) {
  const { tint, tintText, surface, border, text } = useAppTheme();
  const { getAccessToken } = useToken();
  const [selectedReason, setSelectedReason] = useState<ReportReason | null>(null);
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selectedReason) return;

    try {
      setSubmitting(true);
      const token = getAccessToken();
      if (!token) {
        Alert.alert('Error', 'You must be logged in to submit a report.');
        return;
      }
      await createReport({
        reason: selectedReason,
        description: description || undefined,
        planId,
        turisticPlaceId,
        reportedUserId,
      }, token);
      Alert.alert('Success', 'Report submitted successfully.');
      onClose();
      setSelectedReason(null);
      setDescription('');
    } catch (error) {
      console.error('Error submitting report:', error);
      Alert.alert('Error', 'Failed to submit report. Please try again.');
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
            <Text style={[styles.title, { color: text }]}>Report Content</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            <Text style={[styles.label, { color: text }]}>Reason for reporting:</Text>
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
                  {reason.label}
                </Text>
              </TouchableOpacity>
            ))}

            <Text style={[styles.label, { color: text, marginTop: 16 }]}>
              Description (optional):
            </Text>
            <TextInput
              style={[
                styles.textInput,
                { backgroundColor: surface, borderColor: border, color: text },
              ]}
              placeholder="Add more details..."
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
              <Text style={[styles.buttonText, { color: text }]}>Cancel</Text>
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
                <Text style={[styles.buttonText, { color: tintText }]}>Submit Report</Text>
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
