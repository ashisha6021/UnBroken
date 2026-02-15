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
  cancelAlarm,scheduleAlarm,stopRinging, snoozeAlarm

} from '../../alarm1/alarmScheduler123';
import { exitAlarmSafely } from '../../utils/exitAppSafely';



export default function AlarmRingingScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const actionLockedRef = useRef(false);

  // -----------------------------
  // SAFE PARAM / REALM LOOKUP
  // -----------------------------
  const alarmId = route.params?.alarmId;
  console.log('[AlarmRingingScreen] mounted with route params:', route.params);

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
        const {
          taskId: tId,
          dayOfWeek: d,
          time: t,
          isCritical: crit,
        } = alarm;

        taskId = tId;
        dayOfWeek = d;
        time = t;
        isCritical = crit;

        alarmSettings = realm.objectForPrimaryKey(
          'alarm_settings',
          taskId
        );
      }
    }
  } catch (e) {
    console.error('[AlarmRingingScreen] Failed to access Realm', e);
  }

  if (!alarmId || !alarm) {
    console.warn('[AlarmRingingScreen] Missing alarm or alarmId', {
      alarmId,
      hasAlarm: !!alarm,
    });
  return (
    <View style={styles.container}>
      <Text style={styles.title}>⏰ Alarm Ringing...</Text>
      <Text style={styles.subtitle}>
        Loading alarm details...
      </Text>
    </View>
  );
}


  const requireBrainGame =
    isCritical || alarmSettings?.requireBrainGame === true;
  const snoozeMinutes =
  typeof alarmSettings?.snoozeMinutes === 'number' &&
  alarmSettings.snoozeMinutes > 0
    ? alarmSettings.snoozeMinutes
    : 5; // default

  /* -----------------------------
     BLOCK BACK BUTTON
  ----------------------------- */
  useEffect(() => {
    const sub = BackHandler.addEventListener(
      'hardwareBackPress',
      () => true // 🚫 block always
    );
    return () => sub.remove();
  }, []);

  /* -----------------------------
     STOP (NON-CRITICAL ONLY)
     - Stop current sound
     - Cancel current firing
     - Schedule next occurrence
     - Close AlarmActivity task
  ----------------------------- */
  const stopAlarm = useCallback(async () => {
    if (requireBrainGame) return;
    if (actionLockedRef.current) return;
    actionLockedRef.current = true;

    try {
      console.log('[AlarmRingingScreen.stopAlarm] pressed', {
        alarmId,
        taskId,
        dayOfWeek,
        time,
        isCritical,
        requireBrainGame,
      });
      await stopRinging();
      await cancelAlarm(alarmId);

      await scheduleAlarm({
        alarmId,
        taskId,
        dayOfWeek,
        time,
        isCritical,
      });
    } finally {
      console.log('[AlarmRingingScreen.stopAlarm] calling exitAlarmSafely()');
      exitAlarmSafely();
    }
  }, [alarmId, taskId, dayOfWeek, time, isCritical, requireBrainGame]);




  const onSnoozePress = useCallback(async () => {
    if (requireBrainGame || isCritical) return;
    if (actionLockedRef.current) return;
    actionLockedRef.current = true;

    try {
      console.log('[AlarmRingingScreen.onSnoozePress] pressed', {
        alarmId,
        snoozeMinutes,
        requireBrainGame,
        isCritical,
      });
      await snoozeAlarm({
        alarmId,
        snoozeMinutes,
      });
    } finally {
      console.log('[AlarmRingingScreen.onSnoozePress] calling exitAlarmSafely()');
      exitAlarmSafely();
    }
  }, [alarmId, snoozeMinutes, isCritical, requireBrainGame]);


  /* -----------------------------
     START BRAIN GAME
  ----------------------------- */
  const startBrainGame = useCallback(() => {
    navigation.replace('BrainGameHub', {
  taskId,
  alarmId,
});
  }, []);

  /* -----------------------------
     UI
  ----------------------------- */
  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        ⏰ ALARM
      </Text>

      <Text style={styles.subtitle}>
        Task ID: {taskId}
      </Text>

      {requireBrainGame && (
        <Text style={styles.warning}>
          🧠 Brain Game Required
        </Text>
      )}

      {/* ------------------
          BRAIN GAME
      ------------------ */}
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

      {/* ------------------
          STOP (ONLY IF ALLOWED)
      ------------------ */}
      {!requireBrainGame && (
        <TouchableOpacity
          style={styles.stopButton}
          onPress={stopAlarm}
        >
          <Text style={styles.stopText}>
            STOP ALARM
          </Text>
        </TouchableOpacity>
      )}

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
