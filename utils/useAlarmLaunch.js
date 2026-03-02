import { useEffect } from 'react';
import { DeviceEventEmitter } from 'react-native';
import { resetToAlarm } from '../navigation/navigationRef';

export function useAlarmLaunch(setAlarmOverride) {

  useEffect(() => {
    const sub = DeviceEventEmitter.addListener(
      'ALARM_LAUNCHED',
      (payload) => {

      const alarmId = payload?.alarmId;
        if (!alarmId) return;
        setAlarmOverride(true);
        resetToAlarm({ alarmId });
      }
    );

    return () => sub.remove();
  }, []);
}
