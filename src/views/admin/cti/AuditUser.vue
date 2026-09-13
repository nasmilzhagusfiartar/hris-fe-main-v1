<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold text-gray-900">Audit User & Session Info</h2>
        <p class="mt-1 text-sm text-gray-500">Monitor active user sessions and device information.</p>
      </div>
      <button @click="printReport" class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
        Print Audit Report
      </button>
    </div>

    <div class="bg-white shadow sm:rounded-lg p-6">
      <div class="bg-gray-50 p-4 rounded-md border border-gray-200" id="printable-audit-report">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 class="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">User Information</h4>
            <dl class="space-y-2">
              <div class="flex">
                <dt class="w-32 text-sm font-medium text-gray-500">Name:</dt>
                <dd class="text-sm text-gray-900 font-medium">{{ userStore.user?.name || 'N/A' }}</dd>
              </div>
              <div class="flex">
                <dt class="w-32 text-sm font-medium text-gray-500">Email:</dt>
                <dd class="text-sm text-gray-900">{{ userStore.user?.email || 'N/A' }}</dd>
              </div>
              <div class="flex">
                <dt class="w-32 text-sm font-medium text-gray-500">Role:</dt>
                <dd class="text-sm text-gray-900">
                  <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                    {{ userStore.user?.role || 'User' }}
                  </span>
                </dd>
              </div>
            </dl>
          </div>
          
          <div>
            <h4 class="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Machine Information</h4>
            <dl class="space-y-2">
              <div class="flex">
                <dt class="w-32 text-sm font-medium text-gray-500">IP Address:</dt>
                <dd class="text-sm text-gray-900">{{ clientIp }}</dd>
              </div>
              <div class="flex">
                <dt class="w-32 text-sm font-medium text-gray-500">User Agent:</dt>
                <dd class="text-sm text-gray-900 truncate" :title="userAgent">{{ userAgent }}</dd>
              </div>
              <div class="flex">
                <dt class="w-32 text-sm font-medium text-gray-500">Timezone:</dt>
                <dd class="text-sm text-gray-900">{{ timezone }}</dd>
              </div>
              <div class="flex">
                <dt class="w-32 text-sm font-medium text-gray-500">Screen Res:</dt>
                <dd class="text-sm text-gray-900">{{ screenRes }}</dd>
              </div>
              <div class="flex">
                <dt class="w-32 text-sm font-medium text-gray-500">Platform:</dt>
                <dd class="text-sm text-gray-900">{{ platform }}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import ctiService from '@/services/ctiService';

const userStore = useAuthStore();

// Audit Info States
const clientIp = ref('Loading...');
const userAgent = ref(navigator.userAgent);
const timezone = ref(Intl.DateTimeFormat().resolvedOptions().timeZone);
const screenRes = ref(`${window.screen.width}x${window.screen.height}`);
const platform = ref(navigator.platform);

const printReport = () => {
  const content = document.getElementById('printable-audit-report').innerHTML;
  const originalContents = document.body.innerHTML;
  
  document.body.innerHTML = `
    <div style="padding: 20px; font-family: sans-serif;">
      <h2 style="margin-bottom: 20px;">SenjaHRIS Audit Report</h2>
      <p style="margin-bottom: 30px; color: #666;">Generated on: ${new Date().toLocaleString()}</p>
      ${content}
    </div>
  `;
  window.print();
  document.body.innerHTML = originalContents;
  window.location.reload();
};

onMounted(async () => {
  clientIp.value = await ctiService.getMyIp();
});
</script>
