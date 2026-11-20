<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from "vue";
import { useRoute } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { axiosInstance } from "@/plugins/axios";
import { getImageUrl, handleImageError } from "@/helpers/imageHelper";
import {
  ShieldCheck,
  Monitor,
  Smartphone,
  Tablet,
  Globe,
  Cpu,
  Clock,
  Search,
  Filter,
  Calendar,
  Copy,
  Check,
  Eye,
  X,
  RefreshCw,
  AlertTriangle,
  Printer,
  ChevronLeft,
  ChevronRight,
  LogIn,
  LogOut,
  PlusCircle,
  Edit3,
  Trash2,
  ShieldAlert,
  Activity,
  Server,
  User as UserIcon,
} from "lucide-vue-next";

const route = useRoute();
const authStore = useAuthStore();

// Audit Logs State
const logs = ref([]);
const meta = ref({
  current_page: 1,
  last_page: 1,
  per_page: 15,
  total: 0,
  from: 0,
  to: 0,
});
const loading = ref(true);
const error = ref(null);

// Current Active Session Info (from backend + browser fallback)
const currentSession = ref(null);
const browserTimezone = ref(Intl.DateTimeFormat().resolvedOptions().timeZone);
const screenRes = ref(`${window.screen.width} × ${window.screen.height}`);
const rawUserAgent = ref(navigator.userAgent);

// Filter & Pagination Controls
const searchQuery = ref("");
const activityFilter = ref(
  typeof route.query.activity_type === "string" ? route.query.activity_type : "all"
);
const startDate = ref("");
const endDate = ref("");
const perPage = ref(15);
const currentPage = ref(1);

// Detail Modal & Copy Feedback State
const selectedLog = ref(null);
const copiedKey = ref(null);

let debounceTimer = null;

const activityOptions = [
  { value: "all", label: "All Activities" },
  { value: "login", label: "Login" },
  { value: "logout", label: "Logout" },
  { value: "failed_login", label: "Failed Login" },
  { value: "mfa_enabled", label: "MFA Enabled" },
  { value: "mfa_disabled", label: "MFA Disabled" },
  { value: "mfa_success", label: "MFA Verified" },
  { value: "mfa_failed", label: "MFA Failed" },
  { value: "mfa_recovery_used", label: "MFA Recovery Used" },
  { value: "mfa_locked", label: "MFA Locked" },
  { value: "mfa_reset", label: "MFA Reset" },
  { value: "create", label: "Create" },
  { value: "update", label: "Update" },
  { value: "delete", label: "Delete" },
  { value: "access", label: "Access" },
];

// Current user display helpers
const currentUserName = computed(
  () => currentSession.value?.user?.name || authStore.user?.name || "N/A"
);
const currentUserEmail = computed(
  () => currentSession.value?.user?.email || authStore.user?.email || "N/A"
);
const currentUserRoles = computed(() => {
  const roles =
    currentSession.value?.user?.roles || authStore.user?.roles || [];
  if (Array.isArray(roles) && roles.length > 0) {
    return roles
      .map((r) => {
        const name = typeof r === "string" ? r : r?.name || "";
        return name.toLowerCase() === "hr"
          ? "HR"
          : name.charAt(0).toUpperCase() + name.slice(1);
      })
      .join(", ");
  }
  return authStore.user?.role || "User";
});

const currentDevice = computed(() => {
  return (
    currentSession.value?.device || {
      browser_label: "Web Browser",
      os_label: navigator.platform || "OS",
      device_type: "Desktop",
    }
  );
});

const currentIpAddress = computed(
  () => currentSession.value?.ip_address || "127.0.0.1"
);

const currentRawUa = computed(
  () => currentSession.value?.user_agent || rawUserAgent.value
);

const hasActiveFilters = computed(() => {
  return (
    searchQuery.value.trim() !== "" ||
    activityFilter.value !== "all" ||
    startDate.value !== "" ||
    endDate.value !== ""
  );
});

// Fetch paginated audit logs from backend
const fetchAuditLogs = async (page = 1) => {
  loading.value = true;
  error.value = null;

  try {
    const params = {
      page,
      row_per_page: perPage.value,
      activity_type: activityFilter.value,
    };

    if (searchQuery.value.trim() !== "") {
      params.search = searchQuery.value.trim();
    }
    if (startDate.value) {
      params.start_date = startDate.value;
    }
    if (endDate.value) {
      params.end_date = endDate.value;
    }

    const response = await axiosInstance.get("/cti/audit-logs", { params });
    const payload = response.data?.data || {};

    logs.value = payload.data || [];
    meta.value = payload.meta || {
      current_page: page,
      last_page: 1,
      per_page: perPage.value,
      total: 0,
      from: 0,
      to: 0,
    };
    currentPage.value = meta.value.current_page || page;

    if (payload.current_session) {
      currentSession.value = payload.current_session;
    }
  } catch (err) {
    error.value =
      err?.response?.data?.message ||
      "Failed to load user audit activity logs. Please try again.";
  } finally {
    loading.value = false;
  }
};

// Debounced search watcher
watch(searchQuery, () => {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    currentPage.value = 1;
    fetchAuditLogs(1);
  }, 300);
});

watch([activityFilter, startDate, endDate, perPage], () => {
  currentPage.value = 1;
  fetchAuditLogs(1);
});

const resetFilters = () => {
  searchQuery.value = "";
  activityFilter.value = "all";
  startDate.value = "";
  endDate.value = "";
  currentPage.value = 1;
  fetchAuditLogs(1);
};

const goToPage = (page) => {
  if (page < 1 || page > meta.value.last_page || loading.value) return;
  currentPage.value = page;
  fetchAuditLogs(page);
};

const visiblePages = computed(() => {
  const total = meta.value.last_page || 1;
  const current = meta.value.current_page || 1;
  const delta = 2;
  const pages = [];

  for (
    let i = Math.max(1, current - delta);
    i <= Math.min(total, current + delta);
    i++
  ) {
    pages.push(i);
  }
  return pages;
});

// Device & Activity Visual Helpers
const getDeviceIcon = (deviceType) => {
  const normalized = (deviceType || "").toLowerCase();
  if (normalized === "mobile") return Smartphone;
  if (normalized === "tablet") return Tablet;
  return Monitor;
};

const getDeviceBadgeClass = (deviceType) => {
  const normalized = (deviceType || "").toLowerCase();
  if (normalized === "mobile") {
    return "bg-purple-50 text-purple-700 border-purple-200";
  }
  if (normalized === "tablet") {
    return "bg-amber-50 text-amber-700 border-amber-200";
  }
  return "bg-slate-100 text-slate-700 border-slate-200";
};

const getActivityBadgeClass = (type) => {
  const map = {
    login: "bg-emerald-50 text-emerald-700 border-emerald-200",
    logout: "bg-slate-100 text-slate-700 border-slate-300",
    create: "bg-blue-50 text-blue-700 border-blue-200",
    update: "bg-amber-50 text-amber-700 border-amber-200",
    delete: "bg-red-50 text-red-700 border-red-200",
    failed_login: "bg-rose-100 text-rose-800 border-rose-300",
    access: "bg-indigo-50 text-indigo-700 border-indigo-200",
    mfa_enabled: "bg-emerald-50 text-emerald-700 border-emerald-200",
    mfa_disabled: "bg-amber-50 text-amber-800 border-amber-200",
    mfa_success: "bg-emerald-50 text-emerald-700 border-emerald-200",
    mfa_failed: "bg-rose-100 text-rose-800 border-rose-300",
    mfa_recovery_used: "bg-purple-50 text-purple-700 border-purple-200",
    mfa_locked: "bg-red-100 text-red-800 border-red-300",
    mfa_reset: "bg-orange-50 text-orange-800 border-orange-200",
  };
  return map[type] || "bg-gray-100 text-gray-700 border-gray-200";
};

const getActivityIcon = (type) => {
  const map = {
    login: LogIn,
    logout: LogOut,
    create: PlusCircle,
    update: Edit3,
    delete: Trash2,
    failed_login: ShieldAlert,
    access: Activity,
    mfa_enabled: ShieldCheck,
    mfa_disabled: ShieldAlert,
    mfa_success: ShieldCheck,
    mfa_failed: ShieldAlert,
    mfa_recovery_used: ShieldCheck,
    mfa_locked: ShieldAlert,
    mfa_reset: RefreshCw,
  };
  return map[type] || Activity;
};

const getStatusBadgeClass = (statusCode) => {
  const code = Number(statusCode || 200);
  if (code >= 500) return "bg-red-100 text-red-800 border-red-200";
  if (code >= 400) return "bg-rose-50 text-rose-700 border-rose-200";
  if (code >= 300) return "bg-amber-50 text-amber-700 border-amber-200";
  return "bg-emerald-50 text-emerald-700 border-emerald-200";
};

// Copy helper
const copyText = async (text, key) => {
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
    copiedKey.value = key;
    setTimeout(() => {
      if (copiedKey.value === key) {
        copiedKey.value = null;
      }
    }, 2000);
  } catch (e) {
    // Fallback textarea copy
    const el = document.createElement("textarea");
    el.value = text;
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);
    copiedKey.value = key;
    setTimeout(() => {
      if (copiedKey.value === key) {
        copiedKey.value = null;
      }
    }, 2000);
  }
};

const openDetailModal = (log) => {
  selectedLog.value = log;
};

const closeDetailModal = () => {
  selectedLog.value = null;
};

const handleKeydown = (e) => {
  if (e.key === "Escape" && selectedLog.value) {
    closeDetailModal();
  }
};

const printReport = () => {
  window.print();
};

onMounted(() => {
  window.addEventListener("keydown", handleKeydown);
  fetchAuditLogs(1);
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", handleKeydown);
  if (debounceTimer) clearTimeout(debounceTimer);
});
</script>

<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div
      class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white border border-[#DCDEDD] rounded-[20px] p-6"
    >
      <div class="flex items-start sm:items-center gap-4">
        <div
          class="w-12 h-12 rounded-[14px] bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0"
        >
          <ShieldCheck class="w-6 h-6 text-[#0C51D9]" />
        </div>
        <div>
          <h1 class="text-xl sm:text-2xl font-bold text-brand-dark">
            User Audit &amp; Session Activity Logs
          </h1>
          <p class="mt-0.5 text-sm text-brand-light">
            Read-only monitoring of active sessions, devices, IP addresses, and
            HIP HRIS user activity history.
          </p>
        </div>
      </div>

      <div class="flex items-center gap-2.5 self-start sm:self-auto">
        <button
          type="button"
          @click="fetchAuditLogs(currentPage)"
          :disabled="loading"
          class="inline-flex items-center gap-2 px-3.5 py-2.5 border border-[#DCDEDD] rounded-[12px] text-sm font-semibold text-brand-dark bg-white hover:border-[#0C51D9] hover:bg-gray-50 transition-all disabled:opacity-50"
          aria-label="Reload audit logs"
        >
          <RefreshCw class="w-4 h-4" :class="{ 'animate-spin': loading }" />
          <span>Refresh</span>
        </button>

        <button
          type="button"
          @click="printReport"
          class="inline-flex items-center gap-2 px-4 py-2.5 rounded-[12px] text-sm font-semibold text-white bg-[#0C51D9] hover:bg-blue-700 transition-all shadow-sm"
        >
          <Printer class="w-4 h-4" />
          <span>Print Report</span>
        </button>
      </div>
    </div>

    <!-- Current Active Session Summary Card -->
    <div class="bg-white border border-[#DCDEDD] rounded-[20px] p-6">
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-2.5">
          <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <h2 class="text-sm font-bold text-gray-700 uppercase tracking-wider">
            Your Current Session Information
          </h2>
        </div>
        <span
          class="text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full"
        >
          Active Session
        </span>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <!-- User Info -->
        <div
          class="lg:col-span-4 bg-gray-50/80 border border-gray-200/80 rounded-[14px] p-4 flex items-center gap-3.5"
        >
          <img
            :src="getImageUrl(authStore.user?.profile_photo, currentUserName)"
            :alt="currentUserName"
            @error="handleImageError($event, currentUserName)"
            class="w-12 h-12 rounded-full object-cover border border-gray-200 shrink-0"
          />
          <div class="min-w-0 flex-1">
            <p class="text-sm font-bold text-gray-900 truncate">
              {{ currentUserName }}
            </p>
            <p class="text-xs text-gray-500 truncate">{{ currentUserEmail }}</p>
            <div class="mt-1.5 flex items-center gap-1.5 flex-wrap">
              <span
                class="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-blue-100 text-blue-800"
              >
                {{ currentUserRoles }}
              </span>
              <span
                class="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-mono bg-gray-200/80 text-gray-800"
              >
                IP: {{ currentIpAddress }}
              </span>
            </div>
          </div>
        </div>

        <!-- Parsed Device & Environment Info -->
        <div
          class="lg:col-span-4 bg-gray-50/80 border border-gray-200/80 rounded-[14px] p-4 flex flex-col justify-between gap-2"
        >
          <div class="flex items-center justify-between gap-2">
            <span class="text-xs font-medium text-gray-500">Device &amp; Browser</span>
            <span
              class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold border"
              :class="getDeviceBadgeClass(currentDevice.device_type)"
            >
              <component
                :is="getDeviceIcon(currentDevice.device_type)"
                class="w-3 h-3"
              />
              {{ currentDevice.device_type || "Desktop" }}
            </span>
          </div>
          <div class="flex items-center gap-4 text-sm font-semibold text-gray-900">
            <div class="flex items-center gap-1.5">
              <Globe class="w-4 h-4 text-blue-600 shrink-0" />
              <span>{{ currentDevice.browser_label || "Browser" }}</span>
            </div>
            <div class="flex items-center gap-1.5">
              <Cpu class="w-4 h-4 text-indigo-600 shrink-0" />
              <span>{{ currentDevice.os_label || "OS" }}</span>
            </div>
          </div>
          <div class="text-xs text-gray-500 flex items-center justify-between pt-1 border-t border-gray-200/70">
            <span>Timezone: <strong class="text-gray-700">{{ browserTimezone }}</strong></span>
            <span>Screen: <strong class="text-gray-700 font-mono">{{ screenRes }}</strong></span>
          </div>
        </div>

        <!-- Full Raw User Agent with Copy Button -->
        <div
          class="lg:col-span-4 bg-gray-50/80 border border-gray-200/80 rounded-[14px] p-4 flex flex-col justify-between gap-2"
        >
          <div class="flex items-center justify-between gap-2">
            <span class="text-xs font-semibold text-gray-600">
              Current Session Raw User Agent
            </span>
            <button
              type="button"
              @click="copyText(currentRawUa, 'current-ua')"
              class="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold border transition-colors"
              :class="
                copiedKey === 'current-ua'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-[#0C51D9] hover:text-[#0C51D9]'
              "
            >
              <Check v-if="copiedKey === 'current-ua'" class="w-3.5 h-3.5" />
              <Copy v-else class="w-3.5 h-3.5" />
              <span>{{ copiedKey === "current-ua" ? "Copied" : "Copy" }}</span>
            </button>
          </div>
          <p
            class="text-xs font-mono text-gray-700 bg-white border border-gray-200 rounded-lg p-2.5 break-all leading-relaxed select-all"
          >
            {{ currentRawUa }}
          </p>
        </div>
      </div>
    </div>

    <!-- Audit Activity Log Table Card -->
    <div class="bg-white border border-[#DCDEDD] rounded-[20px] p-6">
      <!-- Filter & Search Toolbar -->
      <div class="flex flex-col gap-4 mb-6">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h3 class="text-lg font-bold text-brand-dark">
              User Activity Log Table
            </h3>
            <p class="text-xs text-brand-light">
              Showing most recent access history first (Time in WIB)
            </p>
          </div>

          <div class="flex items-center gap-2 text-xs text-gray-500">
            <span>Total Logs:</span>
            <span class="font-bold text-gray-900 bg-gray-100 px-2.5 py-1 rounded-full">
              {{ meta.total || 0 }}
            </span>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-end">
          <!-- Search User / Email / IP -->
          <div class="sm:col-span-2 lg:col-span-4">
            <label class="block text-xs font-semibold text-gray-600 mb-1">
              Search User / Email / IP Address
            </label>
            <div class="relative">
              <Search
                class="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              />
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Type user name, email, or IP..."
                class="w-full pl-10 pr-9 py-2 text-sm border border-[#DCDEDD] rounded-[12px] focus:outline-none focus:border-[#0C51D9] focus:ring-2 focus:ring-blue-100 transition-all"
              />
              <button
                v-if="searchQuery"
                type="button"
                @click="searchQuery = ''"
                class="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
                aria-label="Clear search"
              >
                <X class="w-4 h-4" />
              </button>
            </div>
          </div>

          <!-- Filter Activity Type -->
          <div class="lg:col-span-3">
            <label class="block text-xs font-semibold text-gray-600 mb-1">
              Activity Type
            </label>
            <div class="relative">
              <Filter
                class="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              />
              <select
                v-model="activityFilter"
                class="w-full pl-9 pr-8 py-2 text-sm border border-[#DCDEDD] rounded-[12px] bg-white focus:outline-none focus:border-[#0C51D9] focus:ring-2 focus:ring-blue-100 transition-all"
              >
                <option
                  v-for="opt in activityOptions"
                  :key="opt.value"
                  :value="opt.value"
                >
                  {{ opt.label }}
                </option>
              </select>
            </div>
          </div>

          <!-- Date Range: Start Date -->
          <div class="lg:col-span-2">
            <label class="block text-xs font-semibold text-gray-600 mb-1">
              Start Date
            </label>
            <div class="relative">
              <input
                v-model="startDate"
                type="date"
                :max="endDate || undefined"
                class="w-full px-3 py-2 text-sm border border-[#DCDEDD] rounded-[12px] bg-white focus:outline-none focus:border-[#0C51D9] focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>
          </div>

          <!-- Date Range: End Date -->
          <div class="lg:col-span-2">
            <label class="block text-xs font-semibold text-gray-600 mb-1">
              End Date
            </label>
            <div class="relative">
              <input
                v-model="endDate"
                type="date"
                :min="startDate || undefined"
                class="w-full px-3 py-2 text-sm border border-[#DCDEDD] rounded-[12px] bg-white focus:outline-none focus:border-[#0C51D9] focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>
          </div>

          <!-- Reset Filter Button -->
          <div class="lg:col-span-1 flex">
            <button
              type="button"
              @click="resetFilters"
              :disabled="!hasActiveFilters"
              class="w-full py-2 px-3 text-xs font-semibold rounded-[12px] border border-[#DCDEDD] text-gray-700 bg-gray-50 hover:bg-gray-100 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              title="Reset all filters"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      <!-- Error State -->
      <div
        v-if="error"
        class="rounded-[16px] border border-red-200 bg-red-50/70 p-6 text-center my-4"
      >
        <AlertTriangle class="w-10 h-10 text-red-600 mx-auto mb-2" />
        <h4 class="text-base font-bold text-red-900 mb-1">
          Failed to Load Activity Logs
        </h4>
        <p class="text-sm text-red-700 mb-4">{{ error }}</p>
        <button
          type="button"
          @click="fetchAuditLogs(currentPage)"
          class="inline-flex items-center gap-2 px-4 py-2 rounded-[10px] text-sm font-semibold bg-red-600 text-white hover:bg-red-700 transition-all"
        >
          <RefreshCw class="w-4 h-4" />
          <span>Try Again</span>
        </button>
      </div>

      <!-- Loading Skeleton State -->
      <div v-else-if="loading" class="space-y-3">
        <!-- Desktop Skeleton Table -->
        <div
          class="hidden md:block border border-gray-200 rounded-[14px] overflow-hidden"
        >
          <div class="bg-gray-50 px-4 py-3 border-b border-gray-200 grid grid-cols-12 gap-4">
            <div class="col-span-2 h-4 bg-gray-200 rounded animate-pulse"></div>
            <div class="col-span-3 h-4 bg-gray-200 rounded animate-pulse"></div>
            <div class="col-span-2 h-4 bg-gray-200 rounded animate-pulse"></div>
            <div class="col-span-2 h-4 bg-gray-200 rounded animate-pulse"></div>
            <div class="col-span-2 h-4 bg-gray-200 rounded animate-pulse"></div>
            <div class="col-span-1 h-4 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div
            v-for="n in 6"
            :key="n"
            class="px-4 py-4 border-b border-gray-100 grid grid-cols-12 gap-4 items-center"
          >
            <div class="col-span-2 space-y-2">
              <div class="h-3.5 bg-gray-200 rounded w-4/5 animate-pulse"></div>
              <div class="h-2.5 bg-gray-100 rounded w-1/2 animate-pulse"></div>
            </div>
            <div class="col-span-3 flex items-center gap-3">
              <div class="w-9 h-9 rounded-full bg-gray-200 animate-pulse shrink-0"></div>
              <div class="space-y-1.5 flex-1">
                <div class="h-3.5 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                <div class="h-2.5 bg-gray-100 rounded w-1/2 animate-pulse"></div>
              </div>
            </div>
            <div class="col-span-2">
              <div class="h-6 bg-gray-200 rounded w-28 animate-pulse"></div>
            </div>
            <div class="col-span-2 space-y-1.5">
              <div class="h-3.5 bg-gray-200 rounded w-3/4 animate-pulse"></div>
              <div class="h-2.5 bg-gray-100 rounded w-1/2 animate-pulse"></div>
            </div>
            <div class="col-span-2 space-y-1.5">
              <div class="h-5 bg-gray-200 rounded-full w-20 animate-pulse"></div>
              <div class="h-2.5 bg-gray-100 rounded w-4/5 animate-pulse"></div>
            </div>
            <div class="col-span-1 flex justify-center">
              <div class="h-8 bg-gray-200 rounded-lg w-16 animate-pulse"></div>
            </div>
          </div>
        </div>

        <!-- Mobile Skeleton Cards -->
        <div class="md:hidden space-y-3">
          <div
            v-for="n in 4"
            :key="n"
            class="border border-gray-200 rounded-[14px] p-4 space-y-3"
          >
            <div class="flex justify-between items-center">
              <div class="h-5 bg-gray-200 rounded-full w-20 animate-pulse"></div>
              <div class="h-3.5 bg-gray-200 rounded w-32 animate-pulse"></div>
            </div>
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-gray-200 animate-pulse"></div>
              <div class="space-y-1.5 flex-1">
                <div class="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                <div class="h-3 bg-gray-100 rounded w-2/3 animate-pulse"></div>
              </div>
            </div>
            <div class="h-8 bg-gray-100 rounded-lg animate-pulse"></div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div
        v-else-if="logs.length === 0"
        class="border border-dashed border-gray-300 rounded-[16px] py-14 px-6 text-center"
      >
        <ShieldCheck class="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <h4 class="text-base font-bold text-gray-800 mb-1">
          No Activity Log Data
        </h4>
        <p class="text-sm text-gray-500 max-w-md mx-auto mb-4">
          No activity logs match the filter or search keywords you entered.
        </p>
        <button
          v-if="hasActiveFilters"
          type="button"
          @click="resetFilters"
          class="inline-flex items-center gap-2 px-4 py-2 rounded-[10px] text-xs font-semibold bg-[#0C51D9] text-white hover:bg-blue-700 transition-all"
        >
          Reset Filters
        </button>
      </div>

      <!-- Data Content: Desktop Table + Mobile Card List -->
      <div v-else>
        <!-- DESKTOP & TABLET TABLE (>= 768px) -->
        <div
          class="hidden md:block border border-[#DCDEDD] rounded-[14px] overflow-hidden"
        >
          <div class="overflow-x-auto max-h-[640px]">
            <table class="w-full text-left border-collapse">
              <thead
                class="bg-gray-50/95 backdrop-blur-sm sticky top-0 z-10 border-b border-[#DCDEDD]"
              >
                <tr>
                  <th
                    scope="col"
                    class="py-3.5 px-4 text-xs font-bold text-gray-600 uppercase tracking-wider w-[175px] min-w-[165px]"
                  >
                    Access Time
                  </th>
                  <th
                    scope="col"
                    class="py-3.5 px-4 text-xs font-bold text-gray-600 uppercase tracking-wider w-[240px] min-w-[210px]"
                  >
                    User
                  </th>
                  <th
                    scope="col"
                    class="py-3.5 px-4 text-xs font-bold text-gray-600 uppercase tracking-wider w-[145px] min-w-[130px]"
                  >
                    IP Address
                  </th>
                  <th
                    scope="col"
                    class="py-3.5 px-4 text-xs font-bold text-gray-600 uppercase tracking-wider w-[230px] min-w-[210px]"
                  >
                    Device
                  </th>
                  <th
                    scope="col"
                    class="py-3.5 px-4 text-xs font-bold text-gray-600 uppercase tracking-wider min-w-[240px]"
                  >
                    Activity
                  </th>
                  <th
                    scope="col"
                    class="py-3.5 px-4 text-xs font-bold text-gray-600 uppercase tracking-wider w-[110px] min-w-[100px] text-center"
                  >
                    Action
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100 text-sm">
                <tr
                  v-for="log in logs"
                  :key="log.id"
                  class="even:bg-gray-50/50 hover:bg-blue-50/40 transition-colors"
                >
                  <!-- 1. Kolom Waktu -->
                  <td class="py-3.5 px-4 align-middle whitespace-nowrap">
                    <div class="flex items-center gap-1.5 text-gray-900 font-semibold text-xs">
                      <Clock class="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span>{{ log.accessed_at_formatted }}</span>
                    </div>
                    <div class="text-[11px] text-gray-400 mt-0.5 pl-5 font-mono">
                      #{{ log.sequence }}
                    </div>
                  </td>

                  <!-- 2. Kolom User -->
                  <td class="py-3.5 px-4 align-middle">
                    <div class="flex items-center gap-3 max-w-[230px]">
                      <img
                        :src="
                          getImageUrl(
                            log.user?.profile_photo,
                            log.user?.name || 'User'
                          )
                        "
                        :alt="log.user?.name || 'User'"
                        @error="
                          handleImageError($event, log.user?.name || 'User')
                        "
                        class="w-9 h-9 rounded-full object-cover border border-gray-200 shrink-0"
                      />
                      <div class="min-w-0 flex-1">
                        <p
                          class="text-sm font-semibold text-gray-900 truncate"
                          :title="log.user?.name"
                        >
                          {{ log.user?.name || "Guest" }}
                        </p>
                        <div class="flex items-center gap-1.5 mt-0.5">
                          <span
                            class="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-100 shrink-0"
                          >
                            {{ log.user?.role || "User" }}
                          </span>
                          <span
                            class="text-xs text-gray-500 truncate"
                            :title="log.user?.email"
                          >
                            {{ log.user?.email || "-" }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>

                  <!-- 3. Kolom IP Address -->
                  <td class="py-3.5 px-4 align-middle whitespace-nowrap">
                    <span
                      class="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-mono font-medium bg-gray-100 text-gray-800 border border-gray-200"
                    >
                      {{ log.ip_address }}
                    </span>
                  </td>

                  <!-- 4. Kolom Device (Parsed Browser/OS/Device + Hover Tooltip Raw UA) -->
                  <td class="py-3.5 px-4 align-middle">
                    <div
                      class="group relative inline-flex flex-col gap-1 cursor-help max-w-[220px]"
                      :title="
                        log.user_agent
                          ? `Raw User Agent:\n${log.user_agent}`
                          : 'User Agent unavailable'
                      "
                    >
                      <div class="flex items-center gap-1.5 flex-wrap">
                        <span
                          class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold border"
                          :class="getDeviceBadgeClass(log.device?.device_type)"
                        >
                          <component
                            :is="getDeviceIcon(log.device?.device_type)"
                            class="w-3 h-3 shrink-0"
                          />
                          <span>{{ log.device?.device_type || "Desktop" }}</span>
                        </span>

                        <span
                          class="inline-flex items-center gap-1 text-xs font-semibold text-gray-900"
                        >
                          <Globe class="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span>{{ log.device?.browser_label || "Browser" }}</span>
                        </span>
                      </div>

                      <div class="flex items-center gap-1 text-xs text-gray-500">
                        <Cpu class="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span class="truncate">{{
                          log.device?.os_label || "Unknown OS"
                        }}</span>
                      </div>

                      <!-- Floating Rich Tooltip for Raw User Agent -->
                      <div
                        v-if="log.user_agent"
                        class="invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-opacity duration-150 pointer-events-none absolute left-0 bottom-full mb-2 z-30 w-80 p-3 rounded-xl bg-slate-900 text-white shadow-xl border border-slate-700"
                      >
                        <div
                          class="text-[10px] font-bold uppercase tracking-wider text-blue-300 mb-1"
                        >
                          Raw User Agent
                        </div>
                        <div class="text-[11px] font-mono leading-relaxed break-all text-slate-100">
                          {{ log.user_agent }}
                        </div>
                      </div>
                    </div>
                  </td>

                  <!-- 5. Kolom Aktivitas -->
                  <td class="py-3.5 px-4 align-middle">
                    <div class="flex flex-col gap-1">
                      <div class="flex items-center gap-2 flex-wrap">
                        <span
                          class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border"
                          :class="getActivityBadgeClass(log.activity?.type)"
                        >
                          <component
                            :is="getActivityIcon(log.activity?.type)"
                            class="w-3 h-3 shrink-0"
                          />
                          <span>{{ log.activity?.label || "Activity" }}</span>
                        </span>
                        <span
                          class="text-[11px] font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded"
                        >
                          {{ log.activity?.module || "System" }}
                        </span>
                      </div>
                      <p class="text-xs text-gray-700 line-clamp-1">
                        {{ log.activity?.description }}
                      </p>
                    </div>
                  </td>

                  <!-- 6. Action Column (Detail) -->
                  <td class="py-3.5 px-4 align-middle text-center whitespace-nowrap">
                    <button
                      type="button"
                      @click="openDetailModal(log)"
                      class="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-[10px] text-xs font-semibold text-[#0C51D9] bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors"
                      :aria-label="`View log detail for ${log.user?.name || ''}`"
                    >
                      <Eye class="w-3.5 h-3.5" />
                      <span>Detail</span>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- MOBILE LIST CARDS (< 768px) -->
        <div class="md:hidden space-y-3">
          <div
            v-for="log in logs"
            :key="log.id"
            class="border border-[#DCDEDD] rounded-[16px] p-4 bg-white hover:border-[#0C51D9] transition-all space-y-3"
          >
            <!-- Top Row: Activity Badge + Timestamp -->
            <div class="flex items-center justify-between gap-2 flex-wrap">
              <span
                class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border"
                :class="getActivityBadgeClass(log.activity?.type)"
              >
                <component
                  :is="getActivityIcon(log.activity?.type)"
                  class="w-3 h-3 shrink-0"
                />
                <span>{{ log.activity?.label }}</span>
              </span>
              <span class="text-xs font-semibold text-gray-600 flex items-center gap-1">
                <Clock class="w-3.5 h-3.5 text-gray-400" />
                {{ log.accessed_at_formatted }}
              </span>
            </div>

            <!-- User Row -->
            <div class="flex items-center gap-3">
              <img
                :src="
                  getImageUrl(
                    log.user?.profile_photo,
                    log.user?.name || 'User'
                  )
                "
                :alt="log.user?.name || 'User'"
                @error="handleImageError($event, log.user?.name || 'User')"
                class="w-10 h-10 rounded-full object-cover border border-gray-200 shrink-0"
              />
              <div class="min-w-0 flex-1">
                <p class="text-sm font-bold text-gray-900 truncate">
                  {{ log.user?.name || "Guest" }}
                </p>
                <p class="text-xs text-gray-500 truncate">
                  {{ log.user?.email || "-" }} •
                  <span class="font-semibold text-blue-700">{{
                    log.user?.role || "User"
                  }}</span>
                </p>
              </div>
              <span
                class="px-2 py-1 rounded text-xs font-mono bg-gray-100 text-gray-800 border border-gray-200 shrink-0"
              >
                {{ log.ip_address }}
              </span>
            </div>

            <!-- Activity Description -->
            <p class="text-xs text-gray-700 bg-gray-50 rounded-lg p-2.5 border border-gray-100">
              <strong class="text-gray-900">{{ log.activity?.module }}:</strong>
              {{ log.activity?.description }}
            </p>

            <!-- Parsed Device Info + Detail Action -->
            <div class="flex items-center justify-between gap-2 pt-1 border-t border-gray-100">
              <div class="flex items-center gap-2 flex-wrap text-xs text-gray-600">
                <span
                  class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold border"
                  :class="getDeviceBadgeClass(log.device?.device_type)"
                >
                  <component
                    :is="getDeviceIcon(log.device?.device_type)"
                    class="w-3 h-3"
                  />
                  {{ log.device?.device_type }}
                </span>
                <span class="font-semibold text-gray-800">
                  {{ log.device?.browser_label }}
                </span>
                <span class="text-gray-400">•</span>
                <span>{{ log.device?.os_label }}</span>
              </div>

              <button
                type="button"
                @click="openDetailModal(log)"
                class="inline-flex items-center gap-1 px-3 py-1.5 rounded-[10px] text-xs font-semibold text-[#0C51D9] bg-blue-50 hover:bg-blue-100 border border-blue-200 shrink-0"
              >
                <Eye class="w-3.5 h-3.5" />
                <span>Detail</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Server-Side Pagination Footer -->
        <div
          class="mt-5 pt-4 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div class="flex items-center gap-3 text-xs text-gray-600">
            <span>
              Showing
              <strong class="text-gray-900">{{ meta.from || 0 }}</strong> –
              <strong class="text-gray-900">{{ meta.to || 0 }}</strong> of
              <strong class="text-gray-900">{{ meta.total || 0 }}</strong> logs
            </span>

            <div class="flex items-center gap-1.5">
              <label for="audit-per-page" class="text-gray-500">Rows:</label>
              <select
                id="audit-per-page"
                v-model.number="perPage"
                class="px-2 py-1 border border-gray-300 rounded-md text-xs bg-white focus:outline-none focus:border-[#0C51D9]"
              >
                <option :value="10">10</option>
                <option :value="15">15</option>
                <option :value="25">25</option>
                <option :value="50">50</option>
              </select>
            </div>
          </div>

          <!-- Page Buttons -->
          <div class="flex items-center gap-1.5 self-end sm:self-auto">
            <button
              type="button"
              @click="goToPage(meta.current_page - 1)"
              :disabled="meta.current_page <= 1 || loading"
              class="inline-flex items-center gap-1 px-3 py-1.5 rounded-[8px] border border-[#DCDEDD] text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft class="w-4 h-4" />
              <span>Prev</span>
            </button>

            <button
              v-for="page in visiblePages"
              :key="page"
              type="button"
              @click="goToPage(page)"
              class="min-w-[34px] h-[34px] px-2.5 rounded-[8px] text-xs font-bold border transition-colors"
              :class="
                page === meta.current_page
                  ? 'bg-[#0C51D9] text-white border-[#0C51D9]'
                  : 'bg-white text-gray-700 border-[#DCDEDD] hover:border-[#0C51D9]'
              "
            >
              {{ page }}
            </button>

            <button
              type="button"
              @click="goToPage(meta.current_page + 1)"
              :disabled="meta.current_page >= meta.last_page || loading"
              class="inline-flex items-center gap-1 px-3 py-1.5 rounded-[8px] border border-[#DCDEDD] text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span>Next</span>
              <ChevronRight class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL DETAIL LOG AUDIT (Read-Only, Full Raw User Agent with word-break: break-all + Copy) -->
    <div
      v-if="selectedLog"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4"
      @click.self="closeDetailModal"
    >
      <div
        class="bg-white border border-[#DCDEDD] rounded-[20px] shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="audit-detail-title"
      >
        <!-- Modal Header -->
        <div
          class="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50/70"
        >
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 rounded-[12px] bg-blue-50 border border-blue-100 flex items-center justify-center"
            >
              <ShieldCheck class="w-5 h-5 text-[#0C51D9]" />
            </div>
            <div>
              <h3 id="audit-detail-title" class="text-base font-bold text-gray-900">
                User Activity Log Detail
              </h3>
              <p class="text-xs text-gray-500 font-mono">
                ID: {{ selectedLog.id }} • #{{ selectedLog.sequence }}
              </p>
            </div>
          </div>

          <button
            type="button"
            @click="closeDetailModal"
            class="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-800 hover:border-gray-400 transition-colors"
            aria-label="Close detail modal"
          >
            <X class="w-4 h-4" />
          </button>
        </div>

        <!-- Modal Body -->
        <div class="p-6 overflow-y-auto space-y-5">
          <!-- Activity & Time Banner -->
          <div
            class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-[14px] bg-gray-50 border border-gray-200"
          >
            <div class="space-y-1">
              <div class="flex items-center gap-2 flex-wrap">
                <span
                  class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border"
                  :class="getActivityBadgeClass(selectedLog.activity?.type)"
                >
                  <component
                    :is="getActivityIcon(selectedLog.activity?.type)"
                    class="w-3.5 h-3.5"
                  />
                  <span>{{ selectedLog.activity?.label }}</span>
                </span>
                <span
                  class="text-xs font-semibold text-gray-700 bg-white border border-gray-200 px-2.5 py-0.5 rounded-md"
                >
                  Module: {{ selectedLog.activity?.module }}
                </span>
              </div>
              <p class="text-sm font-semibold text-gray-900 pt-1">
                {{ selectedLog.activity?.description }}
              </p>
            </div>

            <div class="text-left sm:text-right shrink-0">
              <div class="text-xs font-bold text-gray-900 flex sm:justify-end items-center gap-1">
                <Clock class="w-3.5 h-3.5 text-blue-600" />
                <span>{{ selectedLog.accessed_at_formatted }}</span>
              </div>
              <p class="text-[11px] font-mono text-gray-500 mt-0.5">
                {{ selectedLog.accessed_at }}
              </p>
            </div>
          </div>

          <!-- User & Network Grid -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <!-- User Info -->
            <div class="border border-gray-200 rounded-[14px] p-4 space-y-3">
              <div class="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <UserIcon class="w-3.5 h-3.5 text-blue-600" />
                <span>User Information</span>
              </div>
              <div class="flex items-center gap-3">
                <img
                  :src="
                    getImageUrl(
                      selectedLog.user?.profile_photo,
                      selectedLog.user?.name || 'User'
                    )
                  "
                  :alt="selectedLog.user?.name || 'User'"
                  @error="
                    handleImageError($event, selectedLog.user?.name || 'User')
                  "
                  class="w-11 h-11 rounded-full object-cover border border-gray-200 shrink-0"
                />
                <div class="min-w-0 flex-1">
                  <p class="text-sm font-bold text-gray-900 truncate">
                    {{ selectedLog.user?.name || "Guest / Unauthenticated" }}
                  </p>
                  <p class="text-xs text-gray-600 truncate">
                    {{ selectedLog.user?.email || "-" }}
                  </p>
                  <span
                    class="inline-flex items-center mt-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200"
                  >
                    Role: {{ selectedLog.user?.role || "Guest" }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Parsed Device Info -->
            <div class="border border-gray-200 rounded-[14px] p-4 space-y-2.5">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  <Monitor class="w-3.5 h-3.5 text-indigo-600" />
                  <span>Parsed Device Info</span>
                </div>
                <span
                  class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold border"
                  :class="getDeviceBadgeClass(selectedLog.device?.device_type)"
                >
                  <component
                    :is="getDeviceIcon(selectedLog.device?.device_type)"
                    class="w-3 h-3"
                  />
                  {{ selectedLog.device?.device_type || "Desktop" }}
                </span>
              </div>

              <div class="space-y-1.5 text-xs pt-1">
                <div class="flex justify-between">
                  <span class="text-gray-500">Browser &amp; Version:</span>
                  <span class="font-semibold text-gray-900">
                    {{ selectedLog.device?.browser_label || "-" }}
                  </span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-500">Operating System:</span>
                  <span class="font-semibold text-gray-900">
                    {{ selectedLog.device?.os_label || "-" }}
                  </span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-gray-500">IP Address:</span>
                  <span
                    class="font-mono font-semibold text-gray-900 bg-gray-100 px-2 py-0.5 rounded border border-gray-200"
                  >
                    {{ selectedLog.ip_address }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Raw User Agent Section (Full, word-break: break-all, Copy button) -->
          <div class="border border-gray-200 rounded-[14px] p-4 space-y-2.5 bg-gray-50/50">
            <div class="flex items-center justify-between gap-2">
              <div>
                <h4 class="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Raw User Agent (Full)
                </h4>
                <p class="text-[11px] text-gray-500">
                  Displayed in full without character truncation
                </p>
              </div>

              <button
                type="button"
                @click="copyText(selectedLog.user_agent, 'modal-ua')"
                class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all shrink-0"
                :class="
                  copiedKey === 'modal-ua'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-[#0C51D9] hover:text-[#0C51D9]'
                "
              >
                <Check v-if="copiedKey === 'modal-ua'" class="w-3.5 h-3.5" />
                <Copy v-else class="w-3.5 h-3.5" />
                <span>{{
                  copiedKey === "modal-ua" ? "Copied!" : "Copy User Agent"
                }}</span>
              </button>
            </div>

            <div
              class="p-3.5 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs leading-relaxed break-all select-all border border-slate-800"
              style="word-break: break-all"
            >
              {{ selectedLog.user_agent || "No User-Agent string available" }}
            </div>
          </div>

          <!-- Technical HTTP Request Metadata -->
          <div class="border border-gray-200 rounded-[14px] p-4 space-y-3">
            <div class="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
              <Server class="w-3.5 h-3.5 text-gray-600" />
              <span>Request &amp; Endpoint Metadata</span>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div class="bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                <span class="text-gray-500 block mb-1">Endpoint &amp; Method</span>
                <div class="flex items-center gap-1.5 flex-wrap font-mono">
                  <span
                    class="px-2 py-0.5 rounded font-bold text-[11px] bg-blue-100 text-blue-800"
                  >
                    {{ selectedLog.request?.method }}
                  </span>
                  <span class="text-gray-900 break-all">
                    {{ selectedLog.request?.uri }}
                  </span>
                </div>
              </div>

              <div class="bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                <span class="text-gray-500 block mb-1">HTTP Status &amp; Duration</span>
                <div class="flex items-center gap-2">
                  <span
                    class="px-2 py-0.5 rounded font-mono font-bold text-[11px] border"
                    :class="getStatusBadgeClass(selectedLog.request?.status_code)"
                  >
                    HTTP {{ selectedLog.request?.status_code || 200 }}
                  </span>
                  <span
                    v-if="selectedLog.request?.duration_ms !== null"
                    class="text-gray-700 font-mono"
                  >
                    {{ selectedLog.request.duration_ms }} ms
                  </span>
                  <span
                    v-if="selectedLog.request?.memory_mb"
                    class="text-gray-500 font-mono"
                  >
                    • {{ selectedLog.request.memory_mb }} MB
                  </span>
                </div>
              </div>

              <div class="bg-gray-50 p-2.5 rounded-lg border border-gray-100 sm:col-span-2">
                <span class="text-gray-500 block mb-1">Controller Action</span>
                <span class="font-mono text-gray-800 break-all">
                  {{ selectedLog.request?.controller_action || "-" }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div
          class="px-6 py-3.5 border-t border-gray-200 bg-gray-50 flex items-center justify-end"
        >
          <button
            type="button"
            @click="closeDetailModal"
            class="px-4 py-2 rounded-[10px] text-xs font-semibold bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
