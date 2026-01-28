import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useAppStore } from '../../store/useAppStore';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../constants/theme';
import { formatDateDisplay } from '../../utils/dateHelpers';

export default function LongGoalsList({ navigation }) {
  const { longGoals } = useAppStore();

  const handleEditGoal = (goal) => {
    navigation.navigate('Long-Goal Setting', {
      editingGoalId: goal.id,
    });
  };

  return (
    <>
    <View style={styles.headerStyle}>
             <Text style={styles.headerText}>Long Goal List</Text>          
            </View>
    <ScrollView
      style={{
        flex: 1,
        padding: SPACING.lg,
        backgroundColor: COLORS.background,
      }}
    >
      {longGoals.map((goal) => (
        <View key={goal.id} style={styles.goalCard}>
          <View style={styles.goalCardLeft}>
            <View style={{ flex: 1 }}>
              <Text style={styles.goalTitle}>{goal.title}</Text>
              <Text style={styles.goalDeadline}>
                Deadline:{' '}
                {goal.deadline ? formatDateDisplay(goal.deadline) : '—'}
              </Text>
            </View>

            <View style={styles.completionBadge}>
              <Text style={styles.completionText}>
                {Math.round(goal.completionPercentage || 0)}%
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => handleEditGoal(goal)}
            style={styles.editButton}
          >
            <Text style={styles.editButtonText}>EDIT</Text>
          </TouchableOpacity>
        </View>
      ))}
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
  goalCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
    borderColor:COLORS.textMuted,
    borderWidth:1,
  },
  goalCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: SPACING.sm,
  },
  goalTitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.textPrimary,
    fontWeight: '900',
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
  editButton:{ paddingHorizontal: SPACING.sm,
  paddingVertical:1,
  borderRadius: BORDER_RADIUS.sm,
  backgroundColor: COLORS.accent,
  marginLeft:SPACING.sm

},
  editButtonText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.background,
    fontWeight: '600',
  },
  goalDeadline: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textPrimary,
    marginTop: SPACING.xs,
  }
});
