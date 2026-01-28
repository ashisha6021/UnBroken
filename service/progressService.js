import { differenceInCalendarDays, parseISO } from 'date-fns';
import { getTodayDateString } from '../utils/dateHelpers';

import {
  getTasksByShortGoal,
  getTaskLogsByDate,
  isBreakDay,
  updateShortGoal,
  updateLongGoal,
  getShortGoalsByLongGoal,
  getLongGoals,
  getShortGoals,
} from '../storage/storage-sqlite';

/* =====================================================
   SHORT GOAL PROGRESS
   Based on full daily task completion until deadline
===================================================== */

const DAY_NAMES = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
];

export async function calculateShortGoalProgress(shortGoal) {
  if (!shortGoal?.deadline || !shortGoal?.createdAt) return 0;

  const start = parseISO(shortGoal.createdAt);
  const end = parseISO(shortGoal.deadline);

  const totalCalendarDays =
    differenceInCalendarDays(end, start) + 1;

  if (totalCalendarDays <= 0) return 0;

  const tasks = await getTasksByShortGoal(shortGoal.id);
  if (!tasks || tasks.length === 0) return 0;

  let completedDays = 0;
  let totalExpectedDays = 0; // 🔥 REAL denominator

  for (let i = 0; i < totalCalendarDays; i++) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);

    const dateStr = date.toISOString().split('T')[0];
    const dayName = DAY_NAMES[date.getDay()];

    // ⛔ Skip break days
    if (await isBreakDay(dateStr)) continue;

    // 🔍 Tasks that actually exist on this day
    const dayTasks = tasks.filter(task =>
      task.daysOfWeek.includes(dayName)
    );

    // ⛔ No tasks → day does NOT count
    if (dayTasks.length === 0) continue;

    totalExpectedDays++; // ✅ Count only meaningful days

    const logs = await getTaskLogsByDate(dateStr);

    const relevantLogs = logs.filter(log =>
      dayTasks.some(task => task.id === log.taskId)
    );

    
    // ✅ Day completed only if ALL tasks completed
    if (
      relevantLogs.length === dayTasks.length &&
      relevantLogs.every(log => log.completed === true)
    ) {
      completedDays++;
    }
  }

  if (totalExpectedDays === 0) return 0;

  return Math.min(
    100,
    Math.round((completedDays / totalExpectedDays) * 100)
  );
}
/* =====================================================
   LONG GOAL PROGRESS
   Average of all its short goals
===================================================== */
export function calculateLongGoalProgress(shortGoals) {
  if (!shortGoals || shortGoals.length === 0) return 0;

  const sum = shortGoals.reduce(
    (acc, g) => acc + (g.completionPercentage || 0),
    0
  );

  return Math.round(sum / shortGoals.length);
}

/* =====================================================
   FULL GOAL RECALC
   Call AFTER a task log is saved
===================================================== */
export async function recalcGoalProgress(shortGoal) {
  if (!shortGoal?.id || !shortGoal?.longGoalId) return;

  // 1️⃣ Recalculate THIS short goal
  const shortPercent = await calculateShortGoalProgress(shortGoal);

  await updateShortGoal({
    ...shortGoal,
    completionPercentage: shortPercent,
  });

  // 2️⃣ Fetch ALL short goals for this long goal (fresh from DB)
 const allShortGoals =
  (await getShortGoalsByLongGoal(shortGoal.longGoalId))
    .map(g =>
      g.id === shortGoal.id
        ? { ...g, completionPercentage: shortPercent }
        : g
    );

  if (!allShortGoals || allShortGoals.length === 0) return;

  // 3️⃣ Calculate average (THIS IS THE KEY)
  const total = allShortGoals.reduce(
    (sum, g) => sum + (g.completionPercentage || 0),
    0
  );

  const longPercent = Math.round(
    total / allShortGoals.length
  );

  // 4️⃣ Fetch long goal
  const longGoals = await getLongGoals();
  const longGoal = longGoals.find(
    g => g.id === shortGoal.longGoalId
  );

  if (!longGoal) return;

  // 5️⃣ Update long goal
  await updateLongGoal({
    ...longGoal,
    completionPercentage: longPercent,
  });
}


// Convenience wrapper used by the UI when task logs change
export async function handleTaskLogProgress(shortGoalId) {
  if (!shortGoalId) return;

  // Find the short goal and invoke recalc
  const allShort = await getShortGoals();
 
  const shortGoal = allShort.find(g => g.id === shortGoalId);
 
  if (!shortGoal) return;
 
  await recalcGoalProgress(shortGoal);

}

/* =====================================================
   TODAY PROGRESS
   Used for Result Screen & Streaks
===================================================== */
export async function calculateTodayProgress() {
  const today = getTodayDateString();
  const logs = await getTaskLogsByDate(today);
 
  const normalizedLogs = logs.map(l => ({
  ...l,
  completed: l.completed === true || l.completed === 1,
   }));

  const totalTasks = normalizedLogs.length;
  const completedTasks = normalizedLogs.filter(l => l.completed).length;

  const completionPercentage =
    totalTasks === 0
      ? 0
      : Math.round((completedTasks / totalTasks) * 100);

  return {
    date: today,
    totalTasks,
    completedTasks,
    completionPercentage,
  };
}

