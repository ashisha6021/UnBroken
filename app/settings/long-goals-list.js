import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useAppStore } from '../../store/useAppStore';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../constants/theme';
import { formatDateDisplay } from '../../utils/dateHelpers';
import { useRouter } from 'expo-router';

export default function LongGoalsList() {
  const { longGoals } = useAppStore();
  const router = useRouter();

  const handleEditGoal = (goal) => {
    router.push({
      pathname: '/setup/long-goals',
      params: { editingGoalId: goal.id },
    });
  };

  return (
    <ScrollView style={{ flex: 1, padding: SPACING.lg, backgroundColor: COLORS.background }}>
      {longGoals.map((goal) => (
        <View key={goal.id} style={styles.goalCard}>
          <View style={styles.goalCardLeft}>
            <View style={{ flex: 1 }}>
              <Text style={styles.goalTitle}>{goal.title}</Text>
              <Text style={styles.goalDeadline}>Deadline: {goal.deadline ? formatDateDisplay(goal.deadline) : '—'}</Text>
            </View>
            <View style={styles.completionBadge}>
              <Text style={styles.completionText}>
                {Math.round(goal.completionPercentage || 0)}%
              </Text>
            </View>
          </View>
          <TouchableOpacity onPress={() => handleEditGoal(goal)} style={styles.editButton}>
            <Text style={styles.editButtonText}>EDIT</Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  goalCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
  },
  goalCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: SPACING.sm,
  },
  goalTitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.textPrimary,
    fontWeight: '900',
    flex: 1,
  },
  completionBadge: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  completionText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.background,
    fontWeight: '600',
  },
  editButton: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  editButtonText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.accent,
    fontWeight: '600',
  },
  goalDeadline: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textPrimary,
    marginTop: SPACING.xs,
  }
});
