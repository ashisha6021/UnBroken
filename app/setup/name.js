import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";

import { useAppStore } from "../../store/useAppStore";
import { saveUser } from "../../storage/storage-sqlite";
import {
  COLORS,
  TYPOGRAPHY,
  SPACING,
  BORDER_RADIUS,
} from "../../constants/theme";
import { usePremiumAlert } from "../../store/usePremiumAlert";
export default function NameScreen({ navigation }) {
  const { user, setUser } = useAppStore();
  const [name, setName] = useState(user?.name || "");
   const showAlert = usePremiumAlert((state) => state.showAlert);
  /* ============================
     CONTINUE HANDLER
  ============================ */
  const handleContinue = async () => {
    if (!name.trim()) {

      showAlert("Task Required", "Please enter your name.","Ok","error");
      return;
    }

    const updatedUser = {
      ...user,
      name: name.trim(),
    };

    // Save in SQLite
    await saveUser(updatedUser);

    // Update Zustand Store
    setUser(updatedUser);

    // Move to next onboarding step
    navigation.navigate("Long-Goal Setting");
  };

  /* ============================
     UI
  ============================ */
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          {/* Premium Header */}
          <Text style={styles.title}>What should we call you?</Text>

          <Text style={styles.subtitle}>
            Your name makes this journey personal.
            {"\n"}
            Let’s make UnBroken feel like{" "}
            <Text style={{ color: COLORS.accent, fontWeight: "900" }}>
              yours.
            </Text>
          </Text>

          {/* Premium Input Card */}
          <View style={styles.inputCard}>
            <Text style={styles.inputLabel}>Your Name</Text>

            <TextInput
              style={styles.input}
              placeholder="Ashish Anand..."
              placeholderTextColor={COLORS.textMuted}
              value={name}
              onChangeText={setName}
              autoFocus
              autoCapitalize="words"
              returnKeyType="done"
            />
          </View>

          {/* Premium Continue Button */}
          <TouchableOpacity
            style={styles.button}
            onPress={handleContinue}
            activeOpacity={0.85}
          >
            <Text style={styles.buttonText}>CONTINUE →</Text>
          </TouchableOpacity>

          {/* Small Footer Hint */}
          <Text style={styles.footerText}>
            You can change this anytime in Settings.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

/* ============================
   PREMIUM STYLES
============================ */
const styles = StyleSheet.create({
  /* Screen Base */
  container: {
    flexGrow: 1,
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
    fontSize: 34,
    fontWeight: "900",
    color: COLORS.textPrimary,
    letterSpacing: 0.5,
    marginBottom: SPACING.md,
  },

  /* Subtitle */
  subtitle: {
    fontSize: 16,
    fontWeight: "500",
    color: COLORS.textSecondary,
    lineHeight: 26,
    marginBottom: SPACING.xxl,
  },

  /* Input Card */
  inputCard: {
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

    marginBottom: SPACING.xl,
  },

  inputLabel: {
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.textMuted,
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginBottom: SPACING.sm,
  },

  input: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.textPrimary,

    paddingVertical: SPACING.sm,
  },

  /* Premium Button */
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

  /* Footer Hint */
  footerText: {
    marginTop: SPACING.lg,
    fontSize: 13,
    textAlign: "center",
    color: COLORS.textMuted,
    opacity: 0.7,
  },
});
