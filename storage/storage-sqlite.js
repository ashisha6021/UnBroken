import { getDatabase } from './database';

/* --------------------------------------------------
   USERS
-------------------------------------------------- */

export const saveUser = async (user) => {
  const db = getDatabase();

  await db.runAsync(() => {
    db.raw.create(
      'users',
      {
        id: user.id,
        name: user.name,
        createdAt: user.createdAt,
        hasCompletedSetup: Boolean(user.hasCompletedSetup),
      },
      'modified'
    );
  });
};

export const getUser = async () => {
  const db = getDatabase();
  const result = await db.getFirstAsync('users');

  if (!result) return null;

  return {
    ...result,
    hasCompletedSetup: Boolean(result.hasCompletedSetup),
  };
};

/* --------------------------------------------------
   LONG GOALS
-------------------------------------------------- */

export const saveLongGoals = async (goals) => {
  const db = getDatabase();

  await db.withTransactionAsync(async () => {
    db.raw.delete(db.raw.objects('long_goals'));

    for (const goal of goals) {
      db.raw.create(
        'long_goals',
        {
          id: goal.id,
          title: goal.title,
          description: goal.description ?? null,
          completionPercentage: goal.completionPercentage ?? 0,
          deadline: goal.deadline ?? null,
          createdAt: goal.createdAt,
        },
        'modified'
      );
    }
  });
};

export const getLongGoals = async () => {
  const db = getDatabase();
  return await db.getAllAsync('long_goals', 'TRUEPREDICATE SORT(createdAt ASC)');
};

export const addLongGoal = async (goal) => {
  const db = getDatabase();

  await db.runAsync(() => {
    db.raw.create(
      'long_goals',
      {
        id: goal.id,
        title: goal.title,
        description: goal.description ?? null,
        completionPercentage: goal.completionPercentage ?? 0,
        deadline: goal.deadline ?? null,
        createdAt: goal.createdAt,
      },
      'modified'
    );
  });
};

export const updateLongGoal = async (goal) => {
  const db = getDatabase();

  await db.runAsync(() => {
    db.raw.create(
      'long_goals',
      {
        id: goal.id,
        title: goal.title,
        description: goal.description ?? null,
        completionPercentage: goal.completionPercentage ?? 0,
        deadline: goal.deadline ?? null,
      },
      'modified'
    );
  });
};

// Short Goals operations
export const saveShortGoals = async (goals) => {
  const db = getDatabase();

  await db.withTransactionAsync(() => {
    db.raw.delete(db.raw.objects('short_goals'));

    goals.forEach(goal => {
      db.raw.create(
        'short_goals',
        {
          id: goal.id,
          longGoalId: goal.longGoalId,
          title: goal.title,
          description: goal.description ?? null,
          completionPercentage: goal.completionPercentage ?? 0,
          deadline: goal.deadline ?? null,
          createdAt: goal.createdAt,
        },
        'modified'
      );
    });
  });
};

export const getShortGoals = async () => {
  const db = getDatabase();
  return await db.getAllAsync(
    'short_goals',
    'TRUEPREDICATE SORT(createdAt ASC)'
  );
};

export const addShortGoal = async (goal) => {
  const db = getDatabase();

  await db.runAsync(() => {
    db.raw.create(
      'short_goals',
      {
        id: goal.id,
        longGoalId: goal.longGoalId,
        title: goal.title,
        description: goal.description ?? null,
        completionPercentage: goal.completionPercentage ?? 0,
        deadline: goal.deadline ?? null,
        createdAt: goal.createdAt,
      },
      'modified'
    );
  });
};

export const updateShortGoal = async (goal) => {
  const db = getDatabase();

  await db.runAsync(() => {
    db.raw.create(
      'short_goals',
      {
        id: goal.id,
        title: goal.title,
        description: goal.description ?? null,
        completionPercentage: goal.completionPercentage ?? 0,
        deadline: goal.deadline ?? null,
      },
      'modified'
    );
  });
};

export const getShortGoalsByLongGoal = async (longGoalId) => {
  const db = getDatabase();
  return await db.getAllAsync(
    'short_goals',
    'longGoalId == $0 SORT(createdAt ASC)',
    longGoalId
  );
};


// Tasks operations
export const saveTasks = async (tasks) => {
  const db = getDatabase();

  await db.withTransactionAsync(() => {
    db.raw.delete(db.raw.objects('tasks'));

    tasks.forEach(task => {
      db.raw.create(
        'tasks',
        {
          id: task.id,
          shortGoalId: task.shortGoalId,
          name: task.name,
          daysOfWeek: JSON.stringify(task.daysOfWeek),
          minimumEffortRule: task.minimumEffortRule ?? null,
          createdAt: task.createdAt,
        },
        'modified'
      );
    });
  });
};

export const getTasks = async () => {
  const db = getDatabase();
  const tasks = await db.getAllAsync('tasks', 'TRUEPREDICATE SORT(createdAt ASC)');
  return tasks.map(t => ({
    ...t,
    daysOfWeek: JSON.parse(t.daysOfWeek),
  }));
};

export const addTask = async (task) => {
  const db = getDatabase();

  await db.runAsync(() => {
    db.raw.create(
      'tasks',
      {
        id: task.id,
        shortGoalId: task.shortGoalId,
        name: task.name,
        daysOfWeek: JSON.stringify(task.daysOfWeek),
        minimumEffortRule: task.minimumEffortRule ?? null,
        createdAt: task.createdAt,
      },
      'modified'
    );
  });
};

export const updateTask = async (task) => {
  const db = getDatabase();

  await db.runAsync(() => {
    db.raw.create(
      'tasks',
      {
        id: task.id,
        name: task.name,
        daysOfWeek: JSON.stringify(task.daysOfWeek),
        minimumEffortRule: task.minimumEffortRule ?? null,
      },
      'modified'
    );
  });
};

export const getTasksByShortGoal = async (shortGoalId) => {
  const db = getDatabase();
  const tasks = await db.getAllAsync(
    'tasks',
    'shortGoalId == $0 SORT(createdAt ASC)',
    shortGoalId
  );

  return tasks.map(t => ({
    ...t,
    daysOfWeek: JSON.parse(t.daysOfWeek),
  }));
};

export const saveTaskLogs = async (logs) => {
  const db = getDatabase();

  await db.withTransactionAsync(() => {
    db.raw.delete(db.raw.objects('task_logs'));

    logs.forEach(log => {
      db.raw.create(
        'task_logs',
        {
          id: log.id,
          taskId: log.taskId,
          date: log.date,
          completed: Boolean(log.completed),
          note: log.note ?? null,
          createdAt: log.createdAt,
        },
        'modified'
      );
    });
  });
};

export const getTaskLogs = async () => {
  const db = getDatabase();
  const logs = await db.getAllAsync(
    'task_logs',
    'TRUEPREDICATE SORT(date DESC, createdAt DESC)'
  );

  return logs.map(l => ({
    ...l,
    completed: Boolean(l.completed),

  }));
};

export const addTaskLog = async (log) => {
  const db = getDatabase();

  await db.runAsync(() => {
    db.raw.create(
      'task_logs',
      {
        id: log.id,
        taskId: log.taskId,
        date: log.date,
        completed: Boolean(log.completed),
        note: log.note ?? null,
        createdAt: log.createdAt,
      },
      'modified'
    );
  });
};





  







export const getTaskLogsByDate = async (date) => {
  if (!date) {
    console.warn('[DB] getTaskLogsByDate called without date');
    return [];
  }

  const db = getDatabase();
  
  const logs = await db.getAllAsync(
    'task_logs',
    'date == $0 SORT(createdAt ASC)',
    date
  );

  return logs.map(l => ({
    ...l,
    completed: l.completed === true, // ✅ Realm-safe
  }));
};

export const saveRewardRules = async (rules) => {
  const db = getDatabase();

  await db.withTransactionAsync(() => {
    const all = db.raw.objects('reward_rules');
    db.raw.delete(all);

    rules.forEach((rule) => {
      db.raw.create('reward_rules', {
        id: rule.id,
        taskId: rule.taskId,
        condition: rule.condition,
        reward: rule.reward,
        createdAt: rule.createdAt,
      });
    });
  });
};

export const getRewardRules = async () => {
  const db = getDatabase();
  return db.getAllAsync('reward_rules');
};

export const addRewardRule = async (rule) => {
  const db = getDatabase();

  await db.runAsync(() => {
    db.raw.create('reward_rules', {
      id: rule.id,
      taskId: rule.taskId,
      condition: rule.condition,
      reward: rule.reward,
      createdAt: rule.createdAt,
    });
  });
};

export const getRewardRulesByTask = async (taskId) => {
  const db = getDatabase();
  return db.getAllAsync('reward_rules', `taskId == "${taskId}"`);
};

export const deleteRewardRule = async (ruleId) => {
  const db = getDatabase();

  await db.runAsync(() => {
    const rule = db.raw.objectForPrimaryKey('reward_rules', ruleId);
    if (rule) db.raw.delete(rule);
  });
};

// Punishment Rules operations
export const savePunishmentRules = async (rules) => {
  const db = getDatabase();

  await db.withTransactionAsync(() => {
    const all = db.raw.objects('punishment_rules');
    db.raw.delete(all);

    rules.forEach((rule) => {
      db.raw.create('punishment_rules', {
        id: rule.id,
        taskId: rule.taskId,
        condition: rule.condition,
        punishment: rule.punishment,
        createdAt: rule.createdAt,
      });
    });
  });
};

export const getPunishmentRules = async () => {
  const db = getDatabase();
  return db.getAllAsync('punishment_rules');
};

export const addPunishmentRule = async (rule) => {
  const db = getDatabase();

  await db.runAsync(() => {
    db.raw.create('punishment_rules', {
      id: rule.id,
      taskId: rule.taskId,
      condition: rule.condition,
      punishment: rule.punishment,
      createdAt: rule.createdAt,
    });
  });
};

export const getPunishmentRulesByTask = async (taskId) => {
  const db = getDatabase();
  return db.getAllAsync('punishment_rules', `taskId == "${taskId}"`);
};

export const deletePunishmentRule = async (ruleId) => {
  const db = getDatabase();

  await db.runAsync(() => {
    const rule = db.raw.objectForPrimaryKey('punishment_rules', ruleId);
    if (rule) db.raw.delete(rule);
  });
};


// Break Days operations
export const saveBreakDays = async (breakDays) => {
  const db = getDatabase();

  await db.withTransactionAsync(() => {
    const all = db.raw.objects('break_days');
    db.raw.delete(all);

    breakDays.forEach((day) => {
      db.raw.create('break_days', {
        id: day.id,
        date: day.date,
        reason: day.reason ?? null,
        createdAt: day.createdAt,
      });
    });
  });
};

export const getBreakDays = async () => {
  const db = getDatabase();
  return db.getAllAsync('break_days').then((rows) =>
    rows.sort((a, b) => (a.date < b.date ? 1 : -1))
  );
};

export const addBreakDay = async (breakDay) => {
  const db = getDatabase();

  await db.runAsync(() => {
    db.raw.create(
      'break_days',
      {
        id: breakDay.id,
        date: breakDay.date,
        reason: breakDay.reason ?? null,
        createdAt: breakDay.createdAt,
      },
      'modified'
    );
  });
};

export const isBreakDay = async (date) => {
  const db = getDatabase();
  const result = await db.getFirstAsync('break_days', `date == "${date}"`);
  return !!result;
};

export const dbAddTaskAlarm = async (alarm) => {
  const db = getDatabase();

  await db.runAsync(() => {
    db.raw.create(
      'task_alarms',
      {
        id: alarm.id,
        taskId: alarm.taskId,

        // 🔒 Realm-safe
        dayOfWeek: String(alarm.dayOfWeek),
        time: String(alarm.time),

        enabled: Boolean(alarm.enabled),
        isCritical: Boolean(alarm.isCritical),

        createdAt: alarm.createdAt,
      },
      'modified'
    );
  });
};

export const dbGetTaskAlarmsByTask = async (taskId) => {
  const db = getDatabase();

  const rows = await db.getAllAsync(
    'task_alarms',
    'taskId == $0 SORT(createdAt ASC)',
    taskId
  );

  return rows.map((r) => ({
    ...r,
    enabled: Boolean(r.enabled),
    isCritical: Boolean(r.isCritical),
  }));
};

export const dbUpdateTaskAlarm = async (alarm) => {
  const db = getDatabase();

  await db.runAsync(() => {
    const existing = db.raw.objectForPrimaryKey('task_alarms', alarm.id);
    if (!existing) return;

    existing.dayOfWeek = String(alarm.dayOfWeek);
    existing.time = String(alarm.time);
    existing.enabled = Boolean(alarm.enabled);
  });
};

export const deleteTaskAlarm = async (alarmId) => {
  const db = getDatabase();

  await db.runAsync(() => {
    const alarm = db.raw.objectForPrimaryKey('task_alarms', alarmId);
    if (alarm) db.raw.delete(alarm);
  });
};

export const saveAlarmSettings = async (settings) => {
  const db = getDatabase();

  await db.runAsync(() => {
    db.raw.create(
      'alarm_settings',
      {
        taskId: settings.taskId,

        ringDuration: Number(settings.ringDuration ?? 120),
        snoozeDuration: Number(settings.snoozeDuration ?? 120),

        requireBrainGame: Boolean(settings.requireBrainGame),

        motivationType: settings.motivationType ?? null,
        motivationSource: settings.motivationSource ?? null,

        createdAt: settings.createdAt,
      },
      'modified'
    );
  });
};

export const getAlarmSettingsByTask = async (taskId) => {
  const db = getDatabase();

  const result = await db.getFirstAsync(
    'alarm_settings',
    'taskId == $0',
    taskId
  );

  if (!result) return null;

  return {
    ...result,
    requireBrainGame: Boolean(result.requireBrainGame),
  };
};

export const addBrainGameLog = async (log) => {
  const db = getDatabase();

  await db.runAsync(() => {
    db.raw.create(
      'brain_game_logs',
      {
        id: log.id,
        taskId: log.taskId,
        gameType: log.gameType,

        solved: Boolean(log.solved),
        duration: log.duration != null ? Number(log.duration) : null,

        createdAt: log.createdAt,
      },
      'modified'
    );
  });
};

export const getRecentBrainGames = async (taskId, limit = 2) => {
  const db = getDatabase();

  const rows = await db.getAllAsync(
    'brain_game_logs',
    'taskId == $0 SORT(createdAt DESC)',
    taskId
  );

  return rows.slice(0, limit).map((r) => r.gameType);
};
