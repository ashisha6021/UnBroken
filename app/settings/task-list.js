import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../constants/theme';
import { DAY_NAMES } from '../../types';

export default function TaskList({ navigation }) {
  const { shortGoals, tasks } = useAppStore();
  const [expandedGoals, setExpandedGoals] = useState({});

  const toggleExpand = (id) => {
    setExpandedGoals(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <>
      {/* HEADER (same as ShortGoalsList) */}
      <View style={styles.headerStyle}>
        <Text style={styles.headerText}>Task List</Text>
      </View>

      <ScrollView style={styles.container}>
        {shortGoals.map(goal => {
          const isExpanded = expandedGoals[goal.id];

          return (
            <View key={goal.id} style={styles.section}>
              {/* SHORT GOAL HEADER (same as longGoalHeader) */}
              <View style={styles.longGoalHeader}>
  {/* LEFT: Expand / Collapse */}
  <TouchableOpacity
    style={styles.headerTextContainer}
    onPress={() => toggleExpand(goal.id)}
    activeOpacity={0.7}
  >
    <Text style={styles.longGoalTitle}>
      {goal.title}
    </Text>

    <Text style={styles.goalDeadline}>
      Deadline: {goal.deadline || '—'}
    </Text>
  </TouchableOpacity>

  {/* RIGHT: Add Task + Arrow */}
  <View style={styles.headerRight}>
    <TouchableOpacity
      style={styles.addTaskButtonHeader}
      onPress={() =>
        navigation.navigate('Task Setting', {
          shortGoalId: goal.id,
          longGoalId: goal.longGoalId,
        })
      }
    >
      <Text style={styles.addTaskButtonHeaderText}>
        + Task
      </Text>
    </TouchableOpacity>

    <TouchableOpacity
      onPress={() => toggleExpand(goal.id)}
    >
      <Text style={styles.chevron}>
        {isExpanded ? '▲' : '▼'}
      </Text>
    </TouchableOpacity>
  </View>
</View>


              {/* TASKS (same visual as goalCard) */}
              {isExpanded &&
                tasks
                  .filter(t => t.shortGoalId === goal.id)
                  .map(task => (
                    <View key={task.id} style={styles.goalCard}>
                      <View style={styles.left}>
                        <Text style={styles.title}>{task.name}</Text>

                        <Text style={styles.taskDays}>
                          {task.daysOfWeek
                            .map(d => DAY_NAMES[d].slice(0, 3))
                            .join(', ')}
                        </Text>

                        {task.minimumEffortRule && (
                          <Text style={styles.taskEffort}>
                            Min effort: {task.minimumEffortRule}
                          </Text>
                        )}
                      </View>

                      <View style={styles.right}>
                        <TouchableOpacity
                          style={styles.alarmButton}
                          onPress={() =>
                            navigation.navigate('Alarms', {
                              taskId: task.id,
                            })
                          }
                        >
                          <Text style={styles.alarmButtonText}>⏰</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.editbutton}
                          onPress={() =>
                            navigation.navigate('Task Setting', {
                              shortGoalId: goal.id,
                              editingTaskId: task.id,
                            })
                          }
                        >
                          <Text style={styles.edit}>EDIT</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}

              {isExpanded &&
                tasks.filter(t => t.shortGoalId === goal.id).length === 0 && (
                  <Text style={styles.emptyText}>
                    No tasks yet
                  </Text>
                )}
            </View>
          );
        })}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  headerStyle: {
    ...TYPOGRAPHY.title,
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingTop: SPACING.lg,
  },

  headerText: {
    fontSize: SPACING.xl,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },

  container: {
    flex: 1,
    padding: SPACING.md,
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
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    borderColor: COLORS.textPrimary,
    borderWidth: 1,
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
    fontSize: 24,
    color: COLORS.accent,
    marginLeft: SPACING.md,
  },

  goalCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    marginTop: SPACING.sm,
    marginLeft: SPACING.sm,
    borderColor: COLORS.textMuted,
    borderWidth: 1,
  },

  left: {
    flex: 1,
  },

  title: {
    ...TYPOGRAPHY.body,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },

  taskDays: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },

  taskEffort: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
  },

  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },

  edit: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.background,
    fontWeight: '600',
  },

  alarmButton: {
    paddingHorizontal: 8,
  },

  alarmButtonText: {
    fontSize: 16,
  },

  emptyText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    marginLeft: SPACING.md,
    marginTop: SPACING.sm,
  },
  headerRight: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: SPACING.sm,
},

addTaskButtonHeader: {
  paddingHorizontal: SPACING.sm,
  paddingVertical: 4,
  borderRadius: BORDER_RADIUS.sm,
  backgroundColor: COLORS.accent,
},

addTaskButtonHeaderText: {
  ...TYPOGRAPHY.caption,
  color: COLORS.background,
  fontWeight: '600',
},


editbutton:{ paddingHorizontal: SPACING.sm,
  paddingVertical:1,
  borderRadius: BORDER_RADIUS.sm,
  backgroundColor: COLORS.accent,

}
});
