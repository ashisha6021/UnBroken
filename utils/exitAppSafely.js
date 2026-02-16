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
    console.log('=================================');
    console.log('[exitAlarmSafely] EXIT requested');
    console.log('[exitAlarmSafely] Calling native exitAppCompletely()...');
    console.log('=================================');

    await AlarmModule.exitAppCompletely();

    console.log('[exitAlarmSafely] App exited successfully');
  } catch (e) {
    console.warn(
      '[exitAlarmSafely] Failed to exit app completely',
      e
    );
  }
}
