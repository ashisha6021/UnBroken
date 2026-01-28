import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, AppState, StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';

import { isAppExiting ,resetAppExit } from './app/brain-games/alarmExitState';
import { resetExitGuard } from './app/brain-games/exitAppSafely';

import { getAlarmLaunchData } from './utils/getalarmLaunchdata123';
import RootStack from './navigation/RootStack';
import {
  navigationRef,
  resetToAlarm,
  onNavigationReady,
} from './navigation/navigationRef';

import { requestNotificationPermission } from './utils/requestNotificationPermission';
import { useAppStore } from './store/useAppStore';
import { COLORS } from './constants/theme';
import { initDatabase } from './storage/database';


export default function App() {
  // ✅ ALL HOOKS AT TOP LEVEL
  const initializeApp = useAppStore(s => s.initializeApp);
  const isLoading = useAppStore(s => s.isLoading);

  const [checkedAlarm, setCheckedAlarm] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [initialRoute, setInitialRoute] = useState(null);
  const [initialAlarmData, setInitialAlarmData] = useState(null);

  // ✅ RESET EXIT STATE ON EVERY APP LAUNCH
  useEffect(() => {
    console.log('🔁 [App.js] Resetting exit state on app launch');
    resetAppExit();
    resetExitGuard();
  }, []);

  /* 🚨 Cold start alarm check */
  useEffect(() => {
    (async () => {
      const alarmData = await getAlarmLaunchData();

      console.log('🚨 [App.js] COLD START alarmData:', alarmData);

      if (alarmData?.isAlarmLaunch && global.__ALARM_ACTIVE__)  {
        setInitialAlarmData({ alarmId: alarmData.alarmId });
        setInitialRoute('Alarm Ringing');
      } else {
        setInitialRoute('Home');
      }

      setCheckedAlarm(true);
    })();
  }, []);

  /* 🔄 Resume check */
  useEffect(() => {
    const sub = AppState.addEventListener('change', async state => {
      if (state !== 'active') return;

      if (isAppExiting()) {
        console.log('🛑 [App.js] Ignoring resume — app is exiting');
        return;
      }

      const alarmData = await getAlarmLaunchData();
      console.log('🔄 [App.js] RESUME alarmData:', alarmData);

      if (!alarmData?.isAlarmLaunch) return;

      const current = navigationRef.getCurrentRoute()?.name;
      if (current === 'Alarm Ringing') return;

      resetToAlarm({ alarmId: alarmData.alarmId });
    });

    return () => sub.remove();
  }, []);

  /* 🔔 Permissions */
  useEffect(() => {
    requestNotificationPermission();
  }, []);

  /* 🚀 Init */
  useEffect(() => {
    (async () => {
      await initDatabase();
      await initializeApp();
      setIsInitialized(true);
    })();
  }, []);

  /* 🚫 BLOCK RENDER UNTIL ALARM CHECK */
  if (!checkedAlarm) return null;

  /* 🚫 BLOCK WHILE EXITING */
  if (isAppExiting()) {
    console.log('🛑 [App.js] BLOCKED render because exiting');
    return null;
  }

  /* ⏳ Loader */
  if (!initialRoute || !isInitialized || isLoading) {
    return (
      <View style={{
        flex: 1,
        backgroundColor: COLORS.background,
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <ActivityIndicator size="large" color={COLORS.accent} />
      </View>
    );
  }

  /* 🧭 Navigation */
  return (
    <>
      <StatusBar barStyle="light-content" />
      <NavigationContainer
        ref={navigationRef}
        onReady={onNavigationReady}
      >
        <RootStack
          initialRoute={initialRoute}
          initialAlarmData={initialAlarmData}
        />
      </NavigationContainer>
    </>
  );
}

