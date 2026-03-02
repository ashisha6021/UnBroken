import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, SPACING, BORDER_RADIUS } from "../../constants/theme";

const GUIDE = {
  getting: {
    intro: "UnBroken is not a habit tracker. It is a discipline system.",
    blocks: [
      {
        title: "Step 1 – Set Your Name",
        content:
          "Your name personalizes the system. You can edit it anytime from Settings → Edit Profile.",
      },
      {
        title: "Step 2 – Create Long-Term Goals",
        content:
          "These are your big outcomes like getting fit, cracking CAT, or building skills.",
      },
      {
        title: "Step 3 – Break It Down",
        content:
          "Long Goal → Short Goals → Tasks → Alarms. This structure builds execution.",
      },
      {
        title: "Step 4 – Add At Least One Task",
        content:
          "The system activates only after you create your first task. Discipline starts daily.",
      },
    ],
  },

  long: {
    intro: "Long-Term Goals define your destination.",
    blocks: [
      {
        title: "Create a Goal",
        content:
          "Tap Add. Give it a clear title and deadline. Deadlines create seriousness.",
      },
      {
        title: "Edit Anytime",
        content:
          "Tap EDIT on any goal to modify it instantly.",
      },
      {
        title: "Completion %",
        content:
          "Progress updates automatically based on short goal completion.",
      },
      {
        title: "Add Short Goals",
        content:
          "Tap + Short Goal under a long goal to break it down further.",
      },
    ],
  },

  tasks: {
    intro: "Tasks are where discipline is built.",
    blocks: [
      {
        title: "Create Task",
        content:
          "Give it a name and select at least one day. No day selected = no execution.",
      },
      {
        title: "Minimum Effort Rule",
        content:
          "Optional rule like 30 mins or 10 questions to avoid doing the bare minimum.",
      },
      {
        title: "Edit Task",
        content:
          "Tap EDIT anytime to update days or task details.",
      },
    ],
  },

  alarms: {
    intro: "Alarms enforce execution.",
    blocks: [
      {
        title: "Set Time First",
        content:
          "You must select a time before enabling an alarm.",
      },
      {
        title: "No Time Conflicts",
        content:
          "Two tasks cannot ring at the same time. The app prevents conflicts.",
      },
      {
        title: "Critical Mode",
        content:
          "Rings continuously until completed. Use only for serious commitments like gym or study.",
      },
      {
        title: "Manage Alarms",
        content:
          "In Alarm List, you can disable all alarms for a specific day.",
      },
    ],
  },

  streak: {
    intro: "Streak measures consistency.",
    blocks: [
      {
        title: "Current Streak",
        content: "Your active discipline chain.",
      },
      {
        title: "Longest Streak",
        content: "Your personal best record.",
      },
      {
        title: "Calendar View",
        content:
          "View which days were completed and which were missed.",
      },
    ],
  },

  settings: {
  intro: "Settings is your control center. Everything you build in UnBroken can be viewed, edited, or managed from here.",
  blocks: [
    {
      title: "Profile Section",
      content:
        "You can view your name and tap EDIT to update it anytime.",
    },
    {
      title: "Grouped Goal Lists",
      content:
        "Long Goals, Short Goals, and Tasks are grouped separately for clarity. This makes it easier to find and manage them.",
    },
    {
      title: "Long Goal List",
      content:
        "Tap to open the full list of long goals. You can add new goals or tap EDIT on any existing goal to update it.",
    },
    {
      title: "Short Goal List",
      content:
        "View all short goals grouped under their long goals. You can add new short goals or edit existing ones from here.",
    },
    {
      title: "Task List",
      content:
        "See all your daily tasks in one place. You can add new tasks, edit days, change rules, or update details anytime.",
    },
    {
      title: "Alarm Panel",
      content:
        "See all active alarms. You can disable alarms for a specific day or manage them individually.",
    },
    {
      title: "Statistics Overview",
      content:
        "View total long goals, short goals, tasks, active alarms, current streak, and longest streak.",
    },
    {
      title: "Loser’s Section",
      content:
        "If you delete goals or reset progress, this section keeps accountability visible. No hiding from failures.",
    },
  ],
},

  mindset: {
    intro: "You don’t rise to motivation. You fall to systems.",
    blocks: [
      {
        title: "Structure",
        content: "Long → Short → Task → Alarm.",
      },
      {
        title: "Execution",
        content: "Daily tasks build identity.",
      },
      {
        title: "Consistency",
        content: "Streaks reflect discipline.",
      },
    ],
  },
};

export default function UserGuideDetailScreen({ route }) {
  const { sectionId, title } = route.params;
  const data = GUIDE[sectionId];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>

        <Text style={styles.header}>{title}</Text>
        <Text style={styles.intro}>{data?.intro}</Text>

        {data?.blocks.map((block, index) => (
          <View key={index} style={styles.block}>
            <Text style={styles.blockTitle}>{block.title}</Text>
            <Text style={styles.blockText}>{block.content}</Text>
          </View>
        ))}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SPACING.xl,
  },
  header: {
    fontSize: 24,
    fontWeight: "900",
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  intro: {
    fontSize: 15,
    color: COLORS.textMuted,
    marginBottom: SPACING.xl,
    lineHeight: 22,
  },
  block: {
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  blockTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  blockText: {
    fontSize: 14,
    color: COLORS.textMuted,
    lineHeight: 20,
  },
});