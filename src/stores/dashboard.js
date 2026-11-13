import { defineStore } from "pinia";
import { axiosInstance } from '@/plugins/axios';
import { handleError } from "@/helpers/errorHelper";

export const useDashboardStore = defineStore("dashboard", {
    state: () => ({
        statistics: {
            employees: {
                total: 0,
                added_this_month: 0,
            },
            teams: {
                total: 0,
                new_teams: 0,
            },
            attendance: {
                rate: 0,
                change: 0,
            },
            tasks: {
                completed: 0,
                change: 0,
            },
            projects: {
                active: 0,
                new_projects: 0,
            },
        },
        quickActionCounts: {
            pending_leave_requests: 0,
            pending_payrolls: 0,
            brand_threats_count: 0,
            breached_emails_count: 0,
            my_pending_leaves: 0,
            my_pending_tasks: 0,
        },
        loading: false,
        loadingCounts: false,
        error: null,
    }),

    actions: {
        async fetchStatistics() {
            this.loading = true;
            this.error = null;

            try {
                const response = await axiosInstance.get('/dashboard/statistics');

                this.statistics = response.data.data;
            } catch (error) {
                this.error = handleError(error);
            } finally {
                this.loading = false;
            }
        },

        async fetchQuickActionCounts() {
            this.loadingCounts = true;

            try {
                const response = await axiosInstance.get('/dashboard/quick-action-counts');
                if (response.data?.data) {
                    this.quickActionCounts = {
                        ...this.quickActionCounts,
                        ...response.data.data,
                    };
                }
                return this.quickActionCounts;
            } catch (error) {
                // Silent fallback if endpoint is unreachable
                return this.quickActionCounts;
            } finally {
                this.loadingCounts = false;
            }
        },
    }
});
