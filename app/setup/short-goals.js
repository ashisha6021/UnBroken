import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppStore } from '../../store/useAppStore';
import { addShortGoal } from '../../storage/storage-sqlite';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants/theme';

export default function ShortGoalsScreen() {
  const router = useRouter();
  const { longGoals, shortGoals, addShortGoal: addGoalToStore } = useAppStore();
  const [selectedLongGoalId, setSelectedLongGoalId] = useState(longGoals[0]?.id || '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleAddGoal = async () => {
    if (!selectedLongGoalId) {
      Alert.alert('Error', 'Please select a long-term goal');
      return;
    }
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a goal title');
      return;
    }

    const newGoal = {
      id: Date.now().toString(),
      longGoalId: selectedLongGoalId,
      title: title.trim(),
      description: description.trim() || undefined,
      completionPercentage: 0,
      createdAt: new Date().toISOString(),
    };

    await addShortGoal(newGoal);
    addGoalToStore(newGoal);
    setTitle('');
    setDescription('');
  };

  const handleContinue = () => {
    if (shortGoals.length === 0) {
      Alert.alert('Required', 'Please add at least one short-term goal');
      return;
    }
    router.push('/setup/tasks');
  };

  const selectedLongGoal = longGoals.find(g => g.id === selectedLongGoalId);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.instruction}>
        Define short-term goals that contribute to your long-term objectives.
      </Text>

      <View style={styles.selectorContainer}>
        <Text style={styles.label}>Link to Long-Term Goal:</Text>
        <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} style={styles.selector}>
          {longGoals.map((goal) => (
            <TouchableOpacity
              key={goal.id}
              style={[
                styles.selectorItem,
                selectedLongGoalId === goal.id && styles.selectorItemActive,
              ]}
              onPress={() => setSelectedLongGoalId(goal.id)}
            >
              <Text
                style={[
                  styles.selectorItemText,
                  selectedLongGoalId === goal.id && styles.selectorItemTextActive,
                ]}
              >
                {goal.title}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {selectedLongGoal && (
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Short-term goal (e.g., Lose 6 kg fat)"
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
          <TouchableOpacity style={styles.addButton} onPress={handleAddGoal}>
            <Text style={styles.addButtonText}>ADD GOAL</Text>
          </TouchableOpacity>
        </View>
      )}

      {shortGoals.length > 0 && (
        <View style={styles.goalsList}>
          <Text style={styles.sectionTitle}>Your Short-Term Goals:</Text>
          {shortGoals.map((goal) => {
            const longGoal = longGoals.find(g => g.id === goal.longGoalId);
            return (
              <View key={goal.id} style={styles.goalItem}>
                <Text style={styles.goalTitle}>{goal.title}</Text>
                {goal.description && (
                  <Text style={styles.goalDescription}>{goal.description}</Text>
                )}
                <Text style={styles.goalLink}>→ {longGoal?.title}</Text>
              </View>
            );
          })}
        </View>
      )}

      <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
        <Text style={styles.continueButtonText}>CONTINUE</Text>
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
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
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
  goalTitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.textPrimary,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  goalDescription: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  goalLink: {
    ...TYPOGRAPHY.caption,
    color: COLORS.accent,
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
