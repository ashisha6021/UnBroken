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

    <View style={styles.successGreenFadeTop} />
    <View style={styles.successGreenHighlight} />
<View style={styles.successGreenFadeMid} />
<View style={styles.successGreenFadeBottom} />
    {/* Ambient Light */}
    <View style={styles.successAuraTop} />
    <View style={styles.successAuraBottom} />

    {/* Crown Discipline Badge */}
    <View style={styles.successBadgeWrapper}>
      <View style={styles.successRingOuter} />
      <View style={styles.successRingInner}>
        <Text style={styles.successIcon}>🏆</Text>
      </View>
    </View>

    {/* Title */}
    <Text style={styles.successTitle}>DISCIPLINE EXECUTED</Text>

    <Text style={styles.successSubtitle}>
      No compromises. No excuses.
    </Text>

    {/* Stats */}
    <View style={styles.successStatsCard}>
      <Text style={styles.successStatsSmall}>
        {todayProgress.completedTasks} / {todayProgress.totalTasks} tasks
      </Text>

      <Text style={styles.successStatsBig}>100%</Text>
    </View>

    <Text style={styles.successFootnote}>
      Consistency is taking shape.
    </Text>
     <Text style={styles.successFootnoteSecondary}>
    Keep showing up.
  </Text>
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
successGreenFadeTop: {
  position: "absolute",
  top: -120,
  width: 520,
  height: 520,
  borderRadius: 260,
  backgroundColor: "rgba(0, 255, 170, 0.28)", // premium emerald
},

successGreenFadeMid: {
  position: "absolute",
  top: 140,
  width: 420,
  height: 420,
  borderRadius: 210,
  backgroundColor: "rgba(0, 210, 130, 0.18)",
},

successGreenFadeBottom: {
  position: "absolute",
  bottom: -140,
  width: 480,
  height: 480,
  borderRadius: 240,
  backgroundColor: "rgba(0, 150, 90, 0.12)",
},
successGreenHighlight: {
  position: "absolute",
  top: 40,
  width: 260,
  height: 260,
  borderRadius: 130,
  backgroundColor: "rgba(0, 255, 180, 0.22)",
},
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
  backgroundColor: "#028a46", // darker rich green
},
// containerSuccess: {
//   backgroundColor: "#041C14", // richer emerald base
// },

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
 /* ============================
   PREMIUM SUCCESS TEXT
============================ */

titlePremium: {
  fontSize: 38,
  fontWeight: "900",
  color: "#FFFFFF",
  textAlign: "center",
  marginTop: 18,
  letterSpacing: -1,
},

subtitlePremium: {
  fontSize: 18,
  fontWeight: "600",
  color: "rgba(255,255,255,0.85)",
  marginTop: 6,
},

messagePremium: {
  fontSize: 15,
  fontWeight: "500",
  color: "rgba(255,255,255,0.70)",
  marginTop: 4,
  marginBottom: 35,
},

/* ============================
   PREMIUM BADGE ICON
============================ */

badge: {
  width: 90,
  height: 90,
  borderRadius: 45,
  backgroundColor: "rgba(255,255,255,0.18)",

  justifyContent: "center",
  alignItems: "center",

  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.25)",

  shadowColor: "#000",
  shadowOpacity: 0.35,
  shadowRadius: 18,
  elevation: 10,
},

badgeIcon: {
  fontSize: 44,
},

/* ============================
   PREMIUM GLASS STATS CARD
============================ */

statsCard: {
  width: "100%",
  paddingVertical: 55,

  borderRadius: 30,
  backgroundColor: "rgba(255,255,255,0.12)",

  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.20)",

  shadowColor: "#000",
  shadowOpacity: 0.35,
  shadowRadius: 25,
  elevation: 12,

  alignItems: "center",
},

statsSmall: {
  fontSize: 14,
  fontWeight: "600",
  color: "rgba(255,255,255,0.75)",
  marginBottom: 10,
},

statsBig: {
  fontSize: 78,
  fontWeight: "900",
  color: "#FFFFFF",
  letterSpacing: -3,
},

continueButtonSuccess: {
  backgroundColor: "rgba(255,255,255,0.20)",

  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.25)",

  shadowColor: "#000",
  shadowOpacity: 0.35,
  shadowRadius: 18,
  elevation: 12,
},

continueButtonTextSuccess: {
  color: "#FFFFFF",
  fontSize: 16,
  fontWeight: "800",
  letterSpacing: 2,
},
glow: {
  position: "absolute",
  top: -200,
  width: 500,
  height: 500,
  borderRadius: 250,
  backgroundColor: "rgba(255,255,255,0.12)",
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
  /* =========================
   SUCCESS PREMIUM GLOW
========================= */

successGlow: {
  position: "absolute",
  top: -250,
  width: 600,
  height: 600,
  borderRadius: 300,
  backgroundColor: "rgba(255,255,255,0.08)",
},

successGlowSmall: {
  position: "absolute",
  bottom: -200,
  width: 500,
  height: 500,
  borderRadius: 250,
  backgroundColor: "rgba(255,255,255,0.05)",
},

/* =========================
   BADGE PREMIUM
========================= */

badgeWrapper: {
  alignItems: "center",
  justifyContent: "center",
  marginBottom: 40,
},

badgeHalo: {
  position: "absolute",
  width: 140,
  height: 140,
  borderRadius: 70,
  backgroundColor: "rgba(255,255,255,0.08)",
},

badgePremium: {
  width: 110,
  height: 110,
  borderRadius: 55,
  backgroundColor: "rgba(255,255,255,0.18)",
  justifyContent: "center",
  alignItems: "center",
  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.25)",
  shadowColor: "#000",
  shadowOpacity: 0.4,
  shadowRadius: 25,
  elevation: 15,
},

badgeIconPremium: {
  fontSize: 48,
},

/* =========================
   PREMIUM TYPOGRAPHY
========================= */

titlePremium: {
  fontSize: 36,
  fontWeight: "900",
  color: "#FFFFFF",
  letterSpacing: 2,
  textAlign: "center",
},

subtitlePremium: {
  fontSize: 16,
  fontWeight: "600",
  color: "rgba(255,255,255,0.8)",
  marginTop: 10,
  marginBottom: 40,
  textAlign: "center",
},

messagePremium: {
  fontSize: 14,
  fontWeight: "500",
  color: "rgba(255,255,255,0.65)",
  marginTop: 30,
  textAlign: "center",
},

/* =========================
   STATS CARD PREMIUM
========================= */

statsCardPremium: {
  width: "100%",
  paddingVertical: 65,
  borderRadius: 35,
  backgroundColor: "rgba(255,255,255,0.10)",
  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.20)",
  alignItems: "center",
  shadowColor: "#000",
  shadowOpacity: 0.4,
  shadowRadius: 30,
  elevation: 15,
},

statsSmallPremium: {
  fontSize: 13,
  fontWeight: "600",
  color: "rgba(255,255,255,0.7)",
  marginBottom: 15,
},

statsBigPremium: {
  fontSize: 82,
  fontWeight: "900",
  color: "#FFFFFF",
  letterSpacing: -4,
},

/* =========================
   ELITE SUCCESS AURA
========================= */

successAuraTop: {
  position: "absolute",
  top: -180,
  width: 500,
  height: 500,
  borderRadius: 250,
  backgroundColor: "rgba(255,255,255,0.06)",
},

successAuraBottom: {
  position: "absolute",
  bottom: -200,
  width: 400,
  height: 400,
  borderRadius: 200,
  backgroundColor: "rgba(255,255,255,0.04)",
},

/* =========================
   BADGE SYSTEM
========================= */

successBadgeWrapper: {
  alignItems: "center",
  justifyContent: "center",
  marginBottom: 30,
},

successRingOuter: {
  position: "absolute",
  width: 150,
  height: 150,
  borderRadius: 75,
  backgroundColor: "rgba(255,255,255,0.06)",
},

successRingInner: {
  width: 110,
  height: 110,
  borderRadius: 55,
  backgroundColor: "rgba(255,255,255,0.15)",
  alignItems: "center",
  justifyContent: "center",
  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.2)",
},

successIcon: {
  fontSize: 46,
},

/* =========================
   TYPOGRAPHY
========================= */

successTitle: {
  fontSize: 32,
  fontWeight: "900",
  color: "#FFFFFF",
  letterSpacing: 3,
  textAlign: "center",
  marginBottom: 10,
},

successSubtitle: {
  fontSize: 15,
  fontWeight: "600",
  color: "rgba(255,255,255,0.75)",
  marginBottom: 40,
  textAlign: "center",
},

successFootnote: {
  fontSize: 20,
  fontWeight: "500",
  color: "rgb(236, 226, 226)",
  marginTop: 35,
  textAlign: "center",
  marginBottom:SPACING.md,
   fontWeight:"800"
},

successFootnoteSecondary:{
  fontSize: 16,
  fontWeight: "500",
  color: "rgba(255, 255, 255, 0.9)",
  marginTop: 2,
  textAlign: "center",
   fontWeight:"800",
  marginBottom:SPACING.md
},
/* =========================
   STATS
========================= */

successStatsCard: {
  width: "100%",
  paddingVertical: 55,
  borderRadius: 30,
  backgroundColor: "rgba(255,255,255,0.08)",
  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.15)",
  alignItems: "center",
},

successStatsSmall: {
  fontSize: 22,
  fontWeight: "600",
  color: "rgba(255,255,255,0.65)",
  marginBottom: 12,
},

successStatsBig: {
  fontSize: 72,
  fontWeight: "900",
  color: "#FFFFFF",
  letterSpacing: -2,
},
});
