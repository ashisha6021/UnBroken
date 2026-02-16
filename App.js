// import React, { useEffect, useState } from 'react';
// import {
//   View,
//   ActivityIndicator,
//   StatusBar,
// } from 'react-native';
// import { NavigationContainer } from '@react-navigation/native';

// import RootStack from './navigation/RootStack';
// import {
//   navigationRef,
//   onNavigationReady,
// } from './navigation/navigationRef';
// import { NativeModules } from 'react-native';
// import { resetToAlarm } from './navigation/navigationRef';



// import { requestNotificationPermission } from './utils/requestNotificationPermission';
// import { useAppStore } from './store/useAppStore';
// import { COLORS } from './constants/theme';
// import { initDatabase } from './storage/database';
// import { useAlarmLaunch } from './utils/useAlarmLaunch';

// const { AlarmModule } = NativeModules;

// export default function App() {

//   const initializeApp = useAppStore(s => s.initializeApp);
//   const isLoading = useAppStore(s => s.isLoading);

//   const [isInitialized, setIsInitialized] = useState(false);

//   // ✅ Alarm override state
//   const [alarmOverride, setAlarmOverride] = useState(false);

//   // ✅ Subscribe ONLY ONCE
  
//     useEffect(() => {
//     async function checkLaunchIntent() {
//       const data = await AlarmModule.getLaunchIntentData();
//       console.log("THIS IS GETLAUNCH INTENT DATA",data);
//       if (data?.alarmId) {
//   console.log("🔥 Alarm opened from notification:", data.alarmId);

//   setAlarmOverride(true);

//   setTimeout(() => {
//     resetToAlarm({ alarmId: data.alarmId });
//   }, 300);
// }

//     checkLaunchIntent();
//   }, []);

// useEffect(() => {

//   if (!alarmOverride) {
//     requestNotificationPermission();
//   }
// }, [alarmOverride]);

//   useEffect(() => {
//     let mounted = true;

//     (async () => {
//       try {
//         console.log('[App] Initializing database…');
//         await initDatabase();

//         console.log('[App] Database initialized, calling initializeApp()');
//         await initializeApp();

//         console.log('[App] initializeApp() finished');
//       } catch (e) {
//         console.error('[App.js] Init failed', e);
//       } finally {
//         if (mounted) setIsInitialized(true);
//       }
//     })();

//     return () => {
//       mounted = false;
//     };
//   }, []);

//   // ✅ Loader bypass if alarm launched
//   if ((!isInitialized || isLoading) && !alarmOverride) {
//     return (
//       <View
//         style={{
//           flex: 1,
//           justifyContent: 'center',
//           alignItems: 'center',
//         }}
//       >
//         <ActivityIndicator size="large" />
//       </View>
//     );
//   }

//   return (
//     <>
//       <StatusBar barStyle="light-content" />
//       <NavigationContainer
//         ref={navigationRef}
//         onReady={onNavigationReady}
//       >
//         <RootStack />
//       </NavigationContainer>
//     </>
//   );
// }

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

import { requestNotificationPermission } from "./utils/requestNotificationPermission";
import { useAppStore } from "./store/useAppStore";
import { initDatabase } from "./storage/database";

const { AlarmModule } = NativeModules;

export default function App() {
  const initializeApp = useAppStore((s) => s.initializeApp);
  const isLoading = useAppStore((s) => s.isLoading);

  const [isInitialized, setIsInitialized] = useState(false);
  const [alarmOverride, setAlarmOverride] = useState(false);



useEffect(() => {

  async function checkLaunchIntent() {

    console.log("=================================");
    console.log("🔥 checkLaunchIntent() CALLED");

    const data = await AlarmModule.getLaunchIntentData();

    console.log("LaunchIntentData =", data);
    console.log("=================================");

    if (data?.alarmId) {

      console.log("🚀 Alarm detected → Navigating");
      resetToAlarm({ alarmId: data.alarmId });
    }
  }

  // ✅ Cold Start
  checkLaunchIntent();

  // ✅ Notification Tap While App Running
  const sub = AppState.addEventListener("change", (state) => {

    console.log("🔥 AppState changed:", state);

    if (state === "active") {
      console.log("🔥 App became active → re-checking intent");
      checkLaunchIntent();
    }
  });

  return () => sub.remove();

}, []);



  // ✅ Ask permission only for normal launches
  useEffect(() => {
    if (!alarmOverride) {
      requestNotificationPermission();
    }
  }, [alarmOverride]);

  // ✅ App initialization
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        console.log("[App] Initializing database…");
        await initDatabase();

        console.log("[App] Database initialized, calling initializeApp()");
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

  // ✅ Loader bypass for alarm launch
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
    </>
  );
}
