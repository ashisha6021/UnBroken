import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppStore } from '../../store/useAppStore';
import { addTaskLog, getTaskLogsByDate } from '../../storage/storage-sqlite';
import { getTodayDateString } from '../../utils/dateHelpers';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants/theme';

export default function LogScreen() {
  const router = useRouter();
  const { tasks, shortGoals, longGoals, todayProgress, refreshData } = useAppStore();
  const [taskCompletions, setTaskCompletions] = useState({});
  const [taskNotes, setTaskNotes] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTodayLogs();
  }, []);

  const loadTodayLogs = async () => {
    const today = getTodayDateString();
    const logs = await getTaskLogsByDate(today);
    
    const completions = {};
    const notes = {};
    
    logs.forEach(log => {
      // Ensure completed is always a boolean
      completions[log.taskId] = Boolean(log.completed);
      notes[log.taskId] = log.note || '';
    });
    
    setTaskCompletions(completions);
    setTaskNotes(notes);
    setLoading(false);
  };

  const toggleTask = (taskId) => {
    setTaskCompletions(prev => ({
      ...prev,
      [taskId]: !prev[taskId],
    }));
  };

  const handleSave = async () => {
    const today = getTodayDateString();
    const todayTasks = tasks.filter(task => {
      const dayIndex = new Date().getDay();
      const dayMap = { 0: 'sunday', 1: 'monday', 2: 'tuesday', 3: 'wednesday', 4: 'thursday', 5: 'friday', 6: 'saturday' };
      const todayDay = dayMap[dayIndex];
      return task.daysOfWeek.includes(todayDay);
    });

    // Save all task logs
    for (const task of todayTasks) {
      // Ensure completed is always a boolean
      const completed = Boolean(taskCompletions[task.id]);
      const note = taskNotes[task.id] || '';
      
      const log = {
        id: `${task.id}-${today}`,
        taskId: task.id,
        date: today,
        completed,
        note: note.trim() || undefined,
        createdAt: new Date().toISOString(),
      };
      
      await addTaskLog(log);
    }

    await refreshData();
    
    // Navigate to result screen
    router.push('/result');
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const todayTasks = tasks.filter(task => {
    const dayIndex = new Date().getDay();
    const dayMap = { 0: 'sunday', 1: 'monday', 2: 'tuesday', 3: 'wednesday', 4: 'thursday', 5: 'friday', 6: 'saturday' };
    const todayDay = dayMap[dayIndex];
    return task.daysOfWeek.includes(todayDay);
  });

  if (todayTasks.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>No tasks scheduled for today.</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>GO BACK</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Today's Tasks</Text>
      <Text style={styles.subtitle}>Mark what you've completed</Text>

      {todayTasks.map((task) => {
        const shortGoal = shortGoals.find(g => g.id === task.shortGoalId);
        const longGoal = shortGoal ? longGoals.find(g => g.id === shortGoal.longGoalId) : null;
        // Ensure completed is always a boolean
        const completed = Boolean(taskCompletions[task.id]);

        return (
          <View key={task.id} style={styles.taskCard}>
            <TouchableOpacity
              style={styles.taskHeader}
              onPress={() => toggleTask(task.id)}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, completed && styles.checkboxChecked]}>
                {completed && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <View style={styles.taskInfo}>
                <Text style={styles.taskName}>{task.name}</Text>
                {shortGoal && (
                  <Text style={styles.taskGoal}>
                    {shortGoal.title} → {longGoal?.title}
                  </Text>
                )}
              </View>
            </TouchableOpacity>

            {completed && (
              <TextInput
                style={styles.noteInput}
                placeholder="Add a note (optional)"
                placeholderTextColor={COLORS.textMuted}
                value={taskNotes[task.id] || ''}
                onChangeText={(text) => setTaskNotes(prev => ({ ...prev, [task.id]: text }))}
                multiline={true}
              />
            )}
          </View>
        );
      })}

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>SAVE PROGRESS</Text>
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
  loadingText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.xxl,
  },
  emptyText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.xxl,
  },
  title: {
    ...TYPOGRAPHY.h1,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xl,
  },
  taskCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 2,
    borderColor: COLORS.border,
    marginRight: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  checkmark: {
    color: COLORS.background,
    fontSize: 16,
    fontWeight: 'bold',
  },
  taskInfo: {
    flex: 1,
  },
  taskName: {
    ...TYPOGRAPHY.body,
    color: COLORS.textPrimary,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  taskGoal: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  noteInput: {
    backgroundColor: COLORS.surfaceElevated,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    color: COLORS.textPrimary,
    ...TYPOGRAPHY.bodySmall,
    marginTop: SPACING.md,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: COLORS.accent,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  saveButtonText: {
    ...TYPOGRAPHY.button,
    color: COLORS.background,
    textTransform: 'uppercase',
  },
  backButton: {
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  backButtonText: {
    ...TYPOGRAPHY.button,
    color: COLORS.textPrimary,
    textTransform: 'uppercase',
  },
});
