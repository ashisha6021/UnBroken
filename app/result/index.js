import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppStore } from '../../store/useAppStore';
import { calculateStreak } from '../../utils/streak';
import ConfettiCannon from 'react-native-confetti-cannon';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants/theme';

export default function ResultScreen() {
  const router = useRouter();
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
      setTimeout(() => setShowConfetti(false), 3000);
    }
  }, []);

  const handleContinue = async () => {
    await refreshData();
    router.replace('/');
  };

  if (!todayProgress) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Loading...</Text>
      </View>
    );
  }

  const isFullCompletion = todayProgress.completionPercentage === 100;
  const isPartialCompletion = todayProgress.completionPercentage > 0 && todayProgress.completionPercentage < 100;
  const isNoCompletion = todayProgress.completionPercentage === 0;

  return (
    <View style={[
      styles.container,
      isFullCompletion && styles.containerSuccess,
      isPartialCompletion && styles.containerGuilt,
      isNoCompletion && styles.containerFailure,
    ]}>
      {showConfetti && (
        <ConfettiCannon
          count={200}
          origin={{ x: 0, y: 0 }}
          fadeOut={true}
        />
      )}

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {isFullCompletion && (
          <>
            <Text style={styles.emoji}>🎯</Text>
            <Text style={styles.title}>YOU DID IT.</Text>
            <Text style={styles.subtitle}>Discipline maintained.</Text>
            <Text style={styles.message}>Day Unbroken.</Text>
            <View style={styles.statsContainer}>
              <Text style={styles.statsText}>
                {todayProgress.completedTasks} / {todayProgress.totalTasks} tasks completed
              </Text>
              <Text style={styles.percentage}>100%</Text>
            </View>
          </>
        )}

        {isPartialCompletion && (
          <>
            <Text style={styles.emoji}>⚠️</Text>
            <Text style={styles.titleGuilt}>YOU SHOWED UP...</Text>
            <Text style={styles.subtitleGuilt}>but you held back.</Text>
            <Text style={styles.messageGuilt}>Discipline was incomplete.</Text>
            <View style={styles.statsContainer}>
              <Text style={styles.statsTextGuilt}>
                {todayProgress.completedTasks} / {todayProgress.totalTasks} tasks completed
              </Text>
              <Text style={styles.percentageGuilt}>{todayProgress.completionPercentage}%</Text>
            </View>
            <Text style={styles.warningText}>
              Remember: Consistency is non-negotiable.
            </Text>
          </>
        )}

        {isNoCompletion && (
          <>
            <Text style={styles.emoji}>❌</Text>
            <Text style={styles.titleFailure}>NO PROGRESS TODAY</Text>
            <Text style={styles.subtitleFailure}>The streak is broken.</Text>
            <Text style={styles.messageFailure}>Get back on track tomorrow.</Text>
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
            isFullCompletion && styles.continueButtonSuccess,
            isPartialCompletion && styles.continueButtonGuilt,
            isNoCompletion && styles.continueButtonFailure,
          ]}
          onPress={handleContinue}
        >
          <Text style={[
            styles.continueButtonText,
            isFullCompletion && styles.continueButtonTextSuccess,
          ]}>
            CONTINUE
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
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
  containerSuccess: {
    backgroundColor: COLORS.successDark,
  },
  containerGuilt: {
    backgroundColor: COLORS.background,
  },
  containerFailure: {
    backgroundColor: '#1A0000',
  },
  content: {
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
  },
  emoji: {
    fontSize: 64,
    marginBottom: SPACING.lg,
  },
  title: {
    ...TYPOGRAPHY.h1,
    color: COLORS.background,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  titleGuilt: {
    ...TYPOGRAPHY.h1,
    color: COLORS.guilt,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  titleFailure: {
    ...TYPOGRAPHY.h1,
    color: COLORS.error,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  subtitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.background,
    marginBottom: SPACING.xs,
    textAlign: 'center',
    opacity: 0.9,
  },
  subtitleGuilt: {
    ...TYPOGRAPHY.h2,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  subtitleFailure: {
    ...TYPOGRAPHY.h2,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  message: {
    ...TYPOGRAPHY.body,
    color: COLORS.background,
    marginBottom: SPACING.xl,
    textAlign: 'center',
    opacity: 0.8,
  },
  messageGuilt: {
    ...TYPOGRAPHY.body,
    color: COLORS.textMuted,
    marginBottom: SPACING.xl,
    textAlign: 'center',
  },
  messageFailure: {
    ...TYPOGRAPHY.body,
    color: COLORS.textMuted,
    marginBottom: SPACING.xl,
    textAlign: 'center',
  },
  statsContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.xl,
    width: '100%',
    alignItems: 'center',
  },
  statsText: {
    ...TYPOGRAPHY.body,
    color: COLORS.background,
    marginBottom: SPACING.sm,
  },
  statsTextGuilt: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  statsTextFailure: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  percentage: {
    ...TYPOGRAPHY.h1,
    color: COLORS.background,
    fontSize: 48,
  },
  percentageGuilt: {
    ...TYPOGRAPHY.h1,
    color: COLORS.guilt,
    fontSize: 48,
  },
  percentageFailure: {
    ...TYPOGRAPHY.h1,
    color: COLORS.error,
    fontSize: 48,
  },
  warningText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    fontStyle: 'italic',
  },
  continueButton: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: BORDER_RADIUS.md,
    width: '100%',
    alignItems: 'center',
  },
  continueButtonSuccess: {
    backgroundColor: COLORS.background,
  },
  continueButtonGuilt: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  continueButtonFailure: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  continueButtonText: {
    ...TYPOGRAPHY.button,
    color: COLORS.background,
    textTransform: 'uppercase',
  },
  continueButtonTextSuccess: {
    color: COLORS.success,
  },
  text: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
  },
});
