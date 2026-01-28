import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../constants/theme';

export default function ShortGoalsList({ navigation }) {
  const { shortGoals, longGoals } = useAppStore();
  const [expandedGoals, setExpandedGoals] = useState({});

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

        return (
      

          <View key={longGoal.id} style={styles.section}>
            {/* Long Goal Header */}
            <View style={styles.longGoalHeader}>
  {/* LEFT: Expand / Collapse */}
  <TouchableOpacity
    style={styles.headerTextContainer}
    onPress={() => toggleExpand(longGoal.id)}
    activeOpacity={0.7}
  >
    <Text style={styles.longGoalTitle}>
      {longGoal.title}
    </Text>
    <Text style={styles.goalDeadline}>
      Deadline: {longGoal.deadline || '—'}
    </Text>
  </TouchableOpacity>

  {/* RIGHT: Add + Arrow */}
  <View style={styles.headerRight}>
    <TouchableOpacity
      style={styles.addShortGoalButton}
      onPress={() =>
        navigation.navigate('Short-Goal Setting', {
          longGoalId: longGoal.id,
        })
      }
    >
      <Text style={styles.addShortGoalText}>
        + Short Goal
      </Text>
    </TouchableOpacity>

    <TouchableOpacity
      onPress={() => toggleExpand(longGoal.id)}
    >
      <Text style={styles.chevron}>
        {isExpanded ? '▲' : '▼'}
      </Text>
    </TouchableOpacity>
  </View>
</View>


            {/* Short Goals */}
            {isExpanded && longGoal.shortGoals.map(goal => (
              <View key={goal.id} style={styles.goalCard}>
                <View style={styles.left}>
                  <Text style={styles.title}>{goal.title}</Text>
                </View>

                <View style={styles.right}>
                  <View style={styles.completionBadge}>
                    <Text style={styles.completionText}>
                      {Math.round(goal.completionPercentage || 0)}%
                    </Text>
                  </View>

                  <TouchableOpacity style={styles.editbutton}
                    onPress={() =>
                      navigation.navigate('Short-Goal Setting', {
                        editingGoalId: goal.id,
                      })
                    }
                  >
                    <Text style={styles.edit}>EDIT</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            {isExpanded && longGoal.shortGoals.length === 0 && (
              <Text style={styles.emptyText}>
                No short goals yet
              </Text>
            )}
          </View>
        );
      })}
    </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  headerStyle:{
    ...TYPOGRAPHY.title,
    alignItems: "center",
    backgroundColor:COLORS.background,
    paddingTop:SPACING.lg
    
    

  },
  headerText:{
    fontSize:SPACING.xl,
    color:COLORS.textPrimary,
    fontWeight: '600'
  },
  container: {
    flex: 1,
    padding: SPACING.md,
    backgroundColor: COLORS.background,
  },

  section: {
    marginBottom: SPACING.md,
  },

  longGoalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    borderColor:COLORS.textPrimary,
    borderWidth:1
  },

  headerTextContainer: {
    flex: 1,
  },

  longGoalTitle: {
    ...TYPOGRAPHY.body,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },

  goalDeadline: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },

  chevron: {
    fontSize: 24,        // ⬅️ bigger arrow
    color: COLORS.accent,
    marginLeft: SPACING.md,
  },

  goalCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    padding:10,
    borderRadius: BORDER_RADIUS.md,
    marginTop: SPACING.sm,
    marginLeft: SPACING.sm,
    borderColor:COLORS.textMuted,
    borderWidth:1
  },

  left: {
    flex: 1,
  },

  title: {
    ...TYPOGRAPHY.body,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },

  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
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

  edit: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.background,
    fontWeight: '600',
  },

  emptyText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    marginLeft: SPACING.md,
    marginTop: SPACING.sm,
  },
  headerRight: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: SPACING.sm,
},

addShortGoalButton: {
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
editbutton:{ paddingHorizontal: SPACING.sm,
  paddingVertical:1,
  borderRadius: BORDER_RADIUS.sm,
  backgroundColor: COLORS.accent,
  marginLeft:SPACING.sm

}

});

