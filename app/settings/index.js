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
  const { user, longGoals: storeLongGoals, shortGoals, streak,tasks,taskAlarms } = useAppStore();
  const [longGoals, setLongGoals] = useState(storeLongGoals);
 console.log("THis is alarm data",taskAlarms)
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
<View style={styles.profileCard}>

  {/* Left Side: Avatar */}
  <View style={styles.avatarCircle}>
    <Text style={styles.avatarText}>
      {(user?.name?.[0] || "C").toUpperCase()}
    </Text>
  </View>

  {/* Middle: Name */}
  <View style={styles.profileDetails}>
    <Text style={styles.profileLabel}>Profile Name</Text>

    <Text style={styles.profileName}>
      {user?.name || "Champ"}
    </Text>
  </View>

  {/* Right Side: Edit */}
  <TouchableOpacity
    style={styles.editButton}
    onPress={() => navigation.navigate("Edit Profile")}
  >
    <Text style={styles.editIcon}>✏️</Text>
  </TouchableOpacity>

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
  style={styles.statCard}
  onPress={() => navigation.navigate('Alarm List')}
>
  <Text style={styles.statLabel}>ALARMS</Text>

  <Text style={styles.statValue}>
  {
    Object.values(taskAlarms)
      .flat()
      .filter(alarm => alarm.enabled).length
  }
</Text>
  
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

  {/* ============================
    LOSERS SECTION ENTRY
============================ */}

  <TouchableOpacity
    style={styles.losersButton}
    onPress={() => navigation.navigate('Losers Screen')}
    activeOpacity={0.85}
  >
    <Text style={styles.losersButtonText}>
      LOSER'S SECTION
    </Text>
  
  </TouchableOpacity>

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
  editButton: {
  paddingVertical: 8,
  paddingHorizontal: 16,
  borderRadius: BORDER_RADIUS.full,
  backgroundColor: "rgba(255,255,255,0.08)",
},

editText: {
  fontSize: 12,
  fontWeight: "800",
  color: COLORS.accent,
  letterSpacing: 1,
},


  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  content: {
    padding: SPACING.xl,
    paddingTop:20,
    paddingBottom: SPACING.sm,
  },

  section: {
    marginBottom: SPACING.lg,
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
    marginBottom: SPACING.md,
  },

  streakCard: {
    flex: 1,
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: BORDER_RADIUS.xl,
    paddingVertical: SPACING.md,

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
    paddingVertical:20 ,
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
    marginTop: 10,
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
 profileCard: {
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: COLORS.surfaceElevated,
  borderRadius: 25,
  paddingVertical: 19,
  paddingHorizontal: SPACING.lg,
  marginBottom: SPACING.lg,

  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.08)",

  shadowColor: "#000",
  shadowOpacity: 0.4,
  shadowRadius: 14,
  elevation: 8,
},

/* Avatar */
avatarCircle: {
  width: 58,
  height: 58,
  borderRadius: 29,
  backgroundColor: "rgba(0,255,150,0.15)",

  alignItems: "center",
  justifyContent: "center",
},

avatarText: {
  fontSize: 22,
  fontWeight: "900",
  color: COLORS.accent,
},

/* Name Section */
profileDetails: {
  flex: 1,
  marginLeft: SPACING.md,
},

profileLabel: {
  fontSize: 13,
  fontWeight: "700",
  color: COLORS.textMuted,
  textTransform: "uppercase",
  letterSpacing: 1,
},

profileName: {
  fontSize: 20,
  fontWeight: "900",
  color: COLORS.textPrimary,
  marginTop: 4,
},

/* Edit Button */
editButton: {
  width: 44,
  height: 44,
  borderRadius: 22,
  backgroundColor: "rgba(255,255,255,0.06)",

  alignItems: "center",
  justifyContent: "center",

  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.08)",
},

editIcon: {
  fontSize: 16,
},

losersButton: {
  width: "100%",
  marginTop: 2,
  paddingVertical: SPACING.md,
  borderRadius: BORDER_RADIUS.xl,

  backgroundColor: "rgba(255, 0, 0, 0.08)",
  borderWidth: 1,
  borderColor: "rgba(255, 0, 0, 0.3)",

  alignItems: "center",
  justifyContent: "center",

  shadowColor: "#ff0000",
  shadowOpacity: 0.25,
  shadowRadius: 12,
  elevation: 8,
},

losersButtonText: {
  fontSize: 14,
  fontWeight: "900",
  color: "#ff4d4d",
  letterSpacing: 1,
},

losersSubText: {
  fontSize: 11,
  color: COLORS.textMuted,
  marginTop: 4,
},


});
