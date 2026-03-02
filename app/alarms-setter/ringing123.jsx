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

import {
  cancelAlarm,
  scheduleAlarm,
  stopRinging,
  snoozeAlarm,
} from '../../alarm1/alarmScheduler123';

import { exitAlarmSafely } from '../../utils/exitAppSafely';

export default function AlarmRingingScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const actionLockedRef = useRef(false);

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
      <Text style={styles.title}>⏰ ALARM</Text>

      <Text style={styles.subtitle}>
        Task ID: {taskId}
      </Text>

      {requireBrainGame && (
        <Text style={styles.warning}>
          🧠 Brain Game Required
        </Text>
      )}

      {/* Brain Game Button */}
      {requireBrainGame && (
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={startBrainGame}
        >
          <Text style={styles.primaryText}>
            START BRAIN GAME
          </Text>
        </TouchableOpacity>
      )}

      {/* Snooze */}
      {!isCritical && (
        <TouchableOpacity
          style={[
            styles.stopButton,
            { backgroundColor: '#f5a623', marginVertical: 16 },
          ]}
          onPress={onSnoozePress}
        >
          <Text style={styles.stopText}>SNOOZE</Text>
        </TouchableOpacity>
      )}

      {/* Stop */}
      {!requireBrainGame && (
        <TouchableOpacity
          style={styles.stopButton}
          onPress={stopAlarm}
        >
          <Text style={styles.stopText}>STOP ALARM</Text>
        </TouchableOpacity>
      )}

      {/* Critical Note */}
      {isCritical && (
        <Text style={styles.criticalNote}>
          🔒 Critical alarm cannot be stopped directly
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
    backgroundColor: '#0b0b0b',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },

  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ff3b30',
    marginBottom: 16,
  },

  subtitle: {
    fontSize: 14,
    color: '#aaa',
    marginBottom: 20,
  },

  warning: {
    fontSize: 18,
    color: '#ffd60a',
    marginBottom: 20,
    textAlign: 'center',
  },

  primaryButton: {
    width: '100%',
    padding: 18,
    backgroundColor: '#ffd60a',
    borderRadius: 10,
    marginBottom: 16,
  },

  primaryText: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },

  stopButton: {
    width: '100%',
    padding: 18,
    backgroundColor: '#2ecc71',
    borderRadius: 10,
  },

  stopText: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },

  criticalNote: {
    marginTop: 24,
    fontSize: 14,
    color: '#ff453a',
    textAlign: 'center',
  },
});
