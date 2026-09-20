<script setup>
import { ref, computed, onMounted } from "vue";
import { storeToRefs } from "pinia";
import {
  KeyRound,
  Layers,
  Search,
  Plus,
  ChevronDown,
  RefreshCw,
  SlidersHorizontal,
  CheckCircle2,
  Users,
  Shield,
  Briefcase,
  Clock,
  Wallet,
  Calendar,
  FolderKanban,
  CheckSquare,
  Home,
  User,
  Copy,
  Check,

  Pencil,
  Trash2,
  Eye,
  LogIn,
  LogOut,
  BarChart2,
  Menu,
  Key,
} from "lucide-vue-next";
import { useRbacStore } from "@/stores/rbac";
import { useToastStore } from "@/stores/toast";
import CreatePermissionModal from "@/components/admin/rbac/CreatePermissionModal.vue";

const rbacStore = useRbacStore();
const toast = useToastStore();

const { roles, groupedPermissions, loading, saving } = storeToRefs(rbacStore);

const filters = ref({
  search: "",
  module: "all",
});


const isCreateModalOpen = ref(false);
const editingPermission = ref(null);
const copiedPermission = ref(null);
const collapsedModules = ref({});

onMounted(async () => {
  try {
    await Promise.all([
      rbacStore.fetchGroupedPermissions(),
      rbacStore.fetchRoles(),
    ]);
  } catch (error) {
    toast.error("Gagal memuat data permissions", "Error");
  }
});

const handleRefresh = async () => {
  try {
    await Promise.all([
      rbacStore.fetchGroupedPermissions(),
      rbacStore.fetchRoles(),
    ]);
    toast.success("Data permissions berhasil diperbarui", "Sukses");
  } catch (error) {
    toast.error("Gagal memperbarui data", "Error");
  }
};

const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    copiedPermission.value = text;
    toast.success(`Key "${text}" berhasil disalin.`, "Disalin");
    setTimeout(() => {
      if (copiedPermission.value === text) {
        copiedPermission.value = null;
      }
    }, 2000);
  } catch (err) {
    toast.error("Gagal menyalin text.", "Error");
  }
};

const toggleModuleCollapse = (moduleName) => {
  collapsedModules.value[moduleName] = !collapsedModules.value[moduleName];
};

// Flatten all permissions with their module
const allPermissionsList = computed(() => {
  const list = [];
  Object.entries(groupedPermissions.value || {}).forEach(([moduleName, perms]) => {
    if (Array.isArray(perms)) {
      perms.forEach((p) => {
        list.push({
          ...p,
          module: moduleName,
        });
      });
    }
  });
  return list;
});

// Existing modules list
const availableModules = computed(() => {
  return Object.keys(groupedPermissions.value || {});
});

// Roles that have a specific permission
const getRolesWithPermission = (permissionName) => {
  return roles.value.filter((role) => {
    if (!Array.isArray(role.permissions)) return false;
    return role.permissions.some(
      (p) => (typeof p === "string" ? p : p.name) === permissionName
    );
  });
};

// Filtered grouped permissions
const filteredGroupedPermissions = computed(() => {
  const result = {};
  const search = filters.value.search.toLowerCase().trim();
  const targetModule = filters.value.module;

  Object.entries(groupedPermissions.value || {}).forEach(([moduleName, perms]) => {
    if (targetModule !== "all" && moduleName !== targetModule) {
      return;
    }

    const matched = perms.filter((p) => {
      if (!search) return true;
      return (
        p.name.toLowerCase().includes(search) ||
        (p.action && p.action.toLowerCase().includes(search)) ||
        moduleName.toLowerCase().includes(search)
      );
    });

    if (matched.length > 0) {
      result[moduleName] = matched;
    }
  });

  return result;
});

// Filtered total count
const filteredCount = computed(() => {
  let count = 0;
  Object.values(filteredGroupedPermissions.value).forEach((items) => {
    count += items.length;
  });
  return count;
});

// Clean human-friendly title
const formatPermissionTitle = (name, moduleName) => {
  if (!name) return "";
  let cleanName = name;
  const prefix = `${moduleName?.toLowerCase()}-`;
  if (cleanName.toLowerCase().startsWith(prefix)) {
    cleanName = cleanName.substring(prefix.length);
  }
  return cleanName
    .split(/[-_]/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

// Clean action label
const formatAction = (action) => {
  if (!action) return "";
  return action
    .split(/[-_]/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

// Action Icon
const getActionIcon = (action, name) => {
  const act = (action || name || "").toLowerCase();
  if (act.includes("create") || act.includes("store") || act.includes("add")) {
    return Plus;
  }
  if (act.includes("edit") || act.includes("update") || act.includes("change")) {
    return Pencil;
  }
  if (act.includes("delete") || act.includes("destroy") || act.includes("remove")) {
    return Trash2;
  }
  if (act.includes("check-in") || act.includes("checkin")) {
    return LogIn;
  }
  if (act.includes("check-out") || act.includes("checkout")) {
    return LogOut;
  }
  if (act.includes("stat")) {
    return BarChart2;
  }
  if (act.includes("menu")) {
    return Menu;
  }
  if (act.includes("view") || act.includes("list") || act.includes("show") || act.includes("attendance")) {
    return Eye;
  }
  return Key;
};

// Action Icon Background
const getActionIconBgClass = (action, name) => {
  const act = (action || name || "").toLowerCase();
  if (act.includes("create") || act.includes("store") || act.includes("add")) {
    return "bg-emerald-50 border border-emerald-100";
  }
  if (act.includes("edit") || act.includes("update")) {
    return "bg-amber-50 border border-amber-100";
  }
  if (act.includes("delete") || act.includes("destroy")) {
    return "bg-rose-50 border border-rose-100";
  }
  if (act.includes("check-in")) {
    return "bg-teal-50 border border-teal-100";
  }
  if (act.includes("check-out")) {
    return "bg-orange-50 border border-orange-100";
  }
  if (act.includes("stat")) {
    return "bg-indigo-50 border border-indigo-100";
  }
  if (act.includes("menu")) {
    return "bg-purple-50 border border-purple-100";
  }
  if (act.includes("view") || act.includes("list") || act.includes("show")) {
    return "bg-blue-50 border border-blue-100";
  }
  return "bg-slate-50 border border-slate-200/60";
};

// Action Icon Color
const getActionIconColorClass = (action, name) => {
  const act = (action || name || "").toLowerCase();
  if (act.includes("create") || act.includes("store") || act.includes("add")) {
    return "text-emerald-600";
  }
  if (act.includes("edit") || act.includes("update")) {
    return "text-amber-600";
  }
  if (act.includes("delete") || act.includes("destroy")) {
    return "text-rose-600";
  }
  if (act.includes("check-in")) {
    return "text-teal-600";
  }
  if (act.includes("check-out")) {
    return "text-orange-600";
  }
  if (act.includes("stat")) {
    return "text-indigo-600";
  }
  if (act.includes("menu")) {
    return "text-purple-600";
  }
  if (act.includes("view") || act.includes("list") || act.includes("show")) {
    return "text-blue-600";
  }
  return "text-slate-600";
};

// Role Badge Color
const getRoleBadgeClass = (roleName, isSystem) => {
  const name = (roleName || "").toLowerCase();
  if (name.includes("manager") || isSystem) {
    return "bg-blue-50 text-[#0C51D9] border-blue-200/70";
  }
  if (name.includes("employee")) {
    return "bg-emerald-50 text-emerald-700 border-emerald-200/70";
  }
  if (name.includes("hr")) {
    return "bg-amber-50 text-amber-700 border-amber-200/70";
  }
  if (name.includes("finance")) {
    return "bg-purple-50 text-purple-700 border-purple-200/70";
  }
  return "bg-slate-50 text-slate-700 border-slate-200/70";
};

// Module icon
const getModuleIcon = (moduleName) => {
  const map = {
    employee: Briefcase,
    team: Users,
    attendance: Clock,
    payroll: Wallet,
    leave: Calendar,
    project: FolderKanban,
    task: CheckSquare,
    dashboard: Home,
    profile: User,
  };
  return map[moduleName?.toLowerCase()] || Layers;
};

// Open edit modal
const openEditModal = (permission, moduleName) => {
  editingPermission.value = {
    ...permission,
    module: moduleName,
  };
  isCreateModalOpen.value = true;
};

// Create or Update permission flow
const handleSavePermission = async (payload) => {
  try {
    if (typeof payload === 'object' && payload.id) {
      // Edit mode
      await rbacStore.updatePermission(payload.id, payload.name);
      toast.success(
        `Permission berhasil diperbarui menjadi "${payload.name}".`,
        "Permission Diperbarui"
      );
    } else {
      // Create mode
      await rbacStore.createPermission(payload);
      toast.success(
        `Permission "${payload}" berhasil ditambahkan.`,
        "Permission Baru Dibuat"
      );
    }
    isCreateModalOpen.value = false;
    editingPermission.value = null;
  } catch (error) {
    toast.error(
      rbacStore.error?.message || "Gagal menyimpan permission.",
      "Error"
    );
  }
};
</script>

<template>
  <div>
    <!-- Statistics Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <!-- Total Permissions -->
      <div
        class="bg-white border border-[#DCDEDD] rounded-[20px] hover:border-[#0C51D9] hover:shadow-md transition-all duration-300 p-5"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-brand-dark text-sm font-medium">Total Permissions</p>
            <p class="text-brand-dark text-3xl font-extrabold leading-none my-2">
              {{ loading ? "..." : allPermissionsList.length }}
            </p>
            <p class="text-brand-light text-xs font-normal">
              Hak akses dalam sistem
            </p>
          </div>
          <div
            class="w-14 h-14 bg-blue-50 rounded-[16px] flex items-center justify-center"
          >
            <KeyRound class="w-6 h-6 text-[#0C51D9]" />
          </div>
        </div>
      </div>

      <!-- Total Modules -->
      <div
        class="bg-white border border-[#DCDEDD] rounded-[20px] hover:border-[#0C51D9] hover:shadow-md transition-all duration-300 p-5"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-brand-dark text-sm font-medium">Total Modules</p>
            <p class="text-brand-dark text-3xl font-extrabold leading-none my-2">
              {{ loading ? "..." : availableModules.length }}
            </p>
            <p class="text-emerald-600 text-xs font-semibold">
              Kategori fitur terhubung
            </p>
          </div>
          <div
            class="w-14 h-14 bg-emerald-50 rounded-[16px] flex items-center justify-center"
          >
            <Layers class="w-6 h-6 text-emerald-600" />
          </div>
        </div>
      </div>

      <!-- Active Roles -->
      <div
        class="bg-white border border-[#DCDEDD] rounded-[20px] hover:border-[#0C51D9] hover:shadow-md transition-all duration-300 p-5"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-brand-dark text-sm font-medium">Configured Roles</p>
            <p class="text-brand-dark text-3xl font-extrabold leading-none my-2">
              {{ loading ? "..." : roles.length }}
            </p>
            <p class="text-purple-600 text-xs font-semibold">
              Menerima penugasan permission
            </p>
          </div>
          <div
            class="w-14 h-14 bg-purple-50 rounded-[16px] flex items-center justify-center"
          >
            <Shield class="w-6 h-6 text-purple-600" />
          </div>
        </div>
      </div>

      <!-- Guard System -->
      <div
        class="bg-white border border-[#DCDEDD] rounded-[20px] hover:border-[#0C51D9] hover:shadow-md transition-all duration-300 p-5"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-brand-dark text-sm font-medium">Security Guard</p>
            <p class="text-brand-dark text-2xl font-extrabold leading-none my-2 font-mono">
              sanctum
            </p>
            <p class="text-brand-light text-xs font-normal">
              API Token Authorization
            </p>
          </div>
          <div
            class="w-14 h-14 bg-amber-50 rounded-[16px] flex items-center justify-center"
          >
            <CheckCircle2 class="w-6 h-6 text-amber-600" />
          </div>
        </div>
      </div>
    </div>

    <!-- Search & Filter Bar -->
    <div class="bg-white border border-[#DCDEDD] rounded-[20px] mb-6 p-4">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <!-- Search Input -->
        <div class="flex-1 relative">
          <div
            class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"
          >
            <Search class="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            class="w-full pl-12 pr-4 py-3 border border-[#DCDEDD] rounded-[16px] hover:border-[#0C51D9] focus:border-[#0C51D9] focus:bg-white transition-all duration-300 font-semibold text-sm"
            placeholder="Search permissions by name, action, or module..."
            v-model="filters.search"
          />
        </div>

        <!-- Filter Dropdown, View Mode & Refresh -->
        <div class="flex items-center gap-3 w-full sm:w-auto">
          <!-- Module Filter -->
          <div class="relative w-full sm:w-auto">
            <div
              class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"
            >
              <SlidersHorizontal class="h-4 w-4 text-gray-400" />
            </div>
            <select
              class="w-full sm:w-auto pl-10 pr-8 py-3 border border-[#DCDEDD] rounded-[16px] hover:border-[#0C51D9] focus:border-[#0C51D9] transition-all duration-300 bg-white appearance-none font-semibold text-sm capitalize"
              v-model="filters.module"
            >
              <option value="all">All Modules</option>
              <option
                v-for="mod in availableModules"
                :key="mod"
                :value="mod"
              >
                {{ mod }}
              </option>
            </select>
            <div
              class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"
            >
              <ChevronDown class="h-4 w-4 text-gray-400" />
            </div>
          </div>



          <!-- Refresh Button -->
          <button
            type="button"
            @click="handleRefresh"
            title="Refresh Permissions"
            class="border border-[#DCDEDD] rounded-[16px] hover:border-[#0C51D9] hover:bg-gray-50 transition-all duration-300 p-3 text-gray-600 cursor-pointer shrink-0"
          >
            <RefreshCw class="w-4 h-4" :class="{ 'animate-spin': loading }" />
          </button>
        </div>
      </div>
    </div>

    <!-- Main Content Section -->
    <div class="bg-white border border-[#DCDEDD] rounded-[20px] mb-6 p-5">
      <!-- Section Header -->
      <div
        class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6"
      >
        <div>
          <h3 class="text-brand-dark text-xl font-bold">All Permissions</h3>
          <p class="text-brand-light text-sm font-normal mt-1">
            Showing {{ filteredCount }} of {{ allPermissionsList.length }} permissions across
            {{ Object.keys(filteredGroupedPermissions).length }} modules
          </p>
        </div>

        <button
          type="button"
          @click="editingPermission = null; isCreateModalOpen = true"
          class="btn-primary rounded-[8px] border border-[#2151A0] hover:brightness-110 focus:ring-2 focus:ring-[#0C51D9] transition-all duration-300 blue-gradient blue-btn-shadow px-4 py-3 flex items-center gap-2 cursor-pointer w-full sm:w-auto justify-center"
        >
          <Plus class="w-4 h-4 text-white" />
          <span class="text-brand-white text-sm font-semibold">Add Permission</span>
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="loading && allPermissionsList.length === 0" class="space-y-4">
        <div
          v-for="i in 3"
          :key="i"
          class="border border-[#DCDEDD] rounded-[16px] p-5 space-y-3 animate-pulse"
        >
          <div class="h-5 bg-gray-200 rounded w-1/4"></div>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <div v-for="j in 3" :key="j" class="h-12 bg-gray-100 rounded-[10px]"></div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div
        v-else-if="Object.keys(filteredGroupedPermissions).length === 0"
        class="text-center py-12"
      >
        <KeyRound class="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p class="text-brand-dark text-base font-bold">No permissions found</p>
        <p class="text-brand-light text-sm mt-1">
          Tidak ada permission yang sesuai dengan kriteria pencarian.
        </p>
      </div>

      <!-- Grouped Module Cards -->
      <div v-else class="space-y-6">
        <div
          v-for="(perms, moduleName) in filteredGroupedPermissions"
          :key="moduleName"
          class="border border-[#E5E7EB] rounded-[20px] overflow-hidden transition-all duration-300 hover:shadow-sm"
        >
          <!-- Module Header -->
          <div
            class="bg-gray-50/80 hover:bg-gray-100/70 px-6 py-4 border-b border-[#E5E7EB] flex items-center justify-between gap-4 cursor-pointer select-none transition-colors duration-200"
            @click="toggleModuleCollapse(moduleName)"
          >
            <div class="flex items-center gap-3.5">
              <div
                class="w-10 h-10 rounded-[10px] bg-blue-50 text-[#0C51D9] flex items-center justify-center shrink-0"
              >
                <component :is="getModuleIcon(moduleName)" class="w-5 h-5" />
              </div>
              <div class="flex items-center gap-3">
                <h4 class="text-brand-dark text-[15px] font-bold capitalize tracking-tight">
                  {{ moduleName }}
                </h4>
                <span
                  class="px-3 py-1 rounded-full text-[11px] font-semibold bg-white border border-[#DCDEDD] text-gray-500 shadow-xs"
                >
                  {{ perms.length }} permissions
                </span>
              </div>
            </div>

            <button
              type="button"
              class="p-2 rounded-[10px] text-gray-400 hover:text-gray-600 hover:bg-gray-200/60 transition-all duration-200 cursor-pointer"
              :title="collapsedModules[moduleName] ? 'Buka modul' : 'Tutup modul'"
            >
              <ChevronDown
                class="w-5 h-5 transition-transform duration-200"
                :class="{ 'rotate-180': !collapsedModules[moduleName] }"
              />
            </button>
          </div>

          <!-- Module Content (Collapsible) -->
          <div v-show="!collapsedModules[moduleName]">
            <!-- Card View -->
            <div
              class="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
            >
              <div
                v-for="p in perms"
                :key="p.id"
                class="bg-white border border-[#E5E7EB] hover:border-[#0C51D9]/50 hover:shadow-md rounded-[16px] p-5 transition-all duration-300 flex flex-col justify-between gap-4 group relative"
              >
                <!-- Edit Button (top-right, visible on hover) -->
                <button
                  type="button"
                  @click="openEditModal(p, moduleName)"
                  class="absolute top-3 right-3 p-1.5 rounded-lg text-gray-300 opacity-0 group-hover:opacity-100 hover:text-amber-600 hover:bg-amber-50 transition-all duration-200 cursor-pointer"
                  title="Edit permission"
                >
                  <Pencil class="w-3.5 h-3.5" />
                </button>

                <!-- Top Section: Icon + Title + Key -->
                <div class="flex items-start gap-4">
                  <!-- Action Icon -->
                  <div
                    class="w-10 h-10 rounded-[12px] flex items-center justify-center shrink-0 mt-0.5"
                    :class="getActionIconBgClass(p.action, p.name)"
                  >
                    <component
                      :is="getActionIcon(p.action, p.name)"
                      class="w-[18px] h-[18px]"
                      :class="getActionIconColorClass(p.action, p.name)"
                    />
                  </div>

                  <!-- Title and Slug Key -->
                  <div class="min-w-0 flex-1">
                    <h5
                      class="text-[13px] font-bold text-[#0C1C3C] truncate leading-snug"
                      :title="formatPermissionTitle(p.name, moduleName)"
                    >
                      {{ formatPermissionTitle(p.name, moduleName) }}
                    </h5>
                    <div class="flex items-center gap-2 mt-2">
                      <span
                        class="text-[11px] font-mono text-gray-500 bg-gray-50 px-2.5 py-1 rounded-md border border-gray-200/60 truncate max-w-[200px]"
                        :title="p.name"
                      >
                        {{ p.name }}
                      </span>
                      <button
                        type="button"
                        @click="copyToClipboard(p.name)"
                        class="text-gray-400 hover:text-[#0C51D9] transition-colors p-1 cursor-pointer shrink-0 rounded-md hover:bg-blue-50"
                        title="Salin permission key"
                      >
                        <Check
                          v-if="copiedPermission === p.name"
                          class="w-3.5 h-3.5 text-emerald-600"
                        />
                        <Copy v-else class="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Bottom Section: Roles with Access -->
                <div class="pt-3.5 border-t border-gray-100/80 flex items-center justify-start">
                  <div class="flex flex-wrap items-center justify-start gap-2">
                    <template
                      v-if="getRolesWithPermission(p.name).length > 0"
                    >
                      <span
                        v-for="r in getRolesWithPermission(p.name)"
                        :key="r.id"
                        class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium border"
                        :class="getRoleBadgeClass(r.name, r.is_system_role)"
                      >
                        <span
                          class="w-1.5 h-1.5 rounded-full"
                          :class="{
                            'bg-[#0C51D9]': r.name.toLowerCase().includes('manager') || r.is_system_role,
                            'bg-emerald-600': r.name.toLowerCase().includes('employee'),
                            'bg-amber-600': r.name.toLowerCase().includes('hr'),
                            'bg-purple-600': r.name.toLowerCase().includes('finance'),
                            'bg-slate-500': !['manager', 'employee', 'hr', 'finance'].some(k => r.name.toLowerCase().includes(k))
                          }"
                        ></span>
                        {{ r.name }}
                      </span>
                    </template>
                    <span v-else class="text-[11px] text-gray-400 italic">
                      Belum ada role
                    </span>
                  </div>
                </div>
              </div>
            </div>


          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Permission Modal -->
    <CreatePermissionModal
      :show="isCreateModalOpen"
      :existingModules="availableModules"
      :saving="saving"
      :editPermission="editingPermission"
      @close="isCreateModalOpen = false; editingPermission = null"
      @submit="handleSavePermission"
    />
  </div>
</template>
