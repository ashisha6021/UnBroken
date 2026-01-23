import { useState ,useEffect, useRef} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
  
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAppStore } from '../../store/useAppStore';
import { addLongGoal, updateLongGoal } from '../../storage/storage-sqlite';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants/theme';
import { formatDateDisplay } from '../../utils/dateHelpers';
import DeadlinePicker from '../../utils/DeadlinePicker123';



export default function LongGoalsScreen() {
  const router = useRouter();
  const {
    longGoals,
    addLongGoal: addToStore,
    updateLongGoal: updateInStore,
  } = useAppStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const { editingGoalId } = useLocalSearchParams();
  const [activeEditId, setActiveEditId] = useState(null);
  const [deadline, setDeadline] = useState(null);
  const hasPrefilled = useRef(false);
  const scrollRef = useRef(null);

  const isEditing = Boolean(activeEditId);
  const clearRouteEdit = () => {
  router.setParams({ editingGoalId: undefined });
}; 
useEffect(() => {
  if (!editingGoalId) return;
  if (hasPrefilled.current) return;

  const goal = longGoals.find(g => g.id === editingGoalId);
  if (!goal) return;

  setTitle(goal.title);
  setDescription(goal.description || '');
  setDeadline(goal.deadline);

  setActiveEditId(goal.id); // ✅ ONLY edit source
  hasPrefilled.current = true;
   clearRouteEdit();
}, [editingGoalId, longGoals]);

const handleSave = async () => {
  if (!title.trim()) {
    Alert.alert('Error', 'Please enter a goal title');
    return;
  }

  if (!deadline) {
    Alert.alert('Error', 'Please select a deadline');
    return;
  }

  try {
    if (activeEditId) {
      // ✅ UPDATE
      const updated = {
        id: activeEditId,
        title: title.trim(),
        description: description.trim() || null,
        deadline,
      };

      await updateLongGoal(updated);
      updateInStore(updated);

      // 🔥 EXIT edit mode cleanly
      setActiveEditId(null);
      hasPrefilled.current = false;
    } else {
      // ✅ ADD
      const goal = {
        id: Date.now().toString(),
        title: title.trim(),
        description: description.trim() || null,
        deadline,
        completionPercentage: 0,
        createdAt: new Date().toISOString(),
      };

      await addLongGoal(goal);
      addToStore(goal);

      router.push({
        pathname: '/setup/short-goals',
        params: { longGoalId: goal.id },
      });
    }

    resetForm();
  } catch (err) {
    console.error('Error saving long goal:', err);
  }
};




  const resetForm = () => {
    setTitle('');
    setDescription('');
    setDeadline(null);

  };

  

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView  ref={scrollRef} contentContainerStyle={styles.content}>
        <Text style={styles.instruction}>
          Define your long-term goals. These guide your short-term actions.
        </Text>

        {/* FORM */}
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Goal title"
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

         <DeadlinePicker value={deadline} onChange={setDeadline}/>

         

        

          <TouchableOpacity style={styles.addButton} onPress={handleSave}>
            <Text style={styles.addButtonText}>
              {isEditing ? 'UPDATE GOAL' : 'ADD GOAL'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* LIST */}
        {longGoals.length > 0 && (
          <View style={styles.goalsList}>
            <Text style={styles.sectionTitle}>Your Long-Term Goals</Text>

            {longGoals.map(goal => (
<View key={goal.id} style={styles.goalItem}>
  {/* TITLE */}
  <Text style={styles.goalTitle}>{goal.title}</Text>

  {/* DESCRIPTION */}
  {goal.description && (
    <Text style={styles.goalDescription}>{goal.description}</Text>
  )}

  {/* DEADLINE */}
  <Text style={styles.goalDeadline}>
    Deadline: {formatDateDisplay(goal.deadline)}
  </Text>

  {/* BOTTOM RIGHT ACTIONS */}
 <View style={styles.goalFooter}>
  {/* LEFT: EDIT */}
  <TouchableOpacity
    onPress={() => {
      setTitle(goal.title);
      setDescription(goal.description || '');
      setDeadline(goal.deadline);
      setActiveEditId(goal.id);
      hasPrefilled.current = true;

      requestAnimationFrame(() => {
        scrollRef.current?.scrollTo({ y: 0, animated: true });
      });
    }}
  >
    <Text style={styles.editText}>EDIT</Text>
  </TouchableOpacity>

  {/* RIGHT: % + BUTTON */}
  <View style={styles.goalFooterRight}>
    <Text style={styles.badge}>
      {Math.round(goal.completionPercentage || 0)}%
    </Text>

    <TouchableOpacity
      style={styles.addShortGoalButton}
      onPress={() =>
        router.push({
          pathname: '/setup/short-goals',
          params: { longGoalId: goal.id },
        })
      }
    >
      <Text style={styles.addShortGoalText}>+ Short Goal</Text>
    </TouchableOpacity>
  </View>
</View>
</View>


            ))}
          </View>
        )}

        
      </ScrollView>
    </SafeAreaView>
  );
}

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.lg ,paddingTop:0},

  goalHeaderRight: {
  flexDirection: 'row',
  alignItems: 'center',
  marginTop: SPACING.sm,
  gap: SPACING.sm,
},

addShortGoalButton: {
  marginBottom: 0,
  paddingHorizontal: SPACING.sm,
  paddingVertical: 4,
  borderRadius: BORDER_RADIUS.sm,
  backgroundColor: COLORS.accent,
},

addShortGoalText: {
  ...TYPOGRAPHY.caption,
  color: COLORS.background,
  fontWeight: '600',
},

  instruction: {
    ...TYPOGRAPHY.body,
    color: COLORS.textPrimary,
    marginBottom: SPACING.lg,
  },

  form: { marginBottom: SPACING.xl },

  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },

  textArea: { minHeight: 80, textAlignVertical: 'top' },

  label: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
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

  addButton: {
    backgroundColor: COLORS.accent,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    marginTop: SPACING.md,
  },

  addButtonText: {
    ...TYPOGRAPHY.button,
    color: COLORS.background,
  },

  goalsList: { marginBottom: SPACING.xl },

  sectionTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },

  goalItem: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.sm,
  },

  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  goalTitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },

  badge: {
    backgroundColor: COLORS.accent,
    color: COLORS.background,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
    fontWeight: '600',
  },

  goalDescription: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },

  goalDeadline: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
  },

  editText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.accent,
    marginTop: SPACING.sm,
    fontWeight: '600',
  },
goalFooter: {
  flexDirection: 'row',
  justifyContent: 'space-between', 
  alignItems: 'center',
  marginTop: SPACING.md,
},

goalFooterRight: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: SPACING.sm,
},


});
