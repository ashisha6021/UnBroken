import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppStore } from '../../store/useAppStore';
import { addTaskLog, getTaskLogsByDate } from '../../storage/storage-sqlite';
import { handleTaskLogProgress } from '../../service/progressService';
import { getTodayDateString } from '../../utils/dateHelpers';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants/theme';
import ScreenWrapper from '../../components/ScreenWrapper';
import BottomSaveButton from '../../components/bottombutton'

export default function LogScreen() {
  const navigation = useNavigation();
  const { tasks, shortGoals, longGoals, refreshData } = useAppStore();

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
      completions[log.taskId] = Boolean(log.completed);
      notes[log.taskId] = log.note || '';
    });

    setTaskCompletions(completions);
    setTaskNotes(notes);
    setLoading(false);
  };

  const toggleTask = taskId => {
    setTaskCompletions(prev => ({
      ...prev,
      [taskId]: !prev[taskId],
    }));
  };

  const handleSave = async () => {
    const today = getTodayDateString();

    const dayIndex = new Date().getDay();
    const dayMap = {
      0: 'sunday',
      1: 'monday',
      2: 'tuesday',
      3: 'wednesday',
      4: 'thursday',
      5: 'friday',
      6: 'saturday',
    };
    const todayDay = dayMap[dayIndex];

    const todayTasks = tasks.filter(task =>
      task.daysOfWeek.includes(todayDay)
    );
   
    const affectedShortGoals = new Set();

    for (const task of todayTasks) {
      const completed = Boolean(taskCompletions[task.id]);
      const note = taskNotes[task.id] || '';

      const log = {
        id: `${task.id}-${today}`,
        taskId: task.id,
        shortGoalId: task.shortGoalId,
        date: today,
        completed,
        note: note.trim() || undefined,
        createdAt: new Date().toISOString(),
      };
    
      await addTaskLog(log);
      affectedShortGoals.add(task.shortGoalId);
    }

    // 🔥 recalc once per short goal
    for (const shortGoalId of affectedShortGoals) {
      console.log("THiS IS SHort% completion",await handleTaskLogProgress(shortGoalId))
      await handleTaskLogProgress(shortGoalId);
    }

    await refreshData();
    navigation.navigate('Result');
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const dayIndex = new Date().getDay();
  const dayMap = {
    0: 'sunday',
    1: 'monday',
    2: 'tuesday',
    3: 'wednesday',
    4: 'thursday',
    5: 'friday',
    6: 'saturday',
  };
  const todayDay = dayMap[dayIndex];

  const todayTasks = tasks.filter(task =>
    task.daysOfWeek.includes(todayDay)
  );

  if (todayTasks.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>No tasks scheduled for today.</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>GO BACK</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScreenWrapper>
 
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Today's Tasks</Text>
      <Text style={styles.subtitle}>Mark what you've completed</Text>

      {todayTasks.map(task => {
        const shortGoal = shortGoals.find(g => g.id === task.shortGoalId);
        const longGoal = shortGoal
          ? longGoals.find(g => g.id === shortGoal.longGoalId)
          : null;

        const completed = Boolean(taskCompletions[task.id]);

        return (
          <View key={task.id} style={styles.taskCard}>
            <TouchableOpacity
              style={styles.taskHeader}
              onPress={() => toggleTask(task.id)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.checkbox,
                  completed && styles.checkboxChecked,
                ]}
              >
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
                onChangeText={text =>
                  setTaskNotes(prev => ({ ...prev, [task.id]: text }))
                }
                multiline
              />
            )}
          </View>
        );
      })}
    
      {/* <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>SAVE PROGRESS</Text>
      </TouchableOpacity> */}
    </ScrollView>
    <BottomSaveButton onPress={handleSave} />
    </ScreenWrapper>
 
  );
}

/* ---------------- STYLES (UNCHANGED) ---------------- */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.lg,paddingBottom:80  },
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
    borderColor: COLORS.textPrimary,
  },
  taskHeader: { flexDirection: 'row', alignItems: 'center' },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 2,
    borderColor: COLORS.textPrimary,
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
  taskInfo: { flex: 1 },
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
    padding: SPACING.sm,
    marginTop: SPACING.md,
    minHeight: 40,
  color:COLORS.textPrimary
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
  },
});
