import { useEffect } from "react";
import { DeviceEventEmitter } from "react-native";
import { resetToAlarm } from "../navigation/navigationRef";
import { getAlarmLaunchData } from "./getAlarmLaunchData";

export function useAlarmLaunch() {
  useEffect(() => {

  
    (async () => {
      const launchData = await getAlarmLaunchData();
      if (launchData?.alarmId) {
        
        resetToAlarm({ alarmId: launchData.alarmId });
      }
    })();

    
    const sub = DeviceEventEmitter.addListener(
      "ALARM_LAUNCHED",
      payload => {
        if (payload?.alarmId) {
          
          resetToAlarm({ alarmId: payload.alarmId });
        }
      }
    );

    return () => sub.remove();
  }, []);
}
