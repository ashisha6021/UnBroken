import { createNavigationContainerRef } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();

let pendingAlarmParams = null;

export function resetToAlarm(params) {
  if (navigationRef.isReady()) {
    navigationRef.reset({
      index: 0,
      routes: [{ name: 'Alarm Ringing', params }],
    });
  } else {
    // ⏳ store temporarily
    pendingAlarmParams = params;
  }
}

export function onNavigationReady() {
  if (pendingAlarmParams && navigationRef.isReady()) {
    navigationRef.reset({
      index: 0,
      routes: [{ name: 'Alarm Ringing', params: pendingAlarmParams }],
    });
    pendingAlarmParams = null;
  }
}
