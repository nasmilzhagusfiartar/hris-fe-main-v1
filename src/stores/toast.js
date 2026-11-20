import { defineStore } from "pinia";
import { LABELS } from "@/constants/labels";

export const useToastStore = defineStore("toast", {
  state: () => ({
    toasts: [],
  }),

  actions: {
    addToast({ type = "info", title = "", message = "", duration = 4000 }) {
      const id = Date.now() + Math.random().toString(36).substr(2, 9);
      const newToast = { id, type, title, message, duration };

      this.toasts.push(newToast);

      if (duration > 0) {
        setTimeout(() => {
          this.removeToast(id);
        }, duration);
      }

      return id;
    },

    success(message, title = LABELS.SUCCESS) {
      return this.addToast({ type: "success", title, message });
    },

    error(message, title = LABELS.FAILED) {
      return this.addToast({ type: "error", title, message });
    },

    warning(message, title = "Warning") {
      return this.addToast({ type: "warning", title, message });
    },

    info(message, title = "Information") {
      return this.addToast({ type: "info", title, message });
    },

    removeToast(id) {
      const index = this.toasts.findIndex((t) => t.id === id);
      if (index !== -1) {
        this.toasts.splice(index, 1);
      }
    },

    clearAll() {
      this.toasts = [];
    },
  },
});
