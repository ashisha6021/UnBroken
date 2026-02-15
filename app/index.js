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
            <Text style={styles.settingsButtonText}>SETTINGS</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
    </ScreenWrapper> 
  );
}


const styles = StyleSheet.create({
  /* ============================
     SCREEN BASE
  ============================ */

  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    paddingHorizontal: SPACING.xl,
  },

  content: {
    width: "100%",
    maxWidth: 420,
    alignSelf: "center",
    alignItems: "center",
  },

  /* ============================
     GREETING
  ============================ */

  greeting: {
    fontSize: 38,
    fontWeight: "900",
    color: COLORS.textPrimary,
    letterSpacing: 1,
    marginBottom: SPACING.lg,
    textAlign: "center",
  },

  /* ============================
     QUOTE CARD (Premium Glass)
  ============================ */

  quoteContainer: {
    width: "100%",
    backgroundColor: COLORS.surfaceElevated,
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,

    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",

    marginBottom: SPACING.xl,

    shadowColor: "#000",
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },

  quote: {
    fontSize: 16,
    fontWeight: "500",
    color: COLORS.textPrimary,
    textAlign: "center",
    fontStyle: "italic",
    lineHeight: 24,
    opacity: 0.9,
  },

  /* ============================
     STREAK CARD (Premium Highlight)
  ============================ */

  streakContainer: {
    width: "100%",
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: BORDER_RADIUS.xl,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.lg,

    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",

    alignItems: "center",
    marginBottom: SPACING.xl,

    shadowColor: "#000",
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 5,
  },

  streakLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.textMuted,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: SPACING.xs,
  },

  streakValue: {
    fontSize: 36,
    fontWeight: "900",
    color: COLORS.accent,
    marginBottom: SPACING.sm,
  },

  /* View Calendar Button (Small Premium Pill) */
  viewCalendarButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: BORDER_RADIUS.full,

    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },

  viewCalendarText: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.accent,
    letterSpacing: 0.5,
  },

  /* ============================
     MAIN CTA BUTTONS (Premium)
  ============================ */

  ctaButton: {
    width: "100%",
    paddingVertical: 18,
    borderRadius: BORDER_RADIUS.full,
    alignItems: "center",
    justifyContent: "center",

    marginTop: SPACING.md,

    backgroundColor: COLORS.accent,

    shadowColor: COLORS.accent,
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 10,
  },

  ctaText: {
    fontSize: 14,
    fontWeight: "900",
    color: COLORS.background,
    letterSpacing: 1,
    textTransform: "uppercase",
  },

  /* ============================
     SECONDARY BUTTON (Settings Premium)
  ============================ */

  settingsButton: {
    width: "100%",
    paddingVertical: 16,
    borderRadius: BORDER_RADIUS.full,
    alignItems: "center",
    justifyContent: "center",

    marginTop: SPACING.md,

    backgroundColor: COLORS.surfaceElevated,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },

  settingsButtonText: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.background,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
});





