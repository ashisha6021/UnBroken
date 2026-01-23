import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../constants/theme';
import { useRouter } from 'expo-router';

export default function ShortGoalsList() {
  const { shortGoals, longGoals } = useAppStore();
  const router = useRouter();
  const [expandedGoals, setExpandedGoals] = useState({});

  const toggleExpand = (id) => {
    setExpandedGoals(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const groupedShortGoals = longGoals.map(longGoal => ({
    ...longGoal,
    shortGoals: shortGoals.filter(
      sg => sg.longGoalId === longGoal.id
    ),
  }));

  return (
    <ScrollView style={styles.container}>
      {groupedShortGoals.map(longGoal => {
        const isExpanded = expandedGoals[longGoal.id];

        return (
          <View key={longGoal.id} style={styles.section}>
            {/* Long Goal Header */}
            <TouchableOpacity
              style={styles.longGoalHeader}
              onPress={() => toggleExpand(longGoal.id)}
            >
              {/* Title + Deadline */}
              <View style={styles.headerTextContainer}>
                <Text style={styles.longGoalTitle}>
                  {longGoal.title}
                </Text>
                <Text style={styles.goalDeadline}>
                  Deadline: {longGoal.deadline || '—'}
                </Text>
              </View>

              {/* Arrow */}
              <Text style={styles.chevron}>
                {isExpanded ? '▲' : '▼'}
              </Text>
            </TouchableOpacity>

            {/* Short Goals */}
            {isExpanded && longGoal.shortGoals.map(goal => (
              <View key={goal.id} style={styles.goalCard}>
                <View style={styles.left}>
                  <Text style={styles.title}>{goal.title}</Text>
                </View>

                <View style={styles.right}>
                  <View style={styles.completionBadge}>
                    <Text style={styles.completionText}>
                      {Math.round(goal.completionPercentage || 0)}%
                    </Text>
                  </View>

                  <TouchableOpacity
                    onPress={() =>
                      router.push({
                        pathname: '/setup/short-goals',
                        params: { editingGoalId: goal.id },
                      })
                    }
                  >
                    <Text style={styles.edit}>EDIT</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            {isExpanded && longGoal.shortGoals.length === 0 && (
              <Text style={styles.emptyText}>
                No short goals yet
              </Text>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SPACING.lg,
    backgroundColor: COLORS.background,
  },

  section: {
    marginBottom: SPACING.md,
  },

  longGoalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },

  headerTextContainer: {
    flex: 1,
  },

  longGoalTitle: {
    ...TYPOGRAPHY.body,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },

  goalDeadline: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },

  chevron: {
    fontSize: 24,        // ⬅️ bigger arrow
    color: COLORS.accent,
    marginLeft: SPACING.md,
  },

  goalCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginTop: SPACING.sm,
    marginLeft: SPACING.sm,
  },

  left: {
    flex: 1,
  },

  title: {
    ...TYPOGRAPHY.body,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },

  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
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

  edit: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.accent,
    fontWeight: '600',
  },

  emptyText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    marginLeft: SPACING.md,
    marginTop: SPACING.sm,
  },
});

