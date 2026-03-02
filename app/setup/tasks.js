  import { useState, useEffect, useRef } from 'react';
  import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
    FlatList,Modal, Dimensions 
  } from 'react-native';
  import { useAppStore } from '../../store/useAppStore';
  import { addTask, updateTask, saveUser } from '../../storage/storage-sqlite';
  import { DAYS_OF_WEEK, DAY_NAMES } from '../../types';
  import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants/theme';
  import { usePremiumAlert } from "../../store/usePremiumAlert";

  const sortDaysOfWeek = (days) =>
    [...days].sort(
      (a, b) => DAYS_OF_WEEK.indexOf(a) - DAYS_OF_WEEK.indexOf(b)
    );

  export default function TasksScreen({ navigation, route }) {
    

    const scrollViewRef = useRef(null);
    const listRef = useRef(null);
    
    const editingTaskIdFromRoute = route?.params?.editingTaskId ?? null;
    const shortGoalId = route?.params?.shortGoalId ?? null;
    const longGoalId = route?.params?.longGoalId ?? null;
    const showAlert = usePremiumAlert((state) => state.showAlert);

    const {
      shortGoals,
      tasks,
      addTask: addTaskToStore,
      updateTask: updateTaskInStore,
      user,
      setUser,
    } = useAppStore();

    const hasInitialized = useRef(false);

    const [selectedShortGoalId, setSelectedShortGoalId] = useState('');
    const [taskName, setTaskName] = useState('');
    const [selectedDays, setSelectedDays] = useState([]);
    const [minimumEffort, setMinimumEffort] = useState('');
    const [editingTaskId, setEditingTaskId] = useState(null);
    const [shortGoalModalVisible, setShortGoalModalVisible] = useState(false);
  
 const [taskOverflowMap, setTaskOverflowMap] = useState({});
const [taskExpandedMap, setTaskExpandedMap] = useState({});
const [taskTitleVersionMap, setTaskTitleVersionMap] = useState({});
const taskPositions = useRef({});
    
    useEffect(() => {

  setTaskOverflowMap({});

  setTaskTitleVersionMap(prev => {
    const updated = { ...prev };

    tasks.forEach(task => {
      updated[task.id] = (updated[task.id] || 0) + 1;
    });

    return updated;
  });

}, [tasks]);

const scrollToTask = (taskId) => {
  const y = taskPositions.current[taskId];

  if (y === undefined) return;

  scrollViewRef.current?.scrollTo({
    y: y + 60,
    animated: true,
  });
};
const detectTaskOverflow = (e, id) => {

  if (taskOverflowMap[id] !== undefined) return;

  const lines = e.nativeEvent?.lines;
  if (!lines) return;

  const lastLine = lines[1]?.text || "";

  const cleaned = lastLine
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .trim();

  const isOverflow =
    lines.length === 2 &&
    /…|\.\.\./.test(cleaned);

  if (isOverflow) {
    setTaskOverflowMap(prev => ({
      ...prev,
      [id]: true
    }));
  }
};

     
    const filteredShortGoals = longGoalId
      ? shortGoals.filter(g => g.longGoalId === longGoalId)
      : shortGoals;
    const hasLongShortGoalTitles = filteredShortGoals.some(
    goal => goal.title.length > 18
  );

    useEffect(() => {
      if (hasInitialized.current) return;
      if (!filteredShortGoals.length) return;

      const targetId = shortGoalId || filteredShortGoals[0].id;
      setSelectedShortGoalId(targetId);

      const index = filteredShortGoals.findIndex(g => g.id === targetId);
      if (index >= 0 && listRef.current) {
        requestAnimationFrame(() => {
          listRef.current.scrollToIndex({
            index,
            animated: false,
            viewPosition: 0.5,
          });
        });
      }

      hasInitialized.current = true;
    }, [shortGoalId, filteredShortGoals]);

  useEffect(() => {
    if (!editingTaskIdFromRoute) return;
    if (editingTaskId === editingTaskIdFromRoute) return;

    const taskToEdit = tasks.find(
      t => t.id === editingTaskIdFromRoute
    );

    if (!taskToEdit) return;

    setEditingTaskId(taskToEdit.id);
    setSelectedShortGoalId(taskToEdit.shortGoalId);
    setTaskName(taskToEdit.name);
    setSelectedDays(taskToEdit.daysOfWeek);
    setMinimumEffort(taskToEdit.minimumEffortRule || '');

    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  }, [editingTaskIdFromRoute, tasks]);



    const toggleDay = (day) => {
      setSelectedDays(prev =>
        prev.includes(day)
          ? prev.filter(d => d !== day)
          : [...prev, day]
      );
    };

    const handleAddTask = async () => {
      if (!selectedShortGoalId) {
        
        showAlert("Task Required", "Please select a short-term goal.","Ok","error");
        

        return;
      }

      if (!taskName.trim()) {
        
        showAlert("Task Required", "Please enter a task name.","Ok","error");
        return;
      }

      if (selectedDays.length === 0) {
      
        showAlert("Task Required", "Please select at least one day.","Ok","error");
        
        return;
      }

     if (editingTaskId) {

  const updatedTask = {
    id: editingTaskId,
    shortGoalId: selectedShortGoalId,
    name: taskName.trim(),
    daysOfWeek: sortDaysOfWeek(selectedDays),
    minimumEffortRule: minimumEffort.trim() || null,
  };

  await updateTask(updatedTask);
  updateTaskInStore(updatedTask);

  const editedId = editingTaskId;

  setEditingTaskId(null);
  navigation.setParams({ editingTaskId: null });

  setTimeout(() => {
    scrollToTask(editedId);
  }, 200);

} else {
        const newTask = {
          id: Date.now().toString(),
          shortGoalId: selectedShortGoalId,
          name: taskName.trim(),
          daysOfWeek: sortDaysOfWeek(selectedDays),
          minimumEffortRule: minimumEffort.trim() || null,
          createdAt: new Date().toISOString(),
        };

        await addTask(newTask);
        addTaskToStore(newTask);
      }

      setTaskName('');
      setSelectedDays([]);
      setMinimumEffort('');

      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    };

    const handleEditTask = (task) => {
      setEditingTaskId(task.id);
      setSelectedShortGoalId(task.shortGoalId);
      setTaskName(task.name);
      setSelectedDays(sortDaysOfWeek(task.daysOfWeek));
      setMinimumEffort(task.minimumEffortRule || '');

      setTimeout(() => {
        scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      }, 100);
    };

    const handleCancelEdit = () => {
      setEditingTaskId(null);
      setTaskName('');
      setSelectedDays([]);
      setMinimumEffort('');
      navigation.setParams({ editingTaskId: null });
    };

    const canFinishSetup = tasks.length > 0;

    const handleFinish = async () => {
      if (!canFinishSetup) {
      
        showAlert("Task Required", "Please add at least one task","Ok","error");

        return;
      }

      const updatedUser = {
        ...user,
        hasCompletedSetup: true,
      };

      await saveUser(updatedUser);
      setUser(updatedUser);

    showAlert(
    "Setup Complete 🎉",
    "Your discipline system is ready. Start completing tasks daily.",
    "START",
    "success",
    () => {
      navigation.reset({
        index: 0,
        routes: [{ name: "Home" }],
      });
    }
  );

    };

    const selectedShortGoal = shortGoals.find(
      g => g.id === selectedShortGoalId
    );

    const ITEM_WIDTH = 120 + SPACING.sm;

    return (
      <View style={styles.screen}>
        <ScrollView
          ref={scrollViewRef}
          style={styles.container}
          contentContainerStyle={styles.content}
        >
          <Text style={styles.instruction}>
    {shortGoalId
      ? `MANAGE TASKS`
      : "Define daily tasks that move you toward your short-term goals."}
  </Text>


        
      {/* SHORT GOAL SELECTOR */}
            <View style={styles.selectorContainer}>
              <Text style={styles.label}>Linked to Short-Term Goal</Text>

              {/* ✅ MODAL MODE IF TITLES ARE LONG */}
              {hasLongShortGoalTitles ? (
                <>
                  <TouchableOpacity
                    style={styles.dropdownButton}
                    onPress={() => setShortGoalModalVisible(true)}
                  >
                    <Text style={styles.dropdownButtonText}>
                      {selectedShortGoalId
                        ? filteredShortGoals.find(g => g.id === selectedShortGoalId)?.title
                        : "Select a Short-Term Goal"}
                    </Text>
                  </TouchableOpacity>

                  {/* MODAL */}
                  <Modal
                    visible={shortGoalModalVisible}
                    transparent
                    animationType="slide"
                    onRequestClose={() => setShortGoalModalVisible(false)} 
                  >
                    <View style={styles.modalOverlay}>
                      <View style={styles.modalBox}>
                        <Text style={styles.modalTitle}>
                          Choose Short-Term Goal
                        </Text>

                    
                            <FlatList
                                data={filteredShortGoals}
                                keyExtractor={item => item.id}
                                showsVerticalScrollIndicator={false}
                                renderItem={({ item }) => (
                                  <TouchableOpacity
                                    style={[
                                      styles.modalItem,
                                      selectedShortGoalId === item.id &&
                                        styles.modalItemActive,
                                    ]}
                                    onPress={() => {
                                      setSelectedShortGoalId(item.id);
                                      setShortGoalModalVisible(false);
                                    }}
                                  >
                                    <Text
                                      style={[
                                        styles.modalItemText,
                                        selectedShortGoalId === item.id &&
                                          styles.modalItemTextActive,
                                      ]}
                                      numberOfLines={2}
                                    >
                                      {item.title}
                                    </Text>
                                  </TouchableOpacity>
                                )}
                              />

                        <TouchableOpacity
                          style={styles.closeButton}
                          onPress={() => setShortGoalModalVisible(false)}
                        >
                          <Text style={styles.closeButtonText}>Cancel</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </Modal>
                </>
              ) : (
                /* ✅ FLATLIST MODE IF TITLES ARE SHORT */
                <FlatList
                  ref={listRef}
                  horizontal
                  data={filteredShortGoals}
                  keyExtractor={item => item.id}
                  showsHorizontalScrollIndicator={false}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[
                        styles.selectorItem,
                        selectedShortGoalId === item.id &&
                          styles.selectorItemActive,
                      ]}
                      onPress={() => setSelectedShortGoalId(item.id)}
                    >
                      <Text
                        style={[
                          styles.selectorItemText,
                          selectedShortGoalId === item.id &&
                            styles.selectorItemTextActive,
                        ]}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        {item.title}
                      </Text>
                    </TouchableOpacity>
                  )}
                />
              )}
            </View>


          {/* FORM */}
          {selectedShortGoal && (
            <View style={styles.form}>
              <Text style={styles.formTitle}>
                {editingTaskId ? 'Edit Task' : 'Add New Task'}
              </Text>

              <TextInput
                style={styles.input}
                placeholder="Task name (e.g., Gym workout)"
                placeholderTextColor={COLORS.textMuted}
                value={taskName}
                onChangeText={setTaskName}
              />

              <View style={styles.daysContainer}>
                <Text style={styles.label}>Days of week</Text>
                <View style={styles.daysGrid}>
                  {DAYS_OF_WEEK.map(day => (
                    <TouchableOpacity
                      key={day}
                      style={[
                        styles.dayButton,
                        selectedDays.includes(day) &&
                          styles.dayButtonActive,
                      ]}
                      onPress={() => toggleDay(day)}
                    >
                      <Text
                        style={[
                          styles.dayButtonText,
                          selectedDays.includes(day) &&
                            styles.dayButtonTextActive,
                        ]}
                      >
                        {DAY_NAMES[day].slice(0, 3)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <TextInput
                style={styles.input}
                placeholder="Optional minimum effort rule"
                placeholderTextColor={COLORS.textMuted}
                value={minimumEffort}
                onChangeText={setMinimumEffort}
              />

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[
                    styles.addButton,
                    editingTaskId && styles.updateButton,
                    !editingTaskId && styles.fullWidthButton,
                  ]}
                  onPress={handleAddTask}
                >
                  <Text style={styles.addButtonText}>
                    {editingTaskId ? 'UPDATE TASK' : 'ADD TASK'}
                  </Text>
                </TouchableOpacity>

                {editingTaskId && (
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={handleCancelEdit}
                  >
                    <Text style={styles.cancelButtonText}>CANCEL</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}

          {/* TASK LIST */}
      {/* TASK LIST */}
  {tasks.filter(t => t.shortGoalId === selectedShortGoalId).length > 0 && (
    <View style={styles.tasksList}>

      <Text style={styles.sectionTitle}>
        TASKS LIST
      </Text>

      {tasks
        .filter(t => t.shortGoalId === selectedShortGoalId)
        .map(task => {
          const isExpanded = taskExpandedMap[task.id];

          return (
       <View
  key={task.id}
  onLayout={(e) => {
    taskPositions.current[task.id] = e.nativeEvent.layout.y;
  }}
  style={styles.taskCard}
>

              {/* ✅ TITLE FULL WIDTH */}
              <TouchableOpacity
  onPress={() => {
    if (!taskOverflowMap[task.id]) return;

    setTaskExpandedMap(prev => ({
      ...prev,
      [task.id]: !prev[task.id]
    }));
  }}
>
  <Text
    key={`${task.id}-${taskTitleVersionMap[task.id] || 0}`}
    style={styles.taskTitle}
    numberOfLines={isExpanded ? undefined : 2}
    onTextLayout={(e) => {
      if (!isExpanded) {
        detectTaskOverflow(e, task.id);
      }
    }}
  >
    {task.name}
  </Text>

  {taskOverflowMap[task.id] && (
    <Text style={styles.showMoreText}>
      {isExpanded ? "Show less ▲" : "Show more ▼"}
    </Text>
  )}
</TouchableOpacity>
                 
                <View style={styles.divider} />  
              {/* ✅ BOTTOM ROW (Days + Buttons Together) */}
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
                    style={styles.alarmIconButton}
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
                    style={styles.editPillButton}
                    onPress={() => handleEditTask(task)}
                  >
                    <Text style={styles.editPillText}>EDIT</Text>
                  </TouchableOpacity>

                </View>
              </View>

              {/* Optional Min Effort */}
              {isExpanded && task.minimumEffortRule && (
                <Text style={styles.taskEffort}>
                  Min effort: {task.minimumEffortRule}
                </Text>
              )}

            </View>
          );
        })}
    </View>
  )}
      {shortGoalId && (
          <View style={styles.footer}>
            {!canFinishSetup && (
              <Text style={styles.footerHint}>
                Add at least one task to continue
              </Text>
            )}

            <TouchableOpacity
              style={[
                styles.primaryFooterButton,
                !canFinishSetup &&
                  styles.primaryFooterButtonDisabled,
              ]}
              disabled={!canFinishSetup}
              onPress={handleFinish}
            >
              <Text
                style={[
                  styles.primaryFooterText,
                  !canFinishSetup &&
                    styles.primaryFooterTextDisabled,
                ]}
              >
                FINISH SETUP
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryFooterButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.secondaryFooterText}>
                BACK TO GOALS
              </Text>
            </TouchableOpacity>
          </View>
        )}

        </ScrollView>
      

        
      </View>
    );
  }


  /* ---------------- STYLES ---------------- */

  const styles = StyleSheet.create({
    /* ===========================
      SCREEN BASE
    ============================ */
      divider: {
      height: 1,
      backgroundColor: "rgba(255,255,255,0.06)",
      marginVertical: SPACING.sm,
    },

    screen: {
      flex: 1,
      backgroundColor: COLORS.background,
    },

    container: {
      flex: 1,
      backgroundColor: COLORS.background,
    },

    content: {
      padding: SPACING.xl,
      paddingBottom: 0,
    },

    /* ===========================
      HEADER / INSTRUCTION
    ============================ */

    instruction: {
      fontSize: 18,
      fontWeight: "800",
      color: COLORS.textPrimary,
      marginBottom: SPACING.xl,
      lineHeight: 26,
    },

    /* ===========================
      SHORT GOAL SELECTOR
    ============================ */

    selectorContainer: {
      marginBottom: SPACING.xl,
    },

    label: {
      fontSize: 13,
      fontWeight: "700",
      color: COLORS.textSecondary,
      marginBottom: SPACING.sm,
      letterSpacing: 0.6,
      textTransform: "uppercase",
    },

    selectorItem: {
      width: 125,
      paddingVertical: 12,
      paddingHorizontal: 14,
      borderRadius: BORDER_RADIUS.full,
      backgroundColor: COLORS.surfaceElevated,

      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.06)",

      justifyContent: "center",
      alignItems: "center",

      shadowColor: "#000",
      shadowOpacity: 0.25,
      shadowRadius: 8,
      elevation: 4,

      marginRight: SPACING.sm,
    },

    selectorItemActive: {
      backgroundColor: COLORS.accent,
      borderColor: COLORS.accent,

      shadowColor: COLORS.accent,
      shadowOpacity: 0.55,
      shadowRadius: 10,
      elevation: 6,
    },

    selectorItemText: {
      fontSize: 12,
      fontWeight: "700",
      color: COLORS.textSecondary,
    },

    selectorItemTextActive: {
      color: COLORS.background,
      fontWeight: "900",
    },

    /* ===========================
      DROPDOWN BUTTON
    ============================ */

    dropdownButton: {
      backgroundColor: COLORS.surfaceElevated,
      borderRadius: BORDER_RADIUS.xl,
      paddingVertical: 16,
      paddingHorizontal: 18,

      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",

      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.08)",

      shadowColor: "#000",
      shadowOpacity: 0.35,
      shadowRadius: 10,
      elevation: 6,
    },

    dropdownButtonText: {
      fontSize: 14,
      fontWeight: "700",
      color: COLORS.textPrimary,
      flex: 1,
    },

    /* ===========================
      MODAL PICKER
    ============================ */

    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.75)",
      justifyContent: "center",
      padding: SPACING.lg,
    },

    modalBox: {
      backgroundColor: COLORS.surfaceElevated,
      borderRadius: BORDER_RADIUS.xl,
      padding: SPACING.xl,
      maxHeight: "75%",

      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.08)",

      shadowColor: "#000",
      shadowOpacity: 0.5,
      shadowRadius: 14,
      elevation: 10,
    },

    modalTitle: {
      fontSize: 18,
      fontWeight: "800",
      color: COLORS.textPrimary,
      marginBottom: SPACING.md,
    },

    modalItem: {
      paddingVertical: SPACING.md,
      paddingHorizontal: SPACING.sm,
      borderBottomWidth: 1,
      borderBottomColor: "rgba(255,255,255,0.06)",
    },

    modalItemActive: {
      backgroundColor: COLORS.accent + "20",
      borderRadius: BORDER_RADIUS.md,
    },

    modalItemText: {
      fontSize: 14,
      fontWeight: "600",
      color: COLORS.textSecondary,
    },

    modalItemTextActive: {
      color: COLORS.accent,
      fontWeight: "800",
    },

    closeButton: {
      marginTop: SPACING.lg,
      paddingVertical: 14,
      borderRadius: BORDER_RADIUS.full,
      alignItems: "center",

      backgroundColor: COLORS.surface,
      borderWidth: 1,
      borderColor: COLORS.border,
    },

    closeButtonText: {
      fontSize: 14,
      fontWeight: "700",
      color: COLORS.textPrimary,
    },

    /* ===========================
      FORM
    ============================ */

    form: {
      marginBottom: SPACING.lg,
    },

    formTitle: {
      fontSize: 20,
      fontWeight: "900",
      color: COLORS.textPrimary,
      marginBottom: SPACING.lg,
    },

    input: {
      backgroundColor: COLORS.surfaceElevated,
      borderRadius: BORDER_RADIUS.xl,
      marginTop:SPACING.md,
      paddingVertical: 16,
      paddingHorizontal: 18,

      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.08)",

      fontSize: 14,
      fontWeight: "600",
      color: COLORS.textPrimary,

      shadowColor: "#000",
      shadowOpacity: 0.25,
      shadowRadius: 8,
      elevation: 5,

      marginBottom: SPACING.md,
    },

    daysGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: SPACING.sm,
      marginTop: SPACING.sm,
    },

    dayButton: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: BORDER_RADIUS.full,

      backgroundColor: COLORS.surfaceElevated,
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.06)",

      minWidth: 60,
      alignItems: "center",

      shadowColor: "#000",
      shadowOpacity: 0.2,
      shadowRadius: 6,
      elevation: 3,
    },

    dayButtonActive: {
      backgroundColor: COLORS.accent,
      borderColor: COLORS.accent,

      shadowColor: COLORS.accent,
      shadowOpacity: 0.6,
      shadowRadius: 10,
      elevation: 6,
    },

    dayButtonText: {
      fontSize: 12,
      fontWeight: "700",
      color: COLORS.textSecondary,
    },

    dayButtonTextActive: {
      color: COLORS.background,
      fontWeight: "900",
    },

    /* ===========================
      PRIMARY BUTTONS
    ============================ */

    buttonRow: {
      flexDirection: "row",
      gap: SPACING.sm,
      marginTop: SPACING.sm,
    },

    addButton: {
      flex: 1,
      backgroundColor: COLORS.accent,
      paddingVertical: 18,
      borderRadius: BORDER_RADIUS.full,
      alignItems: "center",

      shadowColor: COLORS.accent,
      shadowOpacity: 0.6,
      shadowRadius: 14,
      elevation: 8,
    },

    addButtonText: {
      fontSize: 14,
      fontWeight: "900",
      color: COLORS.background,
      letterSpacing: 1,
    },

    cancelButton: {
      flex: 1,
      backgroundColor: COLORS.surfaceElevated,
      borderWidth: 1,
      borderColor: COLORS.border,
      paddingVertical: 18,
      borderRadius: BORDER_RADIUS.full,
      alignItems: "center",
    },

    cancelButtonText: {
      fontSize: 14,
      fontWeight: "700",
      color: COLORS.textPrimary,
    },

    /* ===========================
      TASK LIST
    ============================ */

    tasksList: {
      marginBottom: SPACING.xxl,
    },

    sectionTitle: {
      fontSize: 18,
      fontWeight: "900",
      color: COLORS.textPrimary,
      marginBottom: SPACING.md,
    },

    taskCard: {
      backgroundColor: COLORS.surfaceElevated,
      borderRadius: BORDER_RADIUS.xl,
      padding: SPACING.lg,
      marginBottom: SPACING.lg,

      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.06)",

      shadowColor: "#000",
      shadowOpacity: 0.35,
      shadowRadius: 12,
      elevation: 7,
    },

    taskTitle: {
      fontSize: 15,
      fontWeight: "800",
      color: COLORS.textPrimary,
      lineHeight: 22,
    },

    showMoreText: {
      fontSize: 12,
      color: COLORS.textMuted,
      marginTop: 4,
    },

  taskBottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: SPACING.xs,

    flexWrap: "nowrap",   // ✅ no breaking outside
  },



  taskDays: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.textSecondary,

    flex: 1,          // ✅ takes available space
    marginRight: 10,  // ✅ space before buttons
  },


  taskActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,

    flexShrink: 0,   // ✅ buttons never shrink weirdly
  },


    alarmIconButton: {
      width: 38,
      height: 38,
      borderRadius: BORDER_RADIUS.full,
      marginLeft:SPACING.xs,

      backgroundColor: COLORS.surface,
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.08)",

      justifyContent: "center",
      alignItems: "center",

      shadowColor: "#000",
      shadowOpacity: 0.25,
      shadowRadius: 6,
      elevation: 4,
    },

    alarmIcon: {
      fontSize: 15,
      color: COLORS.accent,
    },

    editPillButton: {
      backgroundColor: COLORS.accent,
      paddingHorizontal: 18,
      paddingVertical: 8,
      borderRadius: BORDER_RADIUS.full,
    },

    editPillText: {
      fontSize: 12,
      fontWeight: "900",
      color: COLORS.background,
    },

    taskEffort: {
      fontSize: 12,
      fontWeight: "600",
      color: COLORS.textMuted,
      marginTop: SPACING.sm,
    },

    /* ===========================
      FOOTER CTA
    ============================ */

    footer: {
      borderTopWidth: 1,
      borderTopColor: "rgba(255,255,255,0.08)",
      padding: SPACING.xs,
      backgroundColor: COLORS.background,
    },

    footerHint: {
      fontSize: 12,
      fontWeight: "600",
      color: COLORS.textMuted,
      textAlign: "center",
      marginBottom: SPACING.sm,
    },

    primaryFooterButton: {
      backgroundColor: COLORS.accent,
      paddingVertical: 20,
      borderRadius: BORDER_RADIUS.full,
      alignItems: "center",

      shadowColor: COLORS.accent,
      shadowOpacity: 0.7,
      shadowRadius: 14,
      elevation: 10,

      marginBottom: SPACING.sm,
    },

    primaryFooterText: {
      fontSize: 15,
      fontWeight: "900",
      color: COLORS.background,
      letterSpacing: 1,
    },

    primaryFooterButtonDisabled: {
      backgroundColor: COLORS.border,
    },

    primaryFooterTextDisabled: {
      color: COLORS.textMuted,
    },

    secondaryFooterButton: {
      backgroundColor: COLORS.surfaceElevated,
      borderWidth: 1,
      borderColor: COLORS.border,
      paddingVertical: 18,
      borderRadius: BORDER_RADIUS.full,
      alignItems: "center",
    },

    secondaryFooterText: {
      fontSize: 14,
      fontWeight: "700",
      color: COLORS.textPrimary,
    },
  });

