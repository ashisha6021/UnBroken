import { Stack } from 'expo-router';
import { useEffect, useState, useMemo } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useAppStore } from '../store/useAppStore';
import { StatusBar } from 'expo-status-bar';
import { COLORS } from '../constants/theme';
import { getLongGoals } from '../storage/storage-sqlite';
import { setupAlarmChannels1} from '../alarm1/alarmScheduler123';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';

// Define screen options as constants to ensure proper boolean types
// Using Object.freeze to prevent any modifications
const INDEX_OPTIONS = Object.freeze({ headerShown: false });
const SETUP_INDEX_OPTIONS = Object.freeze({ title: 'Setup', headerShown: true });
const SETUP_NAME_OPTIONS = Object.freeze({ title: 'Your Name', headerShown: true });
const SETUP_LONG_GOALS_OPTIONS = Object.freeze({ title: 'Long-Term Goals', headerShown: true });
const SETUP_SHORT_GOALS_OPTIONS = Object.freeze({ title: 'Short-Term Goals', headerShown: true });
const SETUP_TASKS_OPTIONS = Object.freeze({ title: 'Tasks', headerShown: true });
const LOG_INDEX_OPTIONS = Object.freeze({ title: 'Log Progress', headerShown: true });
const RESULT_INDEX_OPTIONS = Object.freeze({ headerShown: false });
const CELEBRATION_INDEX_OPTIONS = Object.freeze({ headerShown: false });
const SETTINGS_INDEX_OPTIONS = Object.freeze({ title: 'Settings', headerShown: true });
const SETTINGS_RULES_OPTIONS = Object.freeze({ title: 'Rules', headerShown: true });
const STREAK_INDEX_OPTIONS = Object.freeze({ title: 'Streak Calendar', headerShown: true });

export default function RootLayout() {
  const router = useRouter();

  const initializeApp = useAppStore((state) => state.initializeApp);
  const isLoading = useAppStore((state) => state.isLoading);
  const [isInitialized, setIsInitialized] = useState(false);
  const COMPACT_HEADER = {
  headerShown: true,

  headerStyle: {
    backgroundColor: '#000000',
  },

  headerTintColor: '#FFFFFF',

  // 🔥 THIS is what shrinks the header visually
  headerTitleStyle: {
    fontSize: 20,       // smaller title
    fontWeight: '500',
  },

  // 🔥 Reduce vertical padding around back arrow
  headerLeftContainerStyle: {
    paddingVertical: 2,
  },

  headerTitleAlign: 'left',

  contentStyle: {
    backgroundColor: '#000000',
  },
};


  // ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL RETURNS
  // Use functions for options to ensure type stability - React Navigation supports both
  // Functions are called fresh each time, avoiding any potential type conversion issues
  const getIndexOptions = useMemo(() => () => ({ 
    headerShown: false 
  }), []);
    const getRingingOptions = useMemo(() => () => ({ 
    headerShown: false 
  }), []);
  const getSettingsIndexOptions = useMemo(() => () => ({ 
    ...COMPACT_HEADER,
    title: 'Settings', 
    
  }), []);
  const getSettingsRulesOptions = useMemo(() => () => ({ 
    ...COMPACT_HEADER,
    title: 'Rules', 
    
  }), []); 
    const getLongList = useMemo(() => () => ({ 
      ...COMPACT_HEADER,    
      title: 'Long-Term Goals List', 
    
    
  }), []);
     const getShortList = useMemo(() => () => ({ 
      ...COMPACT_HEADER,
    title: 'Short-Term Goals List', 
    
  }), []);
  const getSetupIndexOptions = useMemo(() => () => ({ 
    ...COMPACT_HEADER,
    title: 'Setup', 
    
    
  }), []);
  const getSetupNameOptions = useMemo(() => () => ({ 
    ...COMPACT_HEADER,
    title: 'Your Name', 
  
  }), []);
  const getSetupLongGoalsOptions = useMemo(() => () => ({ 
    ...COMPACT_HEADER,
    title: 'Long-Term Goals', 
   
  }), []);
  const getSetupShortGoalsOptions = useMemo(() => () => ({ 
    ...COMPACT_HEADER,
    title: 'Short-Term Goals', 
    
  }), []);
  const getSetupTasksOptions = useMemo(() => () => ({ 
    ...COMPACT_HEADER,
    title: 'Tasks', 
    
  }), []);
  const getLogIndexOptions = useMemo(() => () => ({ 
    ...COMPACT_HEADER,
    title: 'Log Progress', 
    
  }), []);
  const getResultIndexOptions = useMemo(() => () => ({ 
    headerShown: false 
  }), []);
  const getCelebrationIndexOptions = useMemo(() => () => ({ 
    headerShown: false 
  }), []);
  
  const getStreakIndexOptions = useMemo(() => () => ({
    ...COMPACT_HEADER, 
    title: 'Streak Calendar', 
   
  }), []);
  
  const getAlarmoptions = useMemo(() => () => ({
    ...COMPACT_HEADER,
          title: 'Alarms', 
         
        }), []);


    const getAlarmsettingoptions = useMemo(() => () => ({
      ...COMPACT_HEADER,
          title: 'Alarm Setting', 
        
        }), []);
        
  useEffect(() => {
    console.log('[RootLayout] Component mounted, initializing app...');
    const init = async () => {
      try {
        await initializeApp();
         // 🔔 SETUP ANDROID ALARM CHANNELS (ONCE)
        await setupAlarmChannels1();

        console.log('[RootLayout] Initialization and Alarm Channels Setup Complete');
        setIsInitialized(true);
      } catch (error) {
        console.error('[RootLayout] Initialization error:', error);
        setIsInitialized(true); // Still show app even if init fails
      }
    };
    init();
  }, []);
  


  useEffect(() => {
  const subscription =
    Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data =
          response.notification.request.content.data;

        if (!data?.alarmId) return;

        console.log('[Notification Tap]', data);

        router.push({
          pathname: '/alarms-setter/ringing123',
          params: {
            alarmId: data.alarmId,
            taskId: data.taskId,
            dayOfWeek: data.dayOfWeek,
            time: data.time,
            isCritical: String(data.isCritical),
            requireBrainGame: String(data.requireBrainGame),
            snoozeDuration: String(data.snoozeDuration),
          },
        });
      }
    );

  return () => subscription.remove();
}, []);

  console.log('[RootLayout] Rendering layout... isLoading:', isLoading, 'isInitialized:', isInitialized);

  // Don't render Stack until initialization attempt is complete to avoid pre-allocation errors
  // Once isInitialized is true, we can render Stack even if isLoading is still true
  // (the individual screens will handle their own loading states)
  if (!isInitialized) {
    console.log('[RootLayout] Not initialized yet, showing loading screen...');
    return (
      <>
        <StatusBar style="light" />
        <View style={{ flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={COLORS.accent} />
        </View>
      </>
    );
  }
  
  console.log('[RootLayout] Initialized, rendering Stack. isLoading:', isLoading);

  // Verify all option types before rendering
  console.log('[RootLayout] Verifying screen option types...');
  console.log('[RootLayout] INDEX_OPTIONS.headerShown:', INDEX_OPTIONS.headerShown, 'type:', typeof INDEX_OPTIONS.headerShown);
  console.log('[RootLayout] SETUP_INDEX_OPTIONS.headerShown:', SETUP_INDEX_OPTIONS.headerShown, 'type:', typeof SETUP_INDEX_OPTIONS.headerShown);

  try {
    console.log('[RootLayout] About to render Stack with screens...');
    const testOptions = getIndexOptions();
    console.log('[RootLayout] getIndexOptions().headerShown:', testOptions.headerShown, 'type:', typeof testOptions.headerShown);
    
    // Use functions for options to ensure type stability
    // Functions return fresh objects each time, avoiding type conversion issues
    // Try minimal configuration first - only essential screens
    return (
      <>
        <StatusBar style="light" />
        <Stack>
        <Stack.Screen 
          name="index" 
          options={getIndexOptions} 
        />
        <Stack.Screen 
          name="setup/index" 
          options={getSetupIndexOptions} 
        />
        <Stack.Screen 
          name="setup/name" 
          options={getSetupNameOptions} 
        />
        <Stack.Screen 
          name="setup/long-goals" 
          options={getSetupLongGoalsOptions} 
        />
        <Stack.Screen 
          name="setup/short-goals" 
          options={getSetupShortGoalsOptions} 
        />
        <Stack.Screen 
          name="setup/tasks" 
          options={getSetupTasksOptions} 
        />
        <Stack.Screen 
          name="log/index" 
          options={getLogIndexOptions} 
        />
        <Stack.Screen 
          name="result/index" 
          options={getResultIndexOptions} 
        />
        <Stack.Screen 
          name="celebration/index" 
          options={getCelebrationIndexOptions} 
        />
        <Stack.Screen 
          name="streak/index" 
          options={getStreakIndexOptions} 
        />
          <Stack.Screen 
        name="settings/index" 
        options={getSettingsIndexOptions} 
      />
    
      <Stack.Screen 
        name="settings/long-goals-list" 
        options={getLongList} 
      />
      <Stack.Screen 
        name="settings/short-goals-list" 
        options={getShortList} 
      />
      <Stack.Screen 
        name="settings/rules" 
        options={getSettingsRulesOptions} 
      />
      <Stack.Screen 
        name="alarms-setter/index" 
        options={getAlarmoptions} 
      />
      <Stack.Screen 
        name="alarms-setter/alarmsetting1" 
        options={getAlarmsettingoptions} 
      />
      <Stack.Screen 
        name="alarms-setter/ringing123" 
        options={getRingingOptions} 
      />
        </Stack>
      </>
    );
  } catch (error) {
    console.error('[RootLayout] Error rendering:', error);
    console.error('[RootLayout] Error stack:', error.stack);
    // Return minimal layout on error
    return (
      <>
        <StatusBar style="light" />
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
        </Stack>
      </>
    );
  }
}
