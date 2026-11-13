<script setup lang="ts">
import { computed, onMounted, reactive } from "vue";
import { RouterLink } from "vue-router";
import {
  UserPlusIcon,
  UsersIcon,
  BanknoteIcon,
  FolderPlusIcon,
  CalendarCheckIcon,
  ShieldAlertIcon,
  GlobeIcon,
  FileBarChart2Icon,
  ClockIcon,
  CalendarPlusIcon,
  ReceiptIcon,
  UserCogIcon,
  Loader2Icon,
} from "lucide-vue-next";
import { useAuthStore } from "@/stores/auth";
import { useDashboardStore } from "@/stores/dashboard";
import { useCtiStore } from "@/stores/cti";
import { useToastStore } from "@/stores/toast";
import { can } from "@/helpers/permissionHelper";

interface QuickActionItem {
  id: string;
  label: string;
  ariaLabel: string;
  icon: any;
  route?: { name: string; query?: Record<string, string> };
  handler?: () => Promise<void>;
  roles: string[];
  permission?: string;
  badgeKey?: string;
  badgeColor?: string;
  primary?: boolean;
}

const authStore = useAuthStore();
const dashboardStore = useDashboardStore();
const ctiStore = useCtiStore();
const toast = useToastStore();

const actionLoading = reactive<Record<string, boolean>>({
  "brand-scan": false,
  "breach-check": false,
});

const userRoles = computed<string[]>(() => {
  const rawRoles = authStore.user?.roles || [];
  return rawRoles.map((r: any) =>
    typeof r === "string" ? r.toLowerCase() : (r?.name || "").toLowerCase()
  );
});

const handleBrandScan = async () => {
  if (actionLoading["brand-scan"]) return;
  actionLoading["brand-scan"] = true;

  try {
    const scan = await ctiStore.createBrandScan("herointiputra.com");
    toast.success(
      `Scan Brand Protection untuk ${scan?.domain || "herointiputra.com"} berhasil diantrikan.`
    );
    await dashboardStore.fetchQuickActionCounts();
  } catch (err: any) {
    const msg =
      typeof err === "string"
        ? err
        : err?.response?.data?.message ||
          ctiStore.error ||
          "Gagal menjalankan scan Brand Protection.";
    toast.error(msg);
  } finally {
    actionLoading["brand-scan"] = false;
  }
};

const handleBreachCheck = async () => {
  if (actionLoading["breach-check"]) return;
  actionLoading["breach-check"] = true;

  try {
    const res = await ctiStore.checkAllEmployeesBreach();
    const queued = res?.queued ?? 0;
    toast.success(
      `Pengecekan data breach (XposedOrNot) diantrikan untuk ${queued} email karyawan.`
    );
    await dashboardStore.fetchQuickActionCounts();
  } catch (err: any) {
    const msg =
      typeof err === "string"
        ? err
        : err?.response?.data?.message ||
          ctiStore.error ||
          "Gagal menjalankan pengecekan data breach.";
    toast.error(msg);
  } finally {
    actionLoading["breach-check"] = false;
  }
};

const quickActionsConfig: QuickActionItem[] = [
  // Management / HR / Admin Actions
  {
    id: "add-employee",
    label: "Add Employee",
    ariaLabel: "Tambah karyawan baru",
    icon: UserPlusIcon,
    route: { name: "admin.employees.create" },
    roles: ["manager", "admin", "hr"],
    permission: "employee-create",
    primary: true,
  },
  {
    id: "create-team",
    label: "Create Team",
    ariaLabel: "Buat tim baru",
    icon: UsersIcon,
    route: { name: "admin.team.create" },
    roles: ["manager", "admin", "hr"],
    permission: "team-create",
  },
  {
    id: "create-project",
    label: "New Project",
    ariaLabel: "Buat proyek baru",
    icon: FolderPlusIcon,
    route: { name: "admin.projects.create" },
    roles: ["manager", "admin", "hr"],
    permission: "project-create",
  },
  {
    id: "process-payroll",
    label: "Process Payroll",
    ariaLabel: "Proses dan buat penggajian bulanan",
    icon: BanknoteIcon,
    route: { name: "admin.payroll.create" },
    roles: ["manager", "admin", "finance"],
    permission: "payroll-create",
    badgeKey: "pending_payrolls",
    badgeColor: "bg-amber-500 text-white",
  },
  {
    id: "review-leave",
    label: "Leave & Attendance",
    ariaLabel: "Kelola absensi dan persetujuan cuti",
    icon: CalendarCheckIcon,
    route: { name: "admin.attendances" },
    roles: ["manager", "admin", "hr", "finance"],
    permission: "attendance-list",
    badgeKey: "pending_leave_requests",
    badgeColor: "bg-blue-600 text-white",
  },
  {
    id: "brand-scan",
    label: "Scan Brand",
    ariaLabel: "Jalankan scan typosquatting Brand Protection",
    icon: GlobeIcon,
    handler: handleBrandScan,
    roles: ["manager", "admin", "hr"],
    permission: "cti-brand-scan",
    badgeKey: "brand_threats_count",
    badgeColor: "bg-red-600 text-white",
  },
  {
    id: "breach-check",
    label: "Check Breaches",
    ariaLabel: "Periksa kebocoran email karyawan via XposedOrNot",
    icon: ShieldAlertIcon,
    handler: handleBreachCheck,
    roles: ["manager", "admin", "hr"],
    permission: "cti-breach-check",
    badgeKey: "breached_emails_count",
    badgeColor: "bg-red-600 text-white",
  },
  {
    id: "view-reports",
    label: "View Reports",
    ariaLabel: "Lihat laporan analitik perusahaan",
    icon: FileBarChart2Icon,
    route: { name: "admin.reports" },
    roles: ["manager", "admin"],
  },
  {
    id: "payroll-dashboard",
    label: "Payroll List",
    ariaLabel: "Lihat daftar penggajian",
    icon: ReceiptIcon,
    route: { name: "admin.payroll.dashboard" },
    roles: ["finance"],
    permission: "payroll-list",
  },

  // Employee Self-Service Actions
  {
    id: "clock-in-out",
    label: "Clock In/Out",
    ariaLabel: "Catat kehadiran masuk atau pulang",
    icon: ClockIcon,
    route: { name: "employee.attendance.clock" },
    roles: ["employee"],
    permission: "attendance-check-in",
    primary: true,
  },
  {
    id: "request-leave",
    label: "Request Leave",
    ariaLabel: "Ajukan permohonan cuti baru",
    icon: CalendarPlusIcon,
    route: {
      name: "employee.attendance.my-attendances",
      query: { action: "request-leave" },
    },
    roles: ["employee"],
    permission: "leave-request-create",
    badgeKey: "my_pending_leaves",
    badgeColor: "bg-amber-500 text-white",
  },
  {
    id: "my-payslips",
    label: "My Payslips",
    ariaLabel: "Lihat slip gaji saya",
    icon: ReceiptIcon,
    route: { name: "employee.payslips" },
    roles: ["employee"],
  },
  {
    id: "edit-profile",
    label: "Edit Profile",
    ariaLabel: "Perbarui profil pengguna",
    icon: UserCogIcon,
    route: { name: "employee.profile.edit" },
    roles: ["employee", "finance"],
    permission: "profile-view",
  },
];

const visibleActions = computed<QuickActionItem[]>(() => {
  return quickActionsConfig.filter((item) => {
    const roleMatched = item.roles.some((r) => userRoles.value.includes(r));
    if (roleMatched) return true;
    if (item.permission && can(item.permission)) {
      // Prevent admin-only actions from leaking to pure employee role unless matched
      if (userRoles.value.includes("employee") && !item.roles.includes("employee")) {
        return false;
      }
      return true;
    }
    return false;
  });
});

const getBadgeValue = (badgeKey?: string): number => {
  if (!badgeKey) return 0;
  const counts = dashboardStore.quickActionCounts as Record<string, number>;
  return Number(counts?.[badgeKey] || 0);
};

onMounted(() => {
  dashboardStore.fetchQuickActionCounts();
});
</script>

<template>
  <!-- Quick Actions Section -->
  <section
    aria-labelledby="quick-actions-heading"
    class="bg-white border border-[#DCDEDD] rounded-[20px] p-4 sm:p-6 transition-all duration-300"
  >
    <div class="flex items-center justify-between gap-2 mb-4">
      <div>
        <h3
          id="quick-actions-heading"
          class="text-brand-dark text-base sm:text-lg font-bold leading-tight"
        >
          Quick Actions
        </h3>
        <p class="text-xs text-gray-500 mt-0.5">
          Shortcut cepat sesuai akses role Anda
        </p>
      </div>
      <span
        class="text-xs text-[#0C51D9] bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-full font-semibold shrink-0"
      >
        {{ visibleActions.length }} Shortcuts
      </span>
    </div>

    <div
      class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
      role="group"
      aria-label="Quick Actions"
    >
      <template v-for="(action, index) in visibleActions" :key="action.id">
        <!-- Route Navigation Action -->
        <RouterLink
          v-if="action.route"
          :to="action.route"
          :aria-label="action.ariaLabel"
          :class="[
            action.primary || index === 0
              ? 'border-[#2151A0] blue-gradient blue-btn-shadow text-white hover:brightness-110 active:scale-[0.98]'
              : 'border-[#DCDEDD] bg-white text-brand-dark hover:border-[#0C51D9] hover:bg-blue-50/40 hover:shadow-sm active:bg-blue-50/80 active:scale-[0.98]',
          ]"
          class="group rounded-[16px] border p-4 flex flex-col items-center justify-center text-center gap-2.5 min-h-[112px] min-w-0 w-full transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0C51D9] focus-visible:ring-offset-2"
        >
          <div class="flex items-center justify-center gap-1.5">
            <div
              :class="[
                action.primary || index === 0
                  ? 'bg-white/20 text-white'
                  : 'bg-blue-50 text-[#0C51D9] group-hover:bg-blue-100',
              ]"
              class="w-10 h-10 rounded-[12px] flex items-center justify-center shrink-0 transition-colors"
            >
              <component :is="action.icon" class="w-5 h-5" />
            </div>

            <!-- Contextual Badge (Flow-based, no absolute/negative margin) -->
            <span
              v-if="action.badgeKey && getBadgeValue(action.badgeKey) > 0"
              :class="action.badgeColor || 'bg-blue-600 text-white'"
              class="min-w-[22px] h-5 px-1.5 rounded-full text-[11px] font-bold inline-flex items-center justify-center shadow-sm shrink-0"
              :title="`${getBadgeValue(action.badgeKey)} item membutuhkan perhatian`"
            >
              {{ getBadgeValue(action.badgeKey) }}
            </span>
          </div>

          <span
            :class="[
              action.primary || index === 0
                ? 'text-brand-white font-semibold'
                : 'text-brand-dark font-semibold group-hover:text-[#0C51D9]',
            ]"
            class="w-full text-xs sm:text-sm leading-snug line-clamp-2 text-ellipsis overflow-hidden break-words transition-colors"
          >
            {{ action.label }}
          </span>
        </RouterLink>

        <!-- Backend Handler Action -->
        <button
          v-else-if="action.handler"
          type="button"
          :aria-label="action.ariaLabel"
          :disabled="actionLoading[action.id]"
          @click="action.handler()"
          class="group rounded-[16px] border border-[#DCDEDD] bg-white text-brand-dark hover:border-[#0C51D9] hover:bg-blue-50/40 hover:shadow-sm active:bg-blue-50/80 active:scale-[0.98] p-4 flex flex-col items-center justify-center text-center gap-2.5 min-h-[112px] min-w-0 w-full transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0C51D9] focus-visible:ring-offset-2 disabled:opacity-60 disabled:pointer-events-none disabled:cursor-not-allowed cursor-pointer"
        >
          <div class="flex items-center justify-center gap-1.5">
            <div
              class="w-10 h-10 rounded-[12px] bg-blue-50 text-[#0C51D9] group-hover:bg-blue-100 flex items-center justify-center shrink-0 transition-colors"
            >
              <Loader2Icon
                v-if="actionLoading[action.id]"
                class="w-5 h-5 animate-spin text-[#0C51D9]"
              />
              <component v-else :is="action.icon" class="w-5 h-5" />
            </div>

            <!-- Contextual Badge (Flow-based, no absolute/negative margin) -->
            <span
              v-if="action.badgeKey && getBadgeValue(action.badgeKey) > 0"
              :class="action.badgeColor || 'bg-red-600 text-white'"
              class="min-w-[22px] h-5 px-1.5 rounded-full text-[11px] font-bold inline-flex items-center justify-center shadow-sm shrink-0"
              :title="`${getBadgeValue(action.badgeKey)} alert terdeteksi`"
            >
              {{ getBadgeValue(action.badgeKey) }}
            </span>
          </div>

          <span
            class="w-full text-brand-dark font-semibold group-hover:text-[#0C51D9] text-xs sm:text-sm leading-snug line-clamp-2 text-ellipsis overflow-hidden break-words transition-colors"
          >
            {{ actionLoading[action.id] ? "Processing..." : action.label }}
          </span>
        </button>
      </template>
    </div>
  </section>
</template>
