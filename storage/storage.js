import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  USER: '@unbroken:user',
  LONG_GOALS: '@unbroken:longGoals',
  SHORT_GOALS: '@unbroken:shortGoals',
  TASKS: '@unbroken:tasks',
  TASK_LOGS: '@unbroken:taskLogs',
  REWARD_RULES: '@unbroken:rewardRules',
  PUNISHMENT_RULES: '@unbroken:punishmentRules',
  BREAK_DAYS: '@unbroken:breakDays',
};

// User
export const saveUser = async (user) => {
  await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
};

export const getUser = async () => {
  const data = await AsyncStorage.getItem(STORAGE_KEYS.USER);
  return data ? JSON.parse(data) : null;
};

// Long Goals
export const saveLongGoals = async (goals) => {
  await AsyncStorage.setItem(STORAGE_KEYS.LONG_GOALS, JSON.stringify(goals));
};

export const getLongGoals = async () => {
  const data = await AsyncStorage.getItem(STORAGE_KEYS.LONG_GOALS);
  return data ? JSON.parse(data) : [];
};

export const addLongGoal = async (goal) => {
  const goals = await getLongGoals();
  goals.push(goal);
  await saveLongGoals(goals);
};

// Short Goals
export const saveShortGoals = async (goals) => {
  await AsyncStorage.setItem(STORAGE_KEYS.SHORT_GOALS, JSON.stringify(goals));
};

export const getShortGoals = async () => {
  const data = await AsyncStorage.getItem(STORAGE_KEYS.SHORT_GOALS);
  return data ? JSON.parse(data) : [];
};

export const addShortGoal = async (goal) => {
  const goals = await getShortGoals();
  goals.push(goal);
  await saveShortGoals(goals);
};

export const getShortGoalsByLongGoal = async (longGoalId) => {
  const goals = await getShortGoals();
  return goals.filter(g => g.longGoalId === longGoalId);
};

// Tasks
export const saveTasks = async (tasks) => {
  await AsyncStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
};

export const getTasks = async () => {
  const data = await AsyncStorage.getItem(STORAGE_KEYS.TASKS);
  return data ? JSON.parse(data) : [];
};

export const addTask = async (task) => {
  const tasks = await getTasks();
  tasks.push(task);
  await saveTasks(tasks);
};

export const getTasksByShortGoal = async (shortGoalId) => {
  const tasks = await getTasks();
  return tasks.filter(t => t.shortGoalId === shortGoalId);
};

// Task Logs
export const saveTaskLogs = async (logs) => {
  await AsyncStorage.setItem(STORAGE_KEYS.TASK_LOGS, JSON.stringify(logs));
};

export const getTaskLogs = async () => {
  const data = await AsyncStorage.getItem(STORAGE_KEYS.TASK_LOGS);
  return data ? JSON.parse(data) : [];
};

export const addTaskLog = async (log) => {
  const logs = await getTaskLogs();
  // Remove existing log for same task and date if exists
  const filtered = logs.filter(l => !(l.taskId === log.taskId && l.date === log.date));
  filtered.push(log);
  await saveTaskLogs(filtered);
};

export const getTaskLogsByDate = async (date) => {
  const logs = await getTaskLogs();
  return logs.filter(l => l.date === date);
};

// Reward Rules
export const saveRewardRules = async (rules) => {
  await AsyncStorage.setItem(STORAGE_KEYS.REWARD_RULES, JSON.stringify(rules));
};

export const getRewardRules = async () => {
  const data = await AsyncStorage.getItem(STORAGE_KEYS.REWARD_RULES);
  return data ? JSON.parse(data) : [];
};

export const addRewardRule = async (rule) => {
  const rules = await getRewardRules();
  rules.push(rule);
  await saveRewardRules(rules);
};

// Punishment Rules
export const savePunishmentRules = async (rules) => {
  await AsyncStorage.setItem(STORAGE_KEYS.PUNISHMENT_RULES, JSON.stringify(rules));
};

export const getPunishmentRules = async () => {
  const data = await AsyncStorage.getItem(STORAGE_KEYS.PUNISHMENT_RULES);
  return data ? JSON.parse(data) : [];
};

export const addPunishmentRule = async (rule) => {
  const rules = await getPunishmentRules();
  rules.push(rule);
  await savePunishmentRules(rules);
};

// Break Days
export const saveBreakDays = async (breakDays) => {
  await AsyncStorage.setItem(STORAGE_KEYS.BREAK_DAYS, JSON.stringify(breakDays));
};

export const getBreakDays = async () => {
  const data = await AsyncStorage.getItem(STORAGE_KEYS.BREAK_DAYS);
  return data ? JSON.parse(data) : [];
};

export const addBreakDay = async (breakDay) => {
  const breakDays = await getBreakDays();
  breakDays.push(breakDay);
  await saveBreakDays(breakDays);
};

export const isBreakDay = async (date) => {
  const breakDays = await getBreakDays();
  return breakDays.some(bd => bd.date === date);
};
