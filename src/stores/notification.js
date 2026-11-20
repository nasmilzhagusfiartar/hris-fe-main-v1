import { defineStore } from "pinia";
import { axiosInstance } from "@/plugins/axios";
import { useAuthStore } from "@/stores/auth";

export const useNotificationStore = defineStore("notification", {
  state: () => ({
    notifications: [],
    meta: {
      current_page: 1,
      last_page: 1,
      per_page: 10,
      total: 0,
    },
    unreadCount: 0,
    loading: false,
    error: null,
    pollTimer: null,
  }),

  actions: {
    async fetchNotifications(params = { row_per_page: 10, page: 1 }) {
      const authStore = useAuthStore();
      if (!authStore.token) return;

      this.loading = true;
      this.error = null;

      try {
        const response = await axiosInstance.get("/notifications", { params });
        const payload = response.data?.data || {};
        this.notifications = payload.data || [];
        this.meta = payload.meta || {
          current_page: 1,
          last_page: 1,
          per_page: 10,
          total: this.notifications.length,
        };
        return this.notifications;
      } catch (err) {
        this.error = "Gagal memuat notifikasi.";
      } finally {
        this.loading = false;
      }
    },

    async fetchUnreadCount() {
      const authStore = useAuthStore();
      if (!authStore.token) {
        this.stopPolling();
        return 0;
      }

      try {
        const response = await axiosInstance.get("/notifications/unread-count");
        this.unreadCount = Number(response.data?.data?.unread_count ?? 0);
        return this.unreadCount;
      } catch (err) {
        return this.unreadCount;
      }
    },

    async markAsRead(notificationId) {
      if (!notificationId) return;

      try {
        const response = await axiosInstance.patch(
          `/notifications/${notificationId}/read`
        );
        const updated = response.data?.data;

        const idx = this.notifications.findIndex((n) => n.id === notificationId);
        if (idx !== -1) {
          if (!this.notifications[idx].is_read) {
            this.unreadCount = Math.max(0, this.unreadCount - 1);
          }
          this.notifications[idx] = {
            ...this.notifications[idx],
            ...(updated || {}),
            is_read: true,
          };
        } else {
          await this.fetchUnreadCount();
        }
      } catch (err) {
        // Silent fail on read status update
      }
    },

    async markAllAsRead() {
      try {
        await axiosInstance.patch("/notifications/read-all");
        this.notifications = this.notifications.map((n) => ({
          ...n,
          is_read: true,
          read_at: n.read_at || new Date().toISOString(),
        }));
        this.unreadCount = 0;
      } catch (err) {
        this.error = "Gagal menandai semua notifikasi.";
      }
    },

    startPolling(intervalMs = 60000) {
      this.stopPolling();
      this.fetchUnreadCount();
      this.pollTimer = setInterval(() => {
        const authStore = useAuthStore();
        if (!authStore.token) {
          this.stopPolling();
          return;
        }
        this.fetchUnreadCount();
      }, intervalMs);
    },

    stopPolling() {
      if (this.pollTimer) {
        clearInterval(this.pollTimer);
        this.pollTimer = null;
      }
    },

    reset() {
      this.stopPolling();
      this.notifications = [];
      this.unreadCount = 0;
      this.error = null;
    },
  },
});
