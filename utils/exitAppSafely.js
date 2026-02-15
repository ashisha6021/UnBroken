import { NativeModules, Platform } from 'react-native';

const { AlarmModule } = NativeModules;

/**
 * ✅ Safely exits alarm flow without killing app
 * - Closes AlarmActivity task
 * - Keeps user data hidden
 * - Works on lock screen
 */
export async function exitAlarmSafely() {
  if (Platform.OS !== 'android') return;

  try {
    console.log('[exitAlarmSafely] Calling native finishAlarmTask()');
    await AlarmModule.finishAlarmTask();
    console.log('[exitAlarmSafely] finishAlarmTask() completed');
  } catch (e) {
    console.warn('[exitAlarmSafely] Failed to finish alarm task', e);
  }
}
