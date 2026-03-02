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
    <View key={task.id}>
      
      {/* ✅ TASK CARD */}
      <View style={styles.taskCard}>
        <View style={styles.taskAccentBar2} />
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
              <Text
                style={styles.taskGoal}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {shortGoal.title} → {longGoal?.title}
              </Text>
            )}
          </View>
        </TouchableOpacity>

        {/* ✅ NOTE INPUT */}
        {completed && (
          <TextInput
            style={styles.noteInput}
            placeholder="Add a note (optional)"
            placeholderTextColor={COLORS.textMuted}
            value={taskNotes[task.id] || ''}
            onChangeText={text =>
              setTaskNotes(prev => ({
                ...prev,
                [task.id]: text,
              }))
            }
            multiline
          />
        )}
      </View>

      {/* ✅ PREMIUM FADE DIVIDER */}
      <View
        style={{
          height: 1,
          backgroundColor: "rgba(255,255,255,0.06)",
          marginVertical: 8,
        }}
      />
    </View>
  );
})}

    
      {/* <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>SAVE PROGRESS</Text>
      </TouchableOpacity> */}
     <BottomSaveButton onPress={handleSave} />
    </ScrollView>
     
    </ScreenWrapper>
 
  );
}

/* ---------------- STYLES (UNCHANGED) ---------------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  content: {
    padding: SPACING.lg,
    paddingBottom: 110,
  },

  /* ---------------- HEADER ---------------- */

  title: {
    fontSize: 38,
    fontWeight: "900",
    color: COLORS.textPrimary,
    letterSpacing: -1,
    marginBottom: 6,
  },

  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xl,
    opacity: 0.8,
  },

  /* ---------------- EMPTY / LOADING ---------------- */

  loadingText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textMuted,
    textAlign: "center",
    marginTop: SPACING.xxl,
  },

  emptyText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textMuted,
    textAlign: "center",
    marginTop: SPACING.xxl,
  },

  /* ---------------- TASK CARD ---------------- */

  taskCard: {
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: 22,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.sm,

    /* Premium depth */
    shadowColor: "#000",
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },

  taskHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  /* ---------------- CHECKBOX PREMIUM ---------------- */

  checkbox: {
    width: 30,
    height: 30,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: COLORS.borderLight,
    marginRight: SPACING.md,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 3,
  },

  checkboxChecked: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,

    shadowColor: COLORS.accent,
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 6,
  },

  checkmark: {
    color: COLORS.background,
    fontSize: 16,
    fontWeight: "900",
  },

  /* ---------------- TASK TEXT ---------------- */

  taskInfo: {
    flex: 1,
  },

  taskName: {
    fontSize: 17,
    fontWeight: "800",
    color: COLORS.textPrimary,
    marginBottom: 4,
    lineHeight: 22,
  },

  taskGoal: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: "500",
    lineHeight: 18,
    opacity: 0.75,
  },

  /* ---------------- NOTE INPUT (Glass Style) ---------------- */

  noteInput: {
    marginTop: SPACING.md,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 14,
    color: COLORS.textPrimary,

    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },

  /* ---------------- BACK BUTTON ---------------- */

  backButton: {
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.full,
    alignItems: "center",
    marginTop: SPACING.lg,
  },

  backButtonText: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.textPrimary,
    letterSpacing: 1,
  },
   taskAccentBar2: {
  position: "absolute",
  left: 0,
  top: 12,
  bottom: 12,
  width: 4,
  borderRadius: 10,
  backgroundColor: COLORS.warning, 
},
});
