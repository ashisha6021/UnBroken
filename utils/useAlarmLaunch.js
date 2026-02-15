import { useEffect } from 'react';
import { DeviceEventEmitter } from 'react-native';
import { resetToAlarm } from '../navigation/navigationRef';

export function useAlarmLaunch(setAlarmOverride) {

  useEffect(() => {
    console.log('[useAlarmLaunch] Subscribing to ALARM_LAUNCHED');

    const sub = DeviceEventEmitter.addListener(
      'ALARM_LAUNCHED',
      (payload) => {

        console.log('[useAlarmLaunch] EVENT RECEIVED:', payload);

        const alarmId = payload?.alarmId;
        if (!alarmId) return;

        // ✅ bypass loader immediately
        setAlarmOverride(true);

        // ✅ navigate to alarm screen
        resetToAlarm({ alarmId });
      }
    );

    return () => sub.remove();
  }, []);
}
