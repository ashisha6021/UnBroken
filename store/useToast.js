import { create } from "zustand";

export const useToast = create(set => ({
  message: "",
  visible: false,

  showToast: (msg) => {
    set({ message: msg, visible: true });

    setTimeout(() => {
      set({ visible: false });
    }, 2200);
  }
}));