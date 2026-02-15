import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../constants/theme';
import { DAY_NAMES } from '../../types';

export default function TaskList({ navigation }) {
  const { shortGoals, tasks } = useAppStore();
  const [expandedGoals, setExpandedGoals] = useState({});
  const [expandedTaskId, setExpandedTaskId] = useState(null);
  const [expandedShortGoalTitleId, setExpandedShortGoalTitleId] = useState(null);

const toggleShortGoalHeaderTitle = (id) => {
  setExpandedShortGoalTitleId(prev => (prev === id ? null : id));
};

const toggleTaskExpand = (id) => {
  setExpandedTaskId(prev => (prev === id ? null : id));
};


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
         
        {/* ✅ SHORT GOAL HEADER */}
        <View style={styles.shortGoalHeaderCard}>
             <View style={styles.taskAccentBar2} />
          {/* Title */}
          <TouchableOpacity
            onPress={() => toggleShortGoalHeaderTitle(goal.id)}
          >
            <Text
              style={styles.shortGoalHeaderTitle}
              numberOfLines={
                expandedShortGoalTitleId === goal.id ? 10 : 2
              }
            >
              {goal.title}
            </Text>

            {goal.title.length > 35 && (
              <Text style={styles.showMoreText}>
                {expandedShortGoalTitleId === goal.id
                  ? "Show less ▲"
                  : "Show more ▼"}
              </Text>
            )}
          </TouchableOpacity>
          <View style={styles.divider} />

          {/* Bottom Row */}
          <View style={styles.shortGoalHeaderBottomRow}>

            <Text style={styles.goalDeadline}>
              Deadline: {goal.deadline || "—"}
            </Text>

            <View style={styles.shortGoalHeaderRight}>

              {/* +Task Button */}
              <TouchableOpacity
                style={styles.addTaskButtonHeader}
                onPress={() =>
                  navigation.navigate("Task Setting", {
                    shortGoalId: goal.id,
                    longGoalId: goal.longGoalId,
                  })
                }
              >
                <Text style={styles.addTaskButtonHeaderText}>
                  + Task
                </Text>
              </TouchableOpacity>

              {/* Expand Arrow */}
              <TouchableOpacity
                onPress={() => toggleExpand(goal.id)}
              >
                <Text style={styles.chevron}>
                  {isExpanded ? "▲" : "▼"}
                </Text>
              </TouchableOpacity>

            </View>
          </View>
        </View>

        {/* ✅ TASKS UNDER SHORT GOAL */}
        {isExpanded &&
          tasks
            .filter(task => task.shortGoalId === goal.id)
            .map(task => (
              <View key={task.id} style={styles.taskCard}>
                   <View style={styles.taskAccentBar} />
                {/* Task Title */}
                <TouchableOpacity
                  onPress={() => toggleTaskExpand(task.id)}
                >
                  <Text
                    style={styles.taskTitle}
                    numberOfLines={
                      expandedTaskId === task.id ? 10 : 2
                    }
                  >
                    {task.name}
                  </Text>

                  {task.name.length > 35 && (
                    <Text style={styles.showMoreText}>
                      {expandedTaskId === task.id
                        ? "Show less ▲"
                        : "Show more ▼"}
                    </Text>
                  )}
                </TouchableOpacity>
                <View style={styles.divider} />

                {/* Bottom Row */}
                <View style={styles.taskBottomRow}>

                  {/* Days */}
                  <Text style={styles.taskDays}>
                    {task.daysOfWeek
                      .map(d => DAY_NAMES[d].slice(0, 3))
                      .join(", ")}
                  </Text>

                  {/* Actions */}
                  <View style={styles.taskActions}>

                    {/* Alarm */}
                    <TouchableOpacity
                      style={styles.alarmButton}
                      onPress={() =>
                        navigation.navigate("Alarms", {
                          taskId: task.id,
                        })
                      }
                    >
                      <Text style={styles.alarmIcon}>⏰</Text>
                    </TouchableOpacity>

                    {/* Edit */}
                    <TouchableOpacity
                      style={styles.editButton}
                      onPress={() =>
                        navigation.navigate("Task Setting", {
                          shortGoalId: goal.id,
                          editingTaskId: task.id,
                        })
                      }
                    >
                      <Text style={styles.editButtonText}>
                        EDIT
                      </Text>
                    </TouchableOpacity>

                  </View>
                </View>
              </View>
            ))}

        {/* Empty */}
        {isExpanded &&
          tasks.filter(task => task.shortGoalId === goal.id).length === 0 && (
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
  /* ===========================
     HEADER
  ============================ */

  headerStyle: {
    alignItems: "center",
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.lg,
    backgroundColor: COLORS.background,
  },

  headerText: {
    fontSize: 34,
    fontWeight: "900",
    color: COLORS.textPrimary,
    letterSpacing: -0.8,
  },

  container: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    backgroundColor: COLORS.background,
  },

  section: {
    marginBottom: SPACING.xl,
  },

  /* ===========================
     SHORT GOAL HEADER CARD (Premium)
  ============================ */

  shortGoalHeaderCard: {
    backgroundColor: COLORS.surfaceElevated,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,

    shadowColor: "#000",
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },

  shortGoalHeaderTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.textPrimary,
    lineHeight: 24,
    letterSpacing: -0.2,
  },

  showMoreText: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 4,
    fontWeight: "500",
  },

  /* Divider for Premium Feel */
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.06)",
    marginVertical: SPACING.sm,
  },

  shortGoalHeaderBottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  goalDeadline: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },

  shortGoalHeaderRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },

  /* ===========================
     + TASK BUTTON (Premium Pill)
  ============================ */

  addTaskButtonHeader: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: BORDER_RADIUS.full,

    shadowColor: COLORS.accent,
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },

  addTaskButtonHeaderText: {
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.background,
    letterSpacing: 0.5,
  },

  /* Chevron Chip */
  chevron: {
    fontSize: 16,
    fontWeight: "900",
    color: COLORS.accent,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: "rgba(0,255,136,0.08)",
  },

  /* ===========================
     TASK CARD (Nested Premium)
  ============================ */
taskCard: {
  backgroundColor: "rgba(255,255,255,0.06)", // ✅ slightly brighter

  padding: SPACING.md,
  borderRadius: BORDER_RADIUS.lg,

  marginLeft: SPACING.lg,   // ✅ deeper nesting
  marginTop: SPACING.md,

  borderWidth: 1,           // ✅ clear border
  borderColor: "rgba(255,255,255,0.10)",

  shadowColor: "#000",
  shadowOpacity: 0.35,
  shadowRadius: 10,
  elevation: 5,

  position: "relative",
},

taskAccentBar: {
  position: "absolute",
  left: 0,
  top: 12,
  bottom: 12,
  width: 4,
  borderRadius: 10,
  backgroundColor: COLORS.accent, // ✅ green stripe
},
taskAccentBar2: {
  position: "absolute",
  left: 0,
  top: 12,
  bottom: 12,
  width: 4,
  borderRadius: 10,
  backgroundColor: COLORS.warning, // ✅ green stripe
},
  taskTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.textPrimary,
    lineHeight: 20,
  },

taskBottomRow: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginTop: SPACING.sm,
},

taskDays: {
  flex: 1,              // ✅ prevents overflow
  marginRight: 10,
  fontSize: 12,
  fontWeight: "600",
  color: COLORS.textMuted,
},

taskActions: {
  flexDirection: "row",
  alignItems: "center",
  gap: 8,
  flexShrink: 0,
},


  /* ===========================
     ALARM BUTTON (Icon Chip)
  ============================ */

  alarmButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: "rgba(255,255,255,0.06)",
  },

  alarmIcon: {
    fontSize: 15,
  },

  /* ===========================
     EDIT BUTTON (Premium Pill)
  ============================ */

  editButton: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: BORDER_RADIUS.full,

    shadowColor: COLORS.accent,
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },

  editButtonText: {
    fontSize: 12,
    fontWeight: "900",
    color: COLORS.background,
    letterSpacing: 0.6,
  },

  emptyText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.textMuted,
    marginLeft: SPACING.md,
    marginTop: SPACING.sm,
  },
});

