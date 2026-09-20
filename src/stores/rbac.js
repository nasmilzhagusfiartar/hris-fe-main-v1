import { defineStore } from "pinia";
import { axiosInstance } from "@/plugins/axios";
import { handleError } from "@/helpers/errorHelper";

export const useRbacStore = defineStore("rbac", {
  state: () => ({
    roles: [],
    groupedPermissions: {},
    loading: false,
    saving: false,
    error: null,
    success: null,
  }),

  actions: {
    async fetchRoles() {
      this.loading = true;
      this.error = null;
      try {
        const response = await axiosInstance.get("/roles");
        this.roles = response.data.data || [];
        return this.roles;
      } catch (error) {
        this.error = handleError(error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchGroupedPermissions() {
      this.loading = true;
      this.error = null;
      try {
        const response = await axiosInstance.get("/permissions/grouped");
        this.groupedPermissions = response.data.data || {};
        return this.groupedPermissions;
      } catch (error) {
        this.error = handleError(error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async createRole(name) {
      this.saving = true;
      this.error = null;
      try {
        const response = await axiosInstance.post("/roles", { name });
        await this.fetchRoles();
        return response.data.data;
      } catch (error) {
        this.error = handleError(error);
        throw error;
      } finally {
        this.saving = false;
      }
    },

    async updateRole(id, name) {
      this.saving = true;
      this.error = null;
      try {
        const response = await axiosInstance.put(`/roles/${id}`, { name });
        await this.fetchRoles();
        return response.data.data;
      } catch (error) {
        this.error = handleError(error);
        throw error;
      } finally {
        this.saving = false;
      }
    },

    async deleteRole(id) {
      this.saving = true;
      this.error = null;
      try {
        const response = await axiosInstance.delete(`/roles/${id}`);
        await this.fetchRoles();
        return response.data;
      } catch (error) {
        this.error = handleError(error);
        throw error;
      } finally {
        this.saving = false;
      }
    },

    async assignPermissions(roleId, permissions) {
      this.saving = true;
      this.error = null;
      try {
        const response = await axiosInstance.post(`/roles/${roleId}/assign-permissions`, {
          permissions,
        });
        await this.fetchRoles();
        return response.data.data;
      } catch (error) {
        this.error = handleError(error);
        throw error;
      } finally {
        this.saving = false;
      }
    },

    async createPermission(name) {
      this.saving = true;
      this.error = null;
      try {
        const response = await axiosInstance.post("/permissions", { name });
        await this.fetchGroupedPermissions();
        return response.data.data;
      } catch (error) {
        this.error = handleError(error);
        throw error;
      } finally {
        this.saving = false;
      }
    },

    async updatePermission(id, name) {
      this.saving = true;
      this.error = null;
      try {
        const response = await axiosInstance.put(`/permissions/${id}`, { name });
        await this.fetchGroupedPermissions();
        return response.data.data;
      } catch (error) {
        this.error = handleError(error);
        throw error;
      } finally {
        this.saving = false;
      }
    },

    async deletePermission(id) {
      this.saving = true;
      this.error = null;
      try {
        const response = await axiosInstance.delete(`/permissions/${id}`);
        await this.fetchGroupedPermissions();
        return response.data;
      } catch (error) {
        this.error = handleError(error);
        throw error;
      } finally {
        this.saving = false;
      }
    },
  },
});
