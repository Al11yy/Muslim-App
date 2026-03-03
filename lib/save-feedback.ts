import { Alert, Platform, ToastAndroid } from 'react-native';

type SaveFeedbackOptions = {
  saved: boolean;
  label: string;
  entity?: string;
};

export function showSaveFeedback({ saved, label, entity }: SaveFeedbackOptions) {
  const title = entity ? `${entity} Disimpan` : 'Tersimpan';
  const message = saved ? `${label} berhasil disimpan.` : `${label} dihapus dari tersimpan.`;

  if (Platform.OS === 'android') {
    ToastAndroid.show(message, ToastAndroid.SHORT);
    return;
  }

  Alert.alert(title, message);
}
