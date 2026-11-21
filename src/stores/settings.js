import { defineStore } from "pinia";
import { axiosInstance } from '@/plugins/axios';
import { handleError } from "@/helpers/errorHelper";

export const useSettingsStore = defineStore("settings", {
    state: () => ({
        company: {
            name: "",
            email: "",
            phone: "",
            address: "",
            timezone: "Asia/Jakarta",
            work_days_per_week: 5,
        },
        notifications: {
            email_leave_request: true,
            email_payroll_processed: true,
            email_attendance_alert: false,
            push_task_assigned: true,
            push_task_due_soon: true,
        },
        loading: false,
        error: null,
        success: null,
    }),

    actions: {
        // GET /settings
        async fetchSettings() {
            this.loading = true;
            this.error = null;

            try {
                const response = await axiosInstance.get('/settings');

                this.company = response.data.data.company;
                this.notifications = response.data.data.notifications;

                return response.data.data;
            } catch (error) {
                this.error = handleError(error);
            } finally {
                this.loading = false;
            }
        },

        // PUT /settings/company
        async updateCompanySettings(payload) {
            this.loading = true;
            this.error = null;
            this.success = null;

            try {
                const response = await axiosInstance.put('/settings/company', payload);

                this.company = response.data.data;
                this.success = response.data.message || 'Company settings updated successfully';

                return this.company;
            } catch (error) {
                this.error = handleError(error);
                throw error;
            } finally {
                this.loading = false;
            }
        },

        // PUT /settings/notifications
        async updateNotificationSettings(payload) {
            this.loading = true;
            this.error = null;
            this.success = null;

            try {
                const response = await axiosInstance.put('/settings/notifications', payload);

                this.notifications = response.data.data;
                this.success = response.data.message || 'Notification preferences updated';

                return this.notifications;
            } catch (error) {
                this.error = handleError(error);
                throw error;
            } finally {
                this.loading = false;
            }
        },

        // POST /settings/change-password
        async changePassword(payload) {
            this.loading = true;
            this.error = null;
            this.success = null;

            try {
                const response = await axiosInstance.post('/settings/change-password', payload);

                this.success = response.data.message || 'Password updated successfully';

                return true;
            } catch (error) {
                this.error = handleError(error);
                throw error;
            } finally {
                this.loading = false;
            }
        },
    },
});
