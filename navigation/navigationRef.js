import { createNavigationContainerRef } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();

let pendingAlarm = null;

export function resetToAlarm(params) {
  
  if (navigationRef.isReady()) {
    
    navigationRef.reset({
      index: 0,
      routes: [{ name: 'Alarm Ringing', params }],
    });
  } else {
    
    pendingAlarm = params;
  }
}

export function onNavigationReady() {
  
  if (pendingAlarm) {
    navigationRef.reset({
      index: 0,
      routes: [{ name: 'Alarm Ringing', params: pendingAlarm }],
    });
    
    pendingAlarm = null;
  }
}

