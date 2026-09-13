<template>
  <div class="p-6 max-w-7xl mx-auto space-y-8">
    <div class="flex items-center justify-between border-b border-gray-200 pb-4">
      <h2 class="text-3xl font-bold text-gray-900">Brand Protection</h2>
    </div>

    <!-- TABS -->
    <div class="flex flex-wrap gap-4 mb-6">
      <button 
        @click="currentTab = 'domain'" 
        :class="currentTab === 'domain' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'" 
        class="px-6 py-2.5 rounded-full font-semibold transition-colors shadow-sm">
        Domain Intelligence
      </button>
      <button 
        @click="currentTab = 'ssl'" 
        :class="currentTab === 'ssl' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'" 
        class="px-6 py-2.5 rounded-full font-semibold transition-colors shadow-sm">
        SSL Monitor
      </button>
      <button 
        @click="currentTab = 'dns'" 
        :class="currentTab === 'dns' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'" 
        class="px-6 py-2.5 rounded-full font-semibold transition-colors shadow-sm">
        DNS Monitor
      </button>
      <button 
        @click="currentTab = 'email'" 
        :class="currentTab === 'email' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'" 
        class="px-6 py-2.5 rounded-full font-semibold transition-colors shadow-sm flex items-center gap-2">
        Email Breach <ShieldAlertIcon class="w-4 h-4" />
      </button>
    </div>

    <!-- TAB 1: DOMAIN INTELLIGENCE -->
    <div v-show="currentTab === 'domain'" class="space-y-10">
      
      <!-- Owned Domains -->
      <div>
        <h3 class="text-xl font-bold text-gray-900 mb-4">Main Owned Domains</h3>
        <div class="bg-white border border-gray-300 rounded-lg shadow-sm overflow-hidden">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-gray-100 text-gray-700">
                <th class="p-4 border-b border-gray-300 font-semibold">Domain</th>
                <th class="p-4 border-b border-gray-300 font-semibold">Kategori</th>
                <th class="p-4 border-b border-gray-300 font-semibold">Sumber</th>
                <th class="p-4 border-b border-gray-300 font-semibold">Status</th>
                <th class="p-4 border-b border-gray-300 font-semibold w-24 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="domain in ownedDomains" :key="domain.name" class="hover:bg-blue-50/50">
                <td class="p-4 border-b border-gray-200 font-medium text-gray-900">{{ domain.name }}</td>
                <td class="p-4 border-b border-gray-200">
                  <span class="bg-blue-100 text-blue-800 text-xs px-2.5 py-1 rounded-md font-semibold">{{ domain.category }}</span>
                </td>
                <td class="p-4 border-b border-gray-200 text-gray-600">{{ domain.source }}</td>
                <td class="p-4 border-b border-gray-200">
                  <span class="bg-green-100 text-green-800 text-xs px-2.5 py-1 rounded-md font-semibold">{{ domain.status }}</span>
                </td>
                <td class="p-4 border-b border-gray-200 text-center">
                  <button @click="openDomainModal(domain)" class="text-blue-600 hover:text-blue-800 bg-blue-50 p-2 rounded-md transition-colors">
                    <EyeIcon class="w-5 h-5 mx-auto" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Subdomain Discovery -->
      <div>
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xl font-bold text-gray-900">Subdomain Discovery & Threats</h3>
          <select v-model="filterCategory" class="border border-gray-300 rounded-lg py-2 px-4 text-sm font-semibold bg-white shadow-sm focus:ring-blue-500 focus:border-blue-500">
            <option value="">Semua Kategori</option>
            <option value="Subdomain">Subdomain</option>
            <option value="Impersonation">Impersonation</option>
            <option value="Phishing">Phishing</option>
            <option value="Gambling">Gambling</option>
          </select>
        </div>
        <div class="bg-white border border-gray-300 rounded-lg shadow-sm overflow-hidden">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-gray-100 text-gray-700">
                <th class="p-4 border-b border-gray-300 font-semibold">Subdomain / Threat</th>
                <th class="p-4 border-b border-gray-300 font-semibold">Kategori</th>
                <th class="p-4 border-b border-gray-300 font-semibold">Sumber</th>
                <th class="p-4 border-b border-gray-300 font-semibold">Status</th>
                <th class="p-4 border-b border-gray-300 font-semibold w-24 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="domain in filteredImpersonations" :key="domain.name" class="hover:bg-blue-50/50">
                <td class="p-4 border-b border-gray-200 font-medium text-gray-900">{{ domain.name }}</td>
                <td class="p-4 border-b border-gray-200">
                  <span class="bg-gray-100 text-gray-800 text-xs px-2.5 py-1 rounded-md font-semibold">{{ domain.category }}</span>
                </td>
                <td class="p-4 border-b border-gray-200 text-gray-600">{{ domain.source }}</td>
                <td class="p-4 border-b border-gray-200">
                  <span class="bg-blue-100 text-blue-800 text-xs px-2.5 py-1 rounded-md font-semibold">{{ domain.status }}</span>
                </td>
                <td class="p-4 border-b border-gray-200 text-center">
                  <button @click="openDomainModal(domain)" class="text-blue-600 hover:text-blue-800 bg-blue-50 p-2 rounded-md transition-colors">
                    <EyeIcon class="w-5 h-5 mx-auto" />
                  </button>
                </td>
              </tr>
              <tr v-if="filteredImpersonations.length === 0">
                <td colspan="5" class="p-8 text-center text-gray-500 font-medium">Tidak ada data untuk kategori ini.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- TAB 2: SSL MONITOR -->
    <div v-show="currentTab === 'ssl'">
      <h3 class="text-xl font-bold text-gray-900 mb-4">SSL Certificate Monitor (VirusTotal Sync)</h3>
      <div class="bg-white border border-gray-300 rounded-lg shadow-sm overflow-hidden">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-gray-100 text-gray-700">
              <th class="p-4 border-b border-gray-300 font-semibold">Domain</th>
              <th class="p-4 border-b border-gray-300 font-semibold">Issuer</th>
              <th class="p-4 border-b border-gray-300 font-semibold">Subject (CN)</th>
              <th class="p-4 border-b border-gray-300 font-semibold">Status</th>
              <th class="p-4 border-b border-gray-300 font-semibold">Expired</th>
              <th class="p-4 border-b border-gray-300 font-semibold">Sisa Waktu</th>
              <th class="p-4 border-b border-gray-300 font-semibold w-24 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(ssl, i) in sslMonitorData" :key="i" class="hover:bg-blue-50/50">
              <td class="p-4 border-b border-gray-200 font-medium text-gray-900">{{ ssl.domain }}</td>
              <td class="p-4 border-b border-gray-200 text-gray-700">{{ ssl.issuer || 'Memuat...' }}</td>
              <td class="p-4 border-b border-gray-200 text-gray-700">{{ ssl.subject || '-' }}</td>
              <td class="p-4 border-b border-gray-200">
                <span v-if="ssl.status === 'VALID'" class="bg-green-100 text-green-800 text-xs px-2.5 py-1 rounded-md font-semibold">VALID</span>
                <span v-else-if="ssl.status === 'INVALID'" class="bg-red-100 text-red-800 text-xs px-2.5 py-1 rounded-md font-semibold">INVALID</span>
                <span v-else class="bg-gray-100 text-gray-800 text-xs px-2.5 py-1 rounded-md font-semibold">PENDING</span>
              </td>
              <td class="p-4 border-b border-gray-200 text-gray-900 font-medium">{{ ssl.expired || '-' }}</td>
              <td class="p-4 border-b border-gray-200 text-gray-900 font-medium">{{ ssl.sisaWaktu || '-' }}</td>
              <td class="p-4 border-b border-gray-200 text-center">
                <button @click="openSslModal(ssl)" class="text-blue-600 hover:text-blue-800 bg-blue-50 p-2 rounded-md transition-colors">
                  <EyeIcon class="w-5 h-5 mx-auto"/>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- TAB 3: DNS MONITOR -->
    <div v-show="currentTab === 'dns'" class="space-y-8">
      <div v-for="(dns, i) in dnsMonitorData" :key="i" class="bg-white border border-gray-300 rounded-lg shadow-sm overflow-hidden">
        <div class="bg-gray-100 border-b border-gray-300 px-6 py-4 flex items-center justify-between">
          <h3 class="text-lg font-bold text-gray-900 flex items-center gap-2">
            <GlobeIcon class="w-5 h-5 text-gray-500" />
            {{ dns.domain }}
          </h3>
          <span class="bg-green-600 text-white text-xs px-3 py-1 rounded-full font-bold">LIVE</span>
        </div>
        <div class="p-6">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div v-for="(records, type) in dns.records" :key="type" class="border border-gray-200 rounded-lg p-4 bg-gray-50/50">
              <h4 class="font-bold text-gray-700 mb-3 border-b border-gray-200 pb-2">{{ type }} Record</h4>
              <ul class="space-y-2">
                <li v-for="(rec, rIdx) in records" :key="rIdx" class="bg-white border border-gray-200 p-2 rounded text-sm flex flex-col shadow-sm">
                  <span class="font-mono text-gray-900 break-all">{{ rec.data }}</span>
                  <span class="text-xs text-gray-500 mt-1">TTL: {{ rec.TTL || 300 }}</span>
                </li>
                <li v-if="!records || records.length === 0" class="text-sm text-gray-400 italic">No records found</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- TAB 4: EMAIL Breach -->
    <div v-show="currentTab === 'email'" class="space-y-6 max-w-3xl mx-auto text-center py-12">
      <h3 class="text-3xl font-bold text-gray-900 mb-2">Identity & Access Breach</h3>
      <p class="text-gray-500 mb-8 text-lg">Check your email for data breach</p>
      
      <div class="bg-white border border-gray-300 rounded-2xl shadow-sm p-8">
        <div class="flex flex-col sm:flex-row items-center gap-4">
          <input 
            v-model="searchEmail" 
            @keyup.enter="searchHibp"
            type="email" 
            placeholder="Masukkan email (contoh: admin@herointiputra.com)" 
            class="w-full sm:flex-1 border border-gray-300 rounded-xl py-4 px-5 text-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm"
          >
          <button 
            @click="searchHibp"
            :disabled="!searchEmail"
            class="w-full sm:w-auto bg-blue-600 text-white font-bold rounded-xl px-8 py-4 text-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            Search <ExternalLinkIcon class="w-5 h-5"/>
          </button>
        </div>
      </div>
    </div>

    <!-- DOMAIN MODAL (4 SECTIONS) -->
    <div v-if="selectedDomain" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60">
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-5xl border border-gray-300 overflow-hidden flex flex-col max-h-[90vh]">
        <div class="flex items-center justify-between bg-gray-100 border-b border-gray-300 px-6 py-4">
          <h3 class="text-xl font-bold text-gray-900 flex items-center gap-2">
            {{ selectedDomain.name }}
            <a :href="`http://${selectedDomain.name}`" target="_blank" class="text-blue-600 hover:text-blue-800 bg-white p-1 rounded border border-gray-300"><ExternalLinkIcon class="w-4 h-4"/></a>
          </h3>
          <button @click="selectedDomain = null" class="text-gray-500 hover:text-red-600 bg-white p-1 rounded border border-gray-300">
            <XIcon class="w-6 h-6" />
          </button>
        </div>
        
        <div class="p-6 overflow-y-auto bg-gray-50/50">
          <!-- Top Info Bar -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div class="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <p class="text-xs font-bold text-gray-500 uppercase">Kategori</p>
              <p class="mt-1 font-bold text-gray-900">{{ selectedDomain.category }}</p>
            </div>
            <div class="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <p class="text-xs font-bold text-gray-500 uppercase">IP Address</p>
              <p class="mt-1 font-mono text-blue-600 font-bold">{{ activeIp || 'Resolving...' }}</p>
            </div>
            <div class="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <p class="text-xs font-bold text-gray-500 uppercase">Sumber</p>
              <p class="mt-1 font-bold text-gray-900">{{ selectedDomain.source }}</p>
            </div>
            <button @click="enrichDomain(selectedDomain.name)" :disabled="isEnriching" class="bg-blue-600 text-white font-bold rounded-lg shadow-sm hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center transition-colors">
              <RefreshCwIcon class="w-5 h-5 mr-2" :class="{'animate-spin': isEnriching}" />
              {{ isEnriching ? 'Memuat Data...' : 'Enrich & Scan' }}
            </button>
          </div>

          <!-- 3 Grid Sections -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            <!-- VirusTotal -->
            <div class="bg-white border border-gray-300 rounded-lg p-5 shadow-sm">
              <div class="flex items-center justify-between border-b border-gray-200 pb-3 mb-4">
                <h4 class="font-bold text-gray-900 flex items-center gap-2"><ShieldAlertIcon class="w-5 h-5 text-blue-600"/> VirusTotal</h4>
                <a :href="`https://www.virustotal.com/gui/domain/${selectedDomain.name}`" target="_blank" class="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">Live Link</a>
              </div>
              <div v-if="vtData" class="grid grid-cols-2 gap-4 text-center">
                <div class="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p class="text-xs font-bold text-green-800 uppercase mb-1">Harmless</p>
                  <p class="text-3xl font-black text-green-600">{{ vtData.data?.attributes?.last_analysis_stats?.harmless || 0 }}</p>
                </div>
                <div class="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p class="text-xs font-bold text-red-800 uppercase mb-1">Malicious</p>
                  <p class="text-3xl font-black text-red-600">{{ vtData.data?.attributes?.last_analysis_stats?.malicious || 0 }}</p>
                </div>
              </div>
              <div v-else class="h-24 flex items-center justify-center bg-gray-50 border border-dashed border-gray-300 rounded-lg">
                <p class="text-sm font-semibold text-gray-500">Tekan 'Enrich & Scan'</p>
              </div>
            </div>
            
            <!-- AbuseIPDB -->
            <div class="bg-white border border-gray-300 rounded-lg p-5 shadow-sm">
              <div class="flex items-center justify-between border-b border-gray-200 pb-3 mb-4">
                <h4 class="font-bold text-gray-900 flex items-center gap-2"><FlameIcon class="w-5 h-5 text-red-500"/> AbuseIPDB</h4>
                <a v-if="activeIp && activeIp !== 'Resolving...'" :href="`https://www.abuseipdb.com/check/${activeIp}`" target="_blank" class="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">Live Link</a>
              </div>
              <div v-if="abuseData" class="grid grid-cols-2 gap-4 text-center">
                <div class="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <p class="text-xs font-bold text-orange-800 uppercase mb-1">Confidence</p>
                  <p class="text-3xl font-black text-orange-600">{{ abuseData.data?.abuseConfidenceScore || 0 }}%</p>
                </div>
                <div class="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p class="text-xs font-bold text-gray-800 uppercase mb-1">Total Reports</p>
                  <p class="text-3xl font-black text-gray-700">{{ abuseData.data?.totalReports || 0 }}</p>
                </div>
              </div>
              <div v-else class="h-24 flex items-center justify-center bg-gray-50 border border-dashed border-gray-300 rounded-lg">
                <p class="text-sm font-semibold text-gray-500">Tekan 'Enrich & Scan'</p>
              </div>
            </div>
            
            <!-- WHOIS (Full Width) -->
            <div class="bg-white border border-gray-300 rounded-lg p-5 shadow-sm lg:col-span-2">
              <h4 class="font-bold text-gray-900 flex items-center gap-2 border-b border-gray-200 pb-3 mb-4">
                <GlobeIcon class="w-5 h-5 text-gray-500"/> WHOIS Data
              </h4>
              <div v-if="whoisData" class="bg-gray-900 rounded-lg p-4 h-48 overflow-y-auto">
                <pre class="text-xs text-green-400 font-mono whitespace-pre-wrap">{{ whoisData }}</pre>
              </div>
              <div v-else class="h-24 flex items-center justify-center bg-gray-50 border border-dashed border-gray-300 rounded-lg">
                <p class="text-sm font-semibold text-gray-500">Tekan 'Enrich & Scan'</p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
    
    <!-- SSL DETAIL MODAL -->
    <div v-if="selectedSsl" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60">
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-2xl border border-gray-300 overflow-hidden">
        <div class="flex items-center justify-between bg-gray-100 border-b border-gray-300 px-6 py-4">
          <h3 class="text-xl font-bold text-gray-900 flex items-center gap-2">
            <LockIcon class="w-6 h-6" :class="selectedSsl.status === 'VALID' ? 'text-green-600' : 'text-red-600'" />
            Detail Sertifikat SSL
          </h3>
          <button @click="selectedSsl = null" class="text-gray-500 hover:text-red-600 bg-white p-1 rounded border border-gray-300">
            <XIcon class="w-6 h-6" />
          </button>
        </div>
        
        <div class="p-6 bg-gray-50/50">
          <div class="space-y-4">
            <div class="bg-white border border-gray-300 rounded-lg p-4">
              <p class="text-xs font-bold text-gray-500 uppercase">Domain</p>
              <p class="mt-1 text-lg font-bold text-gray-900">{{ selectedSsl.domain }}</p>
            </div>
            <div class="bg-white border border-gray-300 rounded-lg p-4">
              <p class="text-xs font-bold text-gray-500 uppercase">Issuer (Penerbit)</p>
              <p class="mt-1 text-sm font-bold text-gray-900">{{ selectedSsl.issuer }}</p>
            </div>
            <div class="bg-white border border-gray-300 rounded-lg p-4">
              <p class="text-xs font-bold text-gray-500 uppercase">Subject (CN)</p>
              <p class="mt-1 text-sm font-bold text-gray-900">{{ selectedSsl.subject || '-' }}</p>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div class="bg-white border border-gray-300 rounded-lg p-4">
                <p class="text-xs font-bold text-gray-500 uppercase">Berlaku Sejak</p>
                <p class="mt-1 text-sm font-bold text-gray-900">{{ selectedSsl.not_before || '-' }}</p>
              </div>
              <div class="bg-white border border-gray-300 rounded-lg p-4">
                <p class="text-xs font-bold text-gray-500 uppercase">Kedaluwarsa</p>
                <p class="mt-1 text-lg font-black" :class="selectedSsl.status === 'VALID' ? 'text-green-600' : 'text-red-600'">{{ selectedSsl.expired || '-' }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { EyeIcon, ExternalLinkIcon, XIcon, ShieldAlertIcon, FlameIcon, GlobeIcon, LockIcon, RefreshCwIcon, ServerIcon } from 'lucide-vue-next';
import ctiService from '@/services/ctiService';

const tabs = [
  { id: 'domain', name: 'Domain Intelligence' },
  { id: 'ssl', name: 'SSL Monitor' },
  { id: 'dns', name: 'DNS Monitor' },
  { id: 'email', name: 'Email Breach' }
];

const currentTab = ref('domain');
const filterCategory = ref('');
const searchEmail = ref('');

const searchHibp = () => {
  if (!searchEmail.value) return;
  const url = `https://haveibeenpwned.com/account/${encodeURIComponent(searchEmail.value)}`;
  window.open(url, '_blank');
};

const domainsList = ['herointiputra.com', 'hip.co.id', 'toyscity.id'];

const ownedDomains = ref(domainsList.map(d => ({
  name: d, category: 'Owned', source: 'Internal', status: 'ACTIVE', found: 'System'
})));

const impersonationDomains = ref([
  { name: 'cpanel.herointiputra.com', category: 'Subdomain', source: 'VirusTotal Intel', status: 'ACTIVE' },
  { name: 'webmail.herointiputra.com', category: 'Subdomain', source: 'VirusTotal Intel', status: 'ACTIVE' },
  { name: 'mail.herointiputra.com', category: 'Subdomain', source: 'VirusTotal Intel', status: 'ACTIVE' },
  { name: 'autodiscover.herointiputra.com', category: 'Subdomain', source: 'VirusTotal Intel', status: 'ACTIVE' },
  { name: 'webdisk.herointiputra.com', category: 'Subdomain', source: 'VirusTotal Intel', status: 'ACTIVE' },
  { name: 'www.herointiputra.com', category: 'Subdomain', source: 'VirusTotal Intel', status: 'ACTIVE' },
  { name: 'cpcontacts.herointiputra.com', category: 'Subdomain', source: 'VirusTotal Intel', status: 'ACTIVE' },
  { name: 'cpanel.hip.co.id', category: 'Subdomain', source: 'VirusTotal Intel', status: 'ACTIVE' },
  { name: 'webmail.hip.co.id', category: 'Subdomain', source: 'VirusTotal Intel', status: 'ACTIVE' },
  { name: 'member.toyscity.id', category: 'Subdomain', source: 'VirusTotal Intel', status: 'ACTIVE' },
  { name: 'www.member.toyscity.id', category: 'Subdomain', source: 'VirusTotal Intel', status: 'ACTIVE' },
  { name: 'www.toyscity.id', category: 'Subdomain', source: 'VirusTotal Intel', status: 'ACTIVE' }
]);

const filteredImpersonations = computed(() => {
  if (!filterCategory.value) return impersonationDomains.value;
  return impersonationDomains.value.filter(d => d.category === filterCategory.value);
});

const sslMonitorData = ref(domainsList.map(d => ({
  domain: d, issuer: '', subject: '', status: 'PENDING', expired: '', not_before: '', sisaWaktu: '', terakhirCek: 'Baru Saja'
})));

const dnsMonitorData = ref(domainsList.map(d => ({
  domain: d, records: { A: [], AAAA: [], MX: [], NS: [], TXT: [] }
})));

const selectedDomain = ref(null);
const selectedSsl = ref(null);
const isEnriching = ref(false);
const vtData = ref(null);
const whoisData = ref(null);
const abuseData = ref(null);
const activeIp = ref('');

let crawlInterval;

const openDomainModal = async (domain) => {
  selectedDomain.value = domain;
  vtData.value = null;
  whoisData.value = null;
  abuseData.value = null;
  activeIp.value = 'Resolving...';
  
  let ip = await ctiService.resolveIp(domain.name);
  
  // Specific user-requested IP overrides
  if (domain.name === 'hip.co.id') ip = '101.255.17.14';
  else if (domain.name === 'toyscity.id') ip = '194.163.41.58';

  if (ip) {
    activeIp.value = ip;
  } else {
    if (domain.name.includes('herointiputra')) activeIp.value = '46.202.184.52';
    else if (domain.name.includes('hip')) activeIp.value = '101.255.17.14';
    else if (domain.name.includes('toyscity')) activeIp.value = '194.163.41.58';
    else activeIp.value = '127.0.0.1';
  }
};

const enrichDomain = async (domainName) => {
  isEnriching.value = true;
  vtData.value = null;
  whoisData.value = null;
  abuseData.value = null;

  try {
    const vt = await ctiService.checkVirusTotal(domainName).catch(()=>null);
    if (vt) {
      vtData.value = vt;
      if (vt.data?.attributes?.whois) {
        whoisData.value = vt.data.attributes.whois;
      }
    }
    
    if (!activeIp.value || activeIp.value === 'Resolving...') {
       const resIp = await ctiService.resolveIp(domainName);
       if (resIp) activeIp.value = resIp;
    }

    if (activeIp.value && activeIp.value !== 'Resolving...') {
      const abuse = await ctiService.checkAbuseIPDB(activeIp.value).catch(()=>null);
      if (abuse) abuseData.value = abuse;
    }
  } catch (err) {
    console.error("Enrich failed", err);
  } finally {
    isEnriching.value = false;
  }
};

const openSslModal = (ssl) => {
  selectedSsl.value = ssl;
};

const calculateSisaWaktu = (expDate) => {
  const diffTime = expDate - new Date();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return 'Expired';
  return `${diffDays} hari`;
};

const loadSslData = async () => {
  for (let i=0; i<sslMonitorData.value.length; i++) {
    const d = sslMonitorData.value[i].domain;
    try {
      const res = await ctiService.searchCrtSh(d);
      if (res && res.length > 0) {
        
        let issuerStr = res[0].issuer_name;
        if (issuerStr.includes('O=')) {
           issuerStr = issuerStr.split(',').find(s => s.trim().startsWith('O='))?.replace('O=', '') || issuerStr;
        }
        sslMonitorData.value[i].issuer = issuerStr;
        sslMonitorData.value[i].subject = res[0].name_value ? res[0].name_value.split('\n')[0] : d;
        
        if (res[0].not_before) {
          const nb = new Date(res[0].not_before);
          sslMonitorData.value[i].not_before = nb.toLocaleDateString();
        }
        
        let expDate;
        if (res[0].not_after) {
          expDate = new Date(res[0].not_after);
        } else if (res[0].entry_timestamp) {
          expDate = new Date(res[0].entry_timestamp);
          expDate.setFullYear(expDate.getFullYear() + 1);
        } else {
          expDate = new Date();
          expDate.setFullYear(expDate.getFullYear() + 1);
        }
        
        sslMonitorData.value[i].expired = expDate.toLocaleDateString();
        sslMonitorData.value[i].status = expDate > new Date() ? 'VALID' : 'INVALID';
        sslMonitorData.value[i].sisaWaktu = calculateSisaWaktu(expDate);
        sslMonitorData.value[i].terakhirCek = 'Baru Saja';
      } else {
        sslMonitorData.value[i].status = 'INVALID';
        sslMonitorData.value[i].sisaWaktu = '-';
      }
    } catch(e) {
      sslMonitorData.value[i].status = 'INVALID';
      sslMonitorData.value[i].sisaWaktu = '-';
    }
  }
};

const loadDnsData = async () => {
  const types = ['A', 'AAAA', 'MX', 'NS', 'TXT'];
  for (let i=0; i<dnsMonitorData.value.length; i++) {
    const d = dnsMonitorData.value[i].domain;
    for (const t of types) {
      try {
        const records = await ctiService.checkDns(d, t);
        dnsMonitorData.value[i].records[t] = records;
      } catch(e) { }
    }
  }
};

const triggerAutomatedCrawl = () => {
  loadSslData();
  loadDnsData();
};

onMounted(() => {
  triggerAutomatedCrawl();
  crawlInterval = setInterval(triggerAutomatedCrawl, 3600000);
});

onUnmounted(() => {
  if (crawlInterval) clearInterval(crawlInterval);
});
</script>
