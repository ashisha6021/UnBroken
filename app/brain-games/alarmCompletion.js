import {
  stopRinging,
  cancelAlarm,
  scheduleAlarm,
} from '../../alarm1/alarmScheduler123';

import { getRealm } from '../../storage/database';

export async function completeAlarm({ alarmId }) {
  const realm = getRealm();

  const alarm = realm.objectForPrimaryKey('task_alarms', alarmId);

  if (!alarm) {
    console.warn('[completeAlarm] Alarm not found:', alarmId);

    // Still stop sound (never leave ringing forever)
    await stopRinging();
    await cancelAlarm(alarmId);
    return;
  }

  // ✅ Extract primitives immediately
  const taskId = alarm.taskId;
  const dayOfWeek = alarm.dayOfWeek;
  const time = alarm.time;
  const isCritical = alarm.isCritical;

  console.log('[completeAlarm] Completing alarm:', {
    alarmId,
    taskId,
    dayOfWeek,
    time,
    isCritical,
  });

  // ✅ Stop sound
  await stopRinging();

  // ✅ Cancel current firing
  await cancelAlarm(alarmId);

  // ✅ Schedule next occurrence
  await scheduleAlarm({
    alarmId,
    taskId,
    dayOfWeek,
    time,
    isCritical,
  });
}
