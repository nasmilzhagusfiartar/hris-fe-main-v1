import { handleError } from "@/helpers/errorHelper";
import { axiosInstance } from "@/plugins/axios";
import { toFormData } from "@/utils/formDataHelper";
import Cookies from "js-cookie";
import { defineStore } from "pinia";
import router from "@/router";

export const useAuthStore = defineStore("auth", {
    state: () => ({
        token: Cookies.get('token') || null,
        user: null,
        loading: false,
        error: null,
        success: null,
        // MFA challenge state kept strictly in memory (NEVER in localStorage/cookies)
        mfaRequired: false,
        mfaToken: null,
        mfaRemainingAttempts: null,
        mfaLocked: false,
        mfaLockoutMinutes: null,
        mfaError: null,
    }),
    getters: {
        isAuthenticated: (state) => !!state.user && !!state.token,
    },
    actions: {
        resetMfaState() {
            this.mfaRequired = false;
            this.mfaToken = null;
            this.mfaRemainingAttempts = null;
            this.mfaLocked = false;
            this.mfaLockoutMinutes = null;
            this.mfaError = null;
        },

        async login(credentials) {
            this.loading = true;
            this.error = null;
            this.resetMfaState();

            try {
                const response = await axiosInstance.post('/login', credentials);
                const data = response.data?.data || {};

                // Step 1 -> Step 2: MFA required (no access token issued yet)
                if (data.mfa_required && data.mfa_token) {
                    this.mfaRequired = true;
                    this.mfaToken = data.mfa_token;
                    return;
                }

                const token = data.token;
                Cookies.set('token', token);
                this.token = token;
                this.user = data;
                axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                this.success = response.data.message;

                if (data.mfa_setup_required) {
                    await router.push({
                        name: 'employee.profile.edit',
                        query: { tab: 'security', enforce_mfa: '1' },
                    });
                    return;
                }

                await router.push({ name: 'admin.dashboard' });
            } catch (error) {
                const status = error?.response?.status;
                const payload = error?.response?.data;
                if (status === 423) {
                    this.mfaLocked = true;
                    this.mfaLockoutMinutes = payload?.data?.lockout_minutes ?? 15;
                    this.error = payload?.message || 'Account is temporarily locked.';
                } else {
                    this.error = handleError(error);
                }
            } finally {
                this.loading = false;
            }
        },

        async verifyMfa({ code = null, recovery_code = null }) {
            if (!this.mfaToken) {
                this.mfaError = 'MFA session expired. Please sign in again.';
                this.mfaRequired = false;
                return false;
            }

            this.loading = true;
            this.mfaError = null;

            try {
                const body = { mfa_token: this.mfaToken };
                if (recovery_code) {
                    body.recovery_code = recovery_code;
                } else {
                    body.code = code;
                }

                const response = await axiosInstance.post('/login/mfa-verify', body);
                const data = response.data?.data || {};
                const token = data.token;

                this.resetMfaState();
                Cookies.set('token', token);
                this.token = token;
                this.user = data;
                axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                this.success = response.data.message;

                await router.push({ name: 'admin.dashboard' });
                return true;
            } catch (error) {
                const status = error?.response?.status;
                const payload = error?.response?.data;

                if (status === 423) {
                    this.mfaLocked = true;
                    this.mfaLockoutMinutes = payload?.data?.lockout_minutes ?? 15;
                    this.mfaRemainingAttempts = 0;
                    this.mfaToken = null;
                    this.mfaError = payload?.message || 'Account locked due to too many failed attempts.';
                } else if (status === 422) {
                    this.mfaRemainingAttempts = payload?.data?.remaining_attempts ?? null;
                    this.mfaError = payload?.message || 'Invalid verification code.';
                } else if (status === 401) {
                    this.resetMfaState();
                    this.error = payload?.message || 'MFA session expired. Please sign in again.';
                } else {
                    this.mfaError = payload?.message || handleError(error);
                }
                return false;
            } finally {
                this.loading = false;
            }
        },

        cancelMfaChallenge() {
            this.resetMfaState();
            this.error = null;
        },

        async checkAuth() {
            this.loading = true;
            try {
                const response = await axiosInstance.get('/me');
                this.user = response.data.data;
                return this.user;
            } catch (error) {
                if (error.response && error.response.status === 401) {
                    Cookies.remove('token');
                    this.token = null;
                    throw new Error("Unauthorized");
                }
                this.error = handleError(error);
            } finally {
                this.loading = false;
            }
        },

        async logout() {
            this.loading = true;

            try {
                await axiosInstance.post('/logout');
            } catch (error) {
                this.error = handleError(error);
            } finally {
                Cookies.remove('token');
                this.token = null;
                this.user = null;
                this.error = null;
                this.resetMfaState();
                delete axiosInstance.defaults.headers.common['Authorization'];
                this.loading = false;
                router.push({ name: 'login' });
            }
        },

        async updateProfile(payload) {
            this.loading = true;
            this.error = null;
            this.success = null;

            try {
                const body = toFormData(payload, { _method: 'PUT' });
                const response = await axiosInstance.post('/me', body);

                this.success = response.data.message || 'Profile updated successfully';
                await this.checkAuth();
                return response.data.data;
            } catch (error) {
                this.error = handleError(error);
            } finally {
                this.loading = false;
            }
        }
    }
});
