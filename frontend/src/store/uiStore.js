import { create } from "zustand";

let nextToastId = 1;

export const useUiStore = create((set) => ({
  toasts: [],
  pushToast({ title, message, tone = "info", duration = 4000 }) {
    const id = nextToastId++;
    set((state) => ({
      toasts: [
        ...state.toasts,
        {
          id,
          title,
          message,
          tone,
          duration,
        },
      ],
    }));
    return id;
  },
  dismissToast(id) {
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    }));
  },
}));
