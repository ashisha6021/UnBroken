import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

import { useAppStore } from "../../store/useAppStore";
import { COLORS, SPACING, BORDER_RADIUS } from "../../constants/theme";

export default function EditProfileScreen({ navigation }) {
  const { user, updateUserName } = useAppStore();

  const [name, setName] = useState(user?.name || "");

  const handleSave = async () => {
    if (!name.trim()) return;

    await updateUserName(name.trim());

    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Edit Profile</Text>

      <Text style={styles.label}>Your Name</Text>

      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Enter name..."
        placeholderTextColor={COLORS.textMuted}
        style={styles.input}
      />

      <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
        <Text style={styles.saveText}>SAVE CHANGES</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SPACING.xl,
  },

  title: {
    fontSize: 26,
    fontWeight: "900",
    color: COLORS.textPrimary,
    marginBottom: SPACING.xl,
  },

  label: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.textMuted,
    marginBottom: SPACING.sm,
    textTransform: "uppercase",
    letterSpacing: 1,
  },

  input: {
    backgroundColor: COLORS.surfaceElevated,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    fontSize: 16,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    marginBottom: SPACING.xl,
  },

  saveBtn: {
    backgroundColor: COLORS.accent,
    paddingVertical: 18,
    borderRadius: BORDER_RADIUS.full,
    alignItems: "center",
    shadowOpacity: 0.3,
    elevation: 8,
  },

  saveText: {
    fontSize: 14,
    fontWeight: "900",
    color: COLORS.background,
    letterSpacing: 1.2,
  },
});
