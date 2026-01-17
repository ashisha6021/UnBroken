import { create } from 'zustand';
import { initDatabase } from '../storage/database';
import { getUser, saveUser, getLongGoals, getShortGoals, getTasks } from '../storage/storage-sqlite';
import { calculateStreak } from '../utils/streak';
import { getTodayProgress } from '../utils/progress';

// Track if initialization is in progress at module level
let isInitializing = false;
let initPromise = null;

export const useAppStore = create((set, get) => ({
  // State
  user: null,
  longGoals: [],
  shortGoals: [],
  tasks: [],
  todayProgress: null,
  streak: null,
  isLoading: true,
  
  // Actions
  initializeApp: async () => {
    // If already initializing, return the existing promise
    if (isInitializing && initPromise) {
      console.log('[Store] Initialization already in progress, waiting...');
      return initPromise;
    }
    
    // Start new initialization
    isInitializing = true;
    console.log('[Store] Starting initialization...');
    set({ isLoading: true });
    
    initPromise = (async () => {
      try {
        console.log('[Store] Starting app initialization...');
        
        // Initialize SQLite database first
        await initDatabase();
        console.log('[Store] Database initialized');
        
        let user = await getUser();
        console.log('[Store] User fetched:', user ? 'exists' : 'not found');
        
        // Create default user if none exists
        if (!user) {
          user = {
            id: Date.now().toString(),
            name: 'Champ',
            createdAt: new Date().toISOString(),
            hasCompletedSetup: false,
          };
          await saveUser(user);
          console.log('[Store] Default user created');
        }
        
        // Ensure hasCompletedSetup is a boolean - convert explicitly using strict comparison
        const originalHasCompletedSetup = user.hasCompletedSetup;
        console.log('[Store] Original hasCompletedSetup:', originalHasCompletedSetup, 'type:', typeof originalHasCompletedSetup);
        
        // Convert to boolean using strict comparison
        if (typeof user.hasCompletedSetup === 'number') {
          user.hasCompletedSetup = user.hasCompletedSetup === 1;
        } else if (typeof user.hasCompletedSetup === 'string') {
          user.hasCompletedSetup = user.hasCompletedSetup === 'true' || user.hasCompletedSetup === '1';
        } else if (typeof user.hasCompletedSetup !== 'boolean') {
          user.hasCompletedSetup = user.hasCompletedSetup === true;
        }
        
        // Final check - ensure it's definitely a boolean
        user.hasCompletedSetup = user.hasCompletedSetup === true;
        console.log('[Store] Final hasCompletedSetup:', user.hasCompletedSetup, 'type:', typeof user.hasCompletedSetup);
        
        const longGoals = await getLongGoals();
        const shortGoals = await getShortGoals();
        const tasks = await getTasks();
        const todayProgress = await getTodayProgress();
        const streak = await calculateStreak();
        
        console.log('[Store] Data loaded successfully');
        console.log('[Store] Setting state with user.hasCompletedSetup:', user.hasCompletedSetup, 'type:', typeof user.hasCompletedSetup);
        
        set({
          user,
          longGoals,
          shortGoals,
          tasks,
          todayProgress,
          streak,
          isLoading: false,
        });
        
        console.log('[Store] State updated successfully');
        isInitializing = false;
        initPromise = null;
      } catch (error) {
        console.error('[Store] Error initializing app:', error);
        console.error('[Store] Error stack:', error.stack);
        // Always set loading to false even on error
        isInitializing = false;
        initPromise = null;
        set({ isLoading: false });
      }
    })();
    
    return initPromise;
  },
  
  refreshData: async () => {
    try {
      const longGoals = await getLongGoals();
      const shortGoals = await getShortGoals();
      const tasks = await getTasks();
      const todayProgress = await getTodayProgress();
      const streak = await calculateStreak();
      
      set({
        longGoals,
        shortGoals,
        tasks,
        todayProgress,
        streak,
      });
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
  },
  
  setUser: (user) => set({ user }),
  
  addLongGoal: (goal) => {
    const longGoals = [...get().longGoals, goal];
    set({ longGoals });
  },
  
  addShortGoal: (goal) => {
    const shortGoals = [...get().shortGoals, goal];
    set({ shortGoals });
  },
  
  addTask: (task) => {
    const tasks = [...get().tasks, task];
    set({ tasks });
  },
  
  updateLongGoal: (updatedGoal) => {
    const longGoals = get().longGoals.map(goal => 
      goal.id === updatedGoal.id ? updatedGoal : goal
    );
    set({ longGoals });
  },
  
  updateShortGoal: (updatedGoal) => {
    const shortGoals = get().shortGoals.map(goal => 
      goal.id === updatedGoal.id ? updatedGoal : goal
    );
    set({ shortGoals });
  },
  
  updateTask: (updatedTask) => {
    const tasks = get().tasks.map(task => 
      task.id === updatedTask.id ? updatedTask : task
    );
    set({ tasks });
  },
}));
