import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { getRandomQuote } from '../utils/quotes';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../constants/theme';
import { scheduleDebugAlarm } from '../alarm1/alarmScheduler123';
import ScreenWrapper from '../components/ScreenWrapper';


export default function HomeScreen({ navigation }) {

  if (global.__ALARM_ACTIVE__) {
  return null; // ⛔ DO NOT render anything
}
  console.log('[HomeScreen] Component rendering...');

  const { user, isLoading, streak } = useAppStore();
  const [quote, setQuote] = useState('');

  useEffect(() => {
    console.log('[HomeScreen] useEffect running...');
    setQuote(getRandomQuote());
    // initializeApp is now called in App.js (native root)
  }, []);
  // console.log("SCHEDULING DEBUG ALaRM") 
  // scheduleDebugAlarm()
  // console.log("DEBUG ALaRM SET")
  console.log('[HomeScreen] isLoading:', isLoading);
  console.log('[HomeScreen] user:', user);
  console.log('[HomeScreen] streak:', streak);

  const handleLogProgress = () => {
    const hasCompletedSetup = user?.hasCompletedSetup === true;
    if (!user || !hasCompletedSetup) {
      navigation.navigate('Setup');
    } else {
      navigation.navigate('Log');
    }
  };

  if (isLoading === true) {
    console.log('[HomeScreen] Rendering loading screen...');
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ActivityIndicator size="large" color={COLORS.accent} />
      </SafeAreaView>
    );
  }

  const userName = user?.name || 'Champ';
  const hasCompletedSetup = user?.hasCompletedSetup === true;

  return (
    <ScreenWrapper>   
      <SafeAreaView edges={['top']} style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.greeting}>HEY {userName.toUpperCase()}</Text>

        <View style={styles.quoteContainer}>
          <Text style={styles.quote}>{quote}</Text>
        </View>

        {!hasCompletedSetup && (
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={() => navigation.navigate('Setup')}
            activeOpacity={0.8}
          >
            <Text style={styles.ctaText}>LET'S START OUR JOURNEY</Text>
          </TouchableOpacity>
        )}

        {hasCompletedSetup && streak && (
          <View style={styles.streakContainer}>
            <Text style={styles.streakLabel}>Current Streak</Text>
            <Text style={styles.streakValue}>{streak.currentStreak || 0} days</Text>
            <TouchableOpacity
              style={styles.viewCalendarButton}
              onPress={() => navigation.navigate('Streak')}
            >
              <Text style={styles.viewCalendarText}>View Calendar</Text>
            </TouchableOpacity>
          </View>
        )}

        {hasCompletedSetup && (
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={handleLogProgress}
            activeOpacity={0.8}
          >
            <Text style={styles.ctaText}>LET'S LOG TODAY'S PROGRESS</Text>
          </TouchableOpacity>
        )}

        {hasCompletedSetup && (
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={() => navigation.navigate('Settings')}
            activeOpacity={0.8}
          >
            <Text style={styles.ctaText}>SETTINGS</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
    </ScreenWrapper>
 
  );
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
    borderColor:COLORS.textPrimary
  },
  quote: {
    ...TYPOGRAPHY.body,
    color: COLORS.textPrimary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  ctaButton: {
    marginTop: SPACING.md,
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
    borderColor:COLORS.textPrimary
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
     borderRadius: BORDER_RADIUS.md,
     borderWidth:1,
     borderColor:COLORS.accent,
     backgroundColor: COLORS.accent
    

  },
  viewCalendarText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.background,
    
    
  },
});
