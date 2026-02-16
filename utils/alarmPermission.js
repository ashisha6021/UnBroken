import { Platform, Linking, NativeModules } from 'react-native';


const { AlarmModule } = NativeModules;

export async function canScheduleExactAlarms() {
return true;
}
/* ----------------------------------
   REQUEST (OPEN SETTINGS)
---------------------------------- */
export async function requestExactAlarmPermission() {
 return true;}

