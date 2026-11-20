import { defineStore } from "pinia";
import i18n from "@/plugins/i18n";

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

    success(message, title = null) {
      return this.addToast({
        type: "success",
        title: title ?? i18n.global.t("common.success"),
        message,
      });
    },

    error(message, title = null) {
      return this.addToast({
        type: "error",
        title: title ?? i18n.global.t("common.failed"),
        message,
      });
    },

    warning(message, title = null) {
      return this.addToast({
        type: "warning",
        title: title ?? i18n.global.t("common.warning"),
        message,
      });
    },

    info(message, title = null) {
      return this.addToast({
        type: "info",
        title: title ?? i18n.global.t("common.info"),
        message,
      });
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
