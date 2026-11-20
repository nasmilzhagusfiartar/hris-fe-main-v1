import { defineStore } from "pinia";
import { axiosInstance } from '@/plugins/axios';
import { handleError } from "@/helpers/errorHelper";

export const useCtiStore = defineStore("cti", {
  state: () => ({
    breachChecks: [],
    meta: {
      current_page: 1,
      last_page: 1,
      per_page: 10,
      total: 0,
      from: 0,
      to: 0,
    },
    currentBreachResult: null,
    currentBrandScan: null,
    loading: false,
    loadingBreachCheck: false,
    loadingCheckAll: false,
    loadingBreachHistory: false,
    loadingBrandScan: false,
    loadingUrlscan: {},
    error: null,
    success: null,
  }),

  actions: {
    async checkEmailBreach(email) {
      this.loadingBreachCheck = true;
      this.error = null;

      try {
        const response = await axiosInstance.post('/cti/breach-checks', { email });
        this.currentBreachResult = response.data.data;
        this.success = response.data.message || 'Pengecekan email berhasil.';
        return response.data.data;
      } catch (error) {
        this.error = handleError(error);
        throw error;
      } finally {
        this.loadingBreachCheck = false;
      }
    },

    async checkAllEmployeesBreach() {
      this.loadingCheckAll = true;
      this.error = null;

      try {
        const response = await axiosInstance.post('/cti/breach-checks/check-all');
        this.success = response.data.message || 'Pengecekan seluruh karyawan berhasil diantrikan.';
        return response.data.data;
      } catch (error) {
        this.error = handleError(error);
        throw error;
      } finally {
        this.loadingCheckAll = false;
      }
    },

    async fetchBreachChecks(params = {}) {
      this.loadingBreachHistory = true;
      this.error = null;

      try {
        const response = await axiosInstance.get('/cti/breach-checks/all/paginated', { params });
        this.breachChecks = response.data.data?.data || [];
        this.meta = response.data.data?.meta || {
          current_page: 1,
          last_page: 1,
          per_page: 10,
          total: 0,
        };
        return response.data.data;
      } catch (error) {
        this.error = handleError(error);
        throw error;
      } finally {
        this.loadingBreachHistory = false;
      }
    },

    async createBrandScan(domain) {
      this.loadingBrandScan = true;
      this.error = null;

      try {
        const response = await axiosInstance.post('/cti/brand-scans', { domain });
        this.currentBrandScan = response.data.data;
        this.success = response.data.message || 'Scan brand berhasil diantrikan.';
        return response.data.data;
      } catch (error) {
        this.error = handleError(error);
        throw error;
      } finally {
        this.loadingBrandScan = false;
      }
    },

    async getBrandScan(id) {
      try {
        const response = await axiosInstance.get(`/cti/brand-scans/${id}`);
        this.currentBrandScan = response.data.data;
        return response.data.data;
      } catch (error) {
        this.error = handleError(error);
        throw error;
      }
    },

    async getLatestBrandScan(domain) {
      try {
        const response = await axiosInstance.get('/cti/brand-scans/latest', {
          params: domain ? { domain } : {},
        });
        this.currentBrandScan = response.data.data;
        return response.data.data;
      } catch (error) {
        this.error = handleError(error);
        throw error;
      }
    },

    async triggerUrlscan(resultId) {
      this.loadingUrlscan[resultId] = true;
      this.error = null;

      try {
        const response = await axiosInstance.post(`/cti/brand-scan-results/${resultId}/urlscan`);
        this.success = response.data.message || 'Scan urlscan berhasil dimulai.';
        return response.data.data;
      } catch (error) {
        this.error = handleError(error);
        throw error;
      } finally {
        this.loadingUrlscan[resultId] = false;
      }
    },

    async getUrlscanResult(resultId) {
      try {
        const response = await axiosInstance.get(`/cti/brand-scan-results/${resultId}/urlscan`);
        return response.data.data;
      } catch (error) {
        this.error = handleError(error);
        throw error;
      }
    },
  },
});
