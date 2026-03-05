import { useAppStore } from "../store/useAppStore";

export const resolveAlarmDetails = (taskId) => {
  const { tasks, shortGoals, longGoals } = useAppStore.getState();

  const task = tasks.find(t => t.id === taskId);
  if (!task) return null;

  const shortGoal = shortGoals.find(
    g => g.id === task.shortGoalId
  );

  const longGoal = shortGoal
    ? longGoals.find(l => l.id === shortGoal.longGoalId)
    : null;

  return {
    taskName: task.name,
    shortGoalName: shortGoal?.title || "",
    longGoalName: longGoal?.title || "",
  };
};