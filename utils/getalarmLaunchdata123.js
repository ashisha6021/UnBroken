import { useEffect } from "react";
import { DeviceEventEmitter } from "react-native";
import { resetToAlarm } from "../navigation/navigationRef";
import { getAlarmLaunchData } from "./getAlarmLaunchData";

export function useAlarmLaunch() {
  useEffect(() => {

    // ✅ 1. Cold start handling
    (async () => {
      const launchData = await getAlarmLaunchData();
      if (launchData?.alarmId) {
        console.log("🚀 Cold start alarm:", launchData);
        resetToAlarm({ alarmId: launchData.alarmId });
      }
    })();

    // ✅ 2. Warm start event handling
    const sub = DeviceEventEmitter.addListener(
      "ALARM_LAUNCHED",
      payload => {
        if (payload?.alarmId) {
          console.log("🔥 Warm alarm event:", payload);
          resetToAlarm({ alarmId: payload.alarmId });
        }
      }
    );

    return () => sub.remove();
  }, []);
}
