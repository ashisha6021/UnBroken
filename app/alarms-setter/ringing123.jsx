import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  BackHandler,
} from 'react-native';
import { useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';

import { COLORS, SPACING, TYPOGRAPHY } from '../../constants/theme';
import { DAY_NAMES } from '../../types';
import { rescheduleNextAlarm1 , isAlarmScheduled1} from '../../alarm1/alarmScheduler123';
import { showAlarmToast1 } from '../../utils/alarmToast1';

export default function AlarmRingingScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();

  /* --------------------
     PARSE PARAMS (ALL STRINGS!)
  -------------------- */

  const alarmId = params.alarmId;
  const taskId = params.taskId;
  const dayOfWeek = params.dayOfWeek;
  const time = params.time;

  const isCritical = params.isCritical === 'true';
  const requireBrainGame = params.requireBrainGame === 'true';
  const snoozeDuration = Number(params.snoozeDuration ?? 300);

  /* --------------------
     BLOCK BACK BUTTON
  -------------------- */

  useEffect(() => {
    const sub = BackHandler.addEventListener(
      'hardwareBackPress',
      () => true
    );
    return () => sub.remove();
  }, []);

  /* --------------------
     HELPERS
  -------------------- */

  const stopCurrentAlarm = async () => {
    // Stops sound + clears notification
    await Notifications.dismissAllNotificationsAsync();
  };

  /* --------------------
     ACTIONS
  -------------------- */

  // 🔁 NON-CRITICAL ONLY
  const onSnooze = async () => {
    if (isCritical) return;

    await stopCurrentAlarm();

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '⏰ Snoozed Alarm',
        body: 'Time to get back to work',
        sound: 'default',
        data: {
          alarmId,
          taskId,
          dayOfWeek,
          time,
          isCritical: false,
          requireBrainGame,
          snoozeDuration,
        },
      },
      trigger: {
        seconds: snoozeDuration,
      },
    });

    showAlarmToast1(`😴 Snoozed for ${snoozeDuration / 60} minutes`);
    router.back();
  };

  // 🛑 NON-CRITICAL STOP → RESCHEDULE WEEKLY
  const onStop = async () => {
    if (isCritical) return;

    await stopCurrentAlarm();

    await rescheduleNextAlarm1({
      alarmId,
      taskId,
      dayOfWeek,
      time,
      isCritical,
      snoozeDuration,
      requireBrainGame,
    });
    const exists = await isAlarmScheduled1(alarmId);
    if (exists) {
      showAlarmToast1(`🔁 Next alarm: ${DAY_NAMES[dayOfWeek]} at ${time}`);
    } else {
      showAlarmToast1('❌ Alarm cannot be rescheduled.');
    }
   router.back();
  };

  // 🧠 CRITICAL / BRAIN GAME REQUIRED
  const onBrainGame = async () => {
    await stopCurrentAlarm();

    router.push({
      pathname: '/brain-games/start',
      params: {
        alarmId,
        taskId,
        dayOfWeek,
        time,
        isCritical: 'true',
        requireBrainGame: 'true',
        snoozeDuration: String(snoozeDuration),
      },
    });
  };

  /* --------------------
     UI
  -------------------- */

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {isCritical ? '⚠️ CRITICAL ALARM' : '⏰ Alarm'}
      </Text>

      <Text style={styles.task}>
        Time to work on your task
      </Text>

      {/* 🧠 CRITICAL OR BRAIN GAME REQUIRED */}
      {(isCritical || requireBrainGame) && (
        <>
          <Text style={styles.warning}>
            Solve the brain game to stop this alarm
          </Text>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={onBrainGame}
          >
            <Text style={styles.primaryText}>
              START BRAIN GAME
            </Text>
          </TouchableOpacity>
        </>
      )}

      {/* 🔔 NON-CRITICAL CONTROLS */}
      {!isCritical && (
        <>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={onSnooze}
          >
            <Text style={styles.secondaryText}>
              SNOOZE
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.stopButton}
            onPress={onStop}
          >
            <Text style={styles.stopText}>
              STOP
            </Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

/* --------------------
   STYLES
-------------------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  title: {
    ...TYPOGRAPHY.h1,
    color: COLORS.accent,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  task: {
    color: COLORS.textPrimary,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  warning: {
    color: COLORS.error,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  primaryButton: {
    backgroundColor: COLORS.accent,
    padding: SPACING.md,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  primaryText: {
    color: COLORS.background,
    fontWeight: '700',
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: COLORS.accent,
    padding: SPACING.md,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  secondaryText: {
    color: COLORS.accent,
    fontWeight: '600',
  },
  stopButton: {
    padding: SPACING.md,
  },
  stopText: {
    color: COLORS.textMuted,
  },
});
