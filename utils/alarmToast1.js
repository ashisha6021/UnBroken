import { Platform, ToastAndroid, Alert } from 'react-native';


export function showAlarmToast1(message) {
  if (Platform.OS === 'android') {
    ToastAndroid.show(message, ToastAndroid.SHORT);
  } else {
    Alert.alert('Alarm', message);
  }
}
