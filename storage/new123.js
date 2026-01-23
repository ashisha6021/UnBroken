import { getDatabase } from './database';


export async function dbUpdateAlarmCritical(alarmId, isCritical) {
  const db = getDatabase();
  await db.runAsync(
    `UPDATE task_alarms SET isCritical = ? WHERE id = ?`,
    [isCritical ? 1 : 0, alarmId]
  );
}
 