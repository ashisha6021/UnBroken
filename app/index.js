import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { getRandomQuote } from '../utils/quotes';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../constants/theme';

export default function HomeScreen() {
  console.log('[HomeScreen] Component rendering...');
  
  const router = useRouter();
  const { user, isLoading, initializeApp, streak } = useAppStore();
  const [quote, setQuote] = useState('');

  useEffect(() => {
    console.log('[HomeScreen] useEffect running...');
    setQuote(getRandomQuote());
    // Don't call initializeApp here - it's already called in _layout.js
  }, []);

  // Log all values to check for string booleans
  console.log('[HomeScreen] isLoading type:', typeof isLoading, 'value:', isLoading);
  console.log('[HomeScreen] user:', user ? { ...user, hasCompletedSetup: user.hasCompletedSetup, hasCompletedSetupType: typeof user?.hasCompletedSetup } : 'null');
  console.log('[HomeScreen] streak:', streak);

  const handleLogProgress = () => {
    // Ensure hasCompletedSetup is a boolean - use strict comparison
    const hasCompletedSetup = user?.hasCompletedSetup === true;
    if (!user || !hasCompletedSetup) {
      router.push('/setup');
    } else {
      router.push('/log');
    }
  };

  // Ensure isLoading is always a boolean - use strict comparison
  const isLoadingBool = isLoading === true;
  console.log('[HomeScreen] isLoadingBool:', isLoadingBool, 'type:', typeof isLoadingBool);
  
  if (isLoadingBool === true) {
    console.log('[HomeScreen] Rendering loading screen...');
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ActivityIndicator size="large" color={COLORS.accent} />
      </SafeAreaView>
    );
  }

  console.log('[HomeScreen] Rendering main screen...');

  const userName = user?.name || 'Champ';
  // Use strict boolean conversion
  const hasCompletedSetup = user?.hasCompletedSetup === true;
  
  console.log('[HomeScreen] hasCompletedSetup:', hasCompletedSetup, 'type:', typeof hasCompletedSetup);
  console.log('[HomeScreen] About to render main content...');

  try {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.content}>
          <Text style={styles.greeting}>HEY {userName.toUpperCase()}</Text>
          
          <View style={styles.quoteContainer}>
            <Text style={styles.quote}>{quote}</Text>
          </View>

          {hasCompletedSetup && streak && (
          <View style={styles.streakContainer}>
            <Text style={styles.streakLabel}>Current Streak</Text>
            <Text style={styles.streakValue}>{streak.currentStreak || 0} days</Text>
            <TouchableOpacity
              style={styles.viewCalendarButton}
              onPress={() => router.push('/streak')}
            >
              <Text style={styles.viewCalendarText}>View Calendar</Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity 
          style={styles.ctaButton}
          onPress={handleLogProgress}
          activeOpacity={0.8}
        >
          <Text style={styles.ctaText}>LET'S LOG TODAY'S PROGRESS</Text>
        </TouchableOpacity>

          {hasCompletedSetup && (
            <TouchableOpacity 
              style={styles.settingsButton}
              onPress={() => router.push('/settings')}
              activeOpacity={0.8}
            >
              <Text style={styles.settingsButtonText}>SETTINGS</Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    );
  } catch (error) {
    console.error('[HomeScreen] Error rendering:', error);
    console.error('[HomeScreen] Error stack:', error.stack);
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Text style={styles.greeting}>Error: {error.message}</Text>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  greeting: {
    ...TYPOGRAPHY.h1,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xl,
    textAlign: 'center',
  },
  quoteContainer: {
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.xxl,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  quote: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  ctaButton: {
    backgroundColor: COLORS.accent,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: BORDER_RADIUS.md,
    width: '100%',
    alignItems: 'center',
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  ctaText: {
    ...TYPOGRAPHY.button,
    color: COLORS.background,
    textTransform: 'uppercase',
  },
  settingsButton: {
    marginTop: SPACING.md,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  settingsButtonText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
  },
  streakContainer: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    width: '100%',
  },
  streakLabel: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  streakValue: {
    ...TYPOGRAPHY.h2,
    color: COLORS.accent,
    marginBottom: SPACING.sm,
  },
  viewCalendarButton: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
  },
  viewCalendarText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.accent,
    textDecorationLine: 'underline',
  },
});
