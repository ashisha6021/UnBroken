import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAppStore } from '../../store/useAppStore';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants/theme';
import TasksScreen from '../setup/tasks';

export default function SettingsScreen({ navigation }) {
  const { user, longGoals: storeLongGoals, shortGoals, streak,tasks } = useAppStore();
  const [longGoals, setLongGoals] = useState(storeLongGoals);

  // Sync store → local state
  useEffect(() => {
    setLongGoals(storeLongGoals);
  }, [storeLongGoals]);

  // Refresh when screen gains focus
  useFocusEffect(
    useCallback(() => {
      setLongGoals(storeLongGoals);
    }, [storeLongGoals])
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      {/* PROFILE */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>PROFILE</Text>
        <View style={styles.card}>
          <Text style={styles.label}>Name</Text>
          <Text style={styles.value}>{user?.name || 'Champ'}</Text>
        </View>
      </View>

      {/* STATISTICS */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>STATISTICS</Text>

        <View style={styles.card}>
          <Text style={styles.label}>Current Streak</Text>
          <Text style={styles.value}>
            {streak?.currentStreak || 0} days
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Longest Streak</Text>
          <Text style={styles.value}>
            {streak?.longestStreak || 0} days
          </Text>
        </View>

        {/* Long-Term Goals */}
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('Long-Goals List')}
        >
          <Text style={styles.label}>Long-Term Goals</Text>
          <Text style={styles.value}>{longGoals.length}</Text>
        </TouchableOpacity>

        {/* Short-Term Goals */}
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('Short-Goals List')}
        >
          <Text style={styles.label}>Short-Term Goals</Text>
          <Text style={styles.value}>{shortGoals.length}</Text>
        </TouchableOpacity>
         <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('Task List')}
        >
          <Text style={styles.label}>TASKS</Text>
          <Text style={styles.value}>{tasks.length}</Text>
          {console.log("They are task",tasks)}
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Streak')}
        >
          <Text style={styles.buttonText}>
            VIEW CALENDAR STREAK
          </Text>
        </TouchableOpacity>
      </View>

      {/* REWARDS & PUNISHMENTS */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          REWARDS & PUNISHMENTS
        </Text>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Rules')}
        >
          <Text style={styles.buttonText}>MANAGE RULES</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}


// --- STYLES ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.lg },
  section: { marginBottom: SPACING.md },
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
    borderColor: COLORS.textMuted
  },
  label: { ...TYPOGRAPHY.body, color: COLORS.textSecondary },
  value: { ...TYPOGRAPHY.body, color: COLORS.textPrimary, fontWeight: '600' },
  button: {
    backgroundColor: COLORS.accent,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  buttonText: { ...TYPOGRAPHY.button, color: COLORS.background, textTransform: 'uppercase' },
  goalCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.sm,
  },
  goalCardLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: SPACING.sm },
  goalTitle: { ...TYPOGRAPHY.body, color: COLORS.textPrimary, flex: 1 },
  completionBadge: { backgroundColor: COLORS.accent, paddingHorizontal: SPACING.sm, paddingVertical: SPACING.xs, borderRadius: BORDER_RADIUS.sm },
  completionText: { ...TYPOGRAPHY.bodySmall, color: COLORS.background, fontWeight: '600' },
  editButton: { paddingHorizontal: SPACING.sm, paddingVertical: SPACING.xs },
  editButtonText: { ...TYPOGRAPHY.bodySmall, color: COLORS.accent, fontWeight: '600' },
});
