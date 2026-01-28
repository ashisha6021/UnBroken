import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
// import ConfettiCannon from 'react-native-confetti-cannon';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants/theme';

export default function CelebrationScreen() {
  const navigation = useNavigation();
  const route = useRoute();

  const { goalType, goalTitle } = route.params || {};

  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.5));
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  const handleContinue = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Home' }],
    });
  };

  const isLongTerm = goalType === 'long';

  return (
    <View style={styles.container}>
      {/* {showConfetti && (
        <ConfettiCannon
          count={300}
          origin={{ x: 0, y: 0 }}
          fadeOut
        />
      )} */}

      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Text style={styles.emoji}>{isLongTerm ? '🏆' : '⭐'}</Text>

        {isLongTerm ? (
          <>
            <Text style={styles.title}>THIS WAS EARNED.</Text>
            <Text style={styles.subtitle}>You stayed Unbroken.</Text>
            <Text style={styles.goalTitle}>{goalTitle}</Text>
            <Text style={styles.message}>
              A long-term goal conquered through relentless discipline.
            </Text>
          </>
        ) : (
          <>
            <Text style={styles.title}>SHORT-TERM GOAL</Text>
            <Text style={styles.subtitle}>Conquered.</Text>
            <Text style={styles.goalTitle}>{goalTitle}</Text>
            <Text style={styles.message}>
              One step closer to your ultimate objective.
            </Text>
          </>
        )}

        <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
          <Text style={styles.continueButtonText}>CONTINUE</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.successDark,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  content: {
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
  },
  emoji: {
    fontSize: 80,
    marginBottom: SPACING.xl,
  },
  title: {
    ...TYPOGRAPHY.h1,
    color: COLORS.background,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  subtitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.background,
    marginBottom: SPACING.lg,
    textAlign: 'center',
    opacity: 0.9,
  },
  goalTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.background,
    marginBottom: SPACING.md,
    textAlign: 'center',
    opacity: 0.95,
  },
  message: {
    ...TYPOGRAPHY.body,
    color: COLORS.background,
    marginBottom: SPACING.xxl,
    textAlign: 'center',
    opacity: 0.8,
    lineHeight: 24,
  },
  continueButton: {
    backgroundColor: COLORS.background,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: BORDER_RADIUS.md,
    width: '100%',
    alignItems: 'center',
  },
  continueButtonText: {
    ...TYPOGRAPHY.button,
    color: COLORS.success,
    textTransform: 'uppercase',
  },
});
