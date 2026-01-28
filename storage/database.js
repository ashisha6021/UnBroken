import Realm from 'realm';

let realm = null;

/* --------------------------------------------------
   SCHEMAS
-------------------------------------------------- */

const UserSchema = {
  name: 'users',
  primaryKey: 'id',
  properties: {
    id: 'string',
    name: 'string',
    createdAt: 'string',
    hasCompletedSetup: { type: 'bool', default: false },
  },
};

const LongGoalSchema = {
  name: 'long_goals',
  primaryKey: 'id',
  properties: {
    id: 'string',
    title: 'string',
    description: 'string?',
    completionPercentage: { type: 'double', default: 0 },
    deadline: 'string?',
    createdAt: 'string',
  },
};

const ShortGoalSchema = {
  name: 'short_goals',
  primaryKey: 'id',
  properties: {
    id: 'string',
    longGoalId: 'string',
    title: 'string',
    description: 'string?',
    completionPercentage: { type: 'double', default: 0 },
    deadline: 'string?',
    createdAt: 'string',
  },
};

const TaskSchema = {
  name: 'tasks',
  primaryKey: 'id',
  properties: {
    id: 'string',
    shortGoalId: 'string',
    name: 'string',
    daysOfWeek: 'string',
    minimumEffortRule: 'string?',
    createdAt: 'string',
  },
};

const TaskLogSchema = {
  name: 'task_logs',
  primaryKey: 'id',
  properties: {
    id: 'string',
    taskId: 'string',
    date: 'string',
    completed:  { type: 'bool', default: false },
    note: 'string?',
    createdAt: 'string',
  },
};

const RewardRuleSchema = {
  name: 'reward_rules',
  primaryKey: 'id',
  properties: {
    id: 'string',
    taskId: 'string',
    condition: 'string',
    reward: 'string',
    createdAt: 'string',
  },
};

const PunishmentRuleSchema = {
  name: 'punishment_rules',
  primaryKey: 'id',
  properties: {
    id: 'string',
    taskId: 'string',
    condition: 'string',
    punishment: 'string',
    createdAt: 'string',
  },
};

const BreakDaySchema = {
  name: 'break_days',
  primaryKey: 'id',
  properties: {
    id: 'string',
    date: 'string',
    reason: 'string?',
    createdAt: 'string',
  },
};

const TaskAlarmSchema = {
  name: 'task_alarms',
  primaryKey: 'id',
  properties: {
    id: 'string',
    taskId: 'string',
    dayOfWeek:'string',
    time: 'string',
    enabled: { type: 'bool', default: true },
    isCritical: { type: 'bool', default: false },
    createdAt: 'string',
  },
};

const AlarmSettingsSchema = {
  name: 'alarm_settings',
  primaryKey: 'taskId',
  properties: {
    taskId: 'string',
    ringDuration: { type: 'int', default: 120 },
    snoozeDuration: { type: 'int', default: 120 },
    requireBrainGame: { type: 'bool', default: true },
    motivationType: 'string?',
    motivationSource: 'string?',
    createdAt: 'string',
  },
};

const BrainGameLogSchema = {
  name: 'brain_game_logs',
  primaryKey: 'id',
  properties: {
    id: 'string',
    taskId: 'string',
    gameType: 'string',
    solved: { type: 'bool', default: false },
    duration: 'int?',
    createdAt: 'string',
  },
};

/* --------------------------------------------------
   DELETE DATABASE (RESET REALM)
-------------------------------------------------- */

export const deleteDatabase = async () => {
  try {
    if (realm && !realm.isClosed) {
      realm.close();
    }
    realm = null;

    // ⚠️ Deletes default.realm + .lock + .management
    Realm.deleteFile({ schema: [] });

    console.log('[Database] Realm database deleted');
  } catch (err) {
    console.error('[Database] Failed to delete Realm:', err);
  }
};

/* --------------------------------------------------
   INIT DATABASE
-------------------------------------------------- */

export const initDatabase = async () => {
  if (realm) return getDatabase();

  /**
   * 🔥 DEV ONLY RESET
   * Uncomment this while migrating / debugging
   * ❌ DO NOT keep enabled in production
   */
  // try{ 
  //   console.log("DELETING DB")
  //   await deleteDatabase();
  //   console.log("DB DELETED")
  // }catch(e){
  //   console.error('DB Deletion error:', e)
  // };

  realm = await Realm.open({
    schema: [
      UserSchema,
      LongGoalSchema,
      ShortGoalSchema,
      TaskSchema,
      TaskLogSchema,
      RewardRuleSchema,
      PunishmentRuleSchema,
      BreakDaySchema,
      TaskAlarmSchema,
      AlarmSettingsSchema,
      BrainGameLogSchema,
    ],
    schemaVersion: 1,
  });

  console.log('[Database] Realm initialized');
  return getDatabase();
};

/* --------------------------------------------------
   SQLITE-COMPATIBLE API
-------------------------------------------------- */
export const getRealm = () => {
  if (!realm) {
    throw new Error(
      'Realm not initialized. Call initDatabase() first.'
    );
  }
  return realm;
}


export const getDatabase = () => {
  if (!realm) throw new Error('Database not initialized');

  return {
    raw: realm,

    runAsync: async (fn) => {
      realm.write(fn);
    },

    getAllAsync: async (collection, query = null, ...args) => {
      let results = realm.objects(collection);
      if (query) results = results.filtered(query, ...args);
      return JSON.parse(JSON.stringify(results));
    },

    getFirstAsync: async (collection, query = null, ...args) => {
      const rows = await getDatabase().getAllAsync(
        collection,
        query,
        ...args
      );
      return rows.length ? rows[0] : null;
    },

    withTransactionAsync: async (callback) => {
      realm.write(() => {
        callback(getDatabase());
      });
    },
  };
};
