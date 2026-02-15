import React, { useEffect, useState } from 'react';
import {
  View,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';

import RootStack from './navigation/RootStack';
import {
  navigationRef,
  onNavigationReady,
} from './navigation/navigationRef';

import { requestNotificationPermission } from './utils/requestNotificationPermission';
import { useAppStore } from './store/useAppStore';
import { COLORS } from './constants/theme';
import { initDatabase } from './storage/database';
import { useAlarmLaunch } from './utils/useAlarmLaunch';

export default function App() {

  const initializeApp = useAppStore(s => s.initializeApp);
  const isLoading = useAppStore(s => s.isLoading);

  const [isInitialized, setIsInitialized] = useState(false);

  // ✅ Alarm override state
  const [alarmOverride, setAlarmOverride] = useState(false);

  // ✅ Subscribe ONLY ONCE
  useAlarmLaunch(setAlarmOverride);

  useEffect(() => {
    requestNotificationPermission();
  }, []);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        console.log('[App] Initializing database…');
        await initDatabase();

        console.log('[App] Database initialized, calling initializeApp()');
        await initializeApp();

        console.log('[App] initializeApp() finished');
      } catch (e) {
        console.error('[App.js] Init failed', e);
      } finally {
        if (mounted) setIsInitialized(true);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  // ✅ Loader bypass if alarm launched
  if ((!isInitialized || isLoading) && !alarmOverride) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <>
      <StatusBar barStyle="light-content" />
      <NavigationContainer
        ref={navigationRef}
        onReady={onNavigationReady}
      >
        <RootStack />
      </NavigationContainer>
    </>
  );
}

