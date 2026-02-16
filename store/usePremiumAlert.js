import { create } from "zustand";

export const usePremiumAlert = create((set) => ({
  /* ============================
     STATE
  ============================ */

  visible: false,
  title: "",
  message: "",

  // ✅ NEW: Alert type
  type: "info", // success | warning | error | info

  // Buttons
  cancelText: null,
  confirmText: "OK",

  // Callbacks
  onCancel: null,
  onConfirm: null,

  /* ============================================================
     ✅ SIMPLE ALERT (1 Button)
     showAlert(title, message, buttonText, type, onConfirm)
  ============================================================ */
  showAlert: (
    title,
    message,
    confirmText = "OK",
    type = "warning",
    onConfirm = null
  ) =>
    set({
      visible: true,
      title,
      message,

      type, // ✅ STORE TYPE

      cancelText: null,
      confirmText,

      onCancel: null,
      onConfirm,
    }),

  /* ============================================================
     ✅ CONFIRM ALERT (2 Buttons)
     showConfirm(title, message, cancelText, confirmText, type, onConfirm, onCancel)
  ============================================================ */
  showConfirm: (
    title,
    message,
    cancelText = "Cancel",
    confirmText = "Confirm",
    type = "warning",
    onConfirm = null,
    onCancel = null
  ) =>
    set({
      visible: true,
      title,
      message,

      type, // ✅ STORE TYPE

      cancelText,
      confirmText,

      onCancel,
      onConfirm,
    }),

  /* ============================================================
     ✅ HIDE ALERT
  ============================================================ */
  hide: () =>
    set({
      visible: false,
      title: "",
      message: "",

      type: "info", // ✅ reset type

      cancelText: null,
      confirmText: "OK",

      onCancel: null,
      onConfirm: null,
    }),
}));
