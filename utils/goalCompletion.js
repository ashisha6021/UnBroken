import { getTasks, getTaskLogs, getShortGoals, getLongGoals, getTasksByShortGoal } from '../storage/storage-sqlite';

// Check if a short-term goal is completed (all tasks completed for a certain period)
export const checkShortGoalCompletion = async (shortGoalId) => {
  const tasks = await getTasksByShortGoal(shortGoalId);
  if (tasks.length === 0) return false;

  // Simple check: if all tasks have been completed at least once
  const logs = await getTaskLogs();
  const taskLogs = logs.filter(l => tasks.some(t => t.id === l.taskId && l.completed));
  
  // More sophisticated logic can be added here
  // For now, we'll use completion percentage from the goal itself
  const shortGoal = (await getShortGoals()).find(g => g.id === shortGoalId);
  return shortGoal && shortGoal.completionPercentage >= 100;
};

// Check if a long-term goal is completed
export const checkLongGoalCompletion = async (longGoalId) => {
  const longGoal = (await getLongGoals()).find(g => g.id === longGoalId);
  return longGoal && longGoal.completionPercentage >= 100;
};
