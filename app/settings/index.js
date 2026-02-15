import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAppStore } from '../../store/useAppStore';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants/theme';
import TasksScreen from '../setup/tasks';

export default function SettingsScreen({ navigation }) {
  const { user, longGoals: storeLongGoals, shortGoals, streak,tasks } = useAppStore();
  const [longGoals, setLongGoals] = useState(storeLongGoals);

  // Sync store → local state
  useEffect(() => {
    setLongGoals(storeLongGoals);
  }, [storeLongGoals]);

  // Refresh when screen gains focus
  useFocusEffect(
    useCallback(() => {
      setLongGoals(storeLongGoals);
    }, [storeLongGoals])
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      {/* PROFILE */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>PROFILE</Text>
        <View style={styles.card}>
          <Text style={styles.label}>Name</Text>
          <Text style={styles.value}>{user?.name || 'Champ'}</Text>
        </View>
      </View>

      {/* STATISTICS */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>STATISTICS</Text>

        {/* STREAK BOXES SIDE BY SIDE */}
<View style={styles.streakRow}>

  {/* Current Streak */}
  <View style={styles.streakCard}>
    <Text style={styles.streaklabel}>Current Streak</Text>
    <Text style={styles.streakValue}>
      {streak?.currentStreak || 0} 
    </Text>
    <Text style={styles.label}>days</Text>

  </View>

  {/* Longest Streak */}
  <View style={styles.streakCard}>
    <Text style={styles.streaklabel}>Longest Streak</Text>
    <Text style={styles.streakValue}>
      {streak?.longestStreak || 0} 
    </Text>
    <Text style={styles.label}>days</Text>

  </View>

</View>

        {/* Long-Term Goals */}
        <TouchableOpacity
          style={styles.statCard}
          onPress={() => navigation.navigate('Long-Goals List')}
        >
         <Text style={styles.statLabel}>Long-Term Goals</Text>
        <Text style={styles.statValue}>{longGoals.length}</Text>

        </TouchableOpacity>

        {/* Short-Term Goals */}
        <TouchableOpacity
          style={styles.statCard}
          onPress={() => navigation.navigate('Short-Goals List')}
        > 
          <Text style={styles.statLabel}>Short-Term Goals</Text>
          <Text style={styles.statValue}>{shortGoals.length}</Text>

  
        </TouchableOpacity>
         <TouchableOpacity
          style={styles.statCard}
          onPress={() => navigation.navigate('Task List')}
        >
          <Text style={styles.statLabel}>TASKS</Text>
<Text style={styles.statValue}>{tasks.length}</Text>


        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Streak')}
        >
          <Text style={styles.buttonText}>
            VIEW CALENDAR STREAK
          </Text>
        </TouchableOpacity>
      </View>

      {/* REWARDS & PUNISHMENTS */}
      {/* <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          REWARDS & PUNISHMENTS
        </Text>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Rules')}
        >
          <Text style={styles.buttonText}>MANAGE RULES</Text>
        </TouchableOpacity>
      </View> */}
    </ScrollView>
  );
}


// --- STYLES ---
const styles = StyleSheet.create({
  /* ============================
     SCREEN BASE
  ============================ */

  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  content: {
    padding: SPACING.xl,
    paddingBottom: SPACING.xxl,
  },

  section: {
    marginBottom: SPACING.xl,
  },

  /* ============================
     SECTION HEADERS
  ============================ */

  sectionTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: COLORS.textPrimary,
    letterSpacing: 2,
    marginBottom: SPACING.md,
    textTransform: "uppercase",
  },

  /* ============================
     PROFILE CARD
  ============================ */

  card: {
    backgroundColor: COLORS.surfaceElevated,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.lg,

    borderRadius: BORDER_RADIUS.xl,

    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",

    marginBottom: SPACING.md,

    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",

    shadowColor: "#000",
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 5,
  },

  label: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.textMuted,
    letterSpacing: 0.5,
  },

  value: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },

  /* ============================
     STREAK MODULE ROW
  ============================ */

  streakRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },

  streakCard: {
    flex: 1,
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: BORDER_RADIUS.xl,
    paddingVertical: SPACING.lg,

    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",

    alignItems: "center",
    justifyContent: "center",

    shadowColor: "#000",
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 4,
  },

  streaklabel: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.textMuted,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: SPACING.xs,
  },

  streakValue: {
    fontSize: 26,
    fontWeight: "900",
    color: COLORS.accent,
  },

  /* ============================
     PREMIUM LIST ITEMS (Goals/Tasks)
  ============================ */

  statCard: {
    backgroundColor: COLORS.surfaceElevated,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,

    marginBottom: SPACING.md,

    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",

    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",

    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },

  statLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.textSecondary,
    letterSpacing: 0.5,
  },

  statValue: {
    fontSize: 18,
    fontWeight: "900",
    color: COLORS.accent,
  },

  /* ============================
     PREMIUM BUTTON (Calendar)
  ============================ */

  button: {
    marginTop: SPACING.lg,
    backgroundColor: COLORS.accent,

    paddingVertical: 18,
    borderRadius: BORDER_RADIUS.full,

    alignItems: "center",
    justifyContent: "center",

    shadowColor: COLORS.accent,
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 10,
  },

  buttonText: {
    fontSize: 14,
    fontWeight: "900",
    color: COLORS.background,
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
});
