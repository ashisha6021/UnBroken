import * as SQLite from 'expo-sqlite';

let db = null;

// Initialize database
export const initDatabase = async () => {
  try {
    db = await SQLite.openDatabaseAsync('unbroken.db');
    
    // Create tables - execute each statement individually
    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        createdAt TEXT NOT NULL,
        hasCompletedSetup INTEGER DEFAULT 0
      )
    `);

    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS long_goals (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        completionPercentage REAL DEFAULT 0,
        deadline TEXT,
        createdAt TEXT NOT NULL
      )
    `);
    
    // Add deadline column if it doesn't exist (for existing databases)
    try {
      await db.runAsync(`ALTER TABLE long_goals ADD COLUMN deadline TEXT`);
    } catch (e) {
      // Column already exists, ignore
    }

    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS short_goals (
        id TEXT PRIMARY KEY,
        longGoalId TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        completionPercentage REAL DEFAULT 0,
        deadline TEXT,
        createdAt TEXT NOT NULL,
        FOREIGN KEY (longGoalId) REFERENCES long_goals(id)
      )
    `);
    
    // Add deadline column if it doesn't exist (for existing databases)
    try {
      await db.runAsync(`ALTER TABLE short_goals ADD COLUMN deadline TEXT`);
    } catch (e) {
      // Column already exists, ignore
    }

    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        shortGoalId TEXT NOT NULL,
        name TEXT NOT NULL,
        daysOfWeek TEXT NOT NULL,
        minimumEffortRule TEXT,
        createdAt TEXT NOT NULL,
        FOREIGN KEY (shortGoalId) REFERENCES short_goals(id)
      )
    `);

    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS task_logs (
        id TEXT PRIMARY KEY,
        taskId TEXT NOT NULL,
        date TEXT NOT NULL,
        completed INTEGER DEFAULT 0,
        note TEXT,
        createdAt TEXT NOT NULL,
        FOREIGN KEY (taskId) REFERENCES tasks(id),
        UNIQUE(taskId, date)
      )
    `);

    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS reward_rules (
        id TEXT PRIMARY KEY,
        taskId TEXT NOT NULL,
        condition TEXT NOT NULL,
        reward TEXT NOT NULL,
        createdAt TEXT NOT NULL,
        FOREIGN KEY (taskId) REFERENCES tasks(id)
      )
    `);

    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS punishment_rules (
        id TEXT PRIMARY KEY,
        taskId TEXT NOT NULL,
        condition TEXT NOT NULL,
        punishment TEXT NOT NULL,
        createdAt TEXT NOT NULL,
        FOREIGN KEY (taskId) REFERENCES tasks(id)
      )
    `);

    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS break_days (
        id TEXT PRIMARY KEY,
        date TEXT NOT NULL UNIQUE,
        reason TEXT,
        createdAt TEXT NOT NULL
      )
    `);

    // Create indexes
    await db.runAsync(`
      CREATE INDEX IF NOT EXISTS idx_task_logs_date ON task_logs(date)
    `);
    
    await db.runAsync(`
      CREATE INDEX IF NOT EXISTS idx_task_logs_taskId ON task_logs(taskId)
    `);
    
    await db.runAsync(`
      CREATE INDEX IF NOT EXISTS idx_short_goals_longGoalId ON short_goals(longGoalId)
    `);
    
    await db.runAsync(`
      CREATE INDEX IF NOT EXISTS idx_tasks_shortGoalId ON tasks(shortGoalId)
    `);

    console.log('Database initialized successfully');
    return db;
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

// Get database instance
export const getDatabase = () => {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
};
