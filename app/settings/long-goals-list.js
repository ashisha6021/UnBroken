import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useAppStore } from '../../store/useAppStore';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../constants/theme';
import { formatDateDisplay } from '../../utils/dateHelpers';
import { useState } from "react";


export default function LongGoalsList({ navigation }) {
  const { longGoals } = useAppStore();

  const handleEditGoal = (goal) => {
    navigation.navigate('Long-Goal Setting', {
      editingGoalId: goal.id,
    });
  };
  const [expandedId, setExpandedId] = useState(null);

const toggleExpand = (id) => {
  setExpandedId(prev => (prev === id ? null : id));
};

  return (
    <>
 <View style={styles.headerRow}>
  <Text style={styles.headerText}>Long Goal List</Text>

  <TouchableOpacity
    style={styles.addGoalButton}
    onPress={() => navigation.navigate("Long-Goal Setting")}
  >
    <Text style={styles.addGoalButtonText}>+ Add</Text>
  </TouchableOpacity>
</View>

    <ScrollView
      style={{
        flex: 1,
        padding: SPACING.lg,
        backgroundColor: COLORS.background,
      }}
    >
      {longGoals.map((goal) => {
  const isExpanded = expandedId === goal.id;

  return (
    <View key={goal.id} style={styles.goalCard}>
     <View style={styles.taskAccentBar2} />
      {/* ✅ TITLE FULL WIDTH */}
      <TouchableOpacity onPress={() => toggleExpand(goal.id)}>
        <Text
          style={styles.goalTitle}
          numberOfLines={isExpanded ? 10 : 2}
          ellipsizeMode="tail"
        >
          {goal.title}
        </Text>

        {/* SHOW MORE INDICATOR */}
        {goal.title.length > 25 && (
          <Text style={styles.showMoreText}>
            {isExpanded ? "Show less ▲" : "Show more ▼"}
          </Text>
        )}
      </TouchableOpacity>
      <View style={styles.divider} />
      {/* ✅ BOTTOM ROW: Deadline + % + Edit */}
      <View style={styles.bottomRow}>

        {/* Deadline */}
        <Text style={styles.goalDeadline}>
          Deadline:{" "}
          {goal.deadline ? formatDateDisplay(goal.deadline) : "—"}
        </Text>

        {/* Right Side */}
        <View style={styles.bottomRight}>

          {/* % Badge */}
          <View style={styles.completionBadge}>
            <Text style={styles.completionText}>
              {Math.round(goal.completionPercentage || 0)}%
            </Text>
          </View>

          {/* Edit Button */}
          <TouchableOpacity
            onPress={() => handleEditGoal(goal)}
            style={styles.editButton}
          >
            <Text style={styles.editButtonText}>EDIT</Text>
          </TouchableOpacity>

        </View>
      </View>
    </View>
  );
})}

    </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  /* ===========================
     HEADER ROW
  ============================ */
 taskAccentBar2: {
  position: "absolute",
  left: 0,
  top: 12,
  bottom: 12,
  width: 4,
  borderRadius: 10,
  backgroundColor: COLORS.warning, 
},

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.background,
  },

  headerText: {
    fontSize: 34,
    fontWeight: "900",
    color: COLORS.textPrimary,
    letterSpacing: -0.8,
  },

  addGoalButton: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: BORDER_RADIUS.full,

    shadowColor: COLORS.accent,
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },

  addGoalButtonText: {
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.background,
    letterSpacing: 0.5,
  },

  /* ===========================
     GOAL CARD (Premium Glass)
  ============================ */

  goalCard: {
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: BORDER_RADIUS.xl,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,

    shadowColor: "#000",
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },

  /* ===========================
     TITLE
  ============================ */

  goalTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.textPrimary,
    lineHeight: 24,
    letterSpacing: -0.2,
  },

  showMoreText: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 4,
    fontWeight: "500",
  },

  /* ===========================
     DIVIDER LINE
  ============================ */

  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.06)",
    marginVertical: SPACING.md,
  },

  /* ===========================
     BOTTOM ROW
  ============================ */

  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  goalDeadline: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },

  bottomRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },

  /* ===========================
     COMPLETION BADGE
  ============================ */

  completionBadge: {
    backgroundColor: "rgba(0,255,136,0.12)",
    borderWidth: 1,
    borderColor: "rgba(0,255,136,0.25)",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.full,
  },

  completionText: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.accent,
  },

  /* ===========================
     EDIT BUTTON (Premium Pill)
  ============================ */

  editButton: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: BORDER_RADIUS.full,

    shadowColor: COLORS.accent,
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },

  editButtonText: {
    fontSize: 12,
    fontWeight: "900",
    color: COLORS.background,
    letterSpacing: 0.6,
  },
});

