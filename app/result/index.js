import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppStore } from '../../store/useAppStore';
// import ConfettiCannon from 'react-native-confetti-cannon';
import {
  COLORS,
  TYPOGRAPHY,
  SPACING,
  BORDER_RADIUS,
} from '../../constants/theme';

export default function ResultScreen() {
  const navigation = useNavigation();
  const { todayProgress, refreshData } = useAppStore();

  const [fadeAnim] = useState(new Animated.Value(0));
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    if (todayProgress?.completionPercentage === 100) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleContinue = async () => {
    await refreshData();

    navigation.reset({
      index: 0,
      routes: [{ name: 'Home' }], // 👈 adjust if your root screen name differs
    });
  };

  if (!todayProgress) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Loading...</Text>
      </View>
    );
  }

  const isFull = todayProgress.completionPercentage === 100;
  const isPartial =
    todayProgress.completionPercentage > 0 &&
    todayProgress.completionPercentage < 100;
  const isNone = todayProgress.completionPercentage === 0;

  return (
    <View
      style={[
        styles.container,
        isFull && styles.containerSuccess,
        isPartial && styles.containerGuilt,
        isNone && styles.containerFailure,
      ]}
    >
      {/* {showConfetti && (
        <ConfettiCannon count={200} origin={{ x: 0, y: 0 }} fadeOut />
      )} */}

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {isFull && (
          <>
            <Text style={styles.emoji}>🎯</Text>
            <Text style={styles.title}>YOU DID IT.</Text>
            <Text style={styles.subtitle}>Discipline maintained.</Text>
            <Text style={styles.message}>Day Unbroken.</Text>

            <View style={styles.statsContainer}>
              <Text style={styles.statsText}>
                {todayProgress.completedTasks} /{' '}
                {todayProgress.totalTasks} tasks completed
              </Text>
              <Text style={styles.percentage}>100%</Text>
            </View>
          </>
        )}

        {isPartial && (
          <>
            <Text style={styles.emoji}>⚠️</Text>
            <Text style={styles.titleGuilt}>YOU SHOWED UP...</Text>
            <Text style={styles.subtitleGuilt}>but you held back.</Text>
            <Text style={styles.messageGuilt}>
              Discipline was incomplete.
            </Text>

            <View style={styles.statsContainer}>
              <Text style={styles.statsTextGuilt}>
                {todayProgress.completedTasks} /{' '}
                {todayProgress.totalTasks} tasks completed
              </Text>
              <Text style={styles.percentageGuilt}>
                {todayProgress.completionPercentage}%
              </Text>
            </View>

            <Text style={styles.warningText}>
              Remember: Consistency is non-negotiable.
            </Text>
          </>
        )}

        {isNone && (
          <>
            <Text style={styles.emoji}>❌</Text>
            <Text style={styles.titleFailure}>NO PROGRESS TODAY</Text>
            <Text style={styles.subtitleFailure}>The streak is broken.</Text>
            <Text style={styles.messageFailure}>
              Get back on track tomorrow.
            </Text>

            <View style={styles.statsContainer}>
              <Text style={styles.statsTextFailure}>
                0 / {todayProgress.totalTasks} tasks completed
              </Text>
              <Text style={styles.percentageFailure}>0%</Text>
            </View>
          </>
        )}

        <TouchableOpacity
          style={[
            styles.continueButton,
            isFull && styles.continueButtonSuccess,
            isPartial && styles.continueButtonGuilt,
            isNone && styles.continueButtonFailure,
          ]}
          onPress={handleContinue}
        >
          <Text
            style={[
              styles.continueButtonText,
              isFull && styles.continueButtonTextSuccess,
            ]}
          >
            CONTINUE
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}
// --------------------
// STYLES
// --------------------
const styles = StyleSheet.create({
  /* ============================
     SCREEN BASE
  ============================ */

  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.xl,
  },

  /* ============================
     BACKGROUND STATES
  ============================ */

 containerSuccess: {
  backgroundColor: "#00B85C", // darker rich green
},


  containerGuilt: {
    backgroundColor: "#0D0D0D", // ✅ Dark Neutral Premium
  },

  containerFailure: {
    backgroundColor: "#2A0000", // ✅ Deep Premium Red
  },

  /* ============================
     CONTENT WRAPPER
  ============================ */

  content: {
    alignItems: "center",
    width: "100%",
    maxWidth: 420,
  },

  /* ============================
     EMOJI ICON
  ============================ */

emoji: {
  fontSize: 72,
  marginBottom: SPACING.lg,
  textShadowColor: "rgba(255,255,255,0.35)",
  textShadowRadius: 15,
},


  /* ============================
     TITLES
  ============================ */

  title: {
    fontSize: 34,
    fontWeight: "900",
    color: "#FFFFFF",
    textAlign: "center",
    letterSpacing: -1,
    marginBottom: SPACING.sm,
  },

  titleGuilt: {
    fontSize: 32,
    fontWeight: "900",
    color: "#FFC107",
    textAlign: "center",
    marginBottom: SPACING.sm,
  },

  titleFailure: {
    fontSize: 32,
    fontWeight: "900",
    color: "#FF3B30",
    textAlign: "center",
    marginBottom: SPACING.sm,
  },

  /* ============================
     SUBTITLES
  ============================ */

  subtitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: SPACING.xs,
    textAlign: "center",
    opacity: 0.95,
  },

  subtitleGuilt: {
    fontSize: 18,
    fontWeight: "700",
    color: "#BBBBBB",
    marginBottom: SPACING.xs,
    textAlign: "center",
  },

  subtitleFailure: {
    fontSize: 18,
    fontWeight: "700",
    color: "#BBBBBB",
    marginBottom: SPACING.xs,
    textAlign: "center",
  },

  /* ============================
     MESSAGES
  ============================ */

  message: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: SPACING.xl,
    textAlign: "center",
    opacity: 0.9,
  },

  messageGuilt: {
    fontSize: 15,
    fontWeight: "600",
    color: "#888",
    marginBottom: SPACING.xl,
    textAlign: "center",
  },

  messageFailure: {
    fontSize: 15,
    fontWeight: "600",
    color: "#888",
    marginBottom: SPACING.xl,
    textAlign: "center",
  },

  /* ============================
     PREMIUM GLASS STATS CARD
  ============================ */

statsContainer: {
  width: "100%",
  
  paddingVertical: 50,
  paddingHorizontal: 20,

  borderRadius: 26,

  // backgroundColor: "rgba(0,0,0,0.15)", // ✅ dark glass contrast
  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.20)",

  shadowColor: "#000",
  shadowOpacity: 0.9,
  shadowRadius: 18,
  elevation: 5,

  alignItems: "center",
  marginBottom: 80,
},


  statsText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: SPACING.sm,
  },

  statsTextGuilt: {
    fontSize: 14,
    fontWeight: "700",
    color: "#CCCCCC",
    marginBottom: SPACING.sm,
  },

  statsTextFailure: {
    fontSize: 14,
    fontWeight: "700",
    color: "#CCCCCC",
    marginBottom: SPACING.sm,
  },

  /* ============================
     PERCENTAGE BIG
  ============================ */

  percentage: {
  fontSize: 64,
  fontWeight: "900",
  color: "#FFFFFF",
  letterSpacing: -2,
},

  percentageGuilt: {
    fontSize: 54,
    fontWeight: "900",
    color: "#FFC107",
  },

  percentageFailure: {
    fontSize: 54,
    fontWeight: "900",
    color: "#FF3B30",
  },

  /* ============================
     WARNING TEXT
  ============================ */

  warningText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#777",
    textAlign: "center",
    marginBottom: SPACING.xl,
    fontStyle: "italic",
  },

  /* ============================
     PREMIUM CONTINUE BUTTON
  ============================ */

  continueButton: {
    width: "100%",
    paddingVertical: 18,
    borderRadius: BORDER_RADIUS.full,
    alignItems: "center",

    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 10,
  },

  /* Success Button */
 continueButtonSuccess: {
  backgroundColor: "rgba(255,255,255,0.18)", // ✅ frosted glass
  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.25)",

  shadowColor: "#000",
  shadowOpacity: 0.25,
  shadowRadius: 14,
  elevation: 10,
},


  /* Partial Button */
  continueButtonGuilt: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",

    shadowColor: "#FFC107",
  },

  /* Failure Button */
  continueButtonFailure: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",

    shadowColor: "#FF3B30",
  },

  continueButtonText: {
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: 1.2,
    color: "#FFFFFF",
  },

  continueButtonTextSuccess: {
   color: "#FFFFFF", // ✅ Green text on white button
  },

  /* ============================
     LOADING TEXT
  ============================ */

  text: {
    fontSize: 15,
    fontWeight: "600",
    color: "#AAA",
  },
});
