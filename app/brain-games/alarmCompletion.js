// alarmCompletion.js
import {
  stopRinging,
  cancelAlarm,
  scheduleAlarm,
} from '../../alarm1/alarmScheduler123';
import { getRealm } from '../../storage/database';

export async function completeAlarm({ alarmId }) {
  const realm = getRealm();
  const alarm = realm.objectForPrimaryKey('task_alarms', alarmId);

  if (!alarm) return;

  // ✅ extract primitives immediately (Realm safety)
  const taskId = alarm.taskId;
  const dayOfWeek = alarm.dayOfWeek;
  const time = alarm.time;
  const isCritical = alarm.isCritical;

  // 1️⃣ Stop sound first
  await stopRinging();

  // 2️⃣ Cancel current firing ONLY
  await cancelAlarm(alarmId);

  // 3️⃣ Schedule next occurrence (weekly / next valid day)
  await scheduleAlarm({
    alarmId,
    taskId,
    dayOfWeek,
    time,
    isCritical,
  });
}
