import { NativeModules, Platform } from 'react-native';

const { AlarmModule } = NativeModules;

if (!AlarmModule && Platform.OS === 'android') {
  console.error(
    '❌ AlarmModule not linked. Did you rebuild the app after adding native code?'
  );
}

/* --------------------------------------------------
   HELPERS
-------------------------------------------------- */

const DAY_TO_INDEX = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};

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

/* --------------------------------------------------
   SCHEDULE SINGLE ALARM (NATIVE)
-------------------------------------------------- */
export async function scheduleAlarm({
  alarmId,
  taskId,          // kept for compatibility (DB usage)
  dayOfWeek,       // number OR string
  time,            // "HH:mm"
  isCritical,
  ringtoneUri = null, // null → system default
}) {
  if (Platform.OS !== 'android') return;

  const dayIndex =
    typeof dayOfWeek === 'string'
      ? DAY_TO_INDEX[dayOfWeek.toLowerCase()]
      : dayOfWeek;

  if (typeof dayIndex !== 'number') {
    console.error('[alarmScheduler] Invalid dayOfWeek:', dayOfWeek);
    return;
  }

  const triggerAt = getNextTriggerMillis(dayIndex, time);

  console.log('[alarmScheduler] scheduleAlarm()', {
    alarmId,
    taskId,
    dayOfWeek,
    resolvedDayIndex: dayIndex,
    time,
    isCritical,
    triggerAt: new Date(triggerAt).toString(),
  });
  


  AlarmModule.schedule(
    alarmId,
    triggerAt
  );
}

/* --------------------------------------------------
   CANCEL SINGLE ALARM (FOREVER)
-------------------------------------------------- */
export async function cancelAlarm(alarmId) {
  if (Platform.OS !== 'android') return;

  try {
    console.log('[alarmScheduler] cancelAlarm()', { alarmId });
    await AlarmModule.cancelScheduledAlarm(alarmId);
  } catch (e) {
    console.warn('[alarmScheduler] Cancel alarm failed safely', e);
  }
}


/* --------------------------------------------------
   CHECK IF ALARM EXISTS (REAL OS CHECK)
-------------------------------------------------- */
export async function isAlarmScheduled1(alarmId) {
  if (Platform.OS !== 'android') return false;
  console.log('[alarmScheduler] isAlarmScheduled1() check for', alarmId);
  return AlarmModule.isAlarmScheduled(alarmId);
}

/* --------------------------------------------------
   STOP CURRENT RING + RESCHEDULE NEXT WEEK
-------------------------------------------------- */
export async function rescheduleNextAlarm1({
  alarmId,
  dayOfWeek,
  time,
  isCritical,
  ringtoneUri = null,
}) {
  if (Platform.OS !== 'android') return;

  const dayIndex =
    typeof dayOfWeek === 'string'
      ? DAY_TO_INDEX[dayOfWeek.toLowerCase()]
      : dayOfWeek;

  const [hour, minute] = time.split(':').map(Number);

  console.log('🔁 Rescheduling alarm for next week');

  AlarmModule.stopAndReschedule(
    alarmId,
    dayIndex,
    hour,
    minute,
    isCritical,
    ringtoneUri
  );
}

/* --------------------------------------------------
   SCHEDULE ALL ALARMS FOR A TASK
-------------------------------------------------- */
export async function scheduleAlarmsForTask(
  taskId,
  alarms,
  alarmSettings
) {
  for (const alarm of alarms) {
    if (!alarm.enabled || !alarm.time) continue;

    await scheduleAlarm({
      alarmId: alarm.id,
      taskId,
      dayOfWeek: alarm.dayOfWeek,
      time: alarm.time,
      isCritical: alarm.isCritical,
      ringtoneUri: alarmSettings?.ringtoneUri ?? null,
    });
  }
}

/* --------------------------------------------------
   CANCEL ALL ALARMS FOR A TASK
   (USE DB → call cancelAlarm per id)
-------------------------------------------------- */
export async function cancelAlarmsForTask(taskId, alarms) {
  for (const alarm of alarms) {
    await cancelAlarm(alarm.id);
  }
}


export async function stopRinging() {
  if (Platform.OS !== 'android') return;
  console.log('[alarmScheduler] stopRinging() called');
  await AlarmModule.stopRinging();
}


export async function snoozeAlarm({
  alarmId,
  snoozeMinutes,
}) {
  if (Platform.OS !== 'android') return;

  const snoozeAlarmId = `${alarmId}_SNOOZE`;

  // ✅ Default to 5 minutes if not provided or invalid
  const minutes =
    typeof snoozeMinutes === 'number' && snoozeMinutes > 0
      ? snoozeMinutes
      : 5;

  try {
    console.log('[alarmScheduler] snoozeAlarm()', {
      alarmId,
      snoozeMinutes,
      minutes,
      snoozeAlarmId,
    });
    
    await AlarmModule.cancelScheduledAlarm(snoozeAlarmId);
    const triggerAt = Date.now() + minutes * 60 * 1000;

    await AlarmModule.scheduleSnooze(snoozeAlarmId,alarmId,triggerAt);
   await AlarmModule.stopRinging();
    console.log(
      '⏰ Snooze scheduled at',
      new Date(triggerAt).toLocaleTimeString()
    );
  } catch (e) {
    console.warn('❌ Snooze failed safely', e);
  }
}


export async function scheduleDebugAlarm() {
  if (Platform.OS !== 'android') return;

  const triggerAt = Date.now() + 10_000; // 10 seconds

  console.log('🧪 Scheduling debug alarm in 10 seconds');
  console.log(AlarmModule)
  // AlarmModule.schedule(
  //   'debug-alarm',
  //   triggerAt,
  //   true,
  //   null
  // );
}
