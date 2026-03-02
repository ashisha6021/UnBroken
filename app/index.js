import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { getDailyQuote } from '../utils/quoteService';

import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../constants/theme';
import ScreenWrapper from '../components/ScreenWrapper';
import { getDisplayName } from "../utils/name";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getRandomQuote, MOTIVATIONAL_QUOTES } from '../utils/quotes';


export default function HomeScreen({ navigation }) {

  if (global.__ALARM_ACTIVE__) {
    return null;
  }

  const { user, isLoading, streak } = useAppStore();

  const [quote, setQuote] = useState('');
  const [usedQuotes, setUsedQuotes] = useState([]);

  useEffect(() => {

    const loadQuote = async () => {

      const savedQuote = await AsyncStorage.getItem("DAILY_QUOTE");
      const savedDate = await AsyncStorage.getItem("DAILY_QUOTE_DATE");
      const today = new Date().toDateString();

      // ✅ Same day → use saved instantly
      if (savedQuote && savedDate === today) {
        setQuote(savedQuote);
        return;
      }

      // ✅ First time OR new day → show local immediately
      const localQuote = getRandomQuote();
      setQuote(localQuote);

      // 🌐 Background upgrade (API if needed)
      const apiQuote = await getDailyQuote();

      if (apiQuote) {
        setQuote(apiQuote);
      }
    };

    loadQuote();

  }, []);

  // 🔥 Smart No-Repeat Generator
  const getNewQuote = () => {
    const remaining = MOTIVATIONAL_QUOTES.filter(q => !usedQuotes.includes(q));

    if (remaining.length === 0) {
      setUsedQuotes([]);
      return MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];
    }

    const newQuote = remaining[Math.floor(Math.random() * remaining.length)];
    setUsedQuotes(prev => [...prev, newQuote]);
    return newQuote;
  };

  // 🔁 Change Quote Handler
  const handleChangeQuote = async () => {
    const newQuote = getNewQuote();
    setQuote(newQuote);

    await AsyncStorage.setItem("DAILY_QUOTE", newQuote);
    await AsyncStorage.setItem("DAILY_QUOTE_DATE", new Date().toDateString());
  };

  const handleLogProgress = () => {
    const hasCompletedSetup = user?.hasCompletedSetup === true;
    if (!user || !hasCompletedSetup) {
      navigation.navigate('Setup');
    } else {
      navigation.navigate('Log');
    }
  };

  if (isLoading === true) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ActivityIndicator size="large" color={COLORS.accent} />
      </SafeAreaView>
    );
  }

  const userName = getDisplayName(user?.name);
  const hasCompletedSetup = user?.hasCompletedSetup === true;

  return (
    <ScreenWrapper>
     <SafeAreaView edges={['top']} style={styles.container}>

          {/* 🔥 Help Button */}
          <TouchableOpacity
            style={styles.helpButton}
            activeOpacity={0.8}
            onPress={() => navigation.navigate("User Guide")}
          >
            <Text style={styles.helpIcon}>?</Text>
          </TouchableOpacity>

          <View style={styles.content}>

          <Text style={styles.greeting}>HEY {userName.toUpperCase()}</Text>

          <View style={styles.quoteContainer}>
            <Text style={styles.quote}>{quote}</Text>
          </View>
          <TouchableOpacity
  style={styles.refreshQuoteButton}
  onPress={handleChangeQuote}
  activeOpacity={0.7}
>
  <Text style={styles.refreshQuoteText}>↻ Refresh Quote</Text>
</TouchableOpacity>
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

    marginBottom:0,

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
  changeQuoteButton: {
  marginTop: SPACING.md,
  paddingVertical: 8,
  paddingHorizontal: 16,
  borderRadius: BORDER_RADIUS.full,
  backgroundColor: COLORS.surface,
  borderWidth: 1,
  borderColor: COLORS.borderLight,
  alignItems:"center"
},

changeQuoteText: {
  fontSize: 12,
  fontWeight: "6000",
  color: COLORS.accent,
  letterSpacing: 0,
},
/* ============================
   HELP BUTTON (Premium Floating)
============================ */

helpButton: {
  position: "absolute",
  top: 20,
  right: 20,
  width: 42,
  height: 42,
  borderRadius: 21,
  backgroundColor: COLORS.surfaceElevated,
  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.15)",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 10,

  shadowColor: "#000",
  shadowOpacity: 0.4,
  shadowRadius: 10,
  elevation: 8,
},

helpIcon: {
  fontSize: 18,
  fontWeight: "900",
  color: COLORS.accent,
},
refreshQuoteButton: {
  alignSelf: "center",
  marginTop: SPACING.xs,
  paddingVertical:5,
  paddingHorizontal: 16,
  borderRadius: 21,
  backgroundColor: COLORS.surfaceElevated,
  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.15)",
  marginBottom:SPACING.xl,
},

refreshQuoteText: {
  fontSize: 13,
  fontWeight: "600",
  color: COLORS.textMuted,
  letterSpacing: 0.5,
},
});





