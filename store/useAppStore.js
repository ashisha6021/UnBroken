import { create } from 'zustand';
import { initDatabase } from '../storage/database';
import {
  getUser,
  saveUser,
  getLongGoals,
  getShortGoals,
  getTasks,
} from '../storage/storage-sqlite';
import { calculateStreak } from '../utils/streak';
import { calculateTodayProgress } from '../service/progressService';

let isInitializing = false;
let initPromise = null;

export const useAppStore = create((set, get) => ({
  // --------------------
  // STATE
  // --------------------
  user: null,
  longGoals: [],
  shortGoals: [],
  tasks: [],
  todayProgress: null,
  streak: null,
  isLoading: true,
  taskAlarms: {},        // taskId -> alarms[]
  alarmSettings: {},    // taskId -> settings

  // --------------------
  // INITIALIZATION
  // --------------------
  initializeApp: async () => {
    console.log('[Store] initializeApp called');
    if (isInitializing && initPromise) {
      return initPromise;
    }

    isInitializing = true;
    set({ isLoading: true });

    initPromise = (async () => {
      try {
        // 1️⃣ Init DB
        await initDatabase();

        // 2️⃣ Load or create user
        let user = await getUser();
        if (!user) {
          user = {
            id: Date.now().toString(),
            name: 'Champ',
            createdAt: new Date().toISOString(),
            hasCompletedSetup: false,
          };
          await saveUser(user);
        }

        // Normalize boolean
        user.hasCompletedSetup =
          user.hasCompletedSetup === true || user.hasCompletedSetup === 1;

        // 3️⃣ Load all data
        const [longGoals, shortGoals, tasks, todayProgress, streak] =
          await Promise.all([
            getLongGoals(),
            getShortGoals(),
            getTasks(),
            calculateTodayProgress(),
            calculateStreak(),
          ]);

        // 4️⃣ Set store
        set({
          user,
          longGoals,
          shortGoals,
          tasks,
          todayProgress,
          streak,
          isLoading: false,
        });

        isInitializing = false;
        initPromise = null;
      } catch (error) {
        console.error('[Store] Initialization error:', error);
        isInitializing = false;
        initPromise = null;
        set({ isLoading: false });
      }
    })();

    return initPromise;
  },

  // --------------------
  // REFRESH DATA
  // --------------------
  refreshData: async () => {
    try {
      const [longGoals, shortGoals, tasks, todayProgress, streak] =
        await Promise.all([
          getLongGoals(),
          getShortGoals(),
          getTasks(),
          calculateTodayProgress(),
          calculateStreak(),
        ]);

      set({
        longGoals,
        shortGoals,
        tasks,
        todayProgress,
        streak,
      });
    } catch (error) {
      console.error('[Store] Refresh error:', error);
    }
  },

  // --------------------
  // USER
  // --------------------
  setUser: (user) => set({ user }),
  /* ✅ Update user name + persist */
updateUserName: async (newName) => {
  const currentUser = get().user;
  if (!currentUser) return;

  const updatedUser = {
    ...currentUser,
    name: newName,
  };

  // Save to SQLite
  await saveUser(updatedUser);

  // Update Zustand state
  set({ user: updatedUser });
},
  // --------------------
  // LONG GOALS
  // --------------------
  addLongGoal: (goal) =>
    set((state) => ({
      longGoals: [...state.longGoals, goal],
    })),

  updateLongGoal: (updatedGoal) =>
    set((state) => ({
      longGoals: state.longGoals.map((g) =>
        g.id === updatedGoal.id ? { ...g, ...updatedGoal } : g
      ),
    })),

  // --------------------
  // SHORT GOALS
  // --------------------
  addShortGoal: (goal) =>
    set((state) => ({
      shortGoals: [...state.shortGoals, goal],
    })),

  updateShortGoal: (updatedGoal) =>
    set((state) => ({
      shortGoals: state.shortGoals.map((g) =>
        g.id === updatedGoal.id
          ? {
              ...g,            // keep createdAt, completionPercentage
              ...updatedGoal,  // override edited fields
            }
          : g
      ),
    })),

  deleteShortGoal: (goalId) =>
    set((state) => ({
      shortGoals: state.shortGoals.filter((g) => g.id !== goalId),
    })),

  // --------------------
  // TASKS
  // --------------------
  addTask: (task) =>
    set((state) => ({
      tasks: [...state.tasks, task],
    })),

  updateTask: (updatedTask) =>
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === updatedTask.id ? { ...t, ...updatedTask } : t
      ),
    })),

    // --------------------
  // TASK ALARMS (UI STATE ONLY)
  // --------------------

  setTaskAlarms: (taskId, alarms) =>
    set((state) => ({
      taskAlarms: {
        ...state.taskAlarms,
        [taskId]: alarms,
      },
    })),

  addTaskAlarm: (taskId, alarm) =>
    set((state) => ({
      taskAlarms: {
        ...state.taskAlarms,
        [taskId]: [
          ...(state.taskAlarms[taskId] || []),
          alarm,
        ],
      },
    })),

  updateTaskAlarm: (taskId, updatedAlarm) =>
  set((state) => ({
    taskAlarms: {
      ...state.taskAlarms,
      [taskId]: (state.taskAlarms[taskId] || []).map((a) =>
        a.id === updatedAlarm.id ? { ...a, ...updatedAlarm } : a
      ),
    },
  })),


  deleteTaskAlarm: (taskId, alarmId) =>
  set((state) => ({
    taskAlarms: {
      ...state.taskAlarms,
      [taskId]: (state.taskAlarms[taskId] || []).filter(
        (a) => a.id !== alarmId
      ),
    },
  })),


     // --------------------
  // ALARM SETTINGS (UI STATE ONLY)
  // --------------------

  setAlarmSettings: (taskId, settings) =>
    set((state) => ({
      alarmSettings: {
        ...state.alarmSettings,
        [taskId]: settings,
      },
    })),
}));


 