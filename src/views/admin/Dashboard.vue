<script setup lang="ts">
import { computed } from "vue";
import { useAuthStore } from "@/stores/auth";
import { can } from "@/helpers/permissionHelper";
import Statistics from "@/components/admin/dashboard/Statistics.vue";
import EmployeeStatistics from "@/components/admin/dashboard/EmployeeStatistics.vue";
import SecurityStatistics from "@/components/admin/dashboard/SecurityStatistics.vue";
import FinanceStatistics from "@/components/admin/dashboard/FinanceStatistics.vue";
import SearchSection from "@/components/admin/dashboard/SearchSection.vue";
import LatestEmployees from "@/components/admin/dashboard/LatestEmployees.vue";
import LatestTeams from "@/components/admin/dashboard/LatestTeams.vue";

const authStore = useAuthStore();

const userRoles = computed(() =>
  (authStore.user?.roles || []).map((role: any) =>
    typeof role === "string" ? role.toLowerCase() : (role?.name || "").toLowerCase()
  )
);

const isSecurity = computed(() => {
  return (
    userRoles.value.includes("security") &&
    !userRoles.value.includes("admin")
  );
});

const isFinanceOnly = computed(() => {
  return (
    userRoles.value.includes("finance") &&
    !userRoles.value.some((r: string) => ["admin", "hr", "manager"].includes(r))
  );
});

const isEmployee = computed(() => {
  return userRoles.value.includes("employee");
});

const hasDashboardPermission = computed(() => {
  return can("dashboard-view");
});
</script>

<template>
  <div class="space-y-6">
    <!-- Security Role Dashboard: CTI Summary + Security Quick Actions -->
    <template v-if="isSecurity">
      <div class="space-y-6">
        <SecurityStatistics />
      </div>
    </template>

    <!-- Finance Role Dashboard: Payroll Summary + Finance Quick Actions (No global HRIS employee/team stats) -->
    <template v-else-if="isFinanceOnly">
      <div class="space-y-6">
        <FinanceStatistics />
        <SearchSection v-if="hasDashboardPermission" />
      </div>
    </template>

    <!-- Employee Role Dashboard -->
    <template v-else-if="isEmployee">
      <div class="space-y-6">
        <EmployeeStatistics />
        <SearchSection v-if="hasDashboardPermission" />
      </div>
    </template>

    <!-- Admin / HR / Manager Dashboard -->
    <template v-else>
      <div class="space-y-6">
        <Statistics />
        <SearchSection />
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <LatestEmployees v-if="can('employee-list')" />
          <LatestTeams v-if="can('team-list')" />
        </div>
      </div>
    </template>
  </div>
</template>
