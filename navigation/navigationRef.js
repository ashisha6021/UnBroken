import { createNavigationContainerRef } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();

let pendingAlarm = null;

export function resetToAlarm(params) {
  console.log('[navigationRef.resetToAlarm] called with params:', params);
  if (navigationRef.isReady()) {
    console.log('[navigationRef.resetToAlarm] navigation is ready, resetting stack to Alarm Ringing');
    navigationRef.reset({
      index: 0,
      routes: [{ name: 'Alarm Ringing', params }],
    });
  } else {
    console.log('[navigationRef.resetToAlarm] navigation NOT ready, storing pendingAlarm');
    pendingAlarm = params;
  }
}

export function onNavigationReady() {
  console.log('[navigationRef.onNavigationReady] called. pendingAlarm =', pendingAlarm);
  if (pendingAlarm) {
    navigationRef.reset({
      index: 0,
      routes: [{ name: 'Alarm Ringing', params: pendingAlarm }],
    });
    console.log('[navigationRef.onNavigationReady] consumed pendingAlarm and reset navigation');
    pendingAlarm = null;
  }
}

