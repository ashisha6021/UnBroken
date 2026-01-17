import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAppStore } from '../../store/useAppStore';
import { addLongGoal, updateLongGoal } from '../../storage/storage-sqlite';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants/theme';
import { format } from 'date-fns';

export default function LongGoalsScreen() {
  const router = useRouter();
  const { longGoals, addLongGoal: addGoalToStore, updateLongGoal: updateGoalInStore, refreshData } = useAppStore();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [editingGoal, setEditingGoal] = useState(null);

  const handleAddGoal = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a goal title');
      return;
    }

    if (editingGoal) {
      // Update existing goal
      const updatedGoal = {
        ...editingGoal,
        title: title.trim(),
        description: description.trim() || undefined,
        deadline: deadline.trim() || undefined,
      };
      await updateLongGoal(updatedGoal);
      updateGoalInStore(updatedGoal);
      setEditingGoal(null);
    } else {
      // Add new goal
      const newGoal = {
        id: Date.now().toString(),
        title: title.trim(),
        description: description.trim() || undefined,
        completionPercentage: 0,
        deadline: deadline.trim() || undefined,
        createdAt: new Date().toISOString(),
      };
      await addLongGoal(newGoal);
      addGoalToStore(newGoal);
    }
    
    setTitle('');
    setDescription('');
    setDeadline('');
  };

  const handleEditGoal = (goal) => {
    setEditingGoal(goal);
    setTitle(goal.title);
    setDescription(goal.description || '');
    setDeadline(goal.deadline || '');
  };

  const handleCancelEdit = () => {
    setEditingGoal(null);
    setTitle('');
    setDescription('');
    setDeadline('');
  };

  const handleContinue = () => {
    if (longGoals.length === 0) {
      Alert.alert('Required', 'Please add at least one long-term goal');
      return;
    }
    router.push('/setup/short-goals');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.instruction}>
        Define your long-term goals. These are your ultimate objectives.
      </Text>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Goal title (e.g., Build muscular physique)"
          placeholderTextColor={COLORS.textMuted}
          value={title}
          onChangeText={setTitle}
        />
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Optional description"
          placeholderTextColor={COLORS.textMuted}
          value={description}
          onChangeText={setDescription}
          multiline={true}
          numberOfLines={3}
        />
        <TextInput
          style={styles.input}
          placeholder="Deadline (YYYY-MM-DD) - Optional"
          placeholderTextColor={COLORS.textMuted}
          value={deadline}
          onChangeText={setDeadline}
        />
        <View style={styles.buttonRow}>
          {editingGoal && (
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancelEdit}>
              <Text style={styles.cancelButtonText}>CANCEL</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.addButton} onPress={handleAddGoal}>
            <Text style={styles.addButtonText}>
              {editingGoal ? 'UPDATE GOAL' : 'ADD GOAL'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {longGoals.length > 0 && (
        <View style={styles.goalsList}>
          <Text style={styles.sectionTitle}>Your Long-Term Goals:</Text>
          {longGoals.map((goal) => (
            <View key={goal.id} style={styles.goalItem}>
              <View style={styles.goalHeader}>
                <View style={styles.goalHeaderLeft}>
                  <Text style={styles.goalTitle}>{goal.title}</Text>
                  <View style={styles.completionBadge}>
                    <Text style={styles.completionText}>
                      {Math.round(goal.completionPercentage || 0)}%
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => handleEditGoal(goal)}
                >
                  <Text style={styles.editButtonText}>EDIT</Text>
                </TouchableOpacity>
              </View>
              {goal.description && (
                <Text style={styles.goalDescription}>{goal.description}</Text>
              )}
              {goal.deadline && (
                <Text style={styles.goalDeadline}>
                  Deadline: {goal.deadline}
                </Text>
              )}
            </View>
          ))}
        </View>
      )}

      <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
        <Text style={styles.continueButtonText}>CONTINUE</Text>
      </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
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
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cancelButtonText: {
    ...TYPOGRAPHY.button,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
  },
  addButton: {
    flex: 1,
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
  goalsList: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  goalItem: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  goalHeaderLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  goalTitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.textPrimary,
    fontWeight: '600',
    flex: 1,
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
  editButton: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  editButtonText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.accent,
    fontWeight: '600',
  },
  goalDescription: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  goalDeadline: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textMuted,
    fontStyle: 'italic',
  },
  continueButton: {
    backgroundColor: COLORS.accent,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  continueButtonText: {
    ...TYPOGRAPHY.button,
    color: COLORS.background,
    textTransform: 'uppercase',
  },
});
