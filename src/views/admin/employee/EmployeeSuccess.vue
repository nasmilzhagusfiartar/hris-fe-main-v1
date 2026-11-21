<script setup lang="ts">
import { onMounted, computed } from "vue";
import { useI18n } from "vue-i18n";
import { storeToRefs } from "pinia";
import { Users, UserPlus, Plus, Briefcase, Building2, Store, Hash } from "lucide-vue-next";
import { useRouter } from "vue-router";
import { useEmployeeStore } from "@/stores/employee";

const { t } = useI18n();
const router = useRouter();
const employeeStore = useEmployeeStore();
const { statistics, loadingStatistics, lastCreatedEmployee } = storeToRefs(employeeStore);

const created = computed(() => lastCreatedEmployee.value);

const departmentLabel = computed(() => {
  const dept = created.value?.job_information?.department;
  if (!dept) return null;
  const key = `enums.${dept}`;
  return t(key) !== key ? t(key) : dept.replace(/_/g, " ");
});

const goToEmployees = () => {
  router.push({ name: "admin.employees" });
};

const addAnotherEmployee = () => {
  employeeStore.lastCreatedEmployee = null;
  router.push({ name: "admin.employees.create" });
};

onMounted(() => {
  employeeStore.fetchStatistics().catch(() => {});
});
</script>

<template>
  <!-- Success Content -->
  <main class="flex items-center justify-center py-12 min-h-[calc(100vh-80px)]">
    <div class="max-w-lg w-full mx-auto text-center px-4">
      <!-- Success Card -->
      <div class="bg-white border border-[#DCDEDD] rounded-[20px] p-8 shadow-sm">
        <!-- Success Icon -->
        <div class="flex justify-center mb-6">
          <div class="w-28 h-28 bg-green-100 rounded-full flex items-center justify-center">
            <div class="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center">
              <svg
                class="w-12 h-12 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="3"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>
        </div>

        <!-- Success Message -->
        <div class="mb-6">
          <h1 class="text-brand-dark text-2xl font-extrabold mb-2">
            {{ t("employee.addedSuccessTitle") }}
          </h1>
          <p class="text-brand-light text-sm font-normal leading-relaxed">
            {{ t("employee.addedSuccessSub") }}
          </p>
        </div>

        <!-- Newly Created Employee Summary -->
        <div
          v-if="created"
          class="mb-6 text-left bg-gray-50 border border-[#DCDEDD] rounded-[16px] p-4 space-y-2.5"
        >
          <p class="text-xs font-bold uppercase tracking-wider text-gray-500">
            {{ t("employee.newEmployeeSummary") }}
          </p>
          <div class="flex items-center justify-between text-sm">
            <span class="text-gray-500">{{ t("common.name") }}</span>
            <span class="font-bold text-brand-dark">{{ created.user?.name || "-" }}</span>
          </div>
          <div v-if="created.code" class="flex items-center justify-between text-sm">
            <span class="text-gray-500 inline-flex items-center gap-1.5">
              <Hash class="w-3.5 h-3.5" />
              {{ t("employee.employeeCode") }}
            </span>
            <span class="font-mono font-semibold text-brand-dark">{{ created.code }}</span>
          </div>
          <div v-if="created.job_information?.job_title" class="flex items-center justify-between text-sm">
            <span class="text-gray-500 inline-flex items-center gap-1.5">
              <Briefcase class="w-3.5 h-3.5" />
              {{ t("employee.jobTitle") }}
            </span>
            <span class="font-semibold text-brand-dark">{{ created.job_information.job_title }}</span>
          </div>
          <div v-if="departmentLabel" class="flex items-center justify-between text-sm">
            <span class="text-gray-500 inline-flex items-center gap-1.5">
              <Building2 class="w-3.5 h-3.5" />
              {{ t("employee.department") }}
            </span>
            <span class="font-semibold text-brand-dark">{{ departmentLabel }}</span>
          </div>
          <div v-if="created.job_information?.store?.name" class="flex items-center justify-between text-sm">
            <span class="text-gray-500 inline-flex items-center gap-1.5">
              <Store class="w-3.5 h-3.5" />
              {{ t("employee.store") }}
            </span>
            <span class="font-semibold text-brand-dark">
              {{ created.job_information.store.name }}
            </span>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-col gap-3">
          <button
            @click="goToEmployees"
            class="btn-primary rounded-[8px] border border-[#2151A0] hover:brightness-110 focus:ring-2 focus:ring-[#0C51D9] transition-all duration-300 blue-gradient blue-btn-shadow px-6 py-3 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span class="text-brand-white text-base font-semibold">{{ t("employee.viewAllEmployees") }}</span>
            <Users class="w-4 h-4 text-white" />
          </button>

          <button
            @click="addAnotherEmployee"
            class="border border-[#DCDEDD] rounded-[8px] hover:border-[#0C51D9] hover:border-2 hover:bg-gray-50 transition-all duration-300 px-6 py-3 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span class="text-brand-dark text-base font-semibold">{{ t("employee.addAnotherEmployee") }}</span>
            <Plus class="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      <!-- Live Stats from API -->
      <div class="mt-6 grid grid-cols-2 gap-4">
        <div class="bg-white border border-[#DCDEDD] rounded-[16px] p-4">
          <div class="flex items-start gap-3">
            <div class="w-10 h-10 bg-blue-50 rounded-[12px] flex items-center justify-center">
              <Users class="w-5 h-5 text-blue-600" />
            </div>
            <div class="text-left">
              <p class="text-brand-dark text-lg font-bold">
                {{ loadingStatistics ? "..." : (statistics.total ?? 0) }}
              </p>
              <p class="text-brand-light text-xs font-normal">{{ t("employee.totalEmployees") }}</p>
            </div>
          </div>
        </div>
        <div class="bg-white border border-[#DCDEDD] rounded-[16px] p-4">
          <div class="flex items-start gap-3">
            <div class="w-10 h-10 bg-green-50 rounded-[12px] flex items-center justify-center">
              <UserPlus class="w-5 h-5 text-green-600" />
            </div>
            <div class="text-left">
              <p class="text-brand-dark text-lg font-bold">
                {{ loadingStatistics ? "..." : (statistics.added_this_month ?? 0) }}
              </p>
              <p class="text-brand-light text-xs font-normal">{{ t("employee.addedThisMonthLabel") }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>
