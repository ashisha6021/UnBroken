import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Switch,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation, useRoute } from '@react-navigation/native';

import ExactAlarmPermissionModal from '../../components/AlarmPermissionModal';
import { requestExactAlarmPermission, canScheduleExactAlarms } from '../../utils/alarmPermission';


import { dbUpdateAlarmCritical } from '../../storage/new123';
import { useAppStore } from '../../store/useAppStore';
import {
  dbGetTaskAlarmsByTask,
  dbAddTaskAlarm,
  dbUpdateTaskAlarm,
  getAlarmSettingsByTask,
} from '../../storage/storage-sqlite';

import { DAY_NAMES } from '../../types';
import { COLORS, SPACING, TYPOGRAPHY } from '../../constants/theme';

import {
  scheduleAlarm,
  cancelAlarm,
  isAlarmScheduled1,
} from '../../alarm1/alarmScheduler123';

import { showAlarmToast1 } from '../../utils/alarmToast1';
import { exists } from 'realm';



export default function AlarmScreen() {
  // --------------------
  // ROUTING (NATIVE)
  // --------------------
  const navigation = useNavigation();
  const route = useRoute();
  const taskId = route.params?.taskId;

  // --------------------
  // STORE
  // --------------------
  const taskAlarms = useAppStore((s) => s.taskAlarms);
  const setTaskAlarms = useAppStore((s) => s.setTaskAlarms);
  const addAlarmToStore = useAppStore((s) => s.addTaskAlarm);
  const updateAlarmInStore = useAppStore((s) => s.updateTaskAlarm);

  const [showAlarmPermission, setShowAlarmPermission] = useState(false);
  const [pendingAlarmAction, setPendingAlarmAction] = useState(null);


  const task = useAppStore((s) =>
    s.tasks.find((t) => t.id === taskId)
  );

  // --------------------
  // LOCAL STATE
  // --------------------
  const [singlePickerDay, setSinglePickerDay] = useState(null);
  const [groupPickerOpen, setGroupPickerOpen] = useState(false);
  const [selectedDays, setSelectedDays] = useState([]);
  const [alarmSettings, setAlarmSettingsLocal] = useState(null);

  // --------------------
  // LOAD ALARMS
  // --------------------
  useEffect(() => {
    if (!taskId) return;
    loadAlarms();

    (async () => {
      const settings = await getAlarmSettingsByTask(taskId);
      setAlarmSettingsLocal(settings);
    })();
  }, [taskId]);
   
  const ensurePermissionOrQueue = async (action) => {
  const granted = await requestExactAlarmPermission();
  if (!granted) {
    setPendingAlarmAction(() => action);
    setShowAlarmPermission(true);
    return false;
  }
  return true;
};






  const loadAlarms = async () => {
    const data = await dbGetTaskAlarmsByTask(taskId);
    const normalized = data.map((a) => ({
      ...a,
      enabled: Boolean(a.enabled),
      isCritical: Boolean(a.isCritical),
    }));
    setTaskAlarms(taskId, normalized);
  };

  // --------------------
  // SAFETY
  // --------------------
  if (!taskId) {
    return (
      <View style={styles.center}>
        <Text style={styles.muted}>Invalid task</Text>
      </View>
    );
  }

  if (!task) {
    return (
      <View style={styles.center}>
        <Text style={styles.muted}>Loading task...</Text>
      </View>
    );
  }

  const alarms = taskAlarms?.[taskId] ?? [];
  const getAlarmForDay = (day) =>
    alarms.find((a) => a.dayOfWeek === day);

  // --------------------
  // GROUP TIME
  // --------------------
  const toggleSelectDay = (day) => {
    setSelectedDays((prev) =>
      prev.includes(day)
        ? prev.filter((d) => d !== day)
        : [...prev, day]
    );
  };

  const applyGroupTime = async (_, date) => {
    setGroupPickerOpen(false);
    if (!date || selectedDays.length === 0) return;

    const time = date.toTimeString().slice(0, 5);

    for (const day of selectedDays) {
      const existing = getAlarmForDay(day);

      if (existing) {
        const updated = { ...existing, time };

        updateAlarmInStore(taskId, updated);
        await dbUpdateTaskAlarm(updated);

        if (existing.enabled) {
          await cancelAlarm(existing.id);
          await scheduleAlarm({
            alarmId: updated.id,
            taskId,
            dayOfWeek: updated.dayOfWeek,
            time: updated.time,
            isCritical: updated.isCritical,
            snoozeDuration: alarmSettings?.snoozeDuration ?? 300,
            requireBrainGame:
              updated.isCritical || alarmSettings?.requireBrainGame,
          });
            const isalarm = await isAlarmScheduled1(updated.id);

    showAlarmToast1(
    isalarm
      ? updated.isCritical
        ? `⚠️ Critical alarm updated for ${DAY_NAMES[updated.dayOfWeek]} at ${updated.time}`
        : `🔔 Alarm updated for ${DAY_NAMES[day]} at ${updated.time}`
      : `❌ Alarm NOT SET for ${DAY_NAMES[updated.dayOfWeek]} at ${updated.time}`
  );

        }
      } else {
        const newAlarm = {
          id: `${taskId}-${day}`,
          taskId,
          dayOfWeek: day,
          time,
          enabled: false,
          isCritical: false,
          createdAt: new Date().toISOString(),
        };

        await dbAddTaskAlarm(newAlarm);
        addAlarmToStore(taskId, newAlarm);
      }
    }

    setSelectedDays([]);
  };

  // --------------------
  // SINGLE DAY TIME
  // --------------------
const handleSingleTime = async (day, _, date) => {
  setSinglePickerDay(null);
  if (!date) return;

  const time = date.toTimeString().slice(0, 5);
  const existing = getAlarmForDay(day);

  if (existing) {
    const updated = { ...existing, time };

    await dbUpdateTaskAlarm(updated);
    updateAlarmInStore(taskId, updated);
    console.log("THIS ISS UPDATED DATA...",updated)
    // 🔔 ONLY reschedule if alarm is already enabled
    if (updated.enabled) {
      await cancelAlarm(updated.id);
      await scheduleAlarm({
        alarmId: updated.id,
        taskId,
        dayOfWeek: updated.dayOfWeek,
        time: updated.time,
        isCritical: updated.isCritical,
      });
      const isalarm = await isAlarmScheduled1(updated.id);

    showAlarmToast1(
    isalarm
      ? updated.isCritical
        ? `⚠️ Critical alarm updated for ${DAY_NAMES[updated.dayOfWeek]} at ${updated.time}`
        : `🔔 Alarm updated for ${DAY_NAMES[day]} at ${updated.time}`
      : `❌ Alarm NOT SET for ${DAY_NAMES[updated.dayOfWeek]} at ${updated.time}`
  );


    }
  } else {
    // ⛔ Just save time — DO NOT schedule
    const newAlarm = {
      id: `${taskId}-${day}`,
      taskId,
      dayOfWeek: day,
      time,
      enabled: false,
      isCritical: false,
      createdAt: new Date().toISOString(),
    };

    await dbAddTaskAlarm(newAlarm);
    addAlarmToStore(taskId, newAlarm);
  }
};


  // --------------------
  // CRITICAL MODE
  // --------------------
const setAlarmType = async (alarm, isCritical) => {
  const updated = { ...alarm, isCritical };

  // 1️⃣ Update local + DB
  updateAlarmInStore(taskId, updated);
  await dbUpdateAlarmCritical(alarm.id, isCritical);
 
  // 2️⃣ Only touch AlarmManager if alarm is enabled
  if (!updated.enabled) {
    showAlarmToast1(
      isCritical
        ? `⚠️ Critical mode set (alarm disabled)`
        : `✅ Critical mode disabled`
    );
    return;
  }

  // 3️⃣ Re-schedule alarm
  await cancelAlarm(updated.id);

  await scheduleAlarm({
    alarmId: updated.id,
    taskId,
    dayOfWeek: updated.dayOfWeek,
    time: updated.time,
    isCritical,
    snoozeDuration: alarmSettings?.snoozeDuration ?? 300,
    requireBrainGame: true,
  });
  
  // 4️⃣ Verify OS-level scheduling
  const isAlarmSet = await isAlarmScheduled1(updated.id);

  // 5️⃣ Single, correct toast
  showAlarmToast1(
    isAlarmSet
      ? isCritical
        ? `⚠️ Critical alarm enabled for ${DAY_NAMES[updated.dayOfWeek]} at ${updated.time}`
        : `✅ Critical alarm disabled for ${DAY_NAMES[updated.dayOfWeek]} but normal alarm will ring.`
      : `❌ Alarm NOT SET for ${DAY_NAMES[updated.dayOfWeek]} at ${updated.time}`
  );
};

const confirmCritical = (alarm) => {
  Alert.alert(
    'Critical Alarm ⚠️',
    'This alarm will ring continuously and require a brain game.',
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Make Critical',
        onPress: async () => {
          const allowed = await canScheduleExactAlarms();
          if (!allowed) {
            setPendingAlarmAction(() => () =>
              setAlarmType(alarm, true)
            );
            setShowAlarmPermission(true);
            return;
          }

          await setAlarmType(alarm, true);
        },
      },
    ]
  );
};





  // --------------------
  // TOGGLE ENABLE
  // --------------------
const toggleEnabled = async (day) => {
  const alarm = getAlarmForDay(day);
  if (!alarm?.time) {
    Alert.alert('Set time first');
    return;
  }

  // 🔐 Permission ONLY when turning ON
  if (!alarm.enabled) {
    const allowed = await canScheduleExactAlarms();
    if (!allowed) {
      setPendingAlarmAction(() => () => toggleEnabled(day));
      setShowAlarmPermission(true);
      return;
    }
  }

  const updated = {
    ...alarm,
    enabled: !alarm.enabled,
    isCritical: alarm.enabled ? false : alarm.isCritical,
  };

  updateAlarmInStore(taskId, updated);
  await dbUpdateTaskAlarm(updated);

  if (updated.enabled) {
    await scheduleAlarm({
      alarmId: updated.id,
      taskId,
      dayOfWeek: updated.dayOfWeek,
      time: updated.time,
      isCritical: updated.isCritical,
    });

    const isalarm = await isAlarmScheduled1(updated.id);
    showAlarmToast1(
      isalarm
        ? `🔔 Alarm set for ${DAY_NAMES[day]} at ${updated.time}`
        : `❌ Alarm NOT SET for ${DAY_NAMES[day]} at ${updated.time}`
    );
  } else {
    await cancelAlarm(updated.id);

    const isalarm = await isAlarmScheduled1(updated.id);
    console.log("THIS IS IS ALRM for canclel",isalarm)
    showAlarmToast1(
      !isalarm
        ? `⛔ Alarm canceled for ${DAY_NAMES[day]} at ${updated.time}`
        : `⚠️ Alarm could NOT be canceled`
    );
  }
};





  // --------------------
  // UI
  // --------------------
  return (
    <View style={styles.largecontainer}>
      <ScrollView style={styles.container}>
        <Text style={styles.title}>Alarm for Task</Text>

        <View style={styles.nameContainer}>
          <Text style={styles.taskName}>{task.name}</Text>
        </View>

        <Text style={styles.sectionTitle}>Apply same time</Text>

        <View style={styles.daySelector}>
          {task.daysOfWeek.map((day) => (
            <TouchableOpacity
              key={day}
              style={[
                styles.dayChip,
                selectedDays.includes(day) && styles.dayChipActive,
              ]}
              onPress={() => toggleSelectDay(day)}
            >
              <Text
                style={[
                  styles.dayChipText,
                  selectedDays.includes(day) &&
                    styles.dayChipTextActive,
                ]}
              >
                {DAY_NAMES[day].slice(0, 3)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={styles.applyButton}
          onPress={() => setGroupPickerOpen(true)}
        >
          <Text style={styles.applyText}>SET TIME FOR SELECTED DAYS</Text>
        </TouchableOpacity>
        
        <Text style={styles.sectionTitle}>Per day alarms</Text>
        {task.daysOfWeek.map((day) => {
          const alarm = getAlarmForDay(day);
          const isCriticalDisabled = !alarm?.time || !alarm?.enabled;
          return (
            <View key={day} style={styles.row}>
              <Text style={styles.dayLabel}>{DAY_NAMES[day]}</Text>

              <TouchableOpacity
                style={styles.timeBox}
                onPress={() => setSinglePickerDay(day)}
              >
                <Text style={styles.timeText}>
                  {alarm?.time || '--:--'}
                </Text>
              </TouchableOpacity>

              <Switch
                value={Boolean(alarm?.enabled)}
                onValueChange={() => toggleEnabled(day)}
              />

             <TouchableOpacity
                disabled={isCriticalDisabled}
                style={[
                  styles.criticalButton,
                  alarm?.isCritical && styles.criticalActive,
                  isCriticalDisabled && { opacity: 0.4 }
                ]}
                onPress={() => {
                  if (!alarm?.enabled) return;

                  alarm?.isCritical
                    ? setAlarmType(alarm, false)
                    : confirmCritical(alarm);
                }}
              >
                <Text
                  style={[
                    styles.criticalText,
                     alarm?.isCritical &&
                    styles.criticalTextActive,
                  ]}
                >
                  ⚠️CRITICAL
                </Text>
              </TouchableOpacity>

            </View>
          );
        })}

        {singlePickerDay !== null && (
          <DateTimePicker
            mode="time"
            value={new Date()}
            onChange={(e, d) =>
              handleSingleTime(singlePickerDay, e, d)
            }
          />
        )}

        {groupPickerOpen && (
          <DateTimePicker
            mode="time"
            value={new Date()}
            onChange={applyGroupTime}
          />
        )}
      </ScrollView>

      <TouchableOpacity
        style={styles.doneButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.doneText}>DONE</Text>
      </TouchableOpacity>


       <ExactAlarmPermissionModal
  visible={showAlarmPermission}
  onCancel={() => {
    setShowAlarmPermission(false);
    setPendingAlarmAction(null);
  }}
  onAllow={async () => {
    setShowAlarmPermission(false);
    await requestExactAlarmPermission();

    if (pendingAlarmAction) {
      await pendingAlarmAction();
      setPendingAlarmAction(null);
    }
  }}
/>


    </View>
  );
}

// --------------------
// STYLES
// --------------------
const styles = StyleSheet.create({
  largecontainer:{
    flex: 1,
    
    backgroundColor:COLORS.background
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SPACING.md,
    // marginBottom: SPACING.xs,
    paddingBottom: SPACING.xl,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  muted: {
    color: COLORS.textMuted,
  },
  title: {
    ...TYPOGRAPHY.h2,
    color: COLORS.textPrimary,
    // fon
  },
  taskName: {
    ...TYPOGRAPHY.name,
    color: COLORS.background,
  
    fontSize: SPACING.lg,
  },
  sectionTitle: {
    ...TYPOGRAPHY.label,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
    color: COLORS.textPrimary,
    fontWeight: '600',
    fontSize: SPACING.md,
  },
  daySelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  dayChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  dayChipActive: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  dayChipText: {
    color: COLORS.textPrimary,
  },
  dayChipTextActive: {
    color: COLORS.background,
  },
  applyButton: {
    marginTop: SPACING.md,
    padding: SPACING.md,
    backgroundColor: COLORS.accent,
    borderRadius: 8,
    alignItems: 'center',
  },
  applyText: {
    color: COLORS.background,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: SPACING.sm,
  },
  dayLabel: {
    flex: 1,
    color: COLORS.textPrimary,
  },
  timeBox: {
    padding: SPACING.sm,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: SPACING.sm,
  },
  timeText: {
    color: COLORS.textPrimary,
  },
  doneButton: {
    marginVertical  : SPACING.sm,
    marginHorizontal: SPACING.md,
    padding: SPACING.md,
    backgroundColor: COLORS.success,
    borderRadius: 8,
    alignItems: 'center',
  },
  doneText: {
    color: COLORS.background,
    fontWeight: '600',
  },
  nameContainer: { 
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  borderRadius: 8,
  padding: SPACING.sm,
  // marginBottom: SPACING.md,
marginTop: SPACING.md,
 alignItems: 'center',
},
criticalButton: {

  fontSize: 12,
  fontWeight: '600',
   marginRight: SPACING.md,
  borderColor: COLORS.textPrimary,
borderRadius: 6,
    borderWidth: 1,
    padding: SPACING.sm,
  },

criticalActive:{
  backgroundColor: COLORS.accent,
  fontSize: 12,
  fontWeight: '600',
   marginRight: SPACING.md,
  borderColor: COLORS.accent,
borderRadius: 6,
    borderWidth: 1,
    padding: SPACING.sm,
},

criticalText:{
  color: COLORS.textPrimary,
      fontWeight: '600',
},
criticalTextActive:{
  color: COLORS.background,
  fontWeight: '600',
},
settingbutton:{
  fontSize: 5,
  fontWeight: '600',
   marginRight: SPACING.xs,
  borderColor: COLORS.accent,
borderRadius: 6,
    borderWidth: 1,
    padding: SPACING.xs,
  // borderWidth: 1,
  // borderRadius: 8,
  //   padding: SPACING.sm,
  // borderColor: COLORS.accent,
}
  
});
