import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import {
  COLORS,
  SPACING,
  BORDER_RADIUS,
} from "../../constants/theme";

export default function SetupScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>

        {/* Premium Hero Title */}
        <Text style={styles.title}>Welcome to</Text>
        <Text style={styles.brand}>UnBroken</Text>

        {/* Premium Subtitle */}
        <Text style={styles.subtitle}>
          This is not just another habit app.
          {"\n\n"}
          UnBroken is your discipline system — built to turn long-term goals into
          daily execution.
        </Text>

        {/* Premium Info Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>What you’ll set up:</Text>

          <Text style={styles.cardItem}>🔥 Long-Term Goals</Text>
          <Text style={styles.cardItem}>⚡ Short-Term Missions</Text>
          <Text style={styles.cardItem}>✅ Daily Tasks & Alarms</Text>
        </View>

        {/* Premium CTA Button */}
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("Name Setup")}
          activeOpacity={0.85}
        >
          <Text style={styles.buttonText}>START YOUR JOURNEY</Text>
        </TouchableOpacity>

        {/* Footer Hint */}
        <Text style={styles.footerText}>
          Setup takes less than 2 minutes.
        </Text>
      </View>
    </View>
  );
}

/* ============================
   PREMIUM STYLES
============================ */
const styles = StyleSheet.create({
  /* Screen Base */
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SPACING.xl,
  },

  content: {
    flex: 1,
    justifyContent: "center",
    maxWidth: 420,
    alignSelf: "center",
    width: "100%",
  },

  /* Title */
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: COLORS.textSecondary,
    letterSpacing: 0.5,
  },

  brand: {
    fontSize: 44,
    fontWeight: "900",
    color: COLORS.accent,
    letterSpacing: 1,
    marginBottom: SPACING.lg,
  },

  /* Subtitle */
  subtitle: {
    fontSize: 16,
    fontWeight: "500",
    color: COLORS.textPrimary,
    opacity: 0.85,
    lineHeight: 26,
    marginBottom: SPACING.xxl,
  },

  /* Premium Glass Card */
  card: {
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: BORDER_RADIUS.xl,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.lg,

    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",

    shadowColor: "#000",
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 6,

    marginBottom: SPACING.xxl,
  },

  cardTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.textMuted,
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginBottom: SPACING.md,
  },

  cardItem: {
    fontSize: 17,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },

  /* Premium CTA Button */
  button: {
    backgroundColor: COLORS.accent,
    paddingVertical: 18,
    borderRadius: BORDER_RADIUS.full,

    alignItems: "center",
    justifyContent: "center",

    shadowColor: COLORS.accent,
    shadowOpacity: 0.4,
    shadowRadius: 18,
    elevation: 10,
  },

  buttonText: {
    fontSize: 14,
    fontWeight: "900",
    color: COLORS.background,
    letterSpacing: 1.4,
    textTransform: "uppercase",
  },

  /* Footer */
  footerText: {
    marginTop: SPACING.lg,
    fontSize: 13,
    textAlign: "center",
    color: COLORS.textMuted,
    opacity: 0.65,
  },
});
