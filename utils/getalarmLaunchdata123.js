// utils/getAlarmLaunchData.js
import { NativeModules, Platform } from 'react-native';

const { AlarmModule } = NativeModules;
export async function getAlarmLaunchData() {
  if (Platform.OS !== 'android') return null;

  try {
   return await AlarmModule?.getLaunchIntentData?.();
  } catch {
    return null;
  }
}
