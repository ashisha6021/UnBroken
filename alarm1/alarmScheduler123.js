import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

/* --------------------------------------------------
   GLOBAL HANDLER
-------------------------------------------------- */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true, // 👈 heads-up banner
    shouldShowList: true,   // 👈 notification tray
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/* --------------------------------------------------
   ANDROID CHANNELS
-------------------------------------------------- */
export async function setupAlarmChannels1() {
  if (Platform.OS !== 'android') return;

  await Notifications.setNotificationChannelAsync('alarm-normal', {
    name: 'Normal Alarms',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250],
    bypassDnd: false,
    lockscreenVisibility:
      Notifications.AndroidNotificationVisibility.PUBLIC,
  });

  await Notifications.setNotificationChannelAsync('alarm-critical', {
    name: 'Critical Alarms',
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 500, 500, 500],
    bypassDnd: true,
    lockscreenVisibility:
      Notifications.AndroidNotificationVisibility.PUBLIC,
  });
}

/* --------------------------------------------------
   HELPERS
-------------------------------------------------- */
function getNextAlarmDate(dayOfWeek, time) {
  const [hour, minute] = time.split(':').map(Number);
  console.log(`Calculating next alarm date for day ${dayOfWeek} at ${time} (parsed as ${hour}:${minute})`);
  const now = new Date();
  const target = new Date();

  target.setHours(hour, minute, 0, 0);

  const today = target.getDay(); // 0–6
  let diff = (dayOfWeek - today + 7) % 7;

  // If same day but time already passed → next week
  if (diff === 0 && target <= now) {
    diff = 7;
  }

  target.setDate(target.getDate() + diff);
  return target;
}
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
   PERMISSIONS
-------------------------------------------------- */
export async function ensureAlarmPermissions() {
  const { status } =
    await Notifications.getPermissionsAsync();

  if (status !== 'granted') {
    const res = await Notifications.requestPermissionsAsync({
      android: {
        allowAlert: true,
        allowSound: true,
        allowBadge: false,
      },
    });
    return res.status === 'granted';
  }

  return true;
}

export async function isAlarmScheduled1(alarmId) {
  const scheduled =
    await Notifications.getAllScheduledNotificationsAsync();

  return scheduled.some(n => n.identifier === alarmId);
}
/* --------------------------------------------------
   SCHEDULE SINGLE ALARM (✅ FIXED)
-------------------------------------------------- */
export async function scheduleAlarm({
  alarmId,
  taskId,
  dayOfWeek,      // 0–6 (Sun–Sat)
  time,           // "HH:mm"
  isCritical,
  snoozeDuration,
  requireBrainGame,
}) {
  const hasPermission = await ensureAlarmPermissions();
  if (!hasPermission) return;
const dayIndex =
    typeof dayOfWeek === 'string'
      ? DAY_TO_INDEX[dayOfWeek.toLowerCase()]
      : dayOfWeek;

  if (typeof dayIndex !== 'number') {
    console.error('Invalid dayOfWeek:', dayOfWeek);
    return;
  }

  const triggerDate = getNextAlarmDate(dayIndex, time);

  console.log(
    `Scheduling alarm ${alarmId} on day ${dayIndex} at ${time}`,
    triggerDate
  );

  await Notifications.scheduleNotificationAsync({
    identifier: alarmId,
    content: {
      title: isCritical
        ? '⚠️ CRITICAL ALARM'
        : '⏰ Task Alarm',
      body: 'Time to work on your task',
      sound: 'default',
      data: {
        alarmId,
        taskId,
        dayOfWeek,
        time,
        isCritical,
        requireBrainGame,
        snoozeDuration,
      },
    },

    // ✅ DATE trigger (Android compatible)
   trigger: {
  type: Notifications.SchedulableTriggerInputTypes.DATE,
  date: triggerDate,
},

    android: {
      channelId: isCritical
        ? 'alarm-critical'
        : 'alarm-normal',
      sticky: isCritical,
      autoDismiss: !isCritical,
    },
  });
}

/* --------------------------------------------------
   SCHEDULE ALL ALARMS FOR A TASK
-------------------------------------------------- */
export async function scheduleAlarmsForTask(
  taskId,
  alarms,
  alarmSettings
) {
  await cancelAlarmsForTask(taskId);

  for (const alarm of alarms) {
    if (!alarm.enabled || !alarm.time) continue;

    await scheduleAlarm({
      alarmId: alarm.id,
      taskId,
      dayOfWeek: alarm.dayOfWeek,
      time: alarm.time,
      isCritical: alarm.isCritical,
      snoozeDuration: alarmSettings?.snoozeDuration ?? 300,
      requireBrainGame:
        alarm.isCritical || alarmSettings?.requireBrainGame,
    });
  }
}

/* --------------------------------------------------
   CANCEL
-------------------------------------------------- */
export async function cancelAlarm(alarmId) {
  await Notifications.cancelScheduledNotificationAsync(alarmId);
}

export async function cancelAlarmsForTask(taskId) {
  const scheduled =
    await Notifications.getAllScheduledNotificationsAsync();

  for (const n of scheduled) {
    if (n.content?.data?.taskId === taskId) {
      await Notifications.cancelScheduledNotificationAsync(
        n.identifier
      );
    }
  }
}


export async function rescheduleNextAlarm1(data) {
  const {
    alarmId,
    taskId,
    dayOfWeek,
    time,
    isCritical,
    snoozeDuration,
    requireBrainGame,
  } = data;

  console.log('🔁 Auto-rescheduling alarm for next week');

  // Safety cancel
  await cancelAlarm(alarmId);

  // Schedule next occurrence
  await scheduleAlarm({
    alarmId,
    taskId,
    dayOfWeek,
    time,
    isCritical,
    snoozeDuration,
    requireBrainGame,
  });
}
