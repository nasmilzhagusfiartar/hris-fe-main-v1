import { defineStore } from "pinia";
import { axiosInstance } from '@/plugins/axios';
import { handleError } from "@/helpers/errorHelper";

export const useReportStore = defineStore("report", {
    state: () => ({
        overview: null,
        attendanceReport: null,
        payrollReport: null,
        employeeReport: null,
        activityLog: [],
        filters: {
            period: "last_6_months",
        },
        loading: false,
        error: null,
    }),

    actions: {
        // GET /reports/overview
        async fetchOverview() {
            this.loading = true;
            this.error = null;

            try {
                const response = await axiosInstance.get('/reports/overview');

                this.overview = response.data.data;
                return this.overview;
            } catch (error) {
                this.error = handleError(error);
            } finally {
                this.loading = false;
            }
        },

        // GET /reports/attendance
        async fetchAttendanceReport(params) {
            this.loading = true;
            this.error = null;

            try {
                const response = await axiosInstance.get('/reports/attendance', { params });

                this.attendanceReport = response.data.data;
                return this.attendanceReport;
            } catch (error) {
                this.error = handleError(error);
            } finally {
                this.loading = false;
            }
        },

        // GET /reports/payroll
        async fetchPayrollReport(params) {
            this.loading = true;
            this.error = null;

            try {
                const response = await axiosInstance.get('/reports/payroll', { params });

                this.payrollReport = response.data.data;
                return this.payrollReport;
            } catch (error) {
                this.error = handleError(error);
            } finally {
                this.loading = false;
            }
        },

        // GET /reports/employees
        async fetchEmployeeReport(params) {
            this.loading = true;
            this.error = null;

            try {
                const response = await axiosInstance.get('/reports/employees', { params });

                this.employeeReport = response.data.data;
                return this.employeeReport;
            } catch (error) {
                this.error = handleError(error);
            } finally {
                this.loading = false;
            }
        },

        // GET /reports/activity-log
        async fetchActivityLog() {
            try {
                const response = await axiosInstance.get('/reports/activity-log');

                this.activityLog = response.data.data;
                return this.activityLog;
            } catch (error) {
                this.error = handleError(error);
            }
        },
    },
});
