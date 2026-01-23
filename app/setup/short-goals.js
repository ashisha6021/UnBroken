import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  FlatList ,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAppStore } from '../../store/useAppStore';
import { addShortGoal, updateShortGoal } from '../../storage/storage-sqlite';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants/theme';
import DeadlinePicker from '../../utils/DeadlinePicker123';


export default function ShortGoalsScreen() {
  const router = useRouter();
  const { editingGoalId , longGoalId: routeLongGoalId } = useLocalSearchParams();
  const isEditing = Boolean(editingGoalId);

  const {
    longGoals,
    shortGoals,
    addShortGoal: addToStore,
    updateShortGoal: updateInStore,
  } = useAppStore();
  const listRef = useRef(null);
  const hasInitialized = useRef(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [longGoalId, setLongGoalId] = useState(
  routeLongGoalId || longGoals[0]?.id || ''
);

  const [deadline, setDeadline] = useState(null);

  const editingGoal = isEditing
  ? shortGoals.find(g => g.id === editingGoalId)
  : null;

const linkedLongGoal = editingGoal
  ? longGoals.find(lg => lg.id === editingGoal.longGoalId)
  : null;
 useEffect(() => {
  if (hasInitialized.current) return;

  if (routeLongGoalId) {
    setLongGoalId(routeLongGoalId);
    hasInitialized.current = true;
    return;
  }

  if (longGoals.length > 0) {
    setLongGoalId(longGoals[0].id);
    hasInitialized.current = true;
  }
}, [routeLongGoalId, longGoals]);

  useEffect(() => {
  if (!longGoalId) return;

  const index = longGoals.findIndex(g => g.id === longGoalId);
  if (index >= 0 && listRef.current) {
    requestAnimationFrame(() => {
      listRef.current.scrollToIndex({
        index,
        animated: false,
        viewPosition: 0.5,
      });
    });
  }
}, [longGoalId, longGoals]);

  
  // Prefill when editing
  useEffect(() => {
    if (isEditing) {
      const goal = shortGoals.find(g => g.id === editingGoalId);
      if (goal) {
        setTitle(goal.title);
        setDescription(goal.description || '');
        setLongGoalId(goal.longGoalId);
        // Set deadline parts
        if (goal.deadline) {
          setDeadline(goal.deadline);
        }
      }
    }
  }, [editingGoalId,shortGoals]);



  const handleSave = async () => {
  if (!title.trim()) {
    Alert.alert('Error', 'Please enter a goal title');
    return;
  }

  if (!longGoalId) {
    Alert.alert('Error', 'Please select a long-term goal');
    return;
  }

  if (!deadline) {
    Alert.alert('Error', 'Please select a deadline');
    return;
  }

  try {
    if (isEditing) {
      const updatedGoal = {
        id: editingGoalId,
        title: title.trim(),
        description: description.trim() || null,
        deadline,
        longGoalId,
      };

      await updateShortGoal(updatedGoal);
      updateInStore(updatedGoal);
      router.back();
    } else {
      const newGoal = {
        id: Date.now().toString(),
        title: title.trim(),
        description: description.trim() || null,
        deadline,
        longGoalId,
        completionPercentage: 0,
        createdAt: new Date().toISOString(),
      };

      await addShortGoal(newGoal);
      addToStore(newGoal);
      router.push({
  pathname: '/setup/tasks',
  params: { shortGoalId: newGoal.id ,
         longGoalId,
  },
  
});  
    }
   
  } catch (err) {
    Alert.alert('Error', 'Failed to save short-term goal');
  }
};

  const getLongGoalTitle = (longGoalId) =>
    longGoals.find(g => g.id === longGoalId)?.title || 'Unknown';

  const filteredShortGoals = shortGoals.filter(
  goal => goal.longGoalId === longGoalId
);


  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
     

      <Text style={styles.instruction}>
        {isEditing
          ? 'Update your short-term goal.'
          : 'Create short-term goals that lead to your long-term success.'}
      </Text>

      {/* LONG GOAL SELECTOR */}
          <View style={styles.selectorContainer}>
            <Text style={styles.label}>Linked Long-Term Goal</Text>

            {/* EDIT MODE → show only linked long goal */}
            {isEditing && linkedLongGoal ? (
              <View style={styles.lockedLongGoal}>
                <Text style={styles.lockedLongGoalText}>
                  {linkedLongGoal.title}
                </Text>
                <Text style={styles.goalDeadline}>
                  Deadline: {linkedLongGoal.deadline || '—'}
                </Text>
              </View>
            ) : (
              /* CREATE MODE → show selector */
              <FlatList
                ref={listRef}
                horizontal
                data={longGoals}
                keyExtractor={(item) => item.id}
                showsHorizontalScrollIndicator={false}
                getItemLayout={(_, index) => ({
                  length: 120 + SPACING.sm,
                  offset: (120 + SPACING.sm) * index,
                  index,
                })}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.selectorItem,
                      longGoalId === item.id && styles.selectorItemActive,
                    ]}
                    onPress={() => setLongGoalId(item.id)}
                  >
                    <Text
                      style={[
                        styles.selectorText,
                        longGoalId === item.id && styles.selectorTextActive,
                      ]}
                    >
                      {item.title}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            )}
          </View>

    
  <View>
    <Text style={styles.label}>Short-Term Goal Title and Description</Text>
  </View>   
      {/* FORM */}
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Short-term goal title"
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
          multiline
        />

        <DeadlinePicker
  value={deadline}
  onChange={setDeadline}
/>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>
              {isEditing ? 'UPDATE GOAL' : 'SAVE GOAL'}
            </Text>
          </TouchableOpacity>

          {isEditing && (
            <TouchableOpacity
              style={styles.addTaskButtonLarge}
              onPress={() =>
                router.push({
                  pathname: '/setup/tasks',
                  params: { shortGoalId: editingGoalId,longGoalId },
                })
              }
            >
              <Text style={styles.saveButtonText}>ADD TASK</Text>
            </TouchableOpacity>
          )}
         
        </View>
      </View>
       {/* EXISTING GOALS LIST */}
{!isEditing && filteredShortGoals.length > 0 && (
  <View style={styles.existingGoalsContainer}>
    <Text style={styles.sectionTitle}>Short-Term Goals</Text>

    {filteredShortGoals.map(goal => (
      <View key={goal.id} style={styles.existingGoalCard}>
        <View style={styles.goalInfo}>
          <Text style={styles.existingGoalTitle}>{goal.title}</Text>

          <Text style={styles.existingGoalProgress}>
            {Math.round(goal.completionPercentage || 0)}% complete
          </Text>
        </View>

        <View style={styles.goalActions}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() =>
              router.push({
                pathname: '/setup/short-goals',
                params: { editingGoalId: goal.id },
              })
            }
          >
            <Text style={styles.editButtonText}>EDIT</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.addTaskButton}
            onPress={() =>
              router.push({
                pathname: '/setup/tasks',
                params: { shortGoalId: goal.id, longGoalId: goal.longGoalId, },
              })
            }
          >
            
            <Text style={styles.addTaskButtonText}>ADD TASK</Text>
          </TouchableOpacity>
           
        </View>
      </View>
    ))}
  </View>
)}
    
    </ScrollView>
  );
}

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SPACING.lg,paddingTop:14,
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
  selectorText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
  },
  selectorTextActive: {
    color: COLORS.background,
    fontWeight: '600',
  },
  form: {
    marginTop: SPACING.md,
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
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: COLORS.accent,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  saveButtonText: {
    ...TYPOGRAPHY.button,
    color: COLORS.background,
    textTransform: 'uppercase',
  },
  row: { marginBottom: SPACING.sm },

  pill: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: SPACING.sm,
  },

  pillActive: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },

  pillText: { color: COLORS.textSecondary },
  pillTextActive: { color: COLORS.background, fontWeight: '600' },

  // Existing goals list styles
  existingGoalsContainer: {
    marginBottom: SPACING.xl,
  },

   sectionTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
    fontColor: '#1F1F1F',
    paddingTop: SPACING.md,
  },
  existingGoalCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  goalInfo: {
    flex: 1,
  },
  existingGoalTitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.textPrimary,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  existingGoalLink: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.accent,
    marginBottom: SPACING.xs,
  },
  existingGoalProgress: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
  },
  goalActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  editButton: {
    marginVertical: SPACING.sm,
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.accent,
  },
  editButtonText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.accent,
    fontWeight: '600',
  },
  addTaskButton: {
  
     marginVertical: SPACING.sm,
    backgroundColor: COLORS.accent,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.accent,

  },
  addTaskButtonLarge:{
      backgroundColor: COLORS.accent,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center'
  },
  addTaskButtonText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.background,
    fontWeight: '600',
  },

  // Button container styles
  buttonContainer: {
    gap: SPACING.md,
  },
  lockedLongGoal: {

  
  backgroundColor: COLORS.accent,
  borderWidth: 1,
  borderColor: COLORS.border,
  borderRadius: BORDER_RADIUS.md,
  padding: SPACING.md,
},

lockedLongGoalText: {
  ...TYPOGRAPHY.body,
  color: COLORS.background,
  fontWeight: '600',
},
  goalDeadline: {
    ...TYPOGRAPHY.caption,
    color: COLORS.background,
    marginTop: SPACING.xs,
  },
});
