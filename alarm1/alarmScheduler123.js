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
   const dayIndex =
    typeof dayOfWeek === 'string'
      ? DAY_TO_INDEX[dayOfWeek.toLowerCase()]
      : dayOfWeek;

  if (typeof dayIndex !== 'number') {
    console.error('❌ Invalid dayOfWeek:', dayOfWeek);
    return;
  }

  const triggerAt = getNextTriggerMillis(dayIndex, time);
  try {
    await AlarmModule.schedule(alarmId, triggerAt, isCritical);

    
  } catch (e) {
    console.error('❌ Alarm schedule FAILED', e);
  }

  
}

/* ============================================================
   2️⃣ CANCEL SINGLE ALARM (FOREVER)
   ❌ NO isCritical REQUIRED
============================================================ */
export async function cancelAlarm(alarmId) {
  if (Platform.OS !== 'android') return;


  try {
    await AlarmModule.cancelScheduledAlarm(alarmId);
 } catch (e) {
    console.warn('❌ Cancel alarm failed safely', e);
  }
}

/* ============================================================
   3️⃣ CHECK IF ALARM EXISTS (OS LEVEL)
   ❌ NO isCritical REQUIRED
============================================================ */
export async function isAlarmScheduled1(alarmId) {
  if (Platform.OS !== 'android') return false;
  try {
    const exists = await AlarmModule.isAlarmScheduled(alarmId);
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
  try {
    await AlarmModule.stopRinging();
   } catch (e) {
    console.warn('❌ stopRinging failed safely', e);
  }

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
  try {
    
    await AlarmModule.cancelScheduledAlarm(snoozeAlarmId);

    const triggerAt = Date.now() + minutes * 60 * 1000;
    await AlarmModule.scheduleSnooze(
      snoozeAlarmId,
      alarmId,
      triggerAt,
      isCritical
    );
    await AlarmModule.stopRinging();
} catch (e) {
    console.warn('❌ Snooze failed safely', e);
  }

}

/* ============================================================
   6️⃣ SCHEDULE ALL ALARMS FOR TASK
============================================================ */
export async function scheduleAlarmsForTask(taskId, alarms) {
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
  for (const alarm of alarms) {
    await cancelAlarm(alarm.id);
  }
}

/* ============================================================
   9️⃣ CANCEL ALL OS ALARMS BY TASK ID
   🔥 IMPORTANT FOR TASK DELETE
============================================================ */
export async function cancelAllAlarmsByTaskId(taskId, alarms = []) {
  if (Platform.OS !== 'android') return;
  try {
    for (const alarm of alarms) {

      if (!alarm?.id) continue;

      

      // cancel main alarm
      await AlarmModule.cancelScheduledAlarm(alarm.id);

      // cancel snooze alarm also
      const snoozeId = `${alarm.id}_SNOOZE`;
      await AlarmModule.cancelScheduledAlarm(snoozeId);

     
    }
  } catch (e) {
    console.warn('❌ cancelAllAlarmsByTaskId failed safely', e);
  }

  
}

/* ============================================================
   8️⃣ DEBUG ALARM (10 SECONDS TEST)
============================================================ */
export async function scheduleDebugAlarm() {
  if (Platform.OS !== 'android') return;

  const triggerAt = Date.now() + 10_000;


  await AlarmModule.schedule(
    'debug-alarm',
    triggerAt,
    false
  );
}
