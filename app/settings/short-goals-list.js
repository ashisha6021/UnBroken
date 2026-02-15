import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../constants/theme';

export default function ShortGoalsList({ navigation }) {
  const { shortGoals, longGoals } = useAppStore();
  const [expandedGoals, setExpandedGoals] = useState({});
  const [expandedShortGoalId, setExpandedShortGoalId] = useState(null);
  const [expandedLongGoalTitleId, setExpandedLongGoalTitleId] = useState(null);

const toggleLongGoalTitle = (id) => {
  setExpandedLongGoalTitleId(prev => (prev === id ? null : id));
};



const toggleShortGoalTitle = (id) => {
  setExpandedShortGoalId(prev => (prev === id ? null : id));
};

  const toggleExpand = (id) => {
    setExpandedGoals(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const groupedShortGoals = longGoals.map(longGoal => ({
    ...longGoal,
    shortGoals: shortGoals.filter(
      sg => sg.longGoalId === longGoal.id
    ),
  }));

  return (
    <>
       <View style={styles.headerStyle}>
         <Text style={styles.headerText}>Short Goal List</Text>          
        </View>
    <ScrollView style={styles.container}>
     {groupedShortGoals.map(longGoal => {
  const isExpanded = expandedGoals[longGoal.id];
  const isTitleExpanded = expandedLongGoalTitleId === longGoal.id;

  return (
    <View key={longGoal.id} style={styles.section}>

      {/* ✅ LONG GOAL CARD */}
      <View style={styles.longGoalCard}>
          <View style={styles.taskAccentBar2} />
        {/* TITLE FULL WIDTH */}
        <TouchableOpacity
          onPress={() => toggleLongGoalTitle(longGoal.id)}
          activeOpacity={0.8}
        >
          <Text
            style={styles.longGoalTitle}
            numberOfLines={isTitleExpanded ? 10 : 2}
          >
            {longGoal.title}
          </Text>

          {longGoal.title.length > 35 && (
            <Text style={styles.showMoreText}>
              {isTitleExpanded ? "Show less ▲" : "Show more ▼"}
            </Text>
          )}
        </TouchableOpacity>
         <View style={styles.divider} />

        {/* ✅ BOTTOM ROW */}
        <View style={styles.longGoalBottomRow}>

          {/* Deadline */}
          <Text style={styles.goalDeadline}>
            Deadline: {longGoal.deadline || "—"}
          </Text>

          {/* Right Side */}
          <View style={styles.longGoalBottomRight}>

            {/* Add Button */}
            <TouchableOpacity
              style={styles.addShortGoalButton}
              onPress={() =>
                navigation.navigate("Short-Goal Setting", {
                  longGoalId: longGoal.id,
                })
              }
            >
              <Text style={styles.addShortGoalText}>+ Short Goal</Text>
            </TouchableOpacity>

            {/* Expand Arrow */}
            <TouchableOpacity
              onPress={() => toggleExpand(longGoal.id)}
            >
              <Text style={styles.chevron}>
                {isExpanded ? "▲" : "▼"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* ✅ SHORT GOALS UNDER LONG GOAL */}
      {/* ✅ SHORT GOALS UNDER LONG GOAL */}
{isExpanded &&
  longGoal.shortGoals.map(goal => {
    const isShortExpanded = expandedShortGoalId === goal.id;

    return (
      <View key={goal.id} style={styles.shortGoalCard}>
           <View style={styles.taskAccentBar} />
        {/* Title */}
        <TouchableOpacity
          onPress={() => toggleShortGoalTitle(goal.id)}
        >
          <Text
            style={styles.shortGoalTitle}
            numberOfLines={isShortExpanded ? 10 : 2}
          >
            {goal.title}
          </Text>

          {goal.title.length > 35 && (
            <Text style={styles.showMoreText}>
              {isShortExpanded ? "Show less ▲" : "Show more ▼"}
            </Text>
          )}
        </TouchableOpacity>
       <View style={styles.divider} />

        {/* ✅ Deadline */}
        {/* ✅ Bottom Row: Deadline + % + Edit */}
<View style={styles.shortGoalBottomRow}>

  {/* Deadline Left */}
  <Text style={styles.shortGoalDeadline}>
    Deadline: {goal.deadline || "—"}
  </Text>

  {/* Right Side: % + Edit */}
  <View style={styles.shortGoalActions}>

    <View style={styles.completionBadge}>
      <Text style={styles.completionText}>
        {Math.round(goal.completionPercentage || 0)}%
      </Text>
    </View>

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

  </View>
</View>

      </View>
    );
  })}


      {/* Empty */}
      {isExpanded && longGoal.shortGoals.length === 0 && (
        <Text style={styles.emptyText}>No short goals yet</Text>
      )}
    </View>
  );
})}

    </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  /* ===========================
     HEADER
  ============================ */

  headerStyle: {
    alignItems: "center",
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.lg,
    backgroundColor: COLORS.background,
  },

  headerText: {
    fontSize: 34,
    fontWeight: "900",
    color: COLORS.textPrimary,
    letterSpacing: -0.8,
  },

  container: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    backgroundColor: COLORS.background,
  },

  section: {
    marginBottom: SPACING.xl,
  },

  /* ===========================
     LONG GOAL CARD (Premium)
  ============================ */

  longGoalCard: {
    backgroundColor: COLORS.surfaceElevated,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,

    shadowColor: "#000",
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },

  longGoalTitle: {
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

  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.06)",
    marginVertical: SPACING.sm,
  },

  longGoalBottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  goalDeadline: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.textSecondary,
    flex: 1,
  },

  longGoalBottomRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },

  /* ===========================
     + SHORT GOAL BUTTON
  ============================ */

  addShortGoalButton: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: BORDER_RADIUS.full,

    shadowColor: COLORS.accent,
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },

  addShortGoalText: {
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.background,
    letterSpacing: 0.5,
  },

  /* Chevron Chip */
  chevron: {
    fontSize: 16,
    fontWeight: "900",
    color: COLORS.accent,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: "rgba(0,255,136,0.08)",
  },

  /* ===========================
     SHORT GOAL CARD (Nested Glass)
  ============================ */

  shortGoalCard: {
    backgroundColor: "rgba(255,255,255,0.03)",
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,

    marginLeft: SPACING.md,
    marginTop: SPACING.md,

    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },

  shortGoalTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.textPrimary,
    lineHeight: 20,
  },

  /* ===========================
     SHORT GOAL BOTTOM ROW
  ============================ */

  shortGoalBottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: SPACING.sm,
  },

  shortGoalDeadline: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.textMuted,
    flex: 1,
  },

  shortGoalActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },

  /* Completion Badge */
  completionBadge: {
    backgroundColor: "rgba(0,255,136,0.15)",
    borderWidth: 1,
    borderColor: COLORS.accent,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: BORDER_RADIUS.full,
  },

  completionText: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.accent,
  },

  /* EDIT Button */
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

  emptyText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.textMuted,
    marginLeft: SPACING.md,
    marginTop: SPACING.sm,
  },
  taskAccentBar: {
  position: "absolute",
  left: 0,
  top: 12,
  bottom: 12,
  width: 4,
  borderRadius: 10,
  backgroundColor: COLORS.accent, // ✅ green stripe
},
taskAccentBar2: {
  position: "absolute",
  left: 0,
  top: 12,
  bottom: 12,
  width: 4,
  borderRadius: 10,
  backgroundColor: COLORS.warning, // ✅ green stripe
},

});


