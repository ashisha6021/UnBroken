import React, { useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  BackHandler,
  TouchableOpacity,
} from 'react-native';

import { useNavigation, useRoute } from '@react-navigation/native';
import { getRealm } from '../../storage/database';
import { resolveAlarmDetails } from "../../utils/alarmResolver";
import { COLORS, SPACING, BORDER_RADIUS } from '../../constants/theme';
import {
  cancelAlarm,
  scheduleAlarm,
  stopRinging,
  snoozeAlarm,
} from '../../alarm1/alarmScheduler123';
import { getRandomQuote, getAlarmQuote } from '../../utils/quotes';
import { exitAlarmSafely } from '../../utils/exitAppSafely';

export default function AlarmRingingScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const actionLockedRef = useRef(false);
  const quoteRef = useRef(getAlarmQuote());
  /* ============================================================
     1️⃣ GET alarmId FROM ROUTE
  ============================================================ */
  const alarmId = route.params?.alarmId;
 /* ============================================================
     2️⃣ LOAD FULL ALARM DATA FROM REALM
     (DB is source of truth)
  ============================================================ */
  let alarm = null;
  let alarmSettings = null;

  let taskId;
  let dayOfWeek;
  let time;
  let isCritical;

  try {
    const realm = getRealm();

    if (alarmId) {
      alarm = realm.objectForPrimaryKey('task_alarms', alarmId);

      if (alarm) {
        taskId = alarm.taskId;
        dayOfWeek = alarm.dayOfWeek;
        time = alarm.time;
        isCritical = alarm.isCritical;

        alarmSettings = realm.objectForPrimaryKey(
          'alarm_settings',
          taskId
        );

        
      }
    }
  } catch (e) {
    console.error('❌ Realm lookup failed:', e);
  }

  /* ============================================================
     3️⃣ IF DATA NOT READY → LOADING UI
  ============================================================ */
  if (!alarmId || !alarm) {
    console.warn('⚠ Missing alarm data:', {
      alarmId,
      hasAlarm: !!alarm,
    });

    return (
      <View style={styles.container}>
        <Text style={styles.title}>⏰ Alarm Ringing...</Text>
        <Text style={styles.subtitle}>Loading alarm details...</Text>
      </View>
    );
  }
  const alarmDetails = resolveAlarmDetails(taskId);

  const taskName = alarmDetails?.taskName || "Task";
  const shortGoalName = alarmDetails?.shortGoalName || "";
  const longGoalName = alarmDetails?.longGoalName || "";
  /* ============================================================
     4️⃣ COMPUTED RULES
  ============================================================ */
  const requireBrainGame =
    isCritical || alarmSettings?.requireBrainGame === true;

  const snoozeMinutes =
    typeof alarmSettings?.snoozeMinutes === 'number' &&
    alarmSettings.snoozeMinutes > 0
      ? alarmSettings.snoozeMinutes
      : 5;

  /* ============================================================
     5️⃣ BLOCK BACK BUTTON ALWAYS
  ============================================================ */
  useEffect(() => {
    const sub = BackHandler.addEventListener(
      'hardwareBackPress',
      () => true
    );

    return () => sub.remove();
  }, []);

  /* ============================================================
     6️⃣ STOP ALARM (ONLY NON-CRITICAL)
     - Stop sound
     - Cancel alarm
     - Schedule next week
     - Exit AlarmActivity safely
  ============================================================ */
  
  const stopAlarm = useCallback(async () => {
   if (requireBrainGame) {
      console.warn('❌ Stop blocked → BrainGame required');
      return;
    }

    if (actionLockedRef.current) {
      console.warn('⚠ Action already locked');
      return;
    }

    actionLockedRef.current = true;

    try {
      
      await stopRinging();
      await cancelAlarm(alarmId);
      await scheduleAlarm({
        alarmId,
        dayOfWeek,
        time,
        isCritical,
      });
} catch (e) {
      console.error('❌ Stop alarm failed:', e);

    } finally {
      
      exitAlarmSafely();
    }
  }, [alarmId, dayOfWeek, time, isCritical, requireBrainGame]);

  /* ============================================================
     7️⃣ SNOOZE (ONLY NON-CRITICAL)
  ============================================================ */
  const onSnoozePress = useCallback(async () => {
    if (requireBrainGame || isCritical) {
      console.warn('❌ Snooze blocked → Critical alarm');
      return;
    }

    if (actionLockedRef.current) {
      console.warn('⚠ Action already locked');
      return;
    }

    actionLockedRef.current = true;

    try {
      await snoozeAlarm({
        alarmId,
        snoozeMinutes,
      });
     } catch (e) {
      console.error('❌ Snooze failed:', e);

    } finally {
      
      exitAlarmSafely();
    }
  }, [alarmId, snoozeMinutes, requireBrainGame, isCritical]);

  /* ============================================================
     8️⃣ START BRAIN GAME (Critical Only)
  ============================================================ */
  const startBrainGame = useCallback(() => {
     navigation.replace('BrainGameHub', {
      taskId,
      alarmId,
    });
  }, [navigation, taskId, alarmId]);

  /* ============================================================
     9️⃣ UI
  ============================================================ */

  
return (
  <View style={styles.container}>
   {/* ALARM ICON */}
<Text style={styles.alarmIcon}>⏰</Text>

{/* PREMIUM HEADER */}
<Text style={styles.header}>EXECUTION TIME</Text>

{/* MOTIVATION */}
<Text style={styles.motivation}>
  {quoteRef.current}
</Text>
    {/* TASK CARD */}
    <View style={styles.taskCard}>
      <Text style={styles.label}>TASK</Text>
      <Text style={styles.taskTitle}>{taskName}</Text>

      {shortGoalName ? (
        <>
          <Text style={styles.goalLabel}>SHORT GOAL</Text>
          <Text style={styles.goalText}>{shortGoalName}</Text>
        </>
      ) : null}

      {longGoalName ? (
        <>
          <Text style={styles.goalLabel}>LONG GOAL</Text>
          <Text style={styles.goalText}>{longGoalName}</Text>
        </>
      ) : null}
    </View>

    {/* BRAIN GAME WARNING */}
    {requireBrainGame && (
      <View style={styles.warningCard}>
        <Text style={styles.warningText}>
          Brain game required to stop this alarm.
        </Text>
      </View>
    )}

    {/* ACTION BUTTONS */}
    <View style={styles.actionArea}>

      {requireBrainGame && (
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={startBrainGame}
        >
          <Text style={styles.primaryButtonText}>
            START BRAIN GAME
          </Text>
        </TouchableOpacity>
      )}

      {!isCritical && (
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={onSnoozePress}
        >
          <Text style={styles.secondaryButtonText}>
            SNOOZE {snoozeMinutes} MIN
          </Text>
        </TouchableOpacity>
      )}

      {!requireBrainGame && (
        <TouchableOpacity
          style={styles.stopButton}
          onPress={stopAlarm}
        >
          <Text style={styles.stopButtonText}>
            STOP ALARM
          </Text>
        </TouchableOpacity>
      )}

    </View>

    {isCritical && (
      <Text style={styles.criticalNote}>
        Critical alarm cannot be stopped directly.
      </Text>
    )}

  </View>
);
}

/* ================================
   STYLES
================================ */
const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SPACING.xl,
    justifyContent: "center",
  },
 alarmIcon: {
  fontSize: 64,
  textAlign: "center",
  marginBottom: SPACING.md,
},
header: {
  fontSize: 30,
  fontWeight: "900",
  color: COLORS.accent,
  textAlign: "center",
  letterSpacing: 3,
  textTransform: "uppercase",
  marginBottom: 6,
},
motivation: {
  textAlign: "center",
  color: COLORS.textSecondary,
  fontSize: 15,
  fontWeight: "700",
  letterSpacing: 0.5,
  marginBottom: SPACING.xl,
  paddingHorizontal: SPACING.md,
  lineHeight: 22,
},

  taskCard: {
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    // alignItems:"center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",

    shadowColor: "#000",
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,

    marginBottom: SPACING.xl,
  },

  label: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.textMuted,
    letterSpacing: 1,
  },

  taskTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: COLORS.textPrimary,
    marginTop: 6,
    marginBottom: SPACING.md,
  },

  goalLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.textMuted,
    letterSpacing: 0.5,
    marginTop: SPACING.sm,
    marginBottom:SPACING.sm
  },

  goalText: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.textSecondary,
    marginTop: 2,
  },

  warningCard: {
    backgroundColor: "rgba(255,180,0,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,180,0,0.25)",
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },

  warningText: {
    color: "#ffcc00",
    fontWeight: "700",
    textAlign: "center",
  },

  actionArea: {
    gap: SPACING.md,
  },

  primaryButton: {
    // backgroundColor: COLORS.accent,
    backgroundColor:COLORS.warning,
    paddingVertical: 18,
    borderRadius: BORDER_RADIUS.full,

    alignItems: "center",

    // shadowColor: COLORS.accent,
    shadowColor:COLORS.warning,
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 10,
  },

  primaryButtonText: {
    fontSize: 14,
    fontWeight: "900",
    color: COLORS.background,
    letterSpacing: 1,
  },

  secondaryButton: {
    backgroundColor: COLORS.accent,
    paddingVertical: 18,
    borderRadius: BORDER_RADIUS.full,

    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",

    alignItems: "center",
  },

  secondaryButtonText: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },

  stopButton: {
    backgroundColor: "#ff4d4d",
    paddingVertical: 18,
    borderRadius: BORDER_RADIUS.full,

    alignItems: "center",

    shadowColor: "#ff0000",
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },

  stopButtonText: {
    fontSize: 14,
    fontWeight: "900",
    color: "#fff",
    letterSpacing: 1,
  },

  criticalNote: {
    textAlign: "center",
    marginTop: SPACING.lg,
    color: "#ff6b6b",
    fontSize: 13,
    fontWeight: "600",
  },

});