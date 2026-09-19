<script setup>
import { ref, computed, onMounted } from "vue";
import { storeToRefs } from "pinia";
import {
  Shield,
  ShieldCheck,
  ShieldPlus,
  Search,
  X,
  Layers,
  Lock,
  Sparkles,
  ChevronDown,
  RefreshCw,
  SlidersHorizontal,
} from "lucide-vue-next";
import { useRbacStore } from "@/stores/rbac";
import { useToastStore } from "@/stores/toast";
import RoleCard from "@/components/admin/rbac/RoleCard.vue";
import PermissionMatrixModal from "@/components/admin/rbac/PermissionMatrixModal.vue";
import RoleModal from "@/components/admin/rbac/RoleModal.vue";
import ConfirmationModal from "@/components/common/ConfirmationModal.vue";

const rbacStore = useRbacStore();
const toast = useToastStore();

const { roles, groupedPermissions, loading, saving } = storeToRefs(rbacStore);

// Filters
const filters = ref({
  search: "",
  type: "all", // 'all', 'system', 'custom'
});

// Modals
const isMatrixModalOpen = ref(false);
const activeRole = ref(null);

const isRoleModalOpen = ref(false);
const editingRole = ref(null);

const isDeleteModalOpen = ref(false);
const deletingRole = ref(null);

// Stats
const totalAvailablePermissions = computed(() => {
  let count = 0;
  Object.values(groupedPermissions.value || {}).forEach((items) => {
    if (Array.isArray(items)) {
      count += items.length;
    }
  });
  return count || 45;
});

const systemRolesCount = computed(
  () => roles.value.filter((r) => r.is_system_role).length
);

const customRolesCount = computed(
  () => roles.value.filter((r) => !r.is_system_role).length
);

// Filtered roles
const filteredRoles = computed(() => {
  return roles.value.filter((role) => {
    // Type filter
    if (filters.value.type === "system" && !role.is_system_role) return false;
    if (filters.value.type === "custom" && role.is_system_role) return false;

    // Search filter
    if (filters.value.search.trim()) {
      const q = filters.value.search.toLowerCase().trim();
      return role.name?.toLowerCase().includes(q);
    }
    return true;
  });
});

onMounted(async () => {
  try {
    await Promise.all([
      rbacStore.fetchRoles(),
      rbacStore.fetchGroupedPermissions(),
    ]);
  } catch (error) {
    toast.error("Gagal memuat data roles", "Error");
  }
});

const handleRefresh = async () => {
  try {
    await Promise.all([
      rbacStore.fetchRoles(),
      rbacStore.fetchGroupedPermissions(),
    ]);
    toast.success("Data roles berhasil diperbarui", "Sukses");
  } catch (error) {
    toast.error("Gagal memperbarui data", "Error");
  }
};

// Manage Permissions
const handleManagePermissions = (role) => {
  const freshRole = roles.value.find((r) => r.id === role.id) || role;
  activeRole.value = freshRole;
  isMatrixModalOpen.value = true;
};

const handleSavePermissions = async (selectedPermissions) => {
  if (!activeRole.value) return;
  try {
    await rbacStore.assignPermissions(activeRole.value.id, selectedPermissions);
    toast.success(
      `Permission untuk role "${activeRole.value.name}" berhasil disimpan.`,
      "Berhasil Disimpan"
    );
    isMatrixModalOpen.value = false;
    activeRole.value = null;
  } catch (error) {
    toast.error(
      rbacStore.error?.message || "Gagal menyimpan permission ke role.",
      "Error Simpan"
    );
  }
};

// Role Create / Edit
const handleOpenCreateRole = () => {
  editingRole.value = null;
  isRoleModalOpen.value = true;
};

const handleOpenEditRole = (role) => {
  editingRole.value = role;
  isRoleModalOpen.value = true;
};

const handleSaveRole = async (roleName) => {
  try {
    if (editingRole.value) {
      await rbacStore.updateRole(editingRole.value.id, roleName);
      toast.success(
        `Nama role berhasil diubah menjadi "${roleName}".`,
        "Role Diperbarui"
      );
      isRoleModalOpen.value = false;
      editingRole.value = null;
    } else {
      const created = await rbacStore.createRole(roleName);
      toast.success(
        `Role "${roleName}" berhasil dibuat. Silakan atur permission-nya.`,
        "Role Dibuat"
      );
      isRoleModalOpen.value = false;

      const newlyCreatedRole =
        roles.value.find((r) => r.name === roleName) || created;
      if (newlyCreatedRole) {
        handleManagePermissions(newlyCreatedRole);
      }
    }
  } catch (error) {
    toast.error(
      rbacStore.error?.message || "Gagal menyimpan role.",
      "Error Role"
    );
  }
};

// Delete Role
const handleOpenDeleteRole = (role) => {
  deletingRole.value = role;
  isDeleteModalOpen.value = true;
};

const handleConfirmDeleteRole = async () => {
  if (!deletingRole.value) return;
  try {
    await rbacStore.deleteRole(deletingRole.value.id);
    toast.success(
      `Role "${deletingRole.value.name}" berhasil dihapus.`,
      "Role Dihapus"
    );
    isDeleteModalOpen.value = false;
    deletingRole.value = null;
  } catch (error) {
    toast.error(
      rbacStore.error?.message || "Gagal menghapus role ini.",
      "Error Hapus"
    );
  }
};
</script>

<template>
  <div>
    <!-- Statistics Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <!-- Total Roles -->
      <div
        class="bg-white border border-[#DCDEDD] rounded-[20px] hover:border-[#0C51D9] hover:border-2 transition-all duration-300 p-5"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-brand-dark text-sm font-medium">Total Roles</p>
            <p class="text-brand-dark text-3xl font-extrabold leading-none my-2">
              {{ loading ? "..." : roles.length }}
            </p>
            <p class="text-brand-light text-xs font-normal">
              Peran terdaftar di sistem
            </p>
          </div>
          <div
            class="w-14 h-14 bg-blue-50 rounded-[16px] flex items-center justify-center"
          >
            <Shield class="w-6 h-6 text-[#0C51D9]" />
          </div>
        </div>
      </div>

      <!-- System Roles -->
      <div
        class="bg-white border border-[#DCDEDD] rounded-[20px] hover:border-[#0C51D9] hover:border-2 transition-all duration-300 p-5"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-brand-dark text-sm font-medium">System Roles</p>
            <p class="text-brand-dark text-3xl font-extrabold leading-none my-2">
              {{ loading ? "..." : systemRolesCount }}
            </p>
            <p class="text-emerald-600 text-xs font-semibold">
              Dilindungi oleh sistem
            </p>
          </div>
          <div
            class="w-14 h-14 bg-emerald-50 rounded-[16px] flex items-center justify-center"
          >
            <Lock class="w-6 h-6 text-emerald-600" />
          </div>
        </div>
      </div>

      <!-- Custom Roles -->
      <div
        class="bg-white border border-[#DCDEDD] rounded-[20px] hover:border-[#0C51D9] hover:border-2 transition-all duration-300 p-5"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-brand-dark text-sm font-medium">Custom Roles</p>
            <p class="text-brand-dark text-3xl font-extrabold leading-none my-2">
              {{ loading ? "..." : customRolesCount }}
            </p>
            <p class="text-purple-600 text-xs font-semibold">
              Dapat diubah & dihapus
            </p>
          </div>
          <div
            class="w-14 h-14 bg-purple-50 rounded-[16px] flex items-center justify-center"
          >
            <Sparkles class="w-6 h-6 text-purple-600" />
          </div>
        </div>
      </div>

      <!-- Total Permissions -->
      <div
        class="bg-white border border-[#DCDEDD] rounded-[20px] hover:border-[#0C51D9] hover:border-2 transition-all duration-300 p-5"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-brand-dark text-sm font-medium">Total Permissions</p>
            <p class="text-brand-dark text-3xl font-extrabold leading-none my-2">
              {{ loading ? "..." : totalAvailablePermissions }}
            </p>
            <p class="text-brand-light text-xs font-normal">
              Hak akses dalam matriks
            </p>
          </div>
          <div
            class="w-14 h-14 bg-amber-50 rounded-[16px] flex items-center justify-center"
          >
            <Layers class="w-6 h-6 text-amber-600" />
          </div>
        </div>
      </div>
    </div>

    <!-- Search & Filter Bar -->
    <div class="bg-white border border-[#DCDEDD] rounded-[20px] mb-6 p-4">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <!-- Search Bar -->
        <div class="flex-1 relative">
          <div
            class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"
          >
            <Search class="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            class="w-full pl-12 pr-4 py-3 border border-[#DCDEDD] rounded-[16px] hover:border-[#0C51D9] hover:border-2 focus:border-[#0C51D9] focus:border-2 focus:bg-white transition-all duration-300 font-semibold text-sm"
            placeholder="Search roles by name..."
            v-model="filters.search"
          />
        </div>

        <!-- Filter Dropdown & Refresh -->
        <div class="flex items-center gap-3 w-full sm:w-auto">
          <div class="relative w-full sm:w-auto">
            <div
              class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"
            >
              <SlidersHorizontal class="h-4 w-4 text-gray-400" />
            </div>
            <select
              class="w-full sm:w-auto pl-10 pr-8 py-3 border border-[#DCDEDD] rounded-[16px] hover:border-[#0C51D9] hover:border-2 focus:border-[#0C51D9] focus:border-2 transition-all duration-300 bg-white appearance-none font-semibold text-sm"
              v-model="filters.type"
            >
              <option value="all">All Role Types</option>
              <option value="system">System Roles</option>
              <option value="custom">Custom Roles</option>
            </select>
            <div
              class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"
            >
              <ChevronDown class="h-4 w-4 text-gray-400" />
            </div>
          </div>

          <button
            type="button"
            @click="handleRefresh"
            title="Refresh Roles"
            class="border border-[#DCDEDD] rounded-[16px] hover:border-[#0C51D9] hover:border-2 hover:bg-gray-50 transition-all duration-300 p-3 text-gray-600 cursor-pointer shrink-0"
          >
            <RefreshCw class="w-4 h-4" :class="{ 'animate-spin': loading }" />
          </button>
        </div>
      </div>
    </div>

    <!-- Roles Grid Section -->
    <div class="bg-white border border-[#DCDEDD] rounded-[20px] mb-6 p-5">
      <div
        class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6"
      >
        <div>
          <h3 class="text-brand-dark text-xl font-bold">All Roles</h3>
          <p class="text-brand-light text-sm font-normal mt-1">
            Showing {{ filteredRoles.length }} of {{ roles.length }} roles
          </p>
        </div>

        <button
          type="button"
          @click="handleOpenCreateRole"
          class="btn-primary rounded-[8px] border border-[#2151A0] hover:brightness-110 focus:ring-2 focus:ring-[#0C51D9] transition-all duration-300 blue-gradient blue-btn-shadow px-4 py-3 flex items-center gap-2 cursor-pointer w-full sm:w-auto justify-center"
        >
          <ShieldPlus class="w-4 h-4 text-white" />
          <span class="text-brand-white text-sm font-semibold">Add Role</span>
        </button>
      </div>

      <!-- Loading State -->
      <div
        v-if="loading && roles.length === 0"
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6"
      >
        <div
          v-for="i in 3"
          :key="i"
          class="border border-[#DCDEDD] rounded-[16px] p-5 space-y-4 animate-pulse"
        >
          <div class="flex items-center gap-3">
            <div class="w-14 h-14 bg-gray-200 rounded-[12px]"></div>
            <div class="flex-1 space-y-2">
              <div class="h-4 bg-gray-200 rounded w-1/2"></div>
              <div class="h-3 bg-gray-100 rounded w-1/3"></div>
            </div>
          </div>
          <div class="h-8 bg-gray-100 rounded"></div>
          <div class="h-10 bg-gray-200 rounded-[8px]"></div>
        </div>
      </div>

      <!-- Empty State -->
      <div
        v-else-if="filteredRoles.length === 0"
        class="text-center py-12"
      >
        <Shield class="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p class="text-brand-dark text-base font-bold">No roles found</p>
        <p class="text-brand-light text-sm mt-1">
          Tidak ada role yang sesuai dengan filter pencarian.
        </p>
      </div>

      <!-- Roles Cards Grid -->
      <div
        v-else
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        <RoleCard
          v-for="role in filteredRoles"
          :key="role.id"
          :role="role"
          :totalAvailablePermissions="totalAvailablePermissions"
          @managePermissions="handleManagePermissions"
          @editRole="handleOpenEditRole"
          @deleteRole="handleOpenDeleteRole"
        />
      </div>
    </div>

    <!-- Permission Matrix Checklist Modal -->
    <PermissionMatrixModal
      :show="isMatrixModalOpen"
      :role="activeRole"
      :groupedPermissions="groupedPermissions"
      :saving="saving"
      @close="isMatrixModalOpen = false"
      @save="handleSavePermissions"
    />

    <!-- Role Create / Edit Modal -->
    <RoleModal
      :show="isRoleModalOpen"
      :role="editingRole"
      :saving="saving"
      @close="isRoleModalOpen = false"
      @submit="handleSaveRole"
    />

    <!-- Delete Confirmation Modal -->
    <ConfirmationModal
      :show="isDeleteModalOpen"
      title="Delete Role"
      :message="`Apakah Anda yakin ingin menghapus role '${deletingRole?.name}'? Tindakan ini tidak dapat dibatalkan.`"
      confirmText="Yes, Delete"
      cancelText="Cancel"
      type="danger"
      :loading="saving"
      @confirm="handleConfirmDeleteRole"
      @cancel="isDeleteModalOpen = false"
    />
  </div>
</template>
