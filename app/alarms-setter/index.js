import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Switch,
  ScrollView,
  StyleSheet,
  Alert,AppState
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
import { COLORS, SPACING, TYPOGRAPHY ,BORDER_RADIUS} from '../../constants/theme';
import { usePremiumAlert } from '../../store/usePremiumAlert';
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
  const showAlert = usePremiumAlert((state) => state.showAlert);

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
  const showConfirm = usePremiumAlert((s) => s.showConfirm);
  const [showTimeConflictModal, setShowTimeConflictModal] = useState(false);

   const allTaskAlarms = useAppStore((s) => s.taskAlarms);

  useEffect(() => {
  const sub = AppState.addEventListener("change", async (state) => {
    if (state === "active" && pendingAlarmAction) {
      const allowed = await canScheduleExactAlarms();

      if (allowed) {
        const action = pendingAlarmAction;
        setPendingAlarmAction(null);
        action();
      }
    }
  });

  return () => sub.remove();
}, [pendingAlarmAction]);
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
 

const isGroupButtonEnabled = selectedDays.length > 0;
 
const isTimeConflict = (day, time, currentAlarmId) => {
  if (!time) return false;

  for (const taskIdKey in allTaskAlarms) {
    const alarms = allTaskAlarms[taskIdKey] || [];

    for (const alarm of alarms) {

      // skip self
      if (alarm.id === currentAlarmId) continue;

      // only check enabled alarms
      if (!alarm.enabled) continue;

      if (
        String(alarm.dayOfWeek) === String(day) &&
        alarm.time === time
      ) {
        return true;
      }
    }
  }

  return false;
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
  showConfirm(
    "Critical Alarm ⚠️",
    "This alarm will ring continuously and require a brain game to stop.",
    "Cancel",
    "Make Critical",
    "warning", // ✅ type comes here
    async () => {
      const allowed = await canScheduleExactAlarms();

      if (!allowed) {
        setPendingAlarmAction(() => () =>
          setAlarmType(alarm, true)
        );
        setShowAlarmPermission(true);
        return;
      }

      await setAlarmType(alarm, true);
    }
  );
};





  // --------------------
  // TOGGLE ENABLE
  // --------------------
const toggleEnabled = async (day) => {
  const alarm = getAlarmForDay(day);

  if (!alarm?.time) {
    showAlert("Task Required", "Set time first.", "OK", "error");
    return;
  }

  // ================================
  // 🚨 CHECK CONFLICT BEFORE ENABLE
  // ================================
if (!alarm.enabled) {

  const conflict = isTimeConflict(day, alarm.time, alarm.id);

  if (conflict) {
    showConfirm(
      "Time Slot Already Taken",
      "Another task already has an alarm at this time.\nPlease change the time.",
      "Cancel",
      "Change Time",
      "warning",
      () => setSinglePickerDay(day)
    );

    return; // 🚨 STOP HERE
  }

  const allowed = await canScheduleExactAlarms();
  if (!allowed) {
  if (!showAlarmPermission) {
    setPendingAlarmAction(() => () => toggleEnabled(day));
    setShowAlarmPermission(true);
  }
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
      <ScrollView
  style={styles.container}
  contentContainerStyle={{ paddingBottom: 20}}
>

        <Text style={styles.title}>ALARM FOR TASK</Text>

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
  activeOpacity={0.8}
  disabled={!isGroupButtonEnabled}
  style={[
    styles.applyButton,
    !isGroupButtonEnabled && styles.applyButtonDisabled,
  ]}
  onPress={() => setGroupPickerOpen(true)}
>
  <Text
    style={[
      styles.applyText,
      !isGroupButtonEnabled && styles.applyTextDisabled,
    ]}
  >
    SET TIME FOR SELECTED DAYS
  </Text>
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

              {/* 🔗 HELP LINK */}
<TouchableOpacity
  style={styles.helpLink}
  activeOpacity={0.7}
  onPress={() => navigation.navigate("Alarm Help")}
>
  <Text style={styles.helpLinkText}>
    Having trouble with alarms?{" "}
    <Text style={styles.helpLinkAccent}>Fix it here.</Text>
  </Text>
</TouchableOpacity>

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

   
  }}
/>


    </View>
  );
}

// --------------------
// STYLES
// --------------------
const styles = StyleSheet.create({
  /* ===========================
     SCREEN BASE
  ============================ */

  largecontainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  container: {
    flex: 1,
    padding: SPACING.lg,
    backgroundColor: COLORS.background,
  },

  /* ===========================
     HEADER
  ============================ */

  title: {
    fontSize: 30,
    fontWeight: "800",
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
    letterSpacing: -0.5,
  },

  /* ===========================
     TASK NAME (Premium Badge)
  ============================ */

  nameContainer: {
    alignSelf: "flex-start",
    backgroundColor: COLORS.surfaceElevated,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: BORDER_RADIUS.full,
    marginBottom: SPACING.lg,
  },

  taskName: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.accent,
  },

  /* ===========================
     SECTION LABELS
  ============================ */

  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.textMuted,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: SPACING.sm,
    // marginTop: SPACING.lg,
  },

  /* ===========================
     DAY CHIPS
  ============================ */

  daySelector: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },

  dayChip: {
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },

  dayChipActive: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },

  dayChipText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },

  dayChipTextActive: {
    color: COLORS.background,
    fontWeight: "800",
  },

  /* ===========================
     APPLY BUTTON (Premium CTA)
  ============================ */

  applyButton: {
    backgroundColor: COLORS.accent,
    paddingVertical: 14,
    borderRadius: BORDER_RADIUS.full,
    alignItems: "center",
    marginBottom: SPACING.lg,
  },

  applyText: {
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.background,
    letterSpacing: 0.8,
  },

  /* ===========================
     PER DAY ALARM ROW (Premium Card)
  ============================ */

  row: {
    flexDirection: "row",
    alignItems: "center",
    //  justifyContent: "space-between", // ✅ distributes space
  // flexWrap: "wrap",               // ✅ allows wrapping if needed
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: BORDER_RADIUS.xl,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: SPACING.sm,

    /* Premium depth */
    shadowColor: "#000",
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },

 dayLabel: {
  width: 80,            // ✅ Fixed width so it never shrinks
  fontSize: 14,
  fontWeight: "700",
  color: COLORS.textPrimary,
},


  /* ===========================
     TIME PILL (Accent Glow)
  ============================ */

  timeBox: {
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    marginRight: SPACING.xs,
  },

  timeText: {
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.accent,
  },

  /* ===========================
     CRITICAL BUTTON (Premium Outline)
  ============================ */

  criticalButton: {
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.warning,
    marginLeft: SPACING.sm,
    backgroundColor: "transparent",
  },

  criticalActive: {
    backgroundColor: COLORS.warning,
    borderColor: COLORS.warning,
  },

  criticalText: {
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.warning,
    letterSpacing: 0.5,
  },

  criticalTextActive: {
    color: COLORS.background,
  },

  /* ===========================
     DONE BUTTON (Floating Premium)
  ============================ */

  doneButton: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    paddingVertical: 16,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.accent,
    alignItems: "center",

    shadowColor: "#000",
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },

  doneText: {
    fontSize: 14,
    fontWeight: "900",
    color: COLORS.background,
    letterSpacing: 1,
  },

  /* ===========================
     EMPTY / CENTER STATES
  ============================ */

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  muted: {
    color: COLORS.textMuted,
    fontSize: 14,
  },
  applyButtonDisabled: {
  backgroundColor: COLORS.surfaceElevated, // premium dark surface
  borderWidth: 1,
  borderColor: COLORS.borderLight,
},

applyTextDisabled: {
  color: COLORS.textMuted,
  fontWeight: "700",
},
/* ===========================
   SMART HELP BANNER
=========================== */

helpBanner: {
  backgroundColor: "rgba(255,200,0,0.08)",
  borderWidth: 1,
  borderColor: "rgba(255,200,0,0.25)",
  padding: SPACING.md,
  borderRadius: BORDER_RADIUS.xl,
  marginBottom: SPACING.xl,
},

helpBannerTitle: {
  fontSize: 14,
  fontWeight: "900",
  color: COLORS.warning,
  marginBottom: 4,
},

helpBannerText: {
  fontSize: 13,
  fontWeight: "500",
  color: COLORS.textSecondary,
  lineHeight: 18,
},

/* ===========================
   HELP LINK (BOTTOM)
=========================== */

helpLink: {
  marginTop:SPACING.xs,
  paddingVertical: 12,
  alignItems: "center",
},

helpLinkText: {
  fontSize: 13,
  color: COLORS.textMuted,
  fontWeight: "600",
},

helpLinkAccent: {
  color: COLORS.accent,
  fontWeight: "800",
},

});

