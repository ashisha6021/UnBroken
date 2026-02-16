import { NativeModules, Platform } from 'react-native';

const { AlarmModule } = NativeModules;

/* ============================================================
   ✅ MODULE CHECK
============================================================ */
if (!AlarmModule && Platform.OS === 'android') {
  console.error(
    '❌ AlarmModule not linked. Did you rebuild the app after adding native code?'
  );
}

/* ============================================================
   ✅ HELPERS
============================================================ */

const DAY_TO_INDEX = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};

/* --------------------------------------------------
   GET NEXT TRIGGER TIME
-------------------------------------------------- */
function getNextTriggerMillis(dayOfWeek, time) {
  const [hour, minute] = time.split(':').map(Number);

  const now = new Date();
  const target = new Date();

  target.setHours(hour, minute, 0, 0);

  const today = target.getDay();
  let diff = (dayOfWeek - today + 7) % 7;

  // same day but already passed → next week
  if (diff === 0 && target <= now) diff = 7;

  target.setDate(target.getDate() + diff);

  console.log('======================================');
  console.log('[alarmScheduler] getNextTriggerMillis()');
  console.log('dayOfWeek=', dayOfWeek);
  console.log('time=', time);
  console.log('nextTrigger=', target.toString());
  console.log('======================================');

  return target.getTime();
}

/* ============================================================
   1️⃣ SCHEDULE SINGLE ALARM (NATIVE)
============================================================ */
export async function scheduleAlarm({
  alarmId,
  taskId,
  dayOfWeek,
  time,
  isCritical,
}) {
  if (Platform.OS !== 'android') return;

  console.log('======================================');
  console.log('⏰ [alarmScheduler] scheduleAlarm() CALLED');
  console.log('alarmId=', alarmId);
  console.log('taskId=', taskId);
  console.log('dayOfWeek=', dayOfWeek);
  console.log('time=', time);
  console.log('isCritical=', isCritical);
  console.log('======================================');

  const dayIndex =
    typeof dayOfWeek === 'string'
      ? DAY_TO_INDEX[dayOfWeek.toLowerCase()]
      : dayOfWeek;

  if (typeof dayIndex !== 'number') {
    console.error('❌ Invalid dayOfWeek:', dayOfWeek);
    return;
  }

  const triggerAt = getNextTriggerMillis(dayIndex, time);

  console.log('✅ Calling Native AlarmModule.schedule()');
  console.log('triggerAt=', new Date(triggerAt).toString());

  try {
    await AlarmModule.schedule(alarmId, triggerAt, isCritical);

    console.log('✅ Alarm scheduled SUCCESSFULLY');
  } catch (e) {
    console.error('❌ Alarm schedule FAILED', e);
  }

  console.log('======================================');
}

/* ============================================================
   2️⃣ CANCEL SINGLE ALARM (FOREVER)
   ❌ NO isCritical REQUIRED
============================================================ */
export async function cancelAlarm(alarmId) {
  if (Platform.OS !== 'android') return;

  console.log('======================================');
  console.log('🛑 [alarmScheduler] cancelAlarm() CALLED');
  console.log('alarmId=', alarmId);
  console.log('======================================');

  try {
    await AlarmModule.cancelScheduledAlarm(alarmId);

    console.log('✅ Alarm cancelled successfully');
  } catch (e) {
    console.warn('❌ Cancel alarm failed safely', e);
  }

  console.log('======================================');
}

/* ============================================================
   3️⃣ CHECK IF ALARM EXISTS (OS LEVEL)
   ❌ NO isCritical REQUIRED
============================================================ */
export async function isAlarmScheduled1(alarmId) {
  if (Platform.OS !== 'android') return false;

  console.log('======================================');
  console.log('🔍 [alarmScheduler] isAlarmScheduled() CHECK');
  console.log('alarmId=', alarmId);
  console.log('======================================');

  try {
    const exists = await AlarmModule.isAlarmScheduled(alarmId);

    console.log('✅ Alarm exists?', exists);
    return exists;
  } catch (e) {
    console.warn('❌ Alarm check failed', e);
    return false;
  }
}

/* ============================================================
   4️⃣ STOP CURRENT RINGING
============================================================ */
export async function stopRinging() {
  if (Platform.OS !== 'android') return;

  console.log('======================================');
  console.log('🔇 [alarmScheduler] stopRinging() CALLED');
  console.log('======================================');

  try {
    await AlarmModule.stopRinging();
    console.log('✅ Alarm sound stopped');
  } catch (e) {
    console.warn('❌ stopRinging failed safely', e);
  }

  console.log('======================================');
}

/* ============================================================
   5️⃣ SNOOZE ALARM (UPDATED)
   ✅ NEEDS isCritical
============================================================ */
export async function snoozeAlarm({
  alarmId,
  snoozeMinutes,
  isCritical,
}) {
  if (Platform.OS !== 'android') return;

  const snoozeAlarmId = `${alarmId}_SNOOZE`;

  const minutes =
    typeof snoozeMinutes === 'number' && snoozeMinutes > 0
      ? snoozeMinutes
      : 5;

  console.log('======================================');
  console.log('😴 [alarmScheduler] snoozeAlarm() CALLED');
  console.log('alarmId=', alarmId);
  console.log('snoozeMinutes=', minutes);
  console.log('isCritical=', isCritical);
  console.log('snoozeAlarmId=', snoozeAlarmId);
  console.log('======================================');

  try {
    console.log('➡ Cancelling old snooze if exists...');
    await AlarmModule.cancelScheduledAlarm(snoozeAlarmId);

    const triggerAt = Date.now() + minutes * 60 * 1000;

    console.log('➡ Scheduling snooze triggerAt=', new Date(triggerAt));

    await AlarmModule.scheduleSnooze(
      snoozeAlarmId,
      alarmId,
      triggerAt,
      isCritical
    );

    console.log('➡ Stopping current ringing...');
    await AlarmModule.stopRinging();

    console.log('✅ Snooze scheduled SUCCESSFULLY');

  } catch (e) {
    console.warn('❌ Snooze failed safely', e);
  }

  console.log('======================================');
}

/* ============================================================
   6️⃣ SCHEDULE ALL ALARMS FOR TASK
============================================================ */
export async function scheduleAlarmsForTask(taskId, alarms) {
  console.log('======================================');
  console.log('📌 scheduleAlarmsForTask() CALLED');
  console.log('taskId=', taskId);
  console.log('alarmsCount=', alarms.length);
  console.log('======================================');

  for (const alarm of alarms) {
    if (!alarm.enabled || !alarm.time) continue;

    await scheduleAlarm({
      alarmId: alarm.id,
      taskId,
      dayOfWeek: alarm.dayOfWeek,
      time: alarm.time,
      isCritical: alarm.isCritical,
    });
  }
}

/* ============================================================
   7️⃣ CANCEL ALL ALARMS FOR TASK
============================================================ */
export async function cancelAlarmsForTask(taskId, alarms) {
  console.log('======================================');
  console.log('🛑 cancelAlarmsForTask() CALLED');
  console.log('taskId=', taskId);
  console.log('alarmsCount=', alarms.length);
  console.log('======================================');

  for (const alarm of alarms) {
    await cancelAlarm(alarm.id);
  }
}

/* ============================================================
   8️⃣ DEBUG ALARM (10 SECONDS TEST)
============================================================ */
export async function scheduleDebugAlarm() {
  if (Platform.OS !== 'android') return;

  const triggerAt = Date.now() + 10_000;

  console.log('======================================');
  console.log('🧪 scheduleDebugAlarm() CALLED');
  console.log('Trigger in 10 seconds...');
  console.log('triggerAt=', new Date(triggerAt).toString());
  console.log('======================================');

  await AlarmModule.schedule(
    'debug-alarm',
    triggerAt,
    false
  );
}
