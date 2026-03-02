import { NativeModules, Platform } from 'react-native';

const { AlarmModule } = NativeModules;

/**
 * ✅ Fully exit app after alarm stop/snooze
 * - Closes entire app task
 * - Works in release APK
 * - Removes alarm screen completely
 */
export async function exitAlarmSafely() {
  if (Platform.OS !== 'android') return;

  try {
  await AlarmModule.exitAppCompletely();
  } catch (e) {
    console.warn(
      '[exitAlarmSafely] Failed to exit app completely',
      e
    );
  }
}
