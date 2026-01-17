import { getTasks, getTaskLogsByDate, isBreakDay } from '../storage/storage-sqlite';
import { getTodayDateString, isTaskActiveToday } from './dateHelpers';

export const getTodayProgress = async () => {
  const today = getTodayDateString();
  const isBreak = await isBreakDay(today);
  
  if (isBreak) {
    return {
      date: today,
      totalTasks: 0,
      completedTasks: 0,
      completionPercentage: 100, // Break days are considered 100% complete
      taskLogs: [],
      isBreakDay: true,
    };
  }

  const allTasks = await getTasks();
  const todayTasks = allTasks.filter(isTaskActiveToday);
  const todayLogs = await getTaskLogsByDate(today);

  const taskLogs = todayTasks.map(task => {
    const log = todayLogs.find(l => l.taskId === task.id);
    return {
      task,
      log: log || null,
      completed: log ? log.completed : false,
    };
  });

  const completedTasks = taskLogs.filter(tl => tl.completed).length;
  const totalTasks = todayTasks.length;
  const completionPercentage = totalTasks > 0 
    ? Math.round((completedTasks / totalTasks) * 100) 
    : 100;

  return {
    date: today,
    totalTasks,
    completedTasks,
    completionPercentage,
    taskLogs,
    isBreakDay: false,
  };
};
