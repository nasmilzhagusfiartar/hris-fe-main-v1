<script setup lang="ts">
import { ref, onMounted } from "vue";
import { axiosInstance } from "@/plugins/axios";
import QuickActions from "./QuickActions.vue";
import { formatRupiahCompact } from "@/utils/formatUtils";
import {
  WalletIcon,
  CheckCircle2Icon,
  ClockIcon,
  BanknoteIcon,
} from "lucide-vue-next";

const stats = ref({
  total_amount: 0,
  average_salary: 0,
  paid_payrolls: 0,
  pending_payrolls: 0,
  deductions: 0,
});
const loading = ref(true);

const fetchFinanceStats = async () => {
  loading.value = true;
  try {
    const response = await axiosInstance.get("/payrolls/statistics");
    if (response.data?.data) {
      stats.value = response.data.data;
    }
  } catch (e) {
    // fallback defaults
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchFinanceStats();
});
</script>

<template>
  <div class="space-y-6">
    <!-- Finance Payroll Summary Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="bg-white border border-[#DCDEDD] rounded-[20px] p-5">
        <div class="flex items-center justify-between mb-3">
          <div
            class="w-12 h-12 rounded-[14px] bg-blue-50 flex items-center justify-center"
          >
            <WalletIcon class="w-6 h-6 text-blue-600" />
          </div>
          <span
            class="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700"
          >
            This Month
          </span>
        </div>
        <p class="text-2xl font-extrabold text-brand-dark">
          {{ loading ? "..." : formatRupiahCompact(stats.total_amount) }}
        </p>
        <p class="text-sm text-brand-light mt-1">Total Payroll This Month</p>
      </div>

      <div class="bg-white border border-[#DCDEDD] rounded-[20px] p-5">
        <div class="flex items-center justify-between mb-3">
          <div
            class="w-12 h-12 rounded-[14px] bg-emerald-50 flex items-center justify-center"
          >
            <CheckCircle2Icon class="w-6 h-6 text-emerald-600" />
          </div>
          <span
            class="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700"
          >
            Paid
          </span>
        </div>
        <p class="text-2xl font-extrabold text-brand-dark">
          {{ loading ? "..." : stats.paid_payrolls }}
        </p>
        <p class="text-sm text-brand-light mt-1">Paid Payroll Periods</p>
      </div>

      <div class="bg-white border border-[#DCDEDD] rounded-[20px] p-5">
        <div class="flex items-center justify-between mb-3">
          <div
            class="w-12 h-12 rounded-[14px] bg-amber-50 flex items-center justify-center"
          >
            <ClockIcon class="w-6 h-6 text-amber-600" />
          </div>
          <span
            class="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700"
          >
            Pending
          </span>
        </div>
        <p class="text-2xl font-extrabold text-brand-dark">
          {{ loading ? "..." : stats.pending_payrolls }}
        </p>
        <p class="text-sm text-brand-light mt-1">Pending Payroll Payments</p>
      </div>

      <div class="bg-white border border-[#DCDEDD] rounded-[20px] p-5">
        <div class="flex items-center justify-between mb-3">
          <div
            class="w-12 h-12 rounded-[14px] bg-purple-50 flex items-center justify-center"
          >
            <BanknoteIcon class="w-6 h-6 text-purple-600" />
          </div>
          <span
            class="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700"
          >
            Average
          </span>
        </div>
        <p class="text-2xl font-extrabold text-brand-dark">
          {{ loading ? "..." : formatRupiahCompact(stats.average_salary) }}
        </p>
        <p class="text-sm text-brand-light mt-1">Average Net Salary</p>
      </div>
    </div>

    <QuickActions />
  </div>
</template>
