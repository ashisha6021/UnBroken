import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, SPACING, BORDER_RADIUS } from "../../constants/theme";

const sections = [
  { id: "getting", title: "🏠 Getting Started", subtitle: "How to begin your journey" },
  { id: "long", title: "🎯 Long-Term Goals", subtitle: "Your big outcomes" },
  { id: "short", title: "⚡ Short-Term Goals", subtitle: "Turning goals into plans" },
  { id: "tasks", title: "✅ Tasks & Daily Execution", subtitle: "Daily discipline layer" },
  { id: "alarms", title: "⏰ Alarms & Critical Mode", subtitle: "Execution enforcement" },
  { id: "streak", title: "📊 Streak & Progress", subtitle: "Tracking consistency" },
  { id: "settings", title: "⚙️ Settings & Management", subtitle: "Control everything" },,
  { id: "mindset", title: "🧠 Discipline Philosophy", subtitle: "The system mindset" },
];

export default function UserGuideScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        <Text style={styles.title}>Welcome to Your UnBroken Guide</Text>
        <Text style={styles.subtitle}>
          This isn’t just how the app works.
          {"\n"}This is how you build discipline using it.
        </Text>

       {sections.map((section) => (
  <TouchableOpacity
    key={section.id}
    style={styles.card}
    activeOpacity={0.85}
    onPress={() =>
      navigation.navigate("Detail User Guide", {
        sectionId: section.id,
        title: section.title,
      })
    }
  >
    <View style={styles.leftSection}>

      <View>
        <Text style={styles.cardTitle}>{section.title}</Text>
        <Text style={styles.cardSubtitle}>{section.subtitle}</Text>
      </View>

    </View>

    <Text style={styles.chevron}>›</Text>

  </TouchableOpacity>
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
  title: {
    fontSize: 28,
    fontWeight: "900",
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.textMuted,
    marginBottom: SPACING.xl,
    lineHeight: 22,
  },
  card: {
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  cardSubtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  chevron: {
    fontSize: 22,
    color: COLORS.accent,
  },
  leftSection: {
  flexDirection: "row",
  alignItems: "center",
},


});