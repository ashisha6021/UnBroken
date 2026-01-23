import { useState,useEffect,useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  FlatList
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAppStore } from '../../store/useAppStore';
import { addTask, updateTask, saveUser } from '../../storage/storage-sqlite';
import { DAYS_OF_WEEK, DAY_NAMES } from '../../types';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants/theme';


const sortDaysOfWeek = (days) => {
  return [...days].sort(
    (a, b) => DAYS_OF_WEEK.indexOf(a) - DAYS_OF_WEEK.indexOf(b)
  );
};

export default function TasksScreen() {
  const router = useRouter();
  const scrollViewRef = useRef(null);

  const { shortGoalId, longGoalId } = useLocalSearchParams();
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
  const listRef = useRef(null);

  const filteredShortGoals = longGoalId
  ? shortGoals.filter(g => g.longGoalId === longGoalId)
  : shortGoals;

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
        animated: false,     // important
        viewPosition: 0.5,   // center the item
      });
    });
  }

  hasInitialized.current = true;
}, [shortGoalId, filteredShortGoals]);

  const toggleDay = (day) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleAddTask = async () => {
    if (!selectedShortGoalId) {
      Alert.alert('Error', 'Please select a short-term goal');
      return;
    }

    if (!taskName.trim()) {
      Alert.alert('Error', 'Please enter a task name');
      return;
    }

    if (selectedDays.length === 0) {
      Alert.alert('Error', 'Please select at least one day');
      return;
    }

    if (editingTaskId) {
      // Update existing task
      const updatedTask = {
        id: editingTaskId,
        shortGoalId: selectedShortGoalId,
        name: taskName.trim(),
        daysOfWeek: sortDaysOfWeek(selectedDays),
        minimumEffortRule: minimumEffort.trim() || null,
      };

      await updateTask(updatedTask);
      updateTaskInStore(updatedTask);

     setTimeout(() => {
  scrollViewRef.current?.scrollToEnd({ animated: true });
}, 100);

      // Reset form and exit edit mode
      setEditingTaskId(null);
      setTaskName('');
      setSelectedDays([]);
      setMinimumEffort('');
    } else {
      // Create new task
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

      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);

      // Reset form
      setTaskName('');
      setSelectedDays([]);
      setMinimumEffort('');
    }
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
  };
  const canFinishSetup = tasks.length > 0;
  const handleFinish = async () => {
    if (tasks.length === 0) {
      Alert.alert('Required', 'Please add at least one task');
      return;
    }

    const updatedUser = {
      ...user,
      hasCompletedSetup: true,
    };

    await saveUser(updatedUser);
    setUser(updatedUser);

    Alert.alert(
      'Setup Complete',
      'Your discipline system is ready. Start completing tasks daily.',
      [
        {
          text: 'Start',
          onPress: () => router.replace('/'),
        },
      ]
    );
  };

  const selectedShortGoal = shortGoals.find(
    g => g.id === selectedShortGoalId
  );
  const ITEM_WIDTH = 120 + SPACING.sm; // width + marginRight
  return (
    <View style={styles.screen}>
    <ScrollView  ref={scrollViewRef} style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.instruction}>
        {shortGoalId 
          ? `Manage tasks for "${selectedShortGoal?.title}"`
          : 'Define daily tasks that move you toward your short-term goals.'
        }
      </Text>

      {/* SHORT GOAL SELECTOR */}
      <View style={styles.selectorContainer}>
        <Text style={styles.label}>Link to Short-Term Goal</Text>
                  <FlatList
                   ref={listRef}
              horizontal
              data={filteredShortGoals}
              keyExtractor={(item) => item.id}
              showsHorizontalScrollIndicator={false}
              
              getItemLayout={(_, index) => ({
                length: ITEM_WIDTH,       // approximate width of pill
                offset: ITEM_WIDTH * index,
                index,
              })}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.selectorItem,
                    selectedShortGoalId === item.id && styles.selectorItemActive,
                  ]}
                  onPress={() => setSelectedShortGoalId(item.id)}
                >
                  <Text
                    style={[
                      styles.selectorItemText,
                      selectedShortGoalId === item.id &&
                        styles.selectorItemTextActive,
                    ]}
                  >
                    {item.title}
                  </Text>
                </TouchableOpacity>
              )}
            />
      </View>

      {/* TASK FORM */}
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
                    selectedDays.includes(day) && styles.dayButtonActive,
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
              style={[styles.addButton, editingTaskId ? styles.updateButton: styles.fullWidthButton]} 
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
      {tasks.filter(task => task.shortGoalId === selectedShortGoalId).length > 0 && (
        <View style={styles.tasksList}>
          <Text style={styles.sectionTitle}>
            Tasks for {selectedShortGoal?.title}
          </Text>
          {tasks
            .filter(task => task.shortGoalId === selectedShortGoalId)
            .map(task => (
              <View key={task.id} style={styles.taskItem}>
                <View style={styles.taskContent}>
                  <Text style={styles.taskName}>{task.name}</Text>
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
                <View style={{ flexDirection: 'row', gap: 8 , marginTop: SPACING.sm}}>
                  <TouchableOpacity
                    style={styles.alarmButton}
                    onPress={() =>
                      router.push(`/alarms-setter?taskId=${task.id}`)
                    }
                  >
                    <Text style={styles.alarmButtonText}>⏰ ALARM</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => handleEditTask(task)}
                  >
                    <Text style={styles.editButtonText}>EDIT</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
        </View>
      )}

      
      
    </ScrollView>
     

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
            !canFinishSetup && styles.primaryFooterButtonDisabled,
          ]}
          disabled={!canFinishSetup}
          onPress={handleFinish}
        >
          <Text
            style={[
              styles.primaryFooterText,
              !canFinishSetup && styles.primaryFooterTextDisabled,
            ]}
          >
            FINISH SETUP
          </Text>
        </TouchableOpacity>


      <TouchableOpacity
        style={styles.secondaryFooterButton}
        onPress={() => router.back()}
      >
        <Text style={styles.secondaryFooterText}>BACK TO GOALS</Text>
      </TouchableOpacity>
    </View>
  )}
  </View>
  );
}

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  primaryFooterButtonDisabled: {
  backgroundColor: COLORS.border,
},

primaryFooterTextDisabled: {
  color: COLORS.textMuted,
},


   screen: {
  flex: 1,
  backgroundColor: COLORS.background,
},

footer: {
  borderTopWidth: 1,
  borderTopColor: COLORS.border,
  padding: SPACING.md,
  backgroundColor: COLORS.background,
},

primaryFooterButton: {
  backgroundColor: COLORS.success,
  paddingVertical: SPACING.md,
  borderRadius: BORDER_RADIUS.md,
  alignItems: 'center',
  marginBottom: SPACING.sm,
},

primaryFooterText: {
  ...TYPOGRAPHY.button,
  color: COLORS.background,
},

secondaryFooterButton: {
  backgroundColor: COLORS.surface,
  borderWidth: 1,
  borderColor: COLORS.border,
  paddingVertical: SPACING.md,
  borderRadius: BORDER_RADIUS.md,
  alignItems: 'center',
},

secondaryFooterText: {
  ...TYPOGRAPHY.button,
  color: COLORS.textPrimary,
},

  fullWidthButton: {
  flex: 1,
},
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SPACING.lg,
    paddingBottom: SPACING.md, // space for footer
  },
  instruction: {
    ...TYPOGRAPHY.body,
    color: COLORS.textPrimary,
    marginBottom: SPACING.lg,
  },
  selectorContainer: {
    marginBottom: SPACING.lg,
  },
  label: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  selectorItem: {
    width: 120, 
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: SPACING.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectorItemActive: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  selectorItemText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
  },
  selectorItemTextActive: {
    color: COLORS.background,
    fontWeight: '600',
  },
  form: {
    marginBottom: SPACING.xl,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  daysContainer: {
    marginBottom: SPACING.md,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  dayButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    minWidth: 50,
    alignItems: 'center',
  },
  dayButtonActive: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  dayButtonText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
  },
  dayButtonTextActive: {
    color: COLORS.background,
    fontWeight: '600',
  },
  addButton: {
     backgroundColor: COLORS.accent,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center'
  },
  addButtonText: {
    ...TYPOGRAPHY.button,
    color: COLORS.background,
    textTransform: 'uppercase',
  },
  tasksList: {
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  taskItem: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  taskName: {
    ...TYPOGRAPHY.body,
    color: COLORS.textPrimary,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  taskDays: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  taskLink: {
    ...TYPOGRAPHY.caption,
    color: COLORS.accent,
  },
  formTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  updateButton: {
    backgroundColor: COLORS.success || COLORS.accent,
  },
  cancelButton: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    flex: 1,
  },
  cancelButtonText: {
    ...TYPOGRAPHY.button,
    color: COLORS.textPrimary,
  },
  taskContent: {
    flex: 1,
  },
  taskEffort: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
  },
 editButton: {
  height: 32,
  paddingHorizontal: 14,
  borderRadius: 6,
  backgroundColor: COLORS.accent,
  alignItems: 'center',
  justifyContent: 'center',
},
editButtonText: {
  fontSize: 12,
  fontWeight: '600',
  color: COLORS.background,
  lineHeight: 14,
},
  backButton: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  backButtonText: {
    ...TYPOGRAPHY.button,
    color: COLORS.textPrimary,
  },
 alarmButton: {
  height: 32,
  paddingHorizontal: 10,
  borderRadius: 6,
  borderWidth: 1,
  borderColor: COLORS.textPrimary,
  backgroundColor: COLORS.surface,
  alignItems: 'center',
  justifyContent: 'center',
},


alarmButtonText: {
  color: COLORS.textPrimary,
  fontSize: 12,
  fontWeight: '600',
  lineHeight: 14,
},

footerHint: {
  ...TYPOGRAPHY.caption,
  color: COLORS.textMuted,
  textAlign: 'center',
  marginBottom: SPACING.sm,
},


});
