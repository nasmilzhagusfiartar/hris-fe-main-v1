<script setup>
import { ref, onMounted } from "vue";
import { RouterLink } from "vue-router";
import { axiosInstance } from "@/plugins/axios";
import QuickActions from "./QuickActions.vue";
import {
  ShieldAlert,
  Globe,
  Lock,
  UserX,
  ArrowRight,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
} from "lucide-vue-next";

const stats = ref({
  suspicious_domains_count: 0,
  expiring_ssl_count: 0,
  breached_emails_count: 0,
  failed_logins_24h_count: 0,
  users_without_mfa_count: 0,
  mfa_failed_24h_count: 0,
  recent_brand_threats: [],
  recent_breaches: [],
});
const loading = ref(true);
const error = ref(null);

const fetchSecurityStats = async () => {
  loading.value = true;
  error.value = null;
  try {
    const response = await axiosInstance.get("/dashboard/security-statistics");
    if (response.data?.data) {
      stats.value = response.data.data;
    }
  } catch (err) {
    error.value =
      err?.response?.data?.message ||
      "Failed to load Cyber Threat Intelligence summary statistics.";
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchSecurityStats();
});
</script>

<template>
  <div class="space-y-6">
    <!-- Header Banner -->
    <div
      class="bg-white border border-[#DCDEDD] rounded-[20px] p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
    >
      <div>
        <h2 class="text-xl font-extrabold text-brand-dark">
          Cyber Threat Intelligence Overview
        </h2>
        <p class="text-sm text-brand-light mt-1">
          Monitoring domain security, SSL certificates, employee email breaches,
          and suspicious authentication activity.
        </p>
      </div>

      <button
        type="button"
        @click="fetchSecurityStats"
        :disabled="loading"
        class="inline-flex items-center gap-2 px-4 py-2.5 border border-[#DCDEDD] rounded-[12px] text-xs font-semibold text-brand-dark hover:border-[#0C51D9] transition-all self-start sm:self-auto"
      >
        <RefreshCw class="w-4 h-4" :class="{ 'animate-spin': loading }" />
        <span>Refresh CTI</span>
      </button>
    </div>

    <!-- 6 CTI & MFA Metric Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <!-- 1. Suspicious Domains -->
      <div
        class="bg-white border border-[#DCDEDD] rounded-[20px] p-5 hover:border-[#0C51D9] transition-all"
      >
        <div class="flex items-center justify-between mb-3">
          <div
            class="w-12 h-12 rounded-[14px] bg-blue-50 flex items-center justify-center"
          >
            <Globe class="w-6 h-6 text-blue-600" />
          </div>
          <span
            class="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700"
          >
            Typosquatting
          </span>
        </div>
        <p class="text-3xl font-extrabold text-brand-dark">
          {{ loading ? "..." : stats.suspicious_domains_count }}
        </p>
        <p class="text-sm text-brand-light mt-1">New Suspicious Domains</p>
      </div>

      <!-- 2. Expiring SSL < 30 Days -->
      <div
        class="bg-white border border-[#DCDEDD] rounded-[20px] p-5 hover:border-[#0C51D9] transition-all"
      >
        <div class="flex items-center justify-between mb-3">
          <div
            class="w-12 h-12 rounded-[14px] bg-amber-50 flex items-center justify-center"
          >
            <Lock class="w-6 h-6 text-amber-600" />
          </div>
          <span
            class="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700"
          >
            &lt; 30 Days
          </span>
        </div>
        <p class="text-3xl font-extrabold text-brand-dark">
          {{ loading ? "..." : stats.expiring_ssl_count }}
        </p>
        <p class="text-sm text-brand-light mt-1">SSL Expiring &lt; 30 Days</p>
      </div>

      <!-- 3. Breached Employee Emails -->
      <div
        class="bg-white border border-[#DCDEDD] rounded-[20px] p-5 hover:border-[#0C51D9] transition-all"
      >
        <div class="flex items-center justify-between mb-3">
          <div
            class="w-12 h-12 rounded-[14px] bg-red-50 flex items-center justify-center"
          >
            <ShieldAlert class="w-6 h-6 text-red-600" />
          </div>
          <span
            class="px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700"
          >
            Data Breach
          </span>
        </div>
        <p class="text-3xl font-extrabold text-brand-dark">
          {{ loading ? "..." : stats.breached_emails_count }}
        </p>
        <p class="text-sm text-brand-light mt-1">
          Breached Employee Emails
        </p>
      </div>

      <!-- 4. Failed Logins (24h) -->
      <div
        class="bg-white border border-[#DCDEDD] rounded-[20px] p-5 hover:border-[#0C51D9] transition-all"
      >
        <div class="flex items-center justify-between mb-3">
          <div
            class="w-12 h-12 rounded-[14px] bg-rose-50 flex items-center justify-center"
          >
            <UserX class="w-6 h-6 text-rose-600" />
          </div>
          <span
            class="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700"
          >
            Last 24 Hours
          </span>
        </div>
        <p class="text-3xl font-extrabold text-brand-dark">
          {{ loading ? "..." : stats.failed_logins_24h_count }}
        </p>
        <p class="text-sm text-brand-light mt-1">Failed Login Attempts</p>
      </div>

      <!-- 5. Users Without MFA -->
      <div
        class="bg-white border border-[#DCDEDD] rounded-[20px] p-5 hover:border-[#0C51D9] transition-all"
      >
        <div class="flex items-center justify-between mb-3">
          <div
            class="w-12 h-12 rounded-[14px] bg-orange-50 flex items-center justify-center"
          >
            <AlertTriangle class="w-6 h-6 text-orange-600" />
          </div>
          <span
            class="px-2.5 py-1 rounded-full text-xs font-bold bg-orange-50 text-orange-700"
          >
            MFA Coverage
          </span>
        </div>
        <p class="text-3xl font-extrabold text-brand-dark">
          {{ loading ? "..." : stats.users_without_mfa_count }}
        </p>
        <p class="text-sm text-brand-light mt-1">Users Without MFA</p>
      </div>

      <!-- 6. MFA Failed (24h) -->
      <div
        class="bg-white border border-[#DCDEDD] rounded-[20px] p-5 hover:border-[#0C51D9] transition-all"
      >
        <div class="flex items-center justify-between mb-3">
          <div
            class="w-12 h-12 rounded-[14px] bg-purple-50 flex items-center justify-center"
          >
            <ShieldAlert class="w-6 h-6 text-purple-600" />
          </div>
          <span
            class="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700"
          >
            Last 24 Hours
          </span>
        </div>
        <p class="text-3xl font-extrabold text-brand-dark">
          {{ loading ? "..." : stats.mfa_failed_24h_count }}
        </p>
        <p class="text-sm text-brand-light mt-1">MFA Failed Attempts (24h)</p>
      </div>
    </div>

    <!-- Security Quick Actions -->
    <QuickActions />

    <!-- Quick CTI Navigation & Recent Threats -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Recent Discovered Typosquatting Domains -->
      <div class="bg-white border border-[#DCDEDD] rounded-[20px] p-6">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="text-base font-bold text-brand-dark">
              Recent Suspicious Domain Findings
            </h3>
            <p class="text-xs text-brand-light">
              dnstwist &amp; urlscan.io scan results
            </p>
          </div>
          <RouterLink
            :to="{ name: 'admin.cti.brand-protection' }"
            class="inline-flex items-center gap-1 text-xs font-semibold text-[#0C51D9] hover:underline"
          >
            <span>Open Brand Protection</span>
            <ArrowRight class="w-3.5 h-3.5" />
          </RouterLink>
        </div>

        <div
          v-if="!stats.recent_brand_threats?.length"
          class="py-8 text-center text-sm text-gray-500"
        >
          No recent lookalike domain findings.
        </div>

        <div v-else class="space-y-2.5">
          <div
            v-for="item in stats.recent_brand_threats"
            :key="item.id"
            class="flex items-center justify-between p-3 rounded-[12px] border border-gray-200 bg-gray-50/50"
          >
            <div>
              <p class="font-mono text-sm font-bold text-gray-900">
                {{ item.domain }}
              </p>
              <p class="text-xs text-gray-500">Fuzzer: {{ item.fuzzer }}</p>
            </div>
            <span
              v-if="item.urlscan_malicious"
              class="px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800"
            >
              MALICIOUS
            </span>
            <span
              v-else-if="item.urlscan_status === 'done'"
              class="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800"
            >
              CLEAN (Score {{ item.urlscan_score ?? 0 }})
            </span>
            <span
              v-else
              class="px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-200 text-gray-700"
            >
              Detected
            </span>
          </div>
        </div>
      </div>

      <!-- Recent Email Breach Checks -->
      <div class="bg-white border border-[#DCDEDD] rounded-[20px] p-6">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="text-base font-bold text-brand-dark">
              Recent Email Breach Checks
            </h3>
            <p class="text-xs text-brand-light">
              Company email account breach status
            </p>
          </div>
          <RouterLink
            :to="{ name: 'admin.cti.audit-user' }"
            class="inline-flex items-center gap-1 text-xs font-semibold text-[#0C51D9] hover:underline"
          >
            <span>Open Audit User</span>
            <ArrowRight class="w-3.5 h-3.5" />
          </RouterLink>
        </div>

        <div
          v-if="!stats.recent_breaches?.length"
          class="py-8 text-center text-sm text-gray-500"
        >
          No email breach check history available.
        </div>

        <div v-else class="space-y-2.5">
          <div
            v-for="item in stats.recent_breaches"
            :key="item.id"
            class="flex items-center justify-between p-3 rounded-[12px] border border-gray-200 bg-gray-50/50"
          >
            <div class="min-w-0 flex-1 pr-3">
              <p class="text-sm font-bold text-gray-900 truncate">
                {{ item.email }}
              </p>
              <p class="text-xs text-gray-500 truncate">
                {{
                  item.is_breached
                    ? `Detected in ${item.breaches?.length || 1} breach incident(s)`
                    : "No data breaches found"
                }}
              </p>
            </div>
            <span
              v-if="item.is_breached"
              class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 shrink-0"
            >
              <AlertTriangle class="w-3.5 h-3.5" />
              BREACHED
            </span>
            <span
              v-else
              class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 shrink-0"
            >
              <CheckCircle2 class="w-3.5 h-3.5" />
              SAFE
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
