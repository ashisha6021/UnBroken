import { getDatabase } from './database';

// User operations
export const saveUser = async (user) => {
  const db = getDatabase();
  await db.runAsync(
    `INSERT OR REPLACE INTO users (id, name, createdAt, hasCompletedSetup) 
     VALUES (?, ?, ?, ?)`,
    [user.id, user.name, user.createdAt, user.hasCompletedSetup ? 1 : 0]
  );
};

export const getUser = async () => {
  const db = getDatabase();
  const result = await db.getFirstAsync('SELECT * FROM users LIMIT 1');
  if (result) {
    const originalValue = result.hasCompletedSetup;
    const convertedValue = Boolean(result.hasCompletedSetup === 1);
    console.log('[Storage] getUser - Original hasCompletedSetup:', originalValue, 'type:', typeof originalValue);
    console.log('[Storage] getUser - Converted hasCompletedSetup:', convertedValue, 'type:', typeof convertedValue);
    return {
      ...result,
      hasCompletedSetup: convertedValue,
    };
  }
  return null;
};

// Long Goals operations
export const saveLongGoals = async (goals) => {
  const db = getDatabase();
  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM long_goals');
    for (const goal of goals) {
      await db.runAsync(
        `INSERT INTO long_goals (id, title, description, completionPercentage, deadline, createdAt) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [goal.id, goal.title, goal.description || null, goal.completionPercentage || 0, goal.deadline || null, goal.createdAt]
      );
    }
  });
};

export const getLongGoals = async () => {
  const db = getDatabase();
  return await db.getAllAsync('SELECT * FROM long_goals ORDER BY createdAt');
};

export const addLongGoal = async (goal) => {
  const db = getDatabase();
  await db.runAsync(
    `INSERT INTO long_goals (id, title, description, completionPercentage, deadline, createdAt) 
     VALUES (?, ?, ?, ?, ?, ?)`,
    [goal.id, goal.title, goal.description || null, goal.completionPercentage || 0, goal.deadline || null, goal.createdAt]
  );
};

export const updateLongGoal = async (goal) => {
  const db = getDatabase();
  await db.runAsync(
    `UPDATE long_goals 
     SET title = ?, description = ?, completionPercentage = ?, deadline = ?
     WHERE id = ?`,
    [goal.title, goal.description || null, goal.completionPercentage || 0, goal.deadline || null, goal.id]
  );
};

// Short Goals operations
export const saveShortGoals = async (goals) => {
  const db = getDatabase();
  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM short_goals');
    for (const goal of goals) {
      await db.runAsync(
        `INSERT INTO short_goals (id, longGoalId, title, description, completionPercentage, deadline, createdAt) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [goal.id, goal.longGoalId, goal.title, goal.description || null, goal.completionPercentage || 0, goal.deadline || null, goal.createdAt]
      );
    }
  });
};

export const getShortGoals = async () => {
  const db = getDatabase();
  return await db.getAllAsync('SELECT * FROM short_goals ORDER BY createdAt');
};

export const addShortGoal = async (goal) => {
  const db = getDatabase();
  await db.runAsync(
    `INSERT INTO short_goals (id, longGoalId, title, description, completionPercentage, deadline, createdAt) 
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [goal.id, goal.longGoalId, goal.title, goal.description || null, goal.completionPercentage || 0, goal.deadline || null, goal.createdAt]
  );
};

export const updateShortGoal = async (goal) => {
  const db = getDatabase();
  await db.runAsync(
    `UPDATE short_goals 
     SET title = ?, description = ?, completionPercentage = ?, deadline = ?
     WHERE id = ?`,
    [goal.title, goal.description || null, goal.completionPercentage || 0, goal.deadline || null, goal.id]
  );
};

export const getShortGoalsByLongGoal = async (longGoalId) => {
  const db = getDatabase();
  return await db.getAllAsync(
    'SELECT * FROM short_goals WHERE longGoalId = ? ORDER BY createdAt',
    [longGoalId]
  );
};

// Tasks operations
export const saveTasks = async (tasks) => {
  const db = getDatabase();
  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM tasks');
    for (const task of tasks) {
      await db.runAsync(
        `INSERT INTO tasks (id, shortGoalId, name, daysOfWeek, minimumEffortRule, createdAt) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          task.id,
          task.shortGoalId,
          task.name,
          JSON.stringify(task.daysOfWeek),
          task.minimumEffortRule || null,
          task.createdAt,
        ]
      );
    }
  });
};

export const getTasks = async () => {
  const db = getDatabase();
  const tasks = await db.getAllAsync('SELECT * FROM tasks ORDER BY createdAt');
  return tasks.map(task => ({
    ...task,
    daysOfWeek: JSON.parse(task.daysOfWeek),
  }));
};

export const addTask = async (task) => {
  const db = getDatabase();
  await db.runAsync(
    `INSERT INTO tasks (id, shortGoalId, name, daysOfWeek, minimumEffortRule, createdAt) 
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      task.id,
      task.shortGoalId,
      task.name,
      JSON.stringify(task.daysOfWeek),
      task.minimumEffortRule || null,
      task.createdAt,
    ]
  );
};

export const updateTask = async (task) => {
  const db = getDatabase();
  await db.runAsync(
    `UPDATE tasks 
     SET name = ?, daysOfWeek = ?, minimumEffortRule = ?
     WHERE id = ?`,
    [
      task.name,
      JSON.stringify(task.daysOfWeek),
      task.minimumEffortRule || null,
      task.id,
    ]
  );
};

export const getTasksByShortGoal = async (shortGoalId) => {
  const db = getDatabase();
  const tasks = await db.getAllAsync(
    'SELECT * FROM tasks WHERE shortGoalId = ? ORDER BY createdAt',
    [shortGoalId]
  );
  return tasks.map(task => ({
    ...task,
    daysOfWeek: JSON.parse(task.daysOfWeek),
  }));
};

// Task Logs operations
export const saveTaskLogs = async (logs) => {
  const db = getDatabase();
  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM task_logs');
    for (const log of logs) {
      await db.runAsync(
        `INSERT INTO task_logs (id, taskId, date, completed, note, createdAt) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [log.id, log.taskId, log.date, log.completed ? 1 : 0, log.note || null, log.createdAt]
      );
    }
  });
};

export const getTaskLogs = async () => {
  const db = getDatabase();
  const logs = await db.getAllAsync('SELECT * FROM task_logs ORDER BY date DESC, createdAt DESC');
  return logs.map(log => ({
    ...log,
    completed: log.completed === 1,
  }));
};

export const addTaskLog = async (log) => {
  const db = getDatabase();
  await db.runAsync(
    `INSERT OR REPLACE INTO task_logs (id, taskId, date, completed, note, createdAt) 
     VALUES (?, ?, ?, ?, ?, ?)`,
    [log.id, log.taskId, log.date, log.completed ? 1 : 0, log.note || null, log.createdAt]
  );
};

export const getTaskLogsByDate = async (date) => {
  const db = getDatabase();
  const logs = await db.getAllAsync(
    'SELECT * FROM task_logs WHERE date = ? ORDER BY createdAt',
    [date]
  );
  return logs.map(log => ({
    ...log,
    completed: log.completed === 1,
  }));
};

// Reward Rules operations
export const saveRewardRules = async (rules) => {
  const db = getDatabase();
  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM reward_rules');
    for (const rule of rules) {
      await db.runAsync(
        `INSERT INTO reward_rules (id, taskId, condition, reward, createdAt) 
         VALUES (?, ?, ?, ?, ?)`,
        [rule.id, rule.taskId, rule.condition, rule.reward, rule.createdAt]
      );
    }
  });
};

export const getRewardRules = async () => {
  const db = getDatabase();
  return await db.getAllAsync('SELECT * FROM reward_rules ORDER BY createdAt');
};

export const addRewardRule = async (rule) => {
  const db = getDatabase();
  await db.runAsync(
    `INSERT INTO reward_rules (id, taskId, condition, reward, createdAt) 
     VALUES (?, ?, ?, ?, ?)`,
    [rule.id, rule.taskId, rule.condition, rule.reward, rule.createdAt]
  );
};

export const getRewardRulesByTask = async (taskId) => {
  const db = getDatabase();
  return await db.getAllAsync(
    'SELECT * FROM reward_rules WHERE taskId = ? ORDER BY createdAt',
    [taskId]
  );
};

export const deleteRewardRule = async (ruleId) => {
  const db = getDatabase();
  await db.runAsync('DELETE FROM reward_rules WHERE id = ?', [ruleId]);
};

// Punishment Rules operations
export const savePunishmentRules = async (rules) => {
  const db = getDatabase();
  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM punishment_rules');
    for (const rule of rules) {
      await db.runAsync(
        `INSERT INTO punishment_rules (id, taskId, condition, punishment, createdAt) 
         VALUES (?, ?, ?, ?, ?)`,
        [rule.id, rule.taskId, rule.condition, rule.punishment, rule.createdAt]
      );
    }
  });
};

export const getPunishmentRules = async () => {
  const db = getDatabase();
  return await db.getAllAsync('SELECT * FROM punishment_rules ORDER BY createdAt');
};

export const addPunishmentRule = async (rule) => {
  const db = getDatabase();
  await db.runAsync(
    `INSERT INTO punishment_rules (id, taskId, condition, punishment, createdAt) 
     VALUES (?, ?, ?, ?, ?)`,
    [rule.id, rule.taskId, rule.condition, rule.punishment, rule.createdAt]
  );
};

export const getPunishmentRulesByTask = async (taskId) => {
  const db = getDatabase();
  return await db.getAllAsync(
    'SELECT * FROM punishment_rules WHERE taskId = ? ORDER BY createdAt',
    [taskId]
  );
};

export const deletePunishmentRule = async (ruleId) => {
  const db = getDatabase();
  await db.runAsync('DELETE FROM punishment_rules WHERE id = ?', [ruleId]);
};

// Break Days operations
export const saveBreakDays = async (breakDays) => {
  const db = getDatabase();
  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM break_days');
    for (const breakDay of breakDays) {
      await db.runAsync(
        `INSERT INTO break_days (id, date, reason, createdAt) 
         VALUES (?, ?, ?, ?)`,
        [breakDay.id, breakDay.date, breakDay.reason || null, breakDay.createdAt]
      );
    }
  });
};

export const getBreakDays = async () => {
  const db = getDatabase();
  return await db.getAllAsync('SELECT * FROM break_days ORDER BY date DESC');
};

export const addBreakDay = async (breakDay) => {
  const db = getDatabase();
  await db.runAsync(
    `INSERT OR REPLACE INTO break_days (id, date, reason, createdAt) 
     VALUES (?, ?, ?, ?)`,
    [breakDay.id, breakDay.date, breakDay.reason || null, breakDay.createdAt]
  );
};

export const isBreakDay = async (date) => {
  const db = getDatabase();
  const result = await db.getFirstAsync('SELECT 1 FROM break_days WHERE date = ?', [date]);
  return !!result;
};
