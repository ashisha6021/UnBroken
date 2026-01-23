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
import { useLocalSearchParams, useRouter } from 'expo-router';
import {dbUpdateAlarmCritical} from '../../storage/new123';
import { useAppStore } from '../../store/useAppStore';
import {
   dbGetTaskAlarmsByTask ,
   dbAddTaskAlarm,
   dbUpdateTaskAlarm,
   getAlarmSettingsByTask
   
} from '../../storage/storage-sqlite';

import { DAY_NAMES } from '../../types';
import { COLORS, SPACING, TYPOGRAPHY } from '../../constants/theme';
import { is } from 'date-fns/locale';
import {
  scheduleAlarm,
  cancelAlarm,isAlarmScheduled1
} from '../../alarm1/alarmScheduler123';
import { showAlarmToast1 } from '../../utils/alarmToast1';



export default function AlarmScreen() {
  // --------------------
  // ROUTE PARAMS
  // --------------------
  const params = useLocalSearchParams();
  const taskId = params?.taskId;
  const router = useRouter();

  console.log('[AlarmScreen] params:', params);

  // --------------------
  // STORE (SAFE SELECTORS)
  // --------------------
  const taskAlarms = useAppStore((s) => s.taskAlarms);
  const setTaskAlarms = useAppStore((s) => s.setTaskAlarms);
  const addAlarmToStore = useAppStore((s) => s.addTaskAlarm);
  const updateAlarmInStore = useAppStore((s) => s.updateTaskAlarm);

  const task = useAppStore((s) =>
    s.tasks.find((t) => t.id === taskId)
  );

  // --------------------
  // LOCAL STATE (ALWAYS DECLARED)
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
  }, [taskId]);

  const loadAlarms = async () => {
    try {
      const data = await dbGetTaskAlarmsByTask(taskId);
      const normalized = data.map(a => ({
      ...a,
      enabled: Boolean(a.enabled),
      isCritical: Boolean(a.isCritical),
    })); 

      setTaskAlarms(taskId, normalized);
    } catch (err) {
      console.error('[AlarmScreen] Failed to load alarms:', err);
    }
  };
 useEffect(() => {
  if (!taskId) return;

  loadAlarms();

  (async () => {
    const settings = await getAlarmSettingsByTask(taskId);
    setAlarmSettingsLocal(settings);
  })();
}, [taskId]);

  // --------------------
  // SAFE EARLY RETURNS (AFTER HOOKS)
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
  // GROUP DAY SELECTION
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
      const updated = {
  ...existing,
  time,
  };
       console.log('Updating alarm for day', day, updated);
        updateAlarmInStore(taskId, updated);
        await dbUpdateTaskAlarm(updated);
     
        
        if (existing.enabled) {
        await cancelAlarm(existing.id);
        const stillExists = await isAlarmScheduled1(updated.id);
        console.log(
  stillExists
    ? '❌ Alarm cancel FAILED'
    : '✅ Alarm successfully canceled'
);

        await scheduleAlarm({
          alarmId: updated.id,
          taskId,
          dayOfWeek: updated.dayOfWeek,
          time: updated.time,
          isCritical: updated.isCritical,
          snoozeDuration:
            alarmSettings?.snoozeDuration ?? 300,
          requireBrainGame:
            updated.isCritical ||
            alarmSettings?.requireBrainGame,
        });
         const exists = await isAlarmScheduled1(updated.id);
        if (exists) {
  showAlarmToast1(`⏰ Alarm updated for ${DAY_NAMES[day]} at ${updated.time}`);
} else {
  showAlarmToast1('❌ Alarm NOT Updated');
}

console.log(
  exists
    ? '✅ Alarm successfully scheduled'
    : '❌ Alarm NOT scheduled'
);
      }



      } else {
        const newAlarm = {
          id: `${taskId}-${day}`,
          taskId,
          dayOfWeek: day,
          time,
          enabled: false,
          isCritical: false, // ← hard-reset
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
    const updated = {
      ...existing,
      time,
    };

    // 1️⃣ Persist DB
    await dbUpdateTaskAlarm(updated);

    // 2️⃣ Update store
    updateAlarmInStore(taskId, updated);

    // 3️⃣ Reschedule system alarm if enabled
    if (updated.enabled) {
      await cancelAlarm(updated.id);
      const stillExists = await isAlarmScheduled1(updated.id);
        console.log(
  stillExists
    ? '❌ Alarm cancel FAILED'
    : '✅ Alarm successfully canceled'
);

      await scheduleAlarm({
        alarmId: updated.id,
        taskId,
        dayOfWeek: updated.dayOfWeek,
        time: updated.time,
        isCritical: updated.isCritical,
        snoozeDuration:
          alarmSettings?.snoozeDuration ?? 300,
        requireBrainGame:
          updated.isCritical ||
          alarmSettings?.requireBrainGame,
      });
      const exists = await isAlarmScheduled1(updated.id);
     if (exists) {
  showAlarmToast1(`⏰ Alarm updated for ${DAY_NAMES[day]} at ${updated.time}`);
} else {
  showAlarmToast1('❌ Alarm NOT Updated');
}

console.log(
  exists
    ? '✅ Alarm successfully scheduled'
    : '❌ Alarm NOT scheduled'
);
    }
  } else {
    const newAlarm = {
      id: `${taskId}-${day}`,
      taskId,
      dayOfWeek: day,
      time,
      enabled: false,      // ⛔ not enabled by default
      isCritical: false,
      createdAt: new Date().toISOString(),
    };

    await dbAddTaskAlarm(newAlarm);
    addAlarmToStore(taskId, newAlarm);
  }
};


// const setAlarmType = async (alarm, isCritical) => {
//   if (!alarm) return;

//   const updated = {
//     ...alarm,
//     isCritical: Boolean(isCritical),
//   };

//   // 1️⃣ Update store immediately
//   updateAlarmInStore(taskId, updated);
//   if (!alarm?.id) {
//   console.warn('[setAlarmType] Missing alarm id, skipping DB update');
//   return;
// }

//   // 2️⃣ Persist only critical flag in DB
//   await dbUpdateAlarmCritical(alarm.id, isCritical);

//   // 3️⃣ Reschedule system alarm if enabled
//   if (updated.enabled) {
//     await cancelAlarm(updated.id);
    
// const stillExists = await isAlarmScheduled1(updated.id);

// console.log(
//   stillExists
//     ? '❌ Alarm cancel FAILED'
//     : '✅ Alarm successfully canceled'
// );

//     await scheduleAlarm({
//       alarmId: updated.id,
//       taskId,
//       dayOfWeek: updated.dayOfWeek,
//       time: updated.time,
//       isCritical,
//       snoozeDuration:
//         alarmSettings?.snoozeDuration ?? 300,
//       requireBrainGame: true, // 🔥 ALWAYS enforced for critical
//     });
//     const exists = await isAlarmScheduled1(updated.id);
//     {exists?  showAlarmToast1( `⚠️ Critical alarm enabled (${DAY_NAMES[updated.dayOfWeek]})`) :  showAlarmToast1('❌ Critical alarm not enabled.')}
// console.log(
//   exists
//     ? '✅ Alarm successfully scheduled'
//     : '❌ Alarm NOT scheduled'
// );
//   }
// };
const setAlarmType = async (alarm, isCritical) => {
  if (!alarm?.id) {
    console.warn('[setAlarmType] Invalid alarm');
    return;
  }

  const updated = {
    ...alarm,
    isCritical: Boolean(isCritical),
  };

  // 1️⃣ Update store immediately (UI instant feedback)
  updateAlarmInStore(taskId, updated);

  // 2️⃣ Persist only critical flag
  await dbUpdateAlarmCritical(alarm.id, isCritical);

  // 3️⃣ Sync system alarm if enabled
  if (updated.enabled) {
    await cancelAlarm(updated.id);

    const cancelled = !(await isAlarmScheduled1(updated.id));

    console.log(
      cancelled
        ? '✅ Alarm successfully canceled'
        : '❌ Alarm cancel FAILED'
    );

    await scheduleAlarm({
      alarmId: updated.id,
      taskId,
      dayOfWeek: updated.dayOfWeek,
      time: updated.time,
      isCritical,
      snoozeDuration:
        alarmSettings?.snoozeDuration ?? 300,
      requireBrainGame: true, // 🔥 ALWAYS enforced
    });

    const exists = await isAlarmScheduled1(updated.id);

    if (exists) {
      showAlarmToast1(
        isCritical
          ? `⚠️ Critical alarm enabled (${DAY_NAMES[updated.dayOfWeek]})`
          : `✅ Critical alarm disabled (${DAY_NAMES[updated.dayOfWeek]})`
      );
    } else {
      showAlarmToast1('❌ Failed to update critical alarm');
    }

    console.log(
      exists
        ? '✅ Alarm successfully scheduled'
        : '❌ Alarm NOT scheduled'
    );
  } else {
    // Alarm disabled → only toast for critical OFF
    if (!isCritical) {
      showAlarmToast1(
        `ℹ️ Alarm is disabled (${DAY_NAMES[updated.dayOfWeek]})`
      );
    }
  }
};


const confirmCritical = (alarm) => {
  if (!alarm?.time) {
    Alert.alert(
      'Set time first ⏰',
      'Please set a time before making this alarm critical.'
    );
    return;
  }

  if (!alarm.enabled) {
    Alert.alert(
      'Enable alarm 🔔',
      'Please enable the alarm before making it critical.'
    );
    return;
  }

  Alert.alert(
    'Critical Alarm ⚠️',
    'This alarm will:\n\n• Ring continuously\n• Ignore silent mode (Android)\n• Require a brain game to stop\n\nUse only for important tasks.',
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Make Critical',
        style: 'destructive',
        onPress: () => setAlarmType(alarm, true),
      },
    ]
  );
};


  // --------------------
  // TOGGLE ENABLE
  // --------------------
const toggleEnabled = async (day) => {
  const alarm = getAlarmForDay(day);
  if (!alarm?.id || !alarm?.time) {
  Alert.alert(
    'Set time first',
    'Please select a time before enabling the alarm.'
  );
  return;
}
  const nextEnabled = !alarm.enabled;
  const wasCritical = alarm.isCritical;

  const updated = {
    ...alarm,
    enabled: nextEnabled,
    isCritical: nextEnabled ? wasCritical : false,
  };

  // 1️⃣ Update UI immediately
  updateAlarmInStore(taskId, updated);
  if (!updated?.id) {
  console.warn('[DB] Skipping update, invalid alarm:', updated);
  return;
}
  // 2️⃣ Persist DB
  await dbUpdateTaskAlarm(updated);

  // 3️⃣ SYSTEM ALARM SYNC 🔔
  if (nextEnabled) {
    await scheduleAlarm({
      alarmId: updated.id,
      taskId,
      dayOfWeek: updated.dayOfWeek,
      time: updated.time,
      isCritical: updated.isCritical,
      snoozeDuration:
        alarmSettings?.snoozeDuration ?? 300,
      requireBrainGame:
        updated.isCritical ||
        alarmSettings?.requireBrainGame,
    });
    
const exists = await isAlarmScheduled1(updated.id);
if (exists) {
  showAlarmToast1(`🔔 Alarm set for ${DAY_NAMES[day]} at ${updated.time}`);
} else {
  showAlarmToast1('❌ Alarm NOT scheduled');
}

console.log(exists? '✅ Alarm successfully scheduled': '❌ Alarm NOT scheduled');
  } 
  else {
    
    await cancelAlarm(updated.id);
    const stillExists = await isAlarmScheduled1(updated.id);
    if (stillExists) {
  showAlarmToast1('❌ Alarm cancel FAILED');
} else {
  showAlarmToast1(`⛔ Alarm cancelled for ${DAY_NAMES[day]}`);
}


console.log(
  stillExists
    ? '❌ Alarm cancel FAILED'
    : '✅ Alarm successfully canceled'
);
  }

  // 4️⃣ If disabling critical → persist critical OFF
  if (!nextEnabled && wasCritical) {
    dbUpdateAlarmCritical(alarm.id, false);
  }
};






  // --------------------
  // UI
  // --------------------
  return (
    <View style={styles.largecontainer}>
    <ScrollView style={styles.container}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
  <Text style={styles.title}>Alarm for Task</Text>
 <View style={styles.settingbutton}>
    <TouchableOpacity
    onPress={() =>
      router.push({
        pathname: '/alarms-setter/alarmsetting1',
        params: { taskId },
      })
    }
  >
    <Text style={{ color: COLORS.accent, fontWeight: '600' }}>
      Alarm Settings
    </Text>
  </TouchableOpacity>
 </View>

</View>
      <View style={styles.nameContainer}>
      <Text style={styles.taskName}>{task.name}</Text>
      </View>
     
      {/* GROUP TIME */}
      <Text style={styles.sectionTitle}>
        Apply same time to selected days
      </Text>

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
        style={[
          styles.applyButton,
          selectedDays.length === 0 && { opacity: 0.5 },
        ]}
        disabled={selectedDays.length === 0}
        onPress={() => setGroupPickerOpen(true)}
      >
        <Text style={styles.applyText}>SET TIME FOR SELECTED DAYS</Text>
      </TouchableOpacity>

      {/* PER DAY */}
      <Text style={styles.sectionTitle}>Per day alarms</Text>

      {task.daysOfWeek.map((day) => {
        const alarm = getAlarmForDay(day);
        const isCriticalDisabled = !alarm?.time || !alarm?.enabled;
        console.log('Rendering day', day, { isCriticalDisabled }); 
        return (
          <View key={day} style={styles.row}>
            <Text style={styles.dayLabel}>{DAY_NAMES[day]}</Text>
             
             <TouchableOpacity
              disabled={isCriticalDisabled}
              style={[
                styles.criticalButton,
                alarm?.isCritical && styles.criticalActive,
                isCriticalDisabled && { opacity: 0.4 },
              ]}
              onPress={() =>
                alarm?.isCritical
                  ? setAlarmType(alarm, false)
                  : confirmCritical(alarm)
              }
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
        onPress={() => router.back()}
      >
        <Text style={styles.doneText}>DONE</Text>
      </TouchableOpacity>
      </View>
  );
}

// --------------------
// STYLES
// --------------------
const styles = StyleSheet.create({
  largecontainer:{
    flex: 1,
    marginBottom:SPACING.sm,
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
    marginTop: SPACING.sm,
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
