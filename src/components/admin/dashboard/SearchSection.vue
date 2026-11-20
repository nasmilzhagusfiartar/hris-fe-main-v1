<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import {
  SearchIcon,
  BuildingIcon,
  ChevronDownIcon,
  CheckCircleIcon,
  Loader2Icon,
  AlertCircleIcon,
  ArrowRightIcon,
  XIcon,
  CompassIcon,
  UsersIcon,
  FolderIcon,
  CheckSquareIcon,
  CalendarIcon,
} from "lucide-vue-next";
import { axiosInstance } from "@/plugins/axios";
import { useAuthStore } from "@/stores/auth";
import { can } from "@/helpers/permissionHelper";
import { getImageUrl, handleImageError } from "@/helpers/imageHelper";

interface SearchResultItem {
  category: string;
  id: string | number;
  title: string;
  subtitle: string;
  avatar?: string | null;
  route: {
    name: string;
    params?: Record<string, any>;
    query?: Record<string, any>;
  };
}

const { t } = useI18n();
const router = useRouter();
const authStore = useAuthStore();

const searchContainerRef = ref<HTMLElement | null>(null);
const searchInputRef = ref<HTMLInputElement | null>(null);

const searchQuery = ref("");
const selectedDepartment = ref("All Departments");
const selectedStatus = ref("All Status");

const isOpen = ref(false);
const loading = ref(false);
const errorMessage = ref<string | null>(null);
const apiResults = ref<SearchResultItem[]>([]);
const activeIndex = ref(-1);

let debounceTimer: ReturnType<typeof setTimeout> | null = null;
let abortController: AbortController | null = null;

const userRoles = computed<string[]>(() => {
  return (authStore.user?.roles || []).map((r: any) =>
    typeof r === "string" ? r.toLowerCase() : (r?.name || "").toLowerCase()
  );
});

const isEmployeeOnly = computed(() => {
  return (
    userRoles.value.includes("employee") &&
    !userRoles.value.some((r) => ["super-admin", "manager", "admin", "hr", "finance"].includes(r))
  );
});

// Frontend Menu / Page index (searched locally without API request)
const menuCatalog = [
  {
    id: "menu-dashboard",
    title: "Dashboard Overview",
    subtitle: "Home • Statistics & key metrics summary",
    keywords: ["dashboard", "home", "overview", "statistics"],
    route: { name: "admin.dashboard" },
    roles: ["manager", "admin", "hr", "finance", "employee"],
  },
  {
    id: "menu-employees",
    title: "Employees",
    subtitle: "Management • Manage all employee records",
    keywords: ["employees", "staff", "hr", "directory"],
    route: { name: "admin.employees" },
    roles: ["manager", "admin", "hr"],
    permission: "employee-menu",
  },
  {
    id: "menu-employee-create",
    title: "Add New Employee",
    subtitle: "Form • Create a new employee profile",
    keywords: ["add employee", "create employee", "new employee", "recruit"],
    route: { name: "admin.employees.create" },
    roles: ["manager", "admin", "hr"],
    permission: "employee-create",
  },
  {
    id: "menu-teams",
    title: "Our Teams",
    subtitle: "Management • Manage teams and department units",
    keywords: ["teams", "department", "division", "organization"],
    route: { name: "admin.teams" },
    roles: ["manager", "admin", "hr"],
    permission: "team-menu",
  },
  {
    id: "menu-team-create",
    title: "Create New Team",
    subtitle: "Form • Create a new team or organizational unit",
    keywords: ["create team", "add team", "new team"],
    route: { name: "admin.team.create" },
    roles: ["manager", "admin", "hr"],
    permission: "team-create",
  },
  {
    id: "menu-attendances",
    title: "Attendance & Leave Management",
    subtitle: "Management • Manage attendance and leave approvals",
    keywords: ["attendance", "leave", "approval", "clock"],
    route: { name: "admin.attendances" },
    roles: ["manager", "admin", "hr", "finance"],
    permission: "attendance-menu",
  },
  {
    id: "menu-projects",
    title: "Projects & Tasks",
    subtitle: "Management • Manage projects and task boards",
    keywords: ["projects", "tasks", "kanban", "board"],
    route: { name: "admin.projects" },
    roles: ["manager", "admin", "hr"],
    permission: "project-menu",
  },
  {
    id: "menu-payroll",
    title: "Payroll",
    subtitle: "Management • Manage payroll and salary disbursements",
    keywords: ["payroll", "salary", "finance", "payment"],
    route: { name: "admin.payroll.dashboard" },
    roles: ["manager", "admin", "finance"],
    permission: "payroll-menu",
  },
  {
    id: "menu-brand-protection",
    title: "Brand Protection & Email Breach (CTI)",
    subtitle: "Cyber Threat Intel • Monitor domains, SSL, DNS & email breaches",
    keywords: ["brand protection", "cti", "breach", "typosquatting", "ssl", "dns", "email"],
    route: { name: "admin.cti.brand-protection" },
    roles: ["manager", "admin", "hr", "security"],
  },
  {
    id: "menu-audit-user",
    title: "Audit User & Session Info",
    subtitle: "Cyber Threat Intel • User session & device information",
    keywords: ["audit", "session", "user", "log", "cti"],
    route: { name: "admin.cti.audit-user" },
    roles: ["manager", "admin", "hr", "security"],
  },
  {
    id: "menu-reports",
    title: "Reports",
    subtitle: "Others • Executive reports & PDF export",
    keywords: ["reports", "analytics", "pdf", "export"],
    route: { name: "admin.reports" },
    roles: ["manager", "admin", "hr", "finance"],
  },
  {
    id: "menu-roles",
    title: "Roles & Access Control",
    subtitle: "Management • Manage user roles",
    keywords: ["roles", "access control", "rbac"],
    route: { name: "admin.roles" },
    roles: ["super-admin"],
  },
  {
    id: "menu-permissions",
    title: "Permissions",
    subtitle: "Management • System module permission list",
    keywords: ["permissions", "access", "rbac"],
    route: { name: "admin.permissions" },
    roles: ["super-admin"],
  },
  {
    id: "menu-settings",
    title: "Settings",
    subtitle: "Others • HIP HRIS application configuration",
    keywords: ["settings", "configuration", "preferences"],
    route: { name: "admin.settings" },
    roles: ["manager", "admin", "hr"],
  },
  {
    id: "menu-clock",
    title: "Clock In / Clock Out",
    subtitle: "Workspace • Record your daily attendance",
    keywords: ["clock in", "clock out", "check in", "check out", "attendance"],
    route: { name: "employee.attendance.clock" },
    roles: ["employee", "manager", "admin", "hr", "finance"],
  },
  {
    id: "menu-my-attendance",
    title: "My Attendance & Leave Request",
    subtitle: "Workspace • Personal attendance history & leave requests",
    keywords: ["my attendance", "leave request", "request leave"],
    route: { name: "employee.attendance.my-attendances" },
    roles: ["employee", "manager", "admin", "hr", "finance"],
  },
  {
    id: "menu-my-payslips",
    title: "My Payslips",
    subtitle: "Workspace • View and download monthly payslips",
    keywords: ["payslips", "salary", "payroll"],
    route: { name: "employee.payslips" },
    roles: ["employee", "manager", "admin", "hr", "finance"],
  },
  {
    id: "menu-my-team",
    title: "My Team",
    subtitle: "Workspace • View your team members and team projects",
    keywords: ["my team", "team members"],
    route: { name: "employee.team" },
    roles: ["employee", "manager", "admin", "hr", "finance"],
  },
  {
    id: "menu-my-profile",
    title: "My Profile",
    subtitle: "Workspace • Manage personal information and account",
    keywords: ["profile", "account", "password"],
    route: { name: "employee.profile" },
    roles: ["employee", "manager", "admin", "hr", "finance"],
  },
];

const matchedMenuResults = computed<SearchResultItem[]>(() => {
  const q = searchQuery.value.trim().toLowerCase();
  if (q.length < 2) return [];

  return menuCatalog
    .filter((item) => {
      const hasRole = item.roles.some((r) => userRoles.value.includes(r));
      const hasPerm = item.permission ? can(item.permission) : false;
      if (isEmployeeOnly.value && !item.roles.includes("employee")) {
        return false;
      }
      if (!hasRole && !hasPerm) return false;

      return (
        item.title.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q) ||
        item.keywords.some((k) => k.includes(q))
      );
    })
    .slice(0, 6)
    .map((item) => ({
      category: "Menus & Pages",
      id: item.id,
      title: item.title,
      subtitle: item.subtitle,
      route: item.route,
    }));
});

const allResults = computed<SearchResultItem[]>(() => {
  return [...matchedMenuResults.value, ...apiResults.value];
});

const groupedResults = computed<Record<string, SearchResultItem[]>>(() => {
  const groups: Record<string, SearchResultItem[]> = {};
  for (const item of allResults.value) {
    if (!groups[item.category]) {
      groups[item.category] = [];
    }
    groups[item.category].push(item);
  }
  return groups;
});

const executeSearch = async () => {
  const q = searchQuery.value.trim();

  if (abortController) {
    abortController.abort();
    abortController = null;
  }

  if (q.length < 2) {
    apiResults.value = [];
    loading.value = false;
    errorMessage.value = null;
    return;
  }

  isOpen.value = true;
  loading.value = true;
  errorMessage.value = null;
  abortController = new AbortController();

  try {
    const response = await axiosInstance.get("/search", {
      params: {
        q,
        department:
          selectedDepartment.value !== "All Departments"
            ? selectedDepartment.value
            : undefined,
        status:
          selectedStatus.value !== "All Status"
            ? selectedStatus.value
            : undefined,
      },
      signal: abortController.signal,
    });

    const items = response.data?.data?.items || [];
    apiResults.value = Array.isArray(items) ? items : [];
    activeIndex.value = allResults.value.length > 0 ? 0 : -1;
  } catch (err: any) {
    if (err?.name === "CanceledError" || err?.code === "ERR_CANCELED") {
      return;
    }
    errorMessage.value =
      err?.response?.data?.message ||
      "Failed to load search results. Please try again.";
    apiResults.value = [];
  } finally {
    loading.value = false;
  }
};

const triggerDebouncedSearch = () => {
  if (debounceTimer) clearTimeout(debounceTimer);

  const q = searchQuery.value.trim();
  if (q.length < 2) {
    if (abortController) abortController.abort();
    apiResults.value = [];
    loading.value = false;
    errorMessage.value = null;
    activeIndex.value = -1;
    return;
  }

  isOpen.value = true;
  loading.value = true;
  debounceTimer = setTimeout(() => {
    executeSearch();
  }, 300);
};

watch([searchQuery, selectedDepartment, selectedStatus], () => {
  triggerDebouncedSearch();
});

const navigateToResult = (item: SearchResultItem) => {
  if (!item?.route?.name) return;
  isOpen.value = false;
  router.push(item.route);
};

const handleKeydown = (e: KeyboardEvent) => {
  if (!isOpen.value && e.key !== "Escape") {
    if (searchQuery.value.trim().length >= 2) {
      isOpen.value = true;
    }
  }

  const total = allResults.value.length;

  if (e.key === "ArrowDown") {
    e.preventDefault();
    if (total === 0) return;
    activeIndex.value = (activeIndex.value + 1) % total;
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    if (total === 0) return;
    activeIndex.value = (activeIndex.value - 1 + total) % total;
  } else if (e.key === "Enter") {
    e.preventDefault();
    if (activeIndex.value >= 0 && activeIndex.value < total) {
      navigateToResult(allResults.value[activeIndex.value]);
    } else if (searchQuery.value.trim().length >= 2) {
      executeSearch();
    }
  } else if (e.key === "Escape") {
    isOpen.value = false;
    searchInputRef.value?.blur();
  }
};

const clearSearch = () => {
  searchQuery.value = "";
  apiResults.value = [];
  errorMessage.value = null;
  isOpen.value = false;
  activeIndex.value = -1;
  searchInputRef.value?.focus();
};

const handleClickOutside = (event: MouseEvent) => {
  if (
    searchContainerRef.value &&
    !searchContainerRef.value.contains(event.target as Node)
  ) {
    isOpen.value = false;
  }
};

const handleGlobalShortcut = (event: KeyboardEvent) => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    searchInputRef.value?.focus();
    if (searchQuery.value.trim().length >= 2) {
      isOpen.value = true;
    }
  }
};

const getFlatIndex = (item: SearchResultItem) => {
  return allResults.value.findIndex(
    (r) => r.category === item.category && r.id === item.id
  );
};

const getCategoryIcon = (category: string) => {
  switch (category) {
    case "Menus & Pages":
      return CompassIcon;
    case "Employees":
      return UsersIcon;
    case "Teams & Departments":
      return BuildingIcon;
    case "Projects":
      return FolderIcon;
    case "Tasks":
      return CheckSquareIcon;
    default:
      return CalendarIcon;
  }
};

onMounted(() => {
  document.addEventListener("mousedown", handleClickOutside);
  document.addEventListener("keydown", handleGlobalShortcut);
});

onUnmounted(() => {
  document.removeEventListener("mousedown", handleClickOutside);
  document.removeEventListener("keydown", handleGlobalShortcut);
  if (debounceTimer) clearTimeout(debounceTimer);
  if (abortController) abortController.abort();
});
</script>

<template>
  <!-- Search Section -->
  <div
    ref="searchContainerRef"
    class="bg-white border border-[#DCDEDD] rounded-[20px] mb-6 p-4 relative z-30"
  >
    <div
      class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 sm:gap-4"
    >
      <!-- Search Bar -->
      <div class="flex-1 relative">
        <span
          class="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none text-gray-400"
          style="top: 50%; transform: translateY(-50%); left: 16px; pointer-events: none;"
          aria-hidden="true"
        >
          <Loader2Icon
            v-if="loading"
            class="h-[18px] w-[18px] text-[#0C51D9] animate-spin shrink-0"
          />
          <SearchIcon v-else class="h-[18px] w-[18px] text-gray-400 shrink-0" />
        </span>

        <input
          ref="searchInputRef"
          v-model="searchQuery"
          type="text"
          aria-label="Global search"
          class="w-full pl-12 pr-20 py-3 border border-[#DCDEDD] rounded-[16px] text-sm sm:text-base text-brand-dark hover:border-[#0C51D9] focus:border-[#0C51D9] focus:ring-2 focus:ring-blue-100 focus:outline-none focus:bg-white transition-all duration-200"
          style="padding-left: 3rem; padding-right: 5rem;"
          :placeholder="t('search.placeholder')"
          @focus="searchQuery.trim().length >= 2 && (isOpen = true)"
          @keydown="handleKeydown"
        />

        <!-- Right Clear Button / Shortcut Hint -->
        <div
          class="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5"
          style="top: 50%; transform: translateY(-50%); right: 12px;"
        >
          <button
            v-if="searchQuery"
            type="button"
            aria-label="Clear search"
            class="w-6 h-6 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
            @click="clearSearch"
          >
            <XIcon class="w-4 h-4" />
          </button>
          <kbd
            v-else
            class="hidden sm:inline-flex items-center px-2 py-0.5 text-[11px] font-semibold text-gray-400 bg-gray-100 border border-gray-200 rounded-md pointer-events-none"
          >
            Ctrl K
          </kbd>
        </div>
      </div>

      <!-- Filter and Action Buttons -->
      <div
        class="flex flex-col sm:flex-row sm:items-center gap-3 w-full lg:w-auto"
      >
        <!-- Department Filter -->
        <div class="relative w-full sm:w-auto">
          <div
            class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none"
            style="left: 14px; pointer-events: none;"
          >
            <BuildingIcon class="h-4 w-4 text-gray-400 shrink-0" />
          </div>
          <select
            v-model="selectedDepartment"
            aria-label="Filter by department"
            class="w-full sm:w-auto pl-10 pr-8 py-3 border border-[#DCDEDD] rounded-[16px] text-sm font-medium text-brand-dark hover:border-[#0C51D9] focus:border-[#0C51D9] focus:outline-none transition-all duration-200 bg-white appearance-none cursor-pointer"
            style="padding-left: 2.5rem; padding-right: 2rem;"
          >
            <option value="All Departments">{{ t("search.allDepartments") }}</option>
            <option value="development">Development</option>
            <option value="design">Design</option>
            <option value="marketing">Marketing</option>
            <option value="sales">Sales</option>
            <option value="support">Support</option>
            <option value="management">Management</option>
          </select>
          <div
            class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"
          >
            <ChevronDownIcon class="h-4 w-4 text-gray-400" />
          </div>
        </div>

        <!-- Status Filter -->
        <div class="relative w-full sm:w-auto">
          <div
            class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none"
            style="left: 14px; pointer-events: none;"
          >
            <CheckCircleIcon class="h-4 w-4 text-gray-400 shrink-0" />
          </div>
          <select
            v-model="selectedStatus"
            aria-label="Filter status"
            class="w-full sm:w-auto pl-10 pr-8 py-3 border border-[#DCDEDD] rounded-[16px] text-sm font-medium text-brand-dark hover:border-[#0C51D9] focus:border-[#0C51D9] focus:outline-none transition-all duration-200 bg-white appearance-none cursor-pointer"
            style="padding-left: 2.5rem; padding-right: 2rem;"
          >
            <option value="All Status">{{ t("search.allStatus") }}</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="pending">Pending</option>
          </select>
          <div
            class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"
          >
            <ChevronDownIcon class="h-4 w-4 text-gray-400" />
          </div>
        </div>

        <!-- Search Button -->
        <button
          type="button"
          class="btn-primary w-full sm:w-auto rounded-[12px] border border-[#2151A0] hover:brightness-110 focus:ring-2 focus:ring-[#0C51D9] transition-all duration-200 blue-gradient blue-btn-shadow px-6 py-3 flex items-center justify-center gap-2 cursor-pointer"
          @click="executeSearch"
        >
          <SearchIcon class="w-4 h-4 text-white shrink-0" />
          <span class="text-brand-white text-sm sm:text-base font-semibold">
            {{ t("common.search") }}
          </span>
        </button>
      </div>
    </div>

    <!-- Global Search Dropdown Results -->
    <div
      v-if="isOpen && searchQuery.trim().length >= 2"
      class="absolute left-0 right-0 top-full mt-2 bg-white border border-[#DCDEDD] rounded-[20px] shadow-xl overflow-hidden z-50 max-h-[420px] flex flex-col"
      role="listbox"
      aria-label="Global search results"
    >
      <!-- Loading State -->
      <div
        v-if="loading && allResults.length === 0"
        class="p-8 flex items-center justify-center gap-3 text-gray-500 text-sm font-medium"
      >
        <Loader2Icon class="w-5 h-5 text-[#0C51D9] animate-spin" />
        <span>Searching "{{ searchQuery.trim() }}"...</span>
      </div>

      <!-- Error State -->
      <div
        v-else-if="errorMessage && allResults.length === 0"
        class="p-6 flex items-center justify-center gap-2.5 text-red-600 text-sm font-medium bg-red-50/50"
      >
        <AlertCircleIcon class="w-5 h-5 shrink-0" />
        <span>{{ errorMessage }}</span>
      </div>

      <!-- Empty State -->
      <div
        v-else-if="!loading && allResults.length === 0"
        class="p-8 text-center"
      >
        <SearchIcon class="w-8 h-8 text-gray-300 mx-auto mb-2" />
        <p class="text-brand-dark text-sm font-semibold">
          No results for "{{ searchQuery.trim() }}"
        </p>
        <p class="text-gray-500 text-xs mt-1">
          Try a different keyword or adjust the department/status filter.
        </p>
      </div>

      <!-- Categorized Results List -->
      <div v-else class="overflow-y-auto divide-y divide-gray-100">
        <div
          v-for="(items, category) in groupedResults"
          :key="category"
          class="py-2"
        >
          <div
            class="px-4 py-1.5 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-gray-400"
          >
            <span>{{ category }}</span>
            <span>{{ items.length }} result(s)</span>
          </div>

          <button
            v-for="item in items"
            :key="`${item.category}-${item.id}`"
            type="button"
            role="option"
            :aria-selected="getFlatIndex(item) === activeIndex"
            :class="[
              getFlatIndex(item) === activeIndex
                ? 'bg-blue-50/90 text-[#0C51D9]'
                : 'hover:bg-gray-50 text-brand-dark',
            ]"
            class="w-full px-4 py-2.5 flex items-center justify-between gap-3 text-left transition-colors cursor-pointer"
            @mouseenter="activeIndex = getFlatIndex(item)"
            @click="navigateToResult(item)"
          >
            <div class="flex items-center gap-3 min-w-0">
              <img
                v-if="item.avatar"
                :src="getImageUrl(item.avatar, item.title)"
                :alt="item.title"
                class="w-9 h-9 rounded-full object-cover border border-gray-200 shrink-0"
                @error="(e) => handleImageError(e, item.title)"
              />
              <div
                v-else
                class="w-9 h-9 rounded-[10px] bg-blue-50 text-[#0C51D9] flex items-center justify-center shrink-0"
              >
                <component :is="getCategoryIcon(item.category)" class="w-4 h-4" />
              </div>

              <div class="min-w-0">
                <p class="text-sm font-semibold text-brand-dark truncate">
                  {{ item.title }}
                </p>
                <p class="text-xs text-gray-500 truncate">
                  {{ item.subtitle }}
                </p>
              </div>
            </div>

            <ArrowRightIcon
              class="w-4 h-4 text-gray-400 shrink-0"
              :class="{ 'text-[#0C51D9]': getFlatIndex(item) === activeIndex }"
            />
          </button>
        </div>
      </div>

      <!-- Footer Keyboard Hints -->
      <div
        class="px-4 py-2 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500"
      >
        <div class="flex items-center gap-3">
          <span><strong class="font-semibold">↑↓</strong> Navigate</span>
          <span><strong class="font-semibold">Enter</strong> Open</span>
          <span><strong class="font-semibold">Esc</strong> Close</span>
        </div>
        <span v-if="loading" class="text-[#0C51D9] font-medium">
          Updating...
        </span>
      </div>
    </div>
  </div>
</template>
