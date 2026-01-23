// services/progressService.js

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
export async function calculateShortGoalProgress(shortGoal) {
  if (!shortGoal?.deadline || !shortGoal?.createdAt) return 0;

  const start = parseISO(shortGoal.createdAt);
  const end = parseISO(shortGoal.deadline);

  const totalDays = differenceInCalendarDays(end, start) + 1;
  if (totalDays <= 0) return 0;

  const tasks = await getTasksByShortGoal(shortGoal.id);
  if (tasks.length === 0) return 0;

  let completedDays = 0;

  for (let i = 0; i < totalDays; i++) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];

    // Skip break days
    if (await isBreakDay(dateStr)) continue;

    const logs = await getTaskLogsByDate(dateStr);
    const relevantLogs = logs.filter(log =>
      tasks.some(task => task.id === log.taskId)
    );

    if (
      relevantLogs.length === tasks.length &&
      relevantLogs.every(log => log.completed === true)
    ) {
      completedDays++;
    }
  }

  return Math.min(
    100,
    Math.round((completedDays / totalDays) * 100)
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

  // 1️⃣ Recalculate short-term goal
  const shortPercent = await calculateShortGoalProgress(shortGoal);

  await updateShortGoal({
    ...shortGoal,
    completionPercentage: shortPercent,
  });

  // 2️⃣ Fetch sibling short goals
  const siblings = await getShortGoalsByLongGoal(shortGoal.longGoalId);

  const updatedSiblings = siblings.map(g =>
    g.id === shortGoal.id
      ? { ...g, completionPercentage: shortPercent }
      : g
  );

  const longPercent = calculateLongGoalProgress(updatedSiblings);

  // 3️⃣ Fetch full long goal (safe update)
  const longGoals = await getLongGoals();
  const longGoal = longGoals.find(g => g.id === shortGoal.longGoalId);
  if (!longGoal) return;

  // 4️⃣ Update long-term goal
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

  const totalTasks = logs.length;
  const completedTasks = logs.filter(l => l.completed === true).length;

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
