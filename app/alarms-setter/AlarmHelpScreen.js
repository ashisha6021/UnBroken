import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Linking } from "react-native";
import { COLORS, SPACING, BORDER_RADIUS } from "../../constants/theme";

export default function AlarmHelpScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Alarm Help</Text>

      <Text style={styles.subtitle}>
        Some Android devices may block alarms from ringing or showing on the lock
        screen.
      </Text>

      {/* Step Card */}
      <View style={styles.card}>
        <Text style={styles.stepTitle}>1. Allow Display Over Apps</Text>
        <Text style={styles.stepText}>
          Settings → Apps → UnBroken → Special Access → Display Over Other Apps → Allow
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.stepTitle}>2. Disable Battery Optimization</Text>
        <Text style={styles.stepText}>
          Settings → Battery → Optimization → UnBroken → Don’t Optimize
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.stepTitle}>3. Enable Full Screen Notifications</Text>
        <Text style={styles.stepText}>
          Settings → Notifications → Alarm Alerts → Full Screen ON
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.stepTitle}>4. Allow Alarms & Reminders</Text>
        <Text style={styles.stepText}>
          Settings → Special Access → Alarms & Reminders → Allow UnBroken
        </Text>
      </View>

      {/* Open Settings */}
      <TouchableOpacity
        style={styles.button}
        activeOpacity={0.85}
        onPress={() => Linking.openSettings()}
      >
        <Text style={styles.buttonText}>OPEN SETTINGS</Text>
      </TouchableOpacity>
    </View>
  );
}

/* ===========================
   PREMIUM STYLES
=========================== */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SPACING.xl,
  },

  title: {
    fontSize: 28,
    fontWeight: "900",
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },

  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: SPACING.xl,
  },

  card: {
    backgroundColor: COLORS.surfaceElevated,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  stepTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.accent,
    marginBottom: 6,
  },

  stepText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },

  button: {
    marginTop: SPACING.xl,
    backgroundColor: COLORS.accent,
    paddingVertical: 16,
    borderRadius: BORDER_RADIUS.full,
    alignItems: "center",
  },

  buttonText: {
    fontSize: 14,
    fontWeight: "900",
    color: COLORS.background,
    letterSpacing: 1,
  },
});
