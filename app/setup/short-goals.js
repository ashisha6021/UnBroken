import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  FlatList,
  Alert, Modal, Animated
} from 'react-native';
import { useAppStore } from '../../store/useAppStore';
import { addShortGoal, updateShortGoal } from '../../storage/storage-sqlite';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants/theme';
import DeadlinePicker from '../../utils/DeadlinePicker123';
import { usePremiumAlert } from "../../store/usePremiumAlert";
import { formatDateDisplay } from '../../utils/dateHelpers';

export default function ShortGoalsScreen({ navigation, route }) {
  const editingGoalId = route?.params?.editingGoalId ?? null;
  const routeLongGoalId = route?.params?.longGoalId ?? null;
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
  const [modalVisible, setModalVisible] = useState(false);
  const [expandedMap, setExpandedMap] = useState({});
const [overflowMap, setOverflowMap] = useState({});
 
  const updatedGoalId = route?.params?.updatedGoalId ?? null;

const scrollRef = useRef(null);
const goalPositions = useRef({});
const glowAnim = useRef(new Animated.Value(0)).current;

const [highlightedGoalId, setHighlightedGoalId] = useState(null);
  const showAlert = usePremiumAlert((state) => state.showAlert);
  const editingGoal = isEditing
    ? shortGoals.find(g => g.id === editingGoalId)
    : null;

  const linkedLongGoal = editingGoal
    ? longGoals.find(lg => lg.id === editingGoal.longGoalId)
    : null;

const detectOverflow = (e, id) => {

  if (overflowMap[id] !== undefined) return;

  const lines = e.nativeEvent?.lines;
  if (!lines) return;

  const lastLine = lines[1]?.text || "";

  const cleaned = lastLine
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .trim();

  const isOverflow =
    lines.length === 2 &&
    /…|\.\.\./.test(cleaned);

  if (isOverflow) {
    setOverflowMap(prev => ({
      ...prev,
      [id]: true
    }));
  }
};

const toggleExpand = (id) => {
  if (!overflowMap[id]) return;

  setExpandedMap(prev => ({
    ...prev,
    [id]: !prev[id]
  }));
};
  // Initialize selected long goal
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
  if (!updatedGoalId) return;

  setHighlightedGoalId(updatedGoalId);

  setTimeout(() => {
    const y = goalPositions.current[updatedGoalId];

    if (y !== undefined && scrollRef.current) {
      scrollRef.current.scrollTo({
        y: y +20,
        animated: true,
      });
    }

    setTimeout(() => {
      setHighlightedGoalId(null);
    }, 2000);

  }, 300);

}, [updatedGoalId]);

useEffect(() => {
  if (!highlightedGoalId) return;

  glowAnim.setValue(0);

  Animated.sequence([
    Animated.timing(glowAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: false,
    }),
    Animated.delay(1200),
    Animated.timing(glowAnim, {
      toValue: 0,
      duration: 400,
      useNativeDriver: false,
    })
  ]).start();

}, [highlightedGoalId]);

  // Scroll selector to active long goal
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
    if (!isEditing) return;

    const goal = shortGoals.find(g => g.id === editingGoalId);
    if (!goal) return;

    setTitle(goal.title);
    setDescription(goal.description || '');
    setLongGoalId(goal.longGoalId);
    if (goal.deadline) setDeadline(goal.deadline);
  }, [editingGoalId, shortGoals]);
    
  // 🔒 Active long goal & its deadline
const activeLongGoal = longGoals.find(
  lg => lg.id === longGoalId
);
const hasLongTitles = longGoals.some(goal => goal.title.length > 18);

const longGoalDeadline = activeLongGoal?.deadline
  ? new Date(activeLongGoal.deadline)
  : null;

  const handleSave = async () => {
    if (!title.trim()) {
      
      showAlert("Task Required", "Please enter a goal title.","Ok","error");
      return;
    }

    if (!longGoalId) {
      
      showAlert("Task Required", "Please select a long-term goal.","Ok","error");
      return;
    }

    if (!deadline) {
      
      showAlert("Task Required", "Please select a deadline.","Ok","error");

      return;
    }
    if (
        longGoalDeadline &&
        new Date(deadline) > longGoalDeadline
      ) {
        showAlert('Invalid deadline', 'Short-term goal deadline cannot exceed the long-term goal deadline.',"Ok","error");
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
        navigation.navigate("Short-Goal Setting", {
          updatedGoalId: editingGoalId,
          longGoalId
        });
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

        navigation.navigate('Task Setting', {
          shortGoalId: newGoal.id,
          longGoalId,
        });
      }
    } catch (err) {
     
      showAlert('Error', 'Failed to save short-term goal.',"Ok","error");
    }
  };

  const filteredShortGoals = shortGoals.filter(
    goal => goal.longGoalId === longGoalId
  );

  return (
    <ScrollView
            ref={scrollRef}
            style={styles.container}
            contentContainerStyle={styles.content}
          >
      <Text style={styles.instruction}>
        {isEditing
          ? 'Update your short-term goal.'
          : 'Create short-term goals that lead to your long-term success.'}
      </Text>

      {/* LONG GOAL SELECTOR */}
      <View style={styles.selectorContainer}>
        <Text style={styles.label}>Linked Long-Term Goal</Text>

        {isEditing && linkedLongGoal ? (
          <View style={styles.lockedLongGoal}>
            <Text style={styles.lockedLongGoalText}>
              {linkedLongGoal.title}
            </Text>
            <Text style={styles.goalDeadline}>
              Deadline: {linkedLongGoal.deadline || '—'}
            </Text>
          </View>
        ) : hasLongTitles ? (
            /* ✅ MODAL BUTTON MODE */
            <>
              <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => setModalVisible(true)}
              >
                <Text style={styles.dropdownButtonText}>
                  {longGoalId
                    ? longGoals.find(g => g.id === longGoalId)?.title
                    : "Select a Long-Term Goal"}
                </Text>
              </TouchableOpacity>

              {/* ✅ MODAL GOES HERE */}
              <Modal visible={modalVisible} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                  <View style={styles.modalBox}>
                    <Text style={styles.modalTitle}>
                      Choose Long-Term Goal
                    </Text>

                    <ScrollView>
                      {longGoals.map(item => (
                        <TouchableOpacity
                          key={item.id}
                          style={[
                            styles.modalItem,
                            longGoalId === item.id && styles.modalItemActive,
                          ]}
                          onPress={() => {
                            setLongGoalId(item.id);
                            setModalVisible(false);
                          }}
                        >
                          <Text
                            style={[
                              styles.modalItemText,
                              longGoalId === item.id &&
                                styles.modalItemTextActive,
                            ]}
                          >
                            {item.title}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>

                    <TouchableOpacity
                      style={styles.closeButton}
                      onPress={() => setModalVisible(false)}
                    >
                      <Text style={styles.closeButtonText}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Modal>
            </>
          ) 
        : ( 
          <FlatList
            ref={listRef}
            horizontal
            data={longGoals}
            keyExtractor={item => item.id}
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

      {/* FORM */}
      <Text style={styles.label}>Add Short-Term Goal</Text>
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

        <DeadlinePicker value={deadline} onChange={setDeadline}  maxDate={longGoalDeadline}/>

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
                navigation.navigate('Task Setting', {
                  shortGoalId: editingGoalId,
                  longGoalId,
                })
              }
            >
              <Text style={styles.saveButtonText}>ADD TASK</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* EXISTING GOALS */}
      {!isEditing && filteredShortGoals.length > 0 && (
        <View style={styles.existingGoalsContainer}>
          <Text style={styles.sectionTitle}>Short-Term Goals</Text>

          {filteredShortGoals.map(goal => (
    <Animated.View
  key={goal.id}
  onLayout={(e) => {
    goalPositions.current[goal.id] = e.nativeEvent.layout.y;
  }}
  style={[
    styles.existingGoalCard,
    highlightedGoalId === goal.id && {
      shadowColor: COLORS.accent,
      shadowOpacity: glowAnim,
      shadowRadius: glowAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 18]
      }),
      borderWidth: glowAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 2]
      }),
      borderColor: COLORS.accent
    }
  ]}
>

  {/* TOP: TITLE */}
<TouchableOpacity
  activeOpacity={0.8}
  onPress={() => toggleExpand(goal.id)}
>
  <Text
    style={styles.existingGoalTitle}
    numberOfLines={expandedMap[goal.id] ? undefined : 2}
    onTextLayout={(e) => {
      if (!expandedMap[goal.id]) {
        detectOverflow(e, goal.id);
      }
    }}
  >
    {goal.title}
  </Text>


  {overflowMap[goal.id] && (
    <Text style={styles.expandHint}>
      {expandedMap[goal.id] ? "Show less ▲" : "Read more ▼"}
    </Text>
  )}
    <Text style={styles.goalDeadline}>
  Deadline: {goal.deadline ? formatDateDisplay(goal.deadline) : "—"}
</Text>
</TouchableOpacity>

  <View
  style={{
    height: 1,
    backgroundColor: "rgba(255,255,255,0.06)",
    marginVertical: 12,
  }}
/>


  {/* BOTTOM ROW: % + BUTTONS */}
  <View style={styles.bottomRow}>

    {/* % Complete */}
    <Text style={styles.existingGoalProgress}>
      {Math.round(goal.completionPercentage || 0)}% complete
    </Text>

    {/* Buttons */}
    <View style={styles.goalActions}>
      <TouchableOpacity
        style={styles.editButton}
        onPress={() =>
          navigation.navigate("Short-Goal Setting", {
            editingGoalId: goal.id,
          })
        }
      >
        <Text style={styles.editButtonText}>EDIT</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.addTaskButton}
        onPress={() =>
          navigation.navigate("Task Setting", {
            shortGoalId: goal.id,
            longGoalId: goal.longGoalId,
          })
        }
      >
        <Text style={styles.addTaskButtonText}>ADD TASK</Text>
      </TouchableOpacity>
    </View>
  </View>
</Animated.View>

          ))}
        </View>
      )}

    </ScrollView>
  );
}

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  /* ===========================
     BASE
  ============================ */
 goalDeadline: {
  fontSize: 12,
  color: COLORS.textMuted,
  marginTop: 4,
  fontWeight: "600",
},
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
     HEADER TEXT
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
     LABELS
  ============================ */

  label: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.textMuted,
    marginBottom: SPACING.sm,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },

  /* ===========================
     LONG GOAL SELECTOR
  ============================ */

  selectorContainer: {
    marginBottom: SPACING.xl,
  },

  selectorItem: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.surfaceElevated,
    marginRight: SPACING.sm,

    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },

  selectorItemActive: {
    backgroundColor: COLORS.accent,
  },

  selectorText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },

  selectorTextActive: {
    color: COLORS.background,
    fontWeight: "800",
  },

  /* ===========================
     LOCKED LONG GOAL
  ============================ */

  lockedLongGoal: {
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,

    shadowColor: "#000",
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },

  lockedLongGoalText: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.textPrimary,
    lineHeight: 22,
  },

  goalDeadline: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 6,
    fontWeight: "600",
  },

  /* ===========================
     FORM INPUTS
  ============================ */

  form: {
    marginTop: SPACING.md,
    marginBottom: SPACING.lg,
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
     BUTTONS
  ============================ */

  buttonContainer: {
    gap: SPACING.md,
    marginTop: SPACING.sm,
  },

  saveButton: {
    backgroundColor: COLORS.accent,
    paddingVertical: 18,
    borderRadius: BORDER_RADIUS.full,
    alignItems: "center",

    shadowColor: COLORS.accent,
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 8,
  },

  saveButtonText: {
    fontSize: 14,
    fontWeight: "900",
    color: COLORS.background,
    letterSpacing: 1,
  },

  addTaskButtonLarge: {
    // backgroundColor: "rgba(0,255,136,0.15)",
    backgroundColor:COLORS.accent,
    borderWidth: 1,
    borderColor: COLORS.accent,
    paddingVertical: 16,
    borderRadius: BORDER_RADIUS.full,
    alignItems: "center",
  },

  /* ===========================
     SECTION TITLE
  ============================ */

  sectionTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: COLORS.textPrimary,
    marginBottom: SPACING.lg,
    letterSpacing: -0.5,
  },

  /* ===========================
     EXISTING SHORT GOAL CARD
  ============================ */

  existingGoalCard: {
    backgroundColor: COLORS.surfaceElevated,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    marginBottom: SPACING.lg,

    shadowColor: "#000",
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },

  existingGoalTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.textPrimary,
    lineHeight: 22,
  },

  expandHint: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 4,
  },

  /* ===========================
     BOTTOM ROW
  ============================ */

  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: SPACING.md,
  },

  /* ===========================
     PROGRESS BADGE
  ============================ */

  existingGoalProgress: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.full,

    backgroundColor: "rgba(0,255,136,0.12)",
    borderWidth: 1,
    borderColor: COLORS.accent,

    fontSize: 12,
    fontWeight: "800",
    color: COLORS.accent,
  },

  /* ===========================
     ACTION BUTTONS
  ============================ */

  goalActions: {
    flexDirection: "row",
    gap: SPACING.sm,
  },

  editButton: {
    marginLeft:SPACING.sm,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.accent,

    shadowColor: COLORS.accent,
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },

  editButtonText: {
    fontSize: 11,
    fontWeight: "900",
    color: COLORS.background,
    letterSpacing: 0.6,
  },

  addTaskButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.accent,

    shadowColor: COLORS.accent,
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },

  addTaskButtonText: {
    fontSize: 11,
    fontWeight: "900",
    color: COLORS.background,
    letterSpacing: 0.6,
  },

  /* ===========================
     MODAL PREMIUM LOOK
  ============================ */
  /* ===========================
   DROPDOWN BUTTON (Premium)
=========================== */

dropdownButton: {
  backgroundColor: COLORS.surfaceElevated,
  borderRadius: BORDER_RADIUS.xl,
  paddingVertical: 16,
  paddingHorizontal: 18,

  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",

  shadowColor: "#000",
  shadowOpacity: 0.3,
  shadowRadius: 10,
  elevation: 6,
},

dropdownButtonText: {
  fontSize: 14,
  fontWeight: "700",
  color: COLORS.textPrimary,
  flex: 1,
},

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    justifyContent: "center",
    padding: SPACING.lg,
  },

  modalBox: {
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    maxHeight: "75%",

    shadowColor: "#000",
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 10,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: COLORS.textPrimary,
    marginBottom: SPACING.lg,
  },

  modalItem: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
    backgroundColor: COLORS.surface,
  },

  modalItemActive: {
    backgroundColor: "rgba(0,255,136,0.15)",
    borderWidth: 1,
    borderColor: COLORS.accent,
  },

  modalItemText: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },

  modalItemTextActive: {
    color: COLORS.accent,
    fontWeight: "800",
  },

  closeButton: {
    marginTop: SPACING.lg,
    paddingVertical: 14,
    borderRadius: BORDER_RADIUS.full,
    alignItems: "center",
    backgroundColor: COLORS.surface,
  },

  closeButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },

});

