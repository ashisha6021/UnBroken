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
import { exitAppSafely } from '../brain-games/exitAppSafely';



export default function AlarmRingingScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const realm = getRealm();
  const navigatingRef = useRef(false);
  const {alarmId,} = route.params;
const alarm = realm.objectForPrimaryKey('task_alarms', alarmId);

useEffect(() => {
  global.__ALARM_ACTIVE__ = true;

  return () => {
    global.__ALARM_ACTIVE__ = false;
  };
}, []);

useEffect(() => {
  if (!alarm) {
   exitAppSafely();
  }
}, [alarm]);

if (!alarm) return null;

const {
  taskId,
  dayOfWeek,
  time,
  isCritical,
} = alarm;

const alarmSettings =
  realm.objectForPrimaryKey('alarm_settings', taskId);

 

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
  ----------------------------- */
const stopAlarm = useCallback(async () => {
  if (requireBrainGame) return;

  await stopRinging();

  // 1️⃣ Cancel current alarm
  await cancelAlarm(alarmId);

  // 2️⃣ Schedule next occurrence
  await scheduleAlarm({
    alarmId,
    taskId,
    dayOfWeek,
    time,
    isCritical,
  });

  // 3️⃣ EXIT APP SAFELY
  exitAppSafely();
}, [
  alarmId,
  taskId,
  dayOfWeek,
  time,
  isCritical,
  requireBrainGame,
]);



const onSnoozePress = useCallback(async () => {
  if (requireBrainGame || isCritical) return;

  console.log('😴 Snoozing for', snoozeMinutes, 'minutes');

  // 🔴 Stop + schedule snooze (already correct)
  await snoozeAlarm({
    alarmId,
    snoozeMinutes,
  });

  // 🔒 Prevent double taps
  if (navigatingRef.current) return;
  navigatingRef.current = true;

  // ⏳ IMPORTANT: delay navigation
 exitAppSafely(400);
}, [
  alarmId,
  snoozeMinutes,
  isCritical,
  requireBrainGame,
  navigation,
]);

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
