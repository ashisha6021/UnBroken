  import React from "react";
  import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Modal,
  } from "react-native";
  import { COLORS, SPACING, BORDER_RADIUS } from "../constants/theme";

  export default function PremiumAlertModal({
    visible,
    title,
    message,
    cancelText,
    confirmText,
    onCancel,
    onConfirm,
    type = "warning", // ✅ success | warning | error | info
  }) {
    if (!visible) return null;

    /* ============================
      ICON + COLOR MAP
    ============================ */

    const ICONS = {
      success: "✅",
      warning: "⚠️",
      error: "❌",
      info: "ℹ️",
    };

    const iconToShow = ICONS[type] || "⚠️";

    const iconBackground =
      type === "success"
        ? "rgba(0,255,140,0.14)"
        : type === "warning"
        ? "rgba(255,200,0,0.14)"
        : type === "error"
        ? "rgba(255,80,80,0.14)"
        : "rgba(80,180,255,0.14)";

    return (
      <Modal transparent animationType="fade" visible={visible}>
        <View style={styles.overlay}>

          {/* BOX */}
          <View style={styles.box}>

            {/* ICON */}
            <View
              style={[
                styles.iconCircle,
                { backgroundColor: iconBackground },
              ]}
            >
              <Text style={styles.icon}>{iconToShow}</Text>
            </View>

            {/* TITLE */}
            <Text style={styles.title}>{title}</Text>

            {/* MESSAGE */}
            <Text style={styles.message}>{message}</Text>

            {/* BUTTONS */}
            <View style={styles.row}>

              {/* Cancel Button */}
              {cancelText && (
                <TouchableOpacity
                  style={styles.cancelBtn}
                  activeOpacity={0.85}
                  onPress={onCancel}
                >
                  <Text style={styles.cancelText}>
                    {cancelText}
                  </Text>
                </TouchableOpacity>
              )}

              {/* Confirm Button */}
              <TouchableOpacity
                style={styles.confirmBtn}
                activeOpacity={0.9}
                onPress={onConfirm}
              >
                <Text
                  style={styles.confirmText}
                  numberOfLines={1}
                >
                  {confirmText}
                </Text>
              </TouchableOpacity>

            </View>
          </View>
        </View>
      </Modal>
    );
  }

  /* ============================
    PREMIUM MODAL STYLES (FINAL)
  ============================ */
  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.80)",
      justifyContent: "center",
      alignItems: "center",
      padding: SPACING.xl,
    },

    box: {
      width: "100%",
      maxWidth: 360,
      backgroundColor: "rgba(25,25,25,0.97)",

      borderRadius: BORDER_RADIUS.xxl,
      paddingVertical: SPACING.xl,
      paddingHorizontal: SPACING.xl,

      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.10)",
      borderRadius:SPACING.xl,
      shadowColor: "#000",
      shadowOpacity: 0.7,
      shadowRadius: 25,
      elevation: 18,

      alignItems: "center",
    },

    /* ICON */
    iconCircle: {
      width: 64,
      height: 64,
      borderRadius: 999,

      justifyContent: "center",
      alignItems: "center",

      marginBottom: SPACING.md,
    },

    icon: {
      fontSize: 28,
    },

    /* TITLE */
    title: {
      fontSize: 20,
      fontWeight: "900",
      color: COLORS.textPrimary,
      textAlign: "center",
      marginBottom: SPACING.sm,
      letterSpacing: 0.4,
    },

    /* MESSAGE */
    message: {
      fontSize: 15,
      fontWeight: "500",
      color: COLORS.textSecondary,
      lineHeight: 22,
      textAlign: "center",
      marginBottom: SPACING.xl,
      opacity: 0.92,
    },

    /* BUTTON ROW */
    row: {
      flexDirection: "row",
      width: "100%",
      gap: SPACING.sm,
    },

    /* CANCEL */
    cancelBtn: {
      flex: 1,
      paddingVertical: 15,
      borderRadius: BORDER_RADIUS.full,

      backgroundColor: "rgba(255,255,255,0.05)",

      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.12)",

      alignItems: "center",
      justifyContent: "center",
    },

    cancelText: {
      fontSize: 14,
      fontWeight: "700",
      color: COLORS.textSecondary,
    },

    /* CONFIRM */
    confirmBtn: {
      flex: 1.3,
      paddingVertical: 15,
      borderRadius: BORDER_RADIUS.full,

      backgroundColor: COLORS.accent,

      alignItems: "center",
      justifyContent: "center",

      shadowColor: COLORS.accent,
      shadowOpacity: 0.6,
      shadowRadius: 14,
      elevation: 12,
    },

    confirmText: {
      fontSize: 14,
      fontWeight: "900",
      color: COLORS.background,
      textTransform: "uppercase",
      letterSpacing: 1,
    },
  });
