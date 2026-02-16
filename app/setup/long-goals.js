import { useState, useEffect, useRef } from 'react';
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

import { useAppStore } from '../../store/useAppStore';
import { addLongGoal, updateLongGoal } from '../../storage/storage-sqlite';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants/theme';
import { formatDateDisplay } from '../../utils/dateHelpers';
import DeadlinePicker from '../../utils/DeadlinePicker123';
import { usePremiumAlert } from '../../store/usePremiumAlert';
export default function LongGoalsScreen({ navigation, route }) {
  const {
    longGoals,
    addLongGoal: addToStore,
    updateLongGoal: updateInStore,
  } = useAppStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [activeEditId, setActiveEditId] = useState(null);
  const [deadline, setDeadline] = useState(null);
  const [expandedGoalId, setExpandedGoalId] = useState(null);

const toggleGoalExpand = (id) => {
  setExpandedGoalId(prev => (prev === id ? null : id));
};


  const hasPrefilled = useRef(false);
  const scrollRef = useRef(null);

  const editingGoalId = route?.params?.editingGoalId ?? null;
  const isEditing = Boolean(activeEditId);
  const showAlert = usePremiumAlert((state) => state.showAlert);
  const clearRouteEdit = () => {
    navigation.setParams({ editingGoalId: undefined });
  };

  useEffect(() => {
    if (!editingGoalId) return;
    if (hasPrefilled.current) return;

    const goal = longGoals.find(g => g.id === editingGoalId);
    if (!goal) return;

    setTitle(goal.title);
    setDescription(goal.description || '');
    setDeadline(goal.deadline);
    setActiveEditId(goal.id);

    hasPrefilled.current = true;
    clearRouteEdit();
  }, [editingGoalId, longGoals]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setDeadline(null);
  };

  const handleSave = async () => {
    if (!title.trim()) {
   
      showAlert('Task Required', 'Please enter a goal title.',"Ok","error");
      return;
    }

    if (!deadline) {
      
      showAlert('Task Required', 'Please select a deadline.',"Ok","error");
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

        navigation.navigate('Short-Goal Setting', { longGoalId: goal.id });
      }

      resetForm();
    } catch (err) {
      console.error('Error saving long goal:', err);
    }
  };

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <ScrollView ref={scrollRef} contentContainerStyle={styles.content}>
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

          <DeadlinePicker value={deadline} onChange={setDeadline} />

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

           {longGoals.map(goal => {
  const isExpanded = expandedGoalId === goal.id;

  return (
    <View key={goal.id} style={styles.goalItem}>

      {/* TITLE + SHOW MORE */}
      <TouchableOpacity
        onPress={() => toggleGoalExpand(goal.id)}
        activeOpacity={0.8}
      >
        <Text
          style={styles.goalTitle}
          numberOfLines={isExpanded ? 10 : 2}
          ellipsizeMode="tail"
        >
          {goal.title}
        </Text>

        {/* SHOW MORE BUTTON */}
    {goal.title.length > 35 && (
  <Text style={styles.showMoreText}>
    {isExpanded ? "▲ Show less" : "▼ Show more"}
  </Text>
)}

      </TouchableOpacity>

      {/* DESCRIPTION (ONLY IF EXPANDED) */}
      {isExpanded && goal.description && (
        <Text style={styles.goalDescription}>
          {goal.description}
        </Text>
      )}

      {/* DEADLINE */}
      <Text style={styles.goalDeadline}>
        Deadline: {formatDateDisplay(goal.deadline)}
      </Text>
      <View style={styles.divider} />
      {/* FOOTER */}
      <View style={styles.goalFooter}>
        {/* EDIT */}
       <TouchableOpacity
        style={styles.editGoalButton}
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
        <Text style={styles.editGoalButtonText}>
          EDIT
        </Text>
      </TouchableOpacity>


        {/* RIGHT SIDE */}
        <View style={styles.goalFooterRight}>
          <Text style={styles.badge}>
            {Math.round(goal.completionPercentage || 0)}%
          </Text>

          <TouchableOpacity
            style={styles.addShortGoalButton}
            onPress={() =>
              navigation.navigate("Short-Goal Setting", {
                longGoalId: goal.id,
              })
            }
          >
            <Text style={styles.addShortGoalText}>
              + Short Goal
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
})}

          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}


/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  /* ===========================
     BASE
  ============================ */

  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  content: {
    padding: SPACING.xl,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },

  /* ===========================
     TOP INSTRUCTION
  ============================ */

  instruction: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.textPrimary,
    lineHeight: 28,
    marginBottom: SPACING.xl,
    letterSpacing: -0.3,
  },

  /* ===========================
     FORM AREA
  ============================ */

  form: {
    marginBottom: SPACING.xxl,
  },

  input: {
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: BORDER_RADIUS.xl,
    paddingVertical: 16,
    paddingHorizontal: 18,

    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textPrimary,

    marginBottom: SPACING.md,

    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },

  textArea: {
    minHeight: 90,
    textAlignVertical: "top",
  },

  /* ===========================
     ADD GOAL BUTTON
  ============================ */

  addButton: {
    backgroundColor: COLORS.accent,
    paddingVertical: 18,
    borderRadius: BORDER_RADIUS.full,
    alignItems: "center",
    marginTop: SPACING.md,

    shadowColor: COLORS.accent,
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 8,
  },

  addButtonText: {
    fontSize: 14,
    fontWeight: "900",
    color: COLORS.background,
    letterSpacing: 1,
  },

  /* ===========================
     GOALS LIST HEADER
  ============================ */

  goalsList: {
    marginTop: SPACING.md,
  },

  sectionTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: COLORS.textPrimary,
    marginBottom: SPACING.lg,
    letterSpacing: -0.5,
  },

  /* ===========================
     GOAL CARD (Premium)
  ============================ */

  goalItem: {
    backgroundColor: COLORS.surfaceElevated,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    marginBottom: SPACING.lg,

    shadowColor: "#000",
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },

  goalTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.textPrimary,
    lineHeight: 22,
  },

  showMoreText: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 4,
    fontWeight: "500",
  },

  goalDescription: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
    lineHeight: 18,
  },

  goalDeadline: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.textMuted,
    marginTop: SPACING.sm,
  },

  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.06)",
    marginVertical: SPACING.md,
  },

  /* ===========================
     FOOTER ROW
  ============================ */

  goalFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: SPACING.md,
  },

  goalFooterRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },

  /* ===========================
     COMPLETION BADGE
  ============================ */

  badge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.full,

    backgroundColor: "rgba(0,255,136,0.15)",
    borderWidth: 1,
    borderColor: COLORS.accent,

    fontSize: 12,
    fontWeight: "800",
    color: COLORS.accent,
  },

  /* ===========================
     EDIT BUTTON
  ============================ */

  editGoalButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.accent,

    shadowColor: COLORS.accent,
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },

  editGoalButtonText: {
    fontSize: 12,
    fontWeight: "900",
    color: COLORS.background,
    letterSpacing: 0.6,
  },

  /* ===========================
     + SHORT GOAL BUTTON
  ============================ */

  addShortGoalButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.accent,

    shadowColor: COLORS.accent,
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },

  addShortGoalText: {
    fontSize: 12,
    fontWeight: "900",
    color: COLORS.background,
    letterSpacing: 0.6,
  },
});

