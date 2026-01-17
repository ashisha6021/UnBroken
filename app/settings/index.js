import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppStore } from '../../store/useAppStore';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants/theme';

export default function SettingsScreen() {
  const router = useRouter();
  const { user, longGoals, shortGoals, streak } = useAppStore();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>PROFILE</Text>
        <View style={styles.card}>
          <Text style={styles.label}>Name</Text>
          <Text style={styles.value}>{user?.name || 'Champ'}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>STATISTICS</Text>
        <View style={styles.card}>
          <Text style={styles.label}>Current Streak</Text>
          <Text style={styles.value}>{streak?.currentStreak || 0} days</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.label}>Longest Streak</Text>
          <Text style={styles.value}>{streak?.longestStreak || 0} days</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.label}>Long-Term Goals</Text>
          <Text style={styles.value}>{longGoals.length}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.label}>Short-Term Goals</Text>
          <Text style={styles.value}>{shortGoals.length}</Text>
        </View>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push('/streak')}
        >
          <Text style={styles.buttonText}>VIEW CALENDAR STREAK</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>REWARDS & PUNISHMENTS</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push('/settings/rules')}
        >
          <Text style={styles.buttonText}>MANAGE RULES</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SPACING.lg,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
    letterSpacing: 1,
  },
  card: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
  },
  value: {
    ...TYPOGRAPHY.body,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  button: {
    backgroundColor: COLORS.accent,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  buttonText: {
    ...TYPOGRAPHY.button,
    color: COLORS.background,
    textTransform: 'uppercase',
  },
});
