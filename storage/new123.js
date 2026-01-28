import { getDatabase } from './database';

/* --------------------------------------------------
   UPDATE ALARM CRITICAL
-------------------------------------------------- */
export const dbUpdateAlarmCritical = async (alarmId, isCritical) => {
  const db = getDatabase();

  await db.runAsync(() => {
    const alarm = db.raw.objectForPrimaryKey('task_alarms', alarmId);
    if (alarm) {
      alarm.isCritical = Boolean(isCritical);
    }
  });
};

/* --------------------------------------------------
   INTERNAL: DELETE TASK (NO TRANSACTION)
-------------------------------------------------- */
const deleteTaskInternal = (db, taskId) => {
  db.raw.delete(db.raw.objects('task_logs').filtered('taskId == $0', taskId));
  db.raw.delete(db.raw.objects('reward_rules').filtered('taskId == $0', taskId));
  db.raw.delete(db.raw.objects('punishment_rules').filtered('taskId == $0', taskId));
  db.raw.delete(db.raw.objects('task_alarms').filtered('taskId == $0', taskId));
  db.raw.delete(db.raw.objects('alarm_settings').filtered('taskId == $0', taskId));
  db.raw.delete(db.raw.objects('brain_game_logs').filtered('taskId == $0', taskId));

  const task = db.raw.objectForPrimaryKey('tasks', taskId);
  if (task) db.raw.delete(task);
};

/* --------------------------------------------------
   DELETE TASK (FULL CASCADE)
-------------------------------------------------- */
export const deleteTaskCascade = async (taskId) => {
  const db = getDatabase();

  await db.withTransactionAsync(() => {
    deleteTaskInternal(db, taskId);
  });
};

/* --------------------------------------------------
   DELETE SHORT GOAL (CASCADE TASKS)
-------------------------------------------------- */
export const deleteShortGoalCascade = async (shortGoalId) => {
  const db = getDatabase();

  await db.withTransactionAsync(() => {
    const tasks = db.raw
      .objects('tasks')
      .filtered('shortGoalId == $0', shortGoalId);

    tasks.forEach((task) => {
      deleteTaskInternal(db, task.id);
    });

    const shortGoal = db.raw.objectForPrimaryKey('short_goals', shortGoalId);
    if (shortGoal) db.raw.delete(shortGoal);
  });
};

/* --------------------------------------------------
   DELETE LONG GOAL (FULL CASCADE)
-------------------------------------------------- */
export const deleteLongGoalCascade = async (longGoalId) => {
  const db = getDatabase();

  await db.withTransactionAsync(() => {
    const shortGoals = db.raw
      .objects('short_goals')
      .filtered('longGoalId == $0', longGoalId);

    shortGoals.forEach((sg) => {
      const tasks = db.raw
        .objects('tasks')
        .filtered('shortGoalId == $0', sg.id);

      tasks.forEach((task) => {
        deleteTaskInternal(db, task.id);
      });

      db.raw.delete(sg);
    });

    const longGoal = db.raw.objectForPrimaryKey('long_goals', longGoalId);
    if (longGoal) db.raw.delete(longGoal);
  });
};
