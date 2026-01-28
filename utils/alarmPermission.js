import { Platform, Linking, NativeModules } from 'react-native';


const { AlarmModule } = NativeModules;

export async function canScheduleExactAlarms() {
  if (Platform.OS !== 'android') return true;
  if (Platform.Version < 31) return true;
 console.log("ENETER THE PERMISISON CHECKER..")
  try {
    
    return await AlarmModule.canScheduleExactAlarmsjava();
    
  } catch {
   
    return false;
  }
}
/* ----------------------------------
   REQUEST (OPEN SETTINGS)
---------------------------------- */
export async function requestExactAlarmPermission() {
  if (Platform.OS !== 'android') return true;
  if (Platform.Version < 31) return true;

  try {
    await AlarmModule.openExactAlarmSettings();
    return true;
  } catch (e) {
    return false;
  }
}

