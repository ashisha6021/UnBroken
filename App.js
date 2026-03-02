
import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, StatusBar } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { NativeModules } from "react-native";
import { AppState } from "react-native";
import RootStack from "./navigation/RootStack";
import {
  navigationRef,
  onNavigationReady,
  resetToAlarm,
} from "./navigation/navigationRef";
import AppToast from "./components/AppToast";
import { useToast } from "./store/useToast";

import { requestNotificationPermission } from "./utils/requestNotificationPermission";
import { useAppStore } from "./store/useAppStore";
import { initDatabase } from "./storage/database";
import PremiumAlertHost from "./components/PremiumAlertHost";

const { AlarmModule } = NativeModules;

export default function App() {
  const initializeApp = useAppStore((s) => s.initializeApp);
  const isLoading = useAppStore((s) => s.isLoading);

  const [isInitialized, setIsInitialized] = useState(false);
  const [alarmOverride, setAlarmOverride] = useState(false);
  const { message, visible } = useToast(); 



useEffect(() => {

  async function checkLaunchIntent() {


    const data = await AlarmModule.getLaunchIntentData();
    if (data?.alarmId) {
     resetToAlarm({ alarmId: data.alarmId });
    }
  }
   checkLaunchIntent();
  const sub = AppState.addEventListener("change", (state) => {
    if (state === "active") {
      checkLaunchIntent();
    }
  });

  return () => sub.remove();

}, []);

  useEffect(() => {
    if (!alarmOverride) {
      requestNotificationPermission();
    }
  }, [alarmOverride]);
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        
        await initDatabase();
        await initializeApp();
      } catch (e) {
        console.error("[App] Init failed", e);
      } finally {
        if (mounted) setIsInitialized(true);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);
  if ((!isInitialized || isLoading) && !alarmOverride) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <>
      <StatusBar barStyle="light-content" />
      <NavigationContainer ref={navigationRef} onReady={onNavigationReady}>
        <RootStack />
      </NavigationContainer>
      <PremiumAlertHost />
      <AppToast message={message} visible={visible} />
    </>
  );
}
