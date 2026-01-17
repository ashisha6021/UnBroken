import { Stack } from 'expo-router';
import { useEffect, useState, useMemo } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useAppStore } from '../store/useAppStore';
import { StatusBar } from 'expo-status-bar';
import { COLORS } from '../constants/theme';

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
  const initializeApp = useAppStore((state) => state.initializeApp);
  const isLoading = useAppStore((state) => state.isLoading);
  const [isInitialized, setIsInitialized] = useState(false);

  // ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL RETURNS
  // Use functions for options to ensure type stability - React Navigation supports both
  // Functions are called fresh each time, avoiding any potential type conversion issues
  const getIndexOptions = useMemo(() => () => ({ 
    headerShown: false 
  }), []);
  const getSetupIndexOptions = useMemo(() => () => ({ 
    title: 'Setup', 
    headerShown: true,
    headerStyle: { backgroundColor: '#000000' },
    headerTintColor: '#FFFFFF',
    headerTitleStyle: { fontWeight: '600' },
    contentStyle: { backgroundColor: '#000000' },
  }), []);
  const getSetupNameOptions = useMemo(() => () => ({ 
    title: 'Your Name', 
    headerShown: true,
    headerStyle: { backgroundColor: '#000000' },
    headerTintColor: '#FFFFFF',
    headerTitleStyle: { fontWeight: '600' },
    contentStyle: { backgroundColor: '#000000' },
  }), []);
  const getSetupLongGoalsOptions = useMemo(() => () => ({ 
    title: 'Long-Term Goals', 
    headerShown: true,
    headerStyle: { backgroundColor: '#000000' },
    headerTintColor: '#FFFFFF',
    headerTitleStyle: { fontWeight: '600' },
    contentStyle: { backgroundColor: '#000000' },
  }), []);
  const getSetupShortGoalsOptions = useMemo(() => () => ({ 
    title: 'Short-Term Goals', 
    headerShown: true,
    headerStyle: { backgroundColor: '#000000' },
    headerTintColor: '#FFFFFF',
    headerTitleStyle: { fontWeight: '600' },
    contentStyle: { backgroundColor: '#000000' },
  }), []);
  const getSetupTasksOptions = useMemo(() => () => ({ 
    title: 'Tasks', 
    headerShown: true,
    headerStyle: { backgroundColor: '#000000' },
    headerTintColor: '#FFFFFF',
    headerTitleStyle: { fontWeight: '600' },
    contentStyle: { backgroundColor: '#000000' },
  }), []);
  const getLogIndexOptions = useMemo(() => () => ({ 
    title: 'Log Progress', 
    headerShown: true,
    headerStyle: { backgroundColor: '#000000' },
    headerTintColor: '#FFFFFF',
    headerTitleStyle: { fontWeight: '600' },
    contentStyle: { backgroundColor: '#000000' },
  }), []);
  const getResultIndexOptions = useMemo(() => () => ({ 
    headerShown: false 
  }), []);
  const getCelebrationIndexOptions = useMemo(() => () => ({ 
    headerShown: false 
  }), []);
  const getSettingsIndexOptions = useMemo(() => () => ({ 
    title: 'Settings', 
    headerShown: true,
    headerStyle: { backgroundColor: '#000000' },
    headerTintColor: '#FFFFFF',
    headerTitleStyle: { fontWeight: '600' },
    contentStyle: { backgroundColor: '#000000' },
  }), []);
  const getSettingsRulesOptions = useMemo(() => () => ({ 
    title: 'Rules', 
    headerShown: true,
    headerStyle: { backgroundColor: '#000000' },
    headerTintColor: '#FFFFFF',
    headerTitleStyle: { fontWeight: '600' },
    contentStyle: { backgroundColor: '#000000' },
  }), []);
  const getStreakIndexOptions = useMemo(() => () => ({ 
    title: 'Streak Calendar', 
    headerShown: true,
    headerStyle: { backgroundColor: '#000000' },
    headerTintColor: '#FFFFFF',
    headerTitleStyle: { fontWeight: '600' },
    contentStyle: { backgroundColor: '#000000' },
  }), []);

  useEffect(() => {
    console.log('[RootLayout] Component mounted, initializing app...');
    const init = async () => {
      try {
        await initializeApp();
        console.log('[RootLayout] Initialization complete');
        setIsInitialized(true);
      } catch (error) {
        console.error('[RootLayout] Initialization error:', error);
        setIsInitialized(true); // Still show app even if init fails
      }
    };
    init();
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
          name="settings/index" 
          options={getSettingsIndexOptions} 
        />
        <Stack.Screen 
          name="settings/rules" 
          options={getSettingsRulesOptions} 
        />
        <Stack.Screen 
          name="streak/index" 
          options={getStreakIndexOptions} 
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
