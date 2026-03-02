import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useState, useRef ,useEffect} from 'react';
import { useAppStore } from '../../store/useAppStore';
import { COLORS, SPACING, BORDER_RADIUS } from '../../constants/theme';
import { DAY_NAMES } from '../../types';
import { formatDateDisplay } from '../../utils/dateHelpers';

export default function TaskList({ navigation }) {

  const { shortGoals, tasks } = useAppStore();

  const [expandedGoals, setExpandedGoals] = useState({});
  const [expandedTaskTitle, setExpandedTaskTitle] = useState({});
  const [expandedShortTitle, setExpandedShortTitle] = useState({});

  const [taskOverflow, setTaskOverflow] = useState({});
  const [shortOverflow, setShortOverflow] = useState({});

  const scrollRef = useRef(null);
  const lastTaskRef = useRef(null);
  const scrollTarget = useRef(null);
  const scrollViewHeight = useRef(0);
  const taskTitleMapRef = useRef({});
const shortTitleMapRef = useRef({});



  const toggleExpand = (id) => {
    const isOpening = !expandedGoals[id];
    if (isOpening) scrollTarget.current = id;

    setExpandedGoals(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };
const detectOverflow = (e, id, title, setter, store, titleRef, isExpanded) => {
  const lines = e.nativeEvent?.lines;
  if (!lines) return;

  // Reset only if title changed
  if (titleRef.current[id] !== title) {
    titleRef.current[id] = title;

    setter(prev => {
      const updated = { ...prev };
      delete updated[id];
      return updated;
    });
  }

  // ❗ DO NOT calculate overflow while expanded
  if (isExpanded) return;

  const lastLine = lines[1]?.text || "";

  const cleaned = lastLine
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .trim();

  const isOverflow =
    lines.length === 2 &&
    /…|\.\.\./.test(cleaned);

  setter(prev => {
    if (prev[id] === isOverflow) return prev;
    return { ...prev, [id]: isOverflow };
  });
};

  const handleLastTaskLayout = () => {

    if (!scrollTarget.current || !lastTaskRef.current || !scrollRef.current) return;

    setTimeout(() => {

      lastTaskRef.current.measureLayout(
        scrollRef.current,
        (x, y, width, height) => {

          const visibleHeight = scrollViewHeight.current;
          const targetScroll = y + height - visibleHeight + 40;

          scrollRef.current.scrollTo({
            y: targetScroll > 0 ? targetScroll : 0,
            animated: true
          });

          scrollTarget.current = null;
        },
        () => {}
      );

    }, 80);
  };

  return (
    <>
      <View style={styles.headerStyle}>
        <Text style={styles.headerText}>Task List</Text>
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.container}
        onLayout={(e) => {
          scrollViewHeight.current = e.nativeEvent.layout.height;
        }}
      >

        {shortGoals.map(goal => {

          const isExpanded = expandedGoals[goal.id];
          const goalTasks = tasks.filter(task => task.shortGoalId === goal.id);

          return (
            <View key={goal.id + goal.title} style={styles.section}>

              {/* SHORT GOAL HEADER */}
              <View style={styles.shortGoalHeaderCard}>
                <View style={styles.taskAccentBar2} />

                <TouchableOpacity
                  onPress={() =>
                    setExpandedShortTitle(prev => ({
                      ...prev,
                      [goal.id]: !prev[goal.id]
                    }))
                  }
                >
                  <Text
                  key={goal.id + goal.title}
                  style={styles.shortGoalHeaderTitle}
                  numberOfLines={expandedShortTitle[goal.id] ? undefined : 2}
                  onTextLayout={(e) =>
                    detectOverflow(
                      e,
                      goal.id,
                      goal.title,
                      setShortOverflow,
                      shortOverflow,
                      shortTitleMapRef,
                      expandedShortTitle[goal.id]
                    )
                  }
                >
                  
                    {goal.title}
                  </Text>

                  {shortOverflow[goal.id] && (
                    <Text style={styles.showMoreText}>
                      {expandedShortTitle[goal.id] ? "Show less ▲" : "Show more ▼"}
                    </Text>
                  )}
                </TouchableOpacity>

                <View style={styles.divider} />

                <View style={styles.shortGoalHeaderBottomRow}>

                  <Text style={styles.goalDeadline}>
                    Deadline: {goal.deadline ? formatDateDisplay(goal.deadline) : "—"}
                  </Text>

                  <View style={styles.shortGoalHeaderRight}>

                    <TouchableOpacity
                      style={styles.addTaskButtonHeader}
                      onPress={() =>
                        navigation.navigate("Task Setting", {
                          shortGoalId: goal.id,
                          longGoalId: goal.longGoalId,
                        })
                      }
                    >
                      <Text style={styles.addTaskButtonHeaderText}>+ Task</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => toggleExpand(goal.id)}>
                      <Text style={styles.chevron}>
                        {isExpanded ? "▲" : "▼"}
                      </Text>
                    </TouchableOpacity>

                  </View>
                </View>
              </View>

              {/* TASKS */}
              {isExpanded &&
                <View key={goal.id + goalTasks.length}>
                {goalTasks.map((task, index) => {

                  const isLast = index === goalTasks.length - 1;

                  return (
                   <View
                key={task.id + task.name}
                      ref={isLast ? lastTaskRef : null}
                      onLayout={isLast ? handleLastTaskLayout : undefined}
                      style={styles.taskCard}
                    >

                      <View style={styles.taskAccentBar} />

                      <TouchableOpacity
                        onPress={() =>
                          setExpandedTaskTitle(prev => ({
                            ...prev,
                            [task.id]: !prev[task.id]
                          }))
                        }
                      >
                       <Text
                            key={task.id + task.name}
                            style={styles.taskTitle}
                            numberOfLines={expandedTaskTitle[task.id] ? undefined : 2}
                            onTextLayout={(e) =>
                              detectOverflow(
                                e,
                                task.id,
                                task.name,
                                setTaskOverflow,
                                taskOverflow,
                                taskTitleMapRef,
                                expandedTaskTitle[task.id]
                              )
                            }
                          >
                          {task.name}
                        </Text>

                        {taskOverflow[task.id] && (
                          <Text style={styles.showMoreText}>
                            {expandedTaskTitle[task.id] ? "Show less ▲" : "Show more ▼"}
                          </Text>
                        )}
                      </TouchableOpacity>

                      <View style={styles.divider} />

                      <View style={styles.taskBottomRow}>

                        <Text style={styles.taskDays}>
                          {task.daysOfWeek
                            .map(d => DAY_NAMES[d].slice(0, 3))
                            .join(", ")}
                        </Text>

                        <View style={styles.taskActions}>

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

                          <TouchableOpacity
                            style={styles.editButton}
                            onPress={() =>
                              navigation.navigate("Task Setting", {
                                shortGoalId: goal.id,
                                editingTaskId: task.id,
                              })
                            }
                          >
                            <Text style={styles.editButtonText}>EDIT</Text>
                          </TouchableOpacity>

                        </View>
                      </View>
                    </View>
                  );
                })}
                </View>
              }

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

