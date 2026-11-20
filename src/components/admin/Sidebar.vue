<script setup>
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import {
  BuildingIcon,
  HomeIcon,
  FileTextIcon,
  UsersIcon,
  SettingsIcon,
  ClockIcon,
  UserIcon,
  CalendarIcon,
  WalletIcon,
  XIcon,
  ShieldCheckIcon,
  BriefcaseIcon,
  KeyIcon,
} from "lucide-vue-next";

import { can, canOneOf } from "@/helpers/permissionHelper";
import { RouterLink } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const props = defineProps(["isOpen"]);
const emit = defineEmits(["navigate"]);

const { t } = useI18n();
const onNavigate = () => emit("navigate");
const authStore = useAuthStore();

// Role-based helpers
const userRoles = computed(() => {
  return (authStore.user?.roles || []).map((r) =>
    typeof r === "string" ? r.toLowerCase() : (r?.name || "").toLowerCase()
  );
});

const isSuperAdmin = computed(() => userRoles.value.includes("super-admin"));
const isAdmin = computed(() => userRoles.value.includes("admin") || isSuperAdmin.value);
const isSecurity = computed(() => userRoles.value.includes("security"));
const isEmployee = computed(() => userRoles.value.includes("employee"));
const isManager = computed(() => userRoles.value.includes("manager"));
const isHr = computed(() => userRoles.value.includes("hr"));
const isFinance = computed(() => userRoles.value.includes("finance"));

const hasFullCtiAccess = computed(() => {
  return (
    isAdmin.value ||
    isSecurity.value ||
    can("cti.brand-protection.view")
  );
});

const hasAuditLogAccess = computed(() => {
  return (
    isAdmin.value ||
    isSecurity.value ||
    can("audit-log.view")
  );
});

// Section access helpers
const hasManagementAccess = computed(() => {
  if (isSecurity.value && !isAdmin.value) return false;
  if (isAdmin.value || isManager.value || isHr.value || isFinance.value) return true;
  return canOneOf([
    "team-menu",
    "employee-menu",
    "attendance-menu",
    "project-menu",
    "payroll-menu",
  ]);
});

const hasSelfServiceAccess = computed(() => {
  if (isEmployee.value || isSecurity.value) return true;
  return canOneOf([
    "attendance-my-attendances",
    "attendance-check-in",
    "attendance-check-out",
    "profile-menu",
    "team-view",
    "payslip-view",
  ]);
});

const hasCtiAccess = computed(() => {
  return (
    hasFullCtiAccess.value ||
    can("cti.email-breach.check-any") ||
    can("cti.email-breach.check-own") ||
    can("cti-menu") ||
    userRoles.value.length > 0
  );
});

const hasOthersAccess = computed(() => {
  return (
    can("report-menu") ||
    can("report-view") ||
    can("setting-menu") ||
    can("setting-view") ||
    isAdmin.value ||
    isSecurity.value ||
    isManager.value ||
    isHr.value ||
    isFinance.value ||
    isEmployee.value
  );
});

// Portal title
const portalSubtitle = computed(() => {
  if (isSuperAdmin.value) return t("nav.portals.superAdmin");
  if (isAdmin.value) return t("nav.portals.admin");
  if (isSecurity.value) return t("nav.portals.security");
  if (isEmployee.value) return t("nav.portals.employee");
  if (isHr.value) return t("nav.portals.hr");
  if (isFinance.value) return t("nav.portals.finance");
  return t("nav.portals.manager");
});
</script>

<template>
  <!-- Sidebar -->
  <aside
    id="sidebar"
    class="fixed lg:relative inset-y-0 left-0 z-50 w-64 bg-white/80 backdrop-blur-xl border-r border-gray-200/50 flex flex-col transform transition-all duration-300 ease-in-out h-full"
    :class="[
      props.isOpen ? 'translate-x-0' : '-translate-x-full',
      'lg:translate-x-0',
    ]"
    data-collapsed="false"
  >
    <!-- Logo Section -->
    <div
      class="px-6 py-4 border-b border-[#DCDEDD] flex items-center justify-between shrink-0"
    >
      <div class="flex items-center gap-4">
        <div class="w-14 h-14 relative flex items-center justify-center shrink-0">
          <div
            class="w-14 h-14 absolute bg-gradient-to-br from-primary-100 to-primary-200 rounded-full"
          ></div>
          <div
            class="w-10 h-10 absolute bg-gradient-to-br from-primary-500 to-primary-600 rounded-full opacity-90"
          ></div>
          <BuildingIcon class="w-5 h-5 text-white relative z-10" />
        </div>
        <div>
          <h1 class="text-brand-dark text-lg font-bold">HIP HRIS</h1>
          <p class="text-brand-dark text-xs font-normal">
            {{ portalSubtitle }}
          </p>
        </div>
      </div>
      <button
        class="lg:hidden w-10 h-10 rounded-full border border-[#DCDEDD] flex items-center justify-center hover:border-[#0C51D9] hover:border-2 transition-all duration-200"
        @click="onNavigate"
      >
        <XIcon class="w-5 h-5 text-gray-600" />
      </button>
    </div>

    <!-- Navigation Menu (Scrollable) -->
    <nav class="px-6 py-4 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
      <!-- 1. MAIN / DASHBOARD -->
      <div>
        <h3 class="section-title">{{ t("nav.sections.main") }}</h3>
        <div class="space-y-2">
          <RouterLink
            :to="{ name: 'admin.dashboard' }"
            :class="{
              'nav-link-active': $route.name === 'admin.dashboard',
            }"
            class="nav-link border border-[#DCDEDD] rounded-[20px] hover:border-[#0C51D9] hover:border-2 focus:bg-white transition-all duration-300"
            @click="onNavigate"
          >
            <HomeIcon
              class="w-5 h-5 text-gray-600"
              :class="{
                'text-white': $route.name === 'admin.dashboard',
              }"
            />
            <span
              class="text-brand-dark text-base font-medium"
              :class="{
                'text-brand-white': $route.name === 'admin.dashboard',
              }"
            >
              {{ t("nav.dashboard") }}
            </span>
          </RouterLink>
        </div>
      </div>

      <!-- 2. MANAGEMENT SECTION (Admin, HR, Manager, Finance) -->
      <div v-if="hasManagementAccess">
        <h3 class="section-title">{{ t("nav.sections.management") }}</h3>
        <div class="space-y-2">
          <!-- Our Teams -->
          <RouterLink
            v-if="can('team-menu') || isManager || isHr"
            :to="{ name: 'admin.teams' }"
            class="nav-link border border-[#DCDEDD] rounded-[20px] hover:border-[#0C51D9] hover:border-2 focus:bg-white transition-all duration-300"
            :class="{
              'nav-link-active': $route.name?.startsWith('admin.team'),
            }"
            @click="onNavigate"
          >
            <UsersIcon
              class="w-5 h-5 text-gray-600"
              :class="{
                'text-white': $route.name?.startsWith('admin.team'),
              }"
            />
            <span
              class="text-brand-dark text-base font-medium"
              :class="{
                'text-brand-white': $route.name?.startsWith('admin.team'),
              }"
            >
              {{ t("nav.teams") }}
            </span>
          </RouterLink>

          <!-- Employees -->
          <RouterLink
            v-if="can('employee-menu') || isManager || isHr"
            :to="{ name: 'admin.employees' }"
            class="nav-link border border-[#DCDEDD] rounded-[20px] hover:border-[#0C51D9] hover:border-2 focus:bg-white transition-all duration-300"
            :class="{
              'nav-link-active': $route.name?.startsWith('admin.employee'),
            }"
            @click="onNavigate"
          >
            <UsersIcon
              class="w-5 h-5 text-gray-600"
              :class="{
                'text-white': $route.name?.startsWith('admin.employee'),
              }"
            />
            <span
              class="text-brand-dark text-base font-medium"
              :class="{
                'text-brand-white': $route.name?.startsWith('admin.employee'),
              }"
            >
              {{ t("nav.employees") }}
            </span>
          </RouterLink>

          <!-- Attendance Management -->
          <RouterLink
            v-if="can('attendance-menu') || isManager || isHr"
            :to="{ name: 'admin.attendances' }"
            class="nav-link border border-[#DCDEDD] rounded-[20px] hover:border-[#0C51D9] hover:border-2 focus:bg-white transition-all duration-300"
            :class="{
              'nav-link-active': $route.name === 'admin.attendances',
            }"
            @click="onNavigate"
          >
            <CalendarIcon
              class="w-5 h-5 text-gray-600"
              :class="{
                'text-white': $route.name === 'admin.attendances',
              }"
            />
            <span
              class="text-brand-dark text-base font-medium"
              :class="{
                'text-brand-white': $route.name === 'admin.attendances',
              }"
            >
              {{ t("nav.attendance") }}
            </span>
          </RouterLink>

          <!-- Projects -->
          <RouterLink
            v-if="can('project-menu') || isManager || isHr"
            :to="{ name: 'admin.projects' }"
            class="nav-link border border-[#DCDEDD] rounded-[20px] hover:border-[#0C51D9] hover:border-2 focus:bg-white transition-all duration-300"
            :class="{
              'nav-link-active': $route.name?.startsWith('admin.project'),
            }"
            @click="onNavigate"
          >
            <BriefcaseIcon
              class="w-5 h-5 text-gray-600"
              :class="{
                'text-white': $route.name?.startsWith('admin.project'),
              }"
            />
            <span
              class="text-brand-dark text-base font-medium"
              :class="{
                'text-brand-white': $route.name?.startsWith('admin.project'),
              }"
            >
              {{ t("nav.projects") }}
            </span>
          </RouterLink>

          <!-- Payroll -->
          <RouterLink
            v-if="can('payroll-menu') || isManager || isFinance"
            :to="{ name: 'admin.payroll.dashboard' }"
            class="nav-link border border-[#DCDEDD] rounded-[20px] hover:border-[#0C51D9] hover:border-2 focus:bg-white transition-all duration-300"
            :class="{
              'nav-link-active': $route.name?.startsWith('admin.payroll'),
            }"
            @click="onNavigate"
          >
            <WalletIcon
              class="w-5 h-5 text-gray-600"
              :class="{
                'text-white': $route.name?.startsWith('admin.payroll'),
              }"
            />
            <span
              class="text-brand-dark text-base font-medium"
              :class="{
                'text-brand-white': $route.name?.startsWith('admin.payroll'),
              }"
            >
              {{ t("nav.payroll") }}
            </span>
          </RouterLink>

          <!-- Roles (Super Admin Only) -->
          <RouterLink
            v-if="isSuperAdmin"
            :to="{ name: 'admin.roles' }"
            class="nav-link border border-[#DCDEDD] rounded-[20px] hover:border-[#0C51D9] hover:border-2 focus:bg-white transition-all duration-300"
            :class="{
              'nav-link-active': $route.name?.startsWith('admin.roles'),
            }"
            @click="onNavigate"
          >
            <ShieldCheckIcon
              class="w-5 h-5 text-gray-600"
              :class="{
                'text-white': $route.name?.startsWith('admin.roles'),
              }"
            />
            <span
              class="text-brand-dark text-base font-medium"
              :class="{
                'text-brand-white': $route.name?.startsWith('admin.roles'),
              }"
            >
              {{ t("nav.roles") }}
            </span>
          </RouterLink>

          <!-- Permissions (Super Admin Only) -->
          <RouterLink
            v-if="isSuperAdmin"
            :to="{ name: 'admin.permissions' }"
            class="nav-link border border-[#DCDEDD] rounded-[20px] hover:border-[#0C51D9] hover:border-2 focus:bg-white transition-all duration-300"
            :class="{
              'nav-link-active': $route.name?.startsWith('admin.permissions'),
            }"
            @click="onNavigate"
          >
            <KeyIcon
              class="w-5 h-5 text-gray-600"
              :class="{
                'text-white': $route.name?.startsWith('admin.permissions'),
              }"
            />
            <span
              class="text-brand-dark text-base font-medium"
              :class="{
                'text-brand-white': $route.name?.startsWith('admin.permissions'),
              }"
            >
              {{ t("nav.permissions") }}
            </span>
          </RouterLink>
        </div>
      </div>

      <!-- 3. EMPLOYEE SELF-SERVICE SECTION (ESS / Personal) -->
      <div v-if="hasSelfServiceAccess">
        <h3 class="section-title">
          {{ isEmployee ? t("nav.sections.myWorkspace") : t("nav.sections.personalWorkspace") }}
        </h3>
        <div class="space-y-2">
          <!-- Clock In / Out -->
          <RouterLink
            v-if="can('attendance-check-in') || can('attendance-check-out') || isEmployee"
            :to="{ name: 'employee.attendance.clock' }"
            class="nav-link border border-[#DCDEDD] rounded-[20px] hover:border-[#0C51D9] hover:border-2 focus:bg-white transition-all duration-300"
            :class="{
              'nav-link-active': $route.name === 'employee.attendance.clock',
            }"
            @click="onNavigate"
          >
            <ClockIcon
              class="w-5 h-5 text-gray-600"
              :class="{
                'text-white': $route.name === 'employee.attendance.clock',
              }"
            />
            <span
              class="text-brand-dark text-base font-medium"
              :class="{
                'text-brand-white': $route.name === 'employee.attendance.clock',
              }"
            >
              {{ t("nav.clockInOut") }}
            </span>
          </RouterLink>

          <!-- My Attendance & Leave Requests -->
          <RouterLink
            v-if="can('attendance-my-attendances') || isEmployee"
            :to="{ name: 'employee.attendance.my-attendances' }"
            class="nav-link border border-[#DCDEDD] rounded-[20px] hover:border-[#0C51D9] hover:border-2 focus:bg-white transition-all duration-300"
            :class="{
              'nav-link-active':
                $route.name === 'employee.attendance.my-attendances',
            }"
            @click="onNavigate"
          >
            <CalendarIcon
              class="w-5 h-5 text-gray-600"
              :class="{
                'text-white':
                  $route.name === 'employee.attendance.my-attendances',
              }"
            />
            <span
              class="text-brand-dark text-base font-medium"
              :class="{
                'text-brand-white':
                  $route.name === 'employee.attendance.my-attendances',
              }"
            >
              {{ t("nav.myAttendance") }}
            </span>
          </RouterLink>

          <!-- My Payslips -->
          <RouterLink
            v-if="can('payslip-view') || isEmployee"
            :to="{ name: 'employee.payslips' }"
            class="nav-link border border-[#DCDEDD] rounded-[20px] hover:border-[#0C51D9] hover:border-2 focus:bg-white transition-all duration-300"
            :class="{
              'nav-link-active': $route.name?.startsWith('employee.payslips'),
            }"
            @click="onNavigate"
          >
            <WalletIcon
              class="w-5 h-5 text-gray-600"
              :class="{
                'text-white': $route.name?.startsWith('employee.payslips'),
              }"
            />
            <span
              class="text-brand-dark text-base font-medium"
              :class="{
                'text-brand-white':
                  $route.name?.startsWith('employee.payslips'),
              }"
            >
              {{ t("nav.myPayslips") }}
            </span>
          </RouterLink>

          <!-- My Team -->
          <RouterLink
            v-if="can('team-view') || isEmployee"
            :to="{ name: 'employee.team' }"
            class="nav-link border border-[#DCDEDD] rounded-[20px] hover:border-[#0C51D9] hover:border-2 focus:bg-white transition-all duration-300"
            :class="{
              'nav-link-active': $route.name === 'employee.team',
            }"
            @click="onNavigate"
          >
            <UsersIcon
              class="w-5 h-5 text-gray-600"
              :class="{
                'text-white': $route.name === 'employee.team',
              }"
            />
            <span
              class="text-brand-dark text-base font-medium"
              :class="{
                'text-brand-white': $route.name === 'employee.team',
              }"
            >
              {{ t("nav.myTeam") }}
            </span>
          </RouterLink>

          <!-- My Profile -->
          <RouterLink
            v-if="can('profile-menu') || isEmployee"
            :to="{ name: 'employee.profile' }"
            class="nav-link border border-[#DCDEDD] rounded-[20px] hover:border-[#0C51D9] hover:border-2 focus:bg-white transition-all duration-300"
            :class="{
              'nav-link-active': $route.name === 'employee.profile',
            }"
            @click="onNavigate"
          >
            <UserIcon
              class="w-5 h-5 text-gray-600"
              :class="{
                'text-white': $route.name === 'employee.profile',
              }"
            />
            <span
              class="text-brand-dark text-base font-medium"
              :class="{
                'text-brand-white': $route.name === 'employee.profile',
              }"
            >
              {{ t("nav.myProfile") }}
            </span>
          </RouterLink>
        </div>
      </div>

      <!-- 4. CYBER THREAT INTEL SECTION (Security / Monitoring) -->
      <div v-if="hasCtiAccess">
        <h3 class="section-title">{{ t("nav.sections.cti") }}</h3>
        <div class="space-y-2">
          <RouterLink
            :to="{ name: 'admin.cti.brand-protection' }"
            class="nav-link border border-[#DCDEDD] rounded-[20px] hover:border-[#0C51D9] hover:border-2 focus:bg-white transition-all duration-300"
            :class="{
              'nav-link-active': $route.name === 'admin.cti.brand-protection',
            }"
            @click="onNavigate"
          >
            <ShieldCheckIcon
              class="w-5 h-5 text-gray-600"
              :class="{
                'text-white': $route.name === 'admin.cti.brand-protection',
              }"
            />
            <span
              class="text-brand-dark text-base font-medium"
              :class="{
                'text-brand-white':
                  $route.name === 'admin.cti.brand-protection',
              }"
            >
              {{ hasFullCtiAccess ? t("nav.brandProtection") : t("nav.emailBreach") }}
            </span>
          </RouterLink>

          <RouterLink
            v-if="hasAuditLogAccess"
            :to="{ name: 'admin.cti.audit-user' }"
            class="nav-link border border-[#DCDEDD] rounded-[20px] hover:border-[#0C51D9] hover:border-2 focus:bg-white transition-all duration-300"
            :class="{
              'nav-link-active': $route.name === 'admin.cti.audit-user',
            }"
            @click="onNavigate"
          >
            <UserIcon
              class="w-5 h-5 text-gray-600"
              :class="{
                'text-white': $route.name === 'admin.cti.audit-user',
              }"
            />
            <span
              class="text-brand-dark text-base font-medium"
              :class="{
                'text-brand-white': $route.name === 'admin.cti.audit-user',
              }"
            >
              {{ t("nav.auditUser") }}
            </span>
          </RouterLink>
        </div>
      </div>

      <!-- 5. OTHERS (Reports & Settings) -->
      <div v-if="hasOthersAccess">
        <h3 class="section-title">{{ t("nav.sections.others") }}</h3>
        <div class="space-y-2">
          <RouterLink
            v-if="(can('report-menu') || can('report-view') || isAdmin || isManager || isHr || isFinance) && !isEmployee && !isSecurity"
            :to="{ name: 'admin.reports' }"
            class="nav-link border border-[#DCDEDD] rounded-[20px] hover:border-[#0C51D9] hover:border-2 focus:bg-white transition-all duration-300"
            :class="{
              'nav-link-active': $route.name === 'admin.reports',
            }"
            @click="onNavigate"
          >
            <FileTextIcon
              class="w-5 h-5 text-gray-600"
              :class="{
                'text-white': $route.name === 'admin.reports',
              }"
            />
            <span
              class="text-brand-dark text-base font-medium"
              :class="{
                'text-brand-white': $route.name === 'admin.reports',
              }"
            >
              {{ t("nav.reports") }}
            </span>
          </RouterLink>

          <RouterLink
            v-if="can('setting-menu') || can('setting-view') || isManager || isHr || isFinance || isEmployee"
            :to="{ name: 'admin.settings' }"
            class="nav-link border border-[#DCDEDD] rounded-[20px] hover:border-[#0C51D9] hover:border-2 focus:bg-white transition-all duration-300"
            :class="{
              'nav-link-active': $route.name === 'admin.settings',
            }"
            @click="onNavigate"
          >
            <SettingsIcon
              class="w-5 h-5 text-gray-600"
              :class="{
                'text-white': $route.name === 'admin.settings',
              }"
            />
            <span
              class="text-brand-dark text-base font-medium"
              :class="{
                'text-brand-white': $route.name === 'admin.settings',
              }"
            >
              {{ t("nav.settings") }}
            </span>
          </RouterLink>
        </div>
      </div>
    </nav>
  </aside>
</template>
