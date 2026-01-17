import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppStore } from '../../store/useAppStore';
import { addTask, saveUser } from '../../storage/storage-sqlite';
import { DAYS_OF_WEEK, DAY_NAMES } from '../../types';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants/theme';

export default function TasksScreen() {
  const router = useRouter();
  const { shortGoals, tasks, addTask: addTaskToStore, user, setUser } = useAppStore();
  const [selectedShortGoalId, setSelectedShortGoalId] = useState(shortGoals[0]?.id || '');
  const [taskName, setTaskName] = useState('');
  const [selectedDays, setSelectedDays] = useState([]);
  const [minimumEffort, setMinimumEffort] = useState('');

  const toggleDay = (day) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter(d => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
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

    const newTask = {
      id: Date.now().toString(),
      shortGoalId: selectedShortGoalId,
      name: taskName.trim(),
      daysOfWeek: selectedDays,
      minimumEffortRule: minimumEffort.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    await addTask(newTask);
    addTaskToStore(newTask);
    setTaskName('');
    setSelectedDays([]);
    setMinimumEffort('');
  };

  const handleFinish = async () => {
    if (tasks.length === 0) {
      Alert.alert('Required', 'Please add at least one task');
      return;
    }

    // Mark setup as complete
    const updatedUser = {
      ...user,
      hasCompletedSetup: true,
    };
    await saveUser(updatedUser);
    setUser(updatedUser);

    Alert.alert(
      'Setup Complete',
      'Your discipline system is ready. Let\'s start logging your progress!',
      [
        {
          text: 'Start',
          onPress: () => router.replace('/'),
        },
      ]
    );
  };

  const selectedShortGoal = shortGoals.find(g => g.id === selectedShortGoalId);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.instruction}>
        Define daily tasks that move you toward your short-term goals.
      </Text>

      <View style={styles.selectorContainer}>
        <Text style={styles.label}>Link to Short-Term Goal:</Text>
        <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} style={styles.selector}>
          {shortGoals.map((goal) => (
            <TouchableOpacity
              key={goal.id}
              style={[
                styles.selectorItem,
                selectedShortGoalId === goal.id && styles.selectorItemActive,
              ]}
              onPress={() => setSelectedShortGoalId(goal.id)}
            >
              <Text
                style={[
                  styles.selectorItemText,
                  selectedShortGoalId === goal.id && styles.selectorItemTextActive,
                ]}
              >
                {goal.title}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {selectedShortGoal && (
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Task name (e.g., Gym Workout)"
            placeholderTextColor={COLORS.textMuted}
            value={taskName}
            onChangeText={setTaskName}
          />

          <View style={styles.daysContainer}>
            <Text style={styles.label}>Days of week:</Text>
            <View style={styles.daysGrid}>
              {DAYS_OF_WEEK.map((day) => (
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
                      selectedDays.includes(day) && styles.dayButtonTextActive,
                    ]}
                  >
                    {DAY_NAMES[day].substring(0, 3)}
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

          <TouchableOpacity style={styles.addButton} onPress={handleAddTask}>
            <Text style={styles.addButtonText}>ADD TASK</Text>
          </TouchableOpacity>
        </View>
      )}

      {tasks.length > 0 && (
        <View style={styles.tasksList}>
          <Text style={styles.sectionTitle}>Your Tasks:</Text>
          {tasks.map((task) => {
            const shortGoal = shortGoals.find(g => g.id === task.shortGoalId);
            return (
              <View key={task.id} style={styles.taskItem}>
                <Text style={styles.taskName}>{task.name}</Text>
                <Text style={styles.taskDays}>
                  {task.daysOfWeek.map(d => DAY_NAMES[d].substring(0, 3)).join(', ')}
                </Text>
                <Text style={styles.taskLink}>→ {shortGoal?.title}</Text>
              </View>
            );
          })}
        </View>
      )}

      <TouchableOpacity style={styles.finishButton} onPress={handleFinish}>
        <Text style={styles.finishButtonText}>FINISH SETUP</Text>
      </TouchableOpacity>
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
  instruction: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  selectorContainer: {
    marginBottom: SPACING.lg,
  },
  label: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  selector: {
    flexDirection: 'row',
  },
  selectorItem: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: SPACING.sm,
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
    ...TYPOGRAPHY.body,
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
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  addButtonText: {
    ...TYPOGRAPHY.button,
    color: COLORS.background,
    textTransform: 'uppercase',
  },
  tasksList: {
    marginBottom: SPACING.xl,
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
  finishButton: {
    backgroundColor: COLORS.accent,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  finishButtonText: {
    ...TYPOGRAPHY.button,
    color: COLORS.background,
    textTransform: 'uppercase',
  },
});
