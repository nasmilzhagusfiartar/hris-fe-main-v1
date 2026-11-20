import { defineStore } from "pinia";
import { axiosInstance } from "@/plugins/axios";
import { handleError } from "@/helpers/errorHelper";

export const useStoreStore = defineStore("store", {
  state: () => ({
    stores: [],
    meta: {
      current_page: 1,
      last_page: 1,
      per_page: 15,
      total: 0,
    },
    loading: false,
    error: null,
    success: null,
  }),

  actions: {
    async fetchStores(params = {}) {
      this.loading = true;
      this.error = null;
      try {
        const response = await axiosInstance.get("/stores", { params });
        this.stores = response.data.data || [];
        return this.stores;
      } catch (error) {
        this.error = handleError(error);
        return [];
      } finally {
        this.loading = false;
      }
    },

    async fetchStoresPaginated(params = {}) {
      this.loading = true;
      this.error = null;
      try {
        const response = await axiosInstance.get("/stores/all/paginated", { params });
        this.stores = response.data.data.data || [];
        this.meta = response.data.data.meta || this.meta;
        return this.stores;
      } catch (error) {
        this.error = handleError(error);
        return [];
      } finally {
        this.loading = false;
      }
    },

    async createStore(payload) {
      this.loading = true;
      this.error = null;
      this.success = null;
      try {
        const response = await axiosInstance.post("/stores", payload);
        this.success = response.data.message;
        return response.data.data;
      } catch (error) {
        this.error = handleError(error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async updateStore(id, payload) {
      this.loading = true;
      this.error = null;
      this.success = null;
      try {
        const response = await axiosInstance.put(`/stores/${id}`, payload);
        this.success = response.data.message;
        return response.data.data;
      } catch (error) {
        this.error = handleError(error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async deleteStore(id) {
      this.loading = true;
      this.error = null;
      this.success = null;
      try {
        const response = await axiosInstance.delete(`/stores/${id}`);
        this.success = response.data.message;
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
