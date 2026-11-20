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
      "Gagal memuat ringkasan statistik Cyber Threat Intelligence.";
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
          Pemantauan keamanan domain, sertifikat SSL, kebocoran email karyawan,
          dan aktivitas autentikasi mencurigakan.
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

    <!-- 4 CTI Metric Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
        <p class="text-sm text-brand-light mt-1">Suspicious Domain Baru</p>
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
            &lt; 30 Hari
          </span>
        </div>
        <p class="text-3xl font-extrabold text-brand-dark">
          {{ loading ? "..." : stats.expiring_ssl_count }}
        </p>
        <p class="text-sm text-brand-light mt-1">SSL Akan Expired &lt; 30 Hari</p>
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
          Email Karyawan Terdampak Breach
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
            24 Jam Terakhir
          </span>
        </div>
        <p class="text-3xl font-extrabold text-brand-dark">
          {{ loading ? "..." : stats.failed_logins_24h_count }}
        </p>
        <p class="text-sm text-brand-light mt-1">Percobaan Login Gagal</p>
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
              Temuan Domain Mencurigakan Terbaru
            </h3>
            <p class="text-xs text-brand-light">
              Hasil pemindaian dnstwist &amp; urlscan.io
            </p>
          </div>
          <RouterLink
            :to="{ name: 'admin.cti.brand-protection' }"
            class="inline-flex items-center gap-1 text-xs font-semibold text-[#0C51D9] hover:underline"
          >
            <span>Buka Brand Protection</span>
            <ArrowRight class="w-3.5 h-3.5" />
          </RouterLink>
        </div>

        <div
          v-if="!stats.recent_brand_threats?.length"
          class="py-8 text-center text-sm text-gray-500"
        >
          Belum ada temuan domain tiruan terbaru.
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
              CLEAN (Skor {{ item.urlscan_score ?? 0 }})
            </span>
            <span
              v-else
              class="px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-200 text-gray-700"
            >
              Terdeteksi
            </span>
          </div>
        </div>
      </div>

      <!-- Recent Email Breach Checks -->
      <div class="bg-white border border-[#DCDEDD] rounded-[20px] p-6">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="text-base font-bold text-brand-dark">
              Pemeriksaan Email Breach Terbaru
            </h3>
            <p class="text-xs text-brand-light">
              Status kebocoran akun email perusahaan
            </p>
          </div>
          <RouterLink
            :to="{ name: 'admin.cti.audit-user' }"
            class="inline-flex items-center gap-1 text-xs font-semibold text-[#0C51D9] hover:underline"
          >
            <span>Buka Audit User</span>
            <ArrowRight class="w-3.5 h-3.5" />
          </RouterLink>
        </div>

        <div
          v-if="!stats.recent_breaches?.length"
          class="py-8 text-center text-sm text-gray-500"
        >
          Belum ada riwayat pemeriksaan kebocoran email.
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
                    ? `Terdeteksi pada ${item.breaches?.length || 1} insiden breach`
                    : "Tidak ditemukan kebocoran data"
                }}
              </p>
            </div>
            <span
              v-if="item.is_breached"
              class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 shrink-0"
            >
              <AlertTriangle class="w-3.5 h-3.5" />
              BOCOR
            </span>
            <span
              v-else
              class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 shrink-0"
            >
              <CheckCircle2 class="w-3.5 h-3.5" />
              AMAN
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
