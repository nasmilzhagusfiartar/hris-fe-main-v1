<template>
  <div class="p-6 max-w-7xl mx-auto space-y-8">
    <div class="flex items-center justify-between border-b border-gray-200 pb-4">
      <h2 class="text-3xl font-bold text-gray-900">
        {{ hasFullBrandProtectionAccess ? "Brand Protection" : "Email Breach" }}
      </h2>
    </div>

    <!-- TABS (Only shown for Admin & Security with full Brand Protection access) -->
    <div v-if="hasFullBrandProtectionAccess" class="flex flex-wrap gap-4 mb-6">
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
      <button 
        @click="currentTab = 'typosquatting'" 
        :class="currentTab === 'typosquatting' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'" 
        class="px-6 py-2.5 rounded-full font-semibold transition-colors shadow-sm flex items-center gap-2">
        Typosquatting <GlobeIcon class="w-4 h-4" />
      </button>
    </div>

    <!-- TAB 1: DOMAIN INTELLIGENCE -->
    <div v-if="hasFullBrandProtectionAccess" v-show="currentTab === 'domain'" class="space-y-10">
      
      <!-- Owned Domains -->
      <div>
        <h3 class="text-xl font-bold text-gray-900 mb-4">Main Owned Domains</h3>
        <div class="bg-white border border-gray-300 rounded-lg shadow-sm overflow-hidden">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-gray-100 text-gray-700">
                <th class="p-4 border-b border-gray-300 font-semibold">Domain</th>
                <th class="p-4 border-b border-gray-300 font-semibold">Category</th>
                <th class="p-4 border-b border-gray-300 font-semibold">Source</th>
                <th class="p-4 border-b border-gray-300 font-semibold">Status</th>
                <th class="p-4 border-b border-gray-300 font-semibold w-24 text-center">Action</th>
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
            <option value="">All Categories</option>
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
                <th class="p-4 border-b border-gray-300 font-semibold">Category</th>
                <th class="p-4 border-b border-gray-300 font-semibold">Source</th>
                <th class="p-4 border-b border-gray-300 font-semibold">Status</th>
                <th class="p-4 border-b border-gray-300 font-semibold w-24 text-center">Action</th>
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
                <td colspan="5" class="p-8 text-center text-gray-500 font-medium">No data available for this category.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- TAB 2: SSL MONITOR -->
    <div v-if="hasFullBrandProtectionAccess" v-show="currentTab === 'ssl'">
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
              <th class="p-4 border-b border-gray-300 font-semibold">Time Remaining</th>
              <th class="p-4 border-b border-gray-300 font-semibold w-24 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(ssl, i) in sslMonitorData" :key="i" class="hover:bg-blue-50/50">
              <td class="p-4 border-b border-gray-200 font-medium text-gray-900">{{ ssl.domain }}</td>
              <td class="p-4 border-b border-gray-200 text-gray-700">{{ ssl.issuer || 'Loading...' }}</td>
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
    <div v-if="hasFullBrandProtectionAccess" v-show="currentTab === 'dns'" class="space-y-8">
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

    <!-- TAB 4: EMAIL BREACH -->
    <div v-show="currentTab === 'email' || !hasFullBrandProtectionAccess" class="space-y-8">
      <!-- Section Pengecekan Email -->
      <div class="bg-white border border-gray-300 rounded-2xl shadow-sm p-6 sm:p-8 space-y-6">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-100 pb-4">
          <div>
            <h3 class="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <ShieldAlertIcon class="w-6 h-6 text-blue-600" />
              Identity & Access Breach
            </h3>
            <p class="text-gray-500 text-sm mt-1">
              {{
                canCheckAnyEmail
                  ? "Check for data breaches on company emails or run a bulk check for all employees."
                  : "Check the data breach status for your own account email address."
              }}
            </p>
          </div>
          <button 
            v-if="canCheckAnyEmail"
            @click="handleCheckAllEmployees"
            :disabled="loadingCheckAll"
            class="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition-colors shadow-sm disabled:opacity-50"
          >
            <RefreshCwIcon class="w-4 h-4" :class="{'animate-spin': loadingCheckAll}" />
            <span>{{ loadingCheckAll ? 'Queuing...' : 'Check All Employees' }}</span>
          </button>
        </div>

        <!-- Input Single Email Check -->
        <div class="flex flex-col sm:flex-row items-center gap-3">
          <div class="relative w-full sm:flex-1">
            <input 
              v-model="breachEmailInput" 
              @keyup.enter="handleCheckSingleEmail"
              type="email" 
              :readonly="!canCheckAnyEmail"
              placeholder="Enter email (e.g., employee@herointiputra.com)" 
              class="w-full border border-gray-300 rounded-xl py-3 px-4 text-base focus:ring-blue-500 focus:border-blue-500 shadow-sm read-only:bg-gray-100 read-only:text-gray-700"
            >
          </div>
          <button 
            @click="handleCheckSingleEmail"
            :disabled="!breachEmailInput || loadingBreachCheck"
            class="w-full sm:w-auto bg-blue-600 text-white font-bold rounded-xl px-6 py-3 text-base hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            <RefreshCwIcon class="w-4 h-4" :class="{'animate-spin': loadingBreachCheck}" />
            <span>{{ loadingBreachCheck ? 'Checking...' : 'Check Email' }}</span>
          </button>
        </div>

        <!-- Info Antrean Massal jika ada -->
        <div v-if="queuedCount !== null" class="bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex items-center gap-3 text-indigo-900">
          <UsersIcon class="w-5 h-5 text-indigo-600 flex-shrink-0" />
          <div class="text-sm font-medium">
            Bulk check successfully queued for <span class="font-bold">{{ queuedCount }}</span> employee emails.
          </div>
        </div>

        <!-- Hasil Pengecekan Single Email -->
        <div v-if="currentBreachResult" class="border rounded-xl p-5 transition-all"
          :class="currentBreachResult.is_breached ? 'bg-red-50/50 border-red-200' : 'bg-green-50/50 border-green-200'">
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
            <div class="flex items-center gap-3">
              <span v-if="currentBreachResult.is_breached" class="flex items-center gap-1.5 bg-red-600 text-white font-bold text-xs px-3 py-1.5 rounded-full shadow-sm">
                <ShieldAlertIcon class="w-4 h-4" /> BREACHED
              </span>
              <span v-else class="flex items-center gap-1.5 bg-green-600 text-white font-bold text-xs px-3 py-1.5 rounded-full shadow-sm">
                <CheckCircleIcon class="w-4 h-4" /> SAFE
              </span>
              <span class="font-bold text-gray-900 text-lg">{{ currentBreachResult.email }}</span>
            </div>
            <div class="text-xs text-gray-500 font-medium">
              Last checked: {{ formatDateTime(currentBreachResult.checked_at) }}
            </div>
          </div>

          <div v-if="currentBreachResult.is_breached" class="space-y-2">
            <p class="text-xs font-bold text-red-800 uppercase tracking-wider">Detected in the following data breaches:</p>
            <div class="flex flex-wrap gap-2">
              <span 
                v-for="(breach, bIdx) in currentBreachResult.breaches" 
                :key="bIdx"
                class="bg-white border border-red-200 text-red-700 text-xs px-3 py-1 rounded-full font-semibold shadow-2xs"
              >
                {{ breach }}
              </span>
              <span v-if="!currentBreachResult.breaches || currentBreachResult.breaches.length === 0" class="text-xs text-red-600 italic">
                Breach detected (incident name details unavailable).
              </span>
            </div>
          </div>
          <div v-else class="text-sm text-green-800 font-medium flex items-center gap-2">
            <CheckCircleIcon class="w-4 h-4 text-green-600" />
            No data breach records found for this email.
          </div>
        </div>
      </div>

      <!-- Tabel Riwayat Pengecekan Kebocoran -->
      <div class="bg-white border border-gray-300 rounded-2xl shadow-sm overflow-hidden">
        <div class="p-5 border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h4 class="text-lg font-bold text-gray-900">Email Check History</h4>
            <p class="text-xs text-gray-500 mt-0.5">Complete audit history of previous email breach checks.</p>
          </div>
          <div v-if="canCheckAnyEmail" class="w-full md:w-72">
            <SearchInput
              v-model="breachSearchQuery"
              placeholder="Search email..."
              input-class="py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 bg-gray-50 focus:bg-white transition-colors"
              @input="onBreachSearchChange"
              @clear="onBreachSearchChange"
            />
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-gray-100 text-gray-700 text-xs uppercase tracking-wider">
                <th class="p-4 border-b border-gray-300 font-bold w-12 text-center">No</th>
                <th class="p-4 border-b border-gray-300 font-bold">Email</th>
                <th class="p-4 border-b border-gray-300 font-bold">Breach Status</th>
                <th class="p-4 border-b border-gray-300 font-bold">Breach List</th>
                <th class="p-4 border-b border-gray-300 font-bold">Checked At</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 text-sm">
              <tr v-if="loadingBreachHistory">
                <td colspan="5" class="p-8 text-center text-gray-500">
                  <div class="flex items-center justify-center gap-2">
                    <RefreshCwIcon class="w-5 h-5 animate-spin text-blue-600" />
                    <span>Loading history...</span>
                  </div>
                </td>
              </tr>
              <tr v-else-if="breachChecks.length === 0">
                <td colspan="5" class="p-8 text-center text-gray-500 font-medium">
                  No email breach check history available.
                </td>
              </tr>
              <tr v-else v-for="(item, idx) in breachChecks" :key="item.id || idx" class="hover:bg-blue-50/40 transition-colors">
                <td class="p-4 text-center text-gray-500 font-mono text-xs">
                  {{ (breachMeta.current_page - 1) * breachMeta.per_page + idx + 1 }}
                </td>
                <td class="p-4 font-semibold text-gray-900">{{ item.email }}</td>
                <td class="p-4">
                  <span v-if="item.is_breached" class="bg-red-100 text-red-800 text-xs px-2.5 py-1 rounded-md font-bold inline-flex items-center gap-1">
                    <ShieldAlertIcon class="w-3.5 h-3.5" /> BREACHED
                  </span>
                  <span v-else class="bg-green-100 text-green-800 text-xs px-2.5 py-1 rounded-md font-bold inline-flex items-center gap-1">
                    <CheckCircleIcon class="w-3.5 h-3.5" /> SAFE
                  </span>
                </td>
                <td class="p-4">
                  <div v-if="item.breaches && item.breaches.length > 0" class="flex flex-wrap gap-1.5">
                    <span 
                      v-for="(bName, bIdx) in item.breaches" 
                      :key="bIdx"
                      class="bg-gray-100 text-gray-800 text-xs px-2 py-0.5 rounded font-medium border border-gray-200"
                    >
                      {{ bName }}
                    </span>
                  </div>
                  <span v-else class="text-gray-400 text-xs italic">-</span>
                </td>
                <td class="p-4 text-gray-600 text-xs font-medium">{{ formatDateTime(item.checked_at) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="breachMeta && breachMeta.total > 0" class="p-4 border-t border-gray-200">
          <Pagination
            :meta="breachMeta"
            :loading="loadingBreachHistory"
            @page-change="handleBreachPageChange"
            @per-page-change="handleBreachPerPageChange"
          />
        </div>
      </div>
    </div>

    <!-- TAB 5: TYPOSQUATTING -->
    <div v-if="hasFullBrandProtectionAccess" v-show="currentTab === 'typosquatting'" class="space-y-6">
      <div class="bg-white border border-gray-300 rounded-2xl shadow-sm p-6 sm:p-8 space-y-6">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-4">
          <div>
            <h3 class="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <GlobeIcon class="w-6 h-6 text-blue-600" />
              Typosquatting & Impersonation Scanner
            </h3>
            <p class="text-gray-500 text-sm mt-1">
              Detect lookalike domains (combosquatting, bitsquatting, homoglyphs) and analyze web reputation via urlscan.io.
            </p>
          </div>
        </div>

        <!-- Scan Controller -->
        <div class="flex flex-col sm:flex-row items-center gap-4">
          <div class="w-full sm:w-72">
            <label class="block text-xs font-bold text-gray-600 uppercase mb-1">Select Target Domain</label>
            <select 
              v-model="selectedBrandDomain" 
              :disabled="isScanningBrand"
              class="w-full border border-gray-300 rounded-xl py-3 px-4 text-base font-medium bg-white focus:ring-blue-500 focus:border-blue-500 shadow-sm disabled:bg-gray-100"
            >
              <option v-for="d in domainsList" :key="d" :value="d">{{ d }}</option>
            </select>
          </div>
          <div class="sm:pt-5 w-full sm:w-auto">
            <button 
              @click="startBrandScan"
              :disabled="isScanningBrand || !selectedBrandDomain"
              class="w-full sm:w-auto bg-blue-600 text-white font-bold rounded-xl px-8 py-3 text-base hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <RefreshCwIcon class="w-5 h-5" :class="{'animate-spin': isScanningBrand}" />
              <span>{{ isScanningBrand ? 'Scanning...' : 'Run Scan' }}</span>
            </button>
          </div>
        </div>

        <!-- Loading Latest Scan History -->
        <div v-if="loadingLatestBrandScan && !isScanningBrand"
          class="bg-gray-50 border border-gray-200 rounded-xl p-5 flex items-center gap-3 text-gray-600">
          <RefreshCwIcon class="w-5 h-5 text-blue-600 animate-spin flex-shrink-0" />
          <span class="text-sm font-medium">Loading latest scan history for <strong class="text-gray-900">{{ selectedBrandDomain }}</strong>...</span>
        </div>

        <!-- Progress Indicator when pending / running -->
        <div v-if="isScanningBrand || (brandScanStatus && (brandScanStatus.status === 'pending' || brandScanStatus.status === 'running'))" 
          class="bg-blue-50 border border-blue-200 rounded-xl p-5 flex items-center gap-4">
          <RefreshCwIcon class="w-6 h-6 text-blue-600 animate-spin flex-shrink-0" />
          <div>
            <p class="text-sm font-bold text-blue-900">Typosquatting scan in progress...</p>
            <p class="text-xs text-blue-700 mt-0.5">
              Domain: <span class="font-mono font-semibold">{{ brandScanStatus?.domain || selectedBrandDomain }}</span> | Status: <span class="uppercase font-semibold">{{ brandScanStatus?.status || 'running' }}</span>. System is automatically polling every 5 seconds.
            </p>
          </div>
        </div>

        <!-- Error Banner when scan failed -->
        <div v-if="brandScanStatus && brandScanStatus.status === 'failed'" 
          class="bg-red-50 border border-red-200 rounded-xl p-5 flex items-center gap-4">
          <ShieldAlertIcon class="w-6 h-6 text-red-600 flex-shrink-0" />
          <div>
            <p class="text-sm font-bold text-red-900">Typosquatting Scan Failed</p>
            <p class="text-xs text-red-700 mt-0.5 font-medium">
              {{ brandScanStatus.error || 'A backend error occurred while running the scan.' }}
            </p>
          </div>
        </div>
      </div>

      <!-- Empty State when domain has never been scanned -->
      <div v-if="!loadingLatestBrandScan && !isScanningBrand && !brandScanStatus"
        class="bg-white border border-dashed border-gray-300 rounded-2xl shadow-sm p-12 text-center space-y-3">
        <div class="w-14 h-14 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto border border-blue-100">
          <GlobeIcon class="w-7 h-7" />
        </div>
        <h4 class="text-lg font-bold text-gray-900">No Scan History for {{ selectedBrandDomain }}</h4>
        <p class="text-sm text-gray-500 max-w-md mx-auto">
          Click the <strong class="text-gray-800">Run Scan</strong> button above to start scanning for potential lookalike domains (typosquatting) on <span class="font-mono font-semibold text-gray-800">{{ selectedBrandDomain }}</span>.
        </p>
      </div>

      <!-- Scan Results -->
      <div v-if="brandScanStatus && brandScanStatus.status === 'done'" class="space-y-4">
        <!-- Case 1: Empty Results -->
        <div v-if="!brandScanStatus.results || brandScanStatus.results.length === 0" 
          class="bg-white border border-gray-300 rounded-2xl shadow-sm p-12 text-center space-y-3">
          <div class="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto border border-green-200">
            <CheckCircleIcon class="w-8 h-8" />
          </div>
          <h4 class="text-xl font-bold text-gray-900">No Active Lookalike Domains Found</h4>
          <p class="text-sm text-gray-500 max-w-md mx-auto">
            The typosquatting check for <span class="font-bold text-gray-800">{{ brandScanStatus.domain }}</span> detected no active permutation domains.
          </p>
        </div>

        <!-- Case 2: Results Present -->
        <div v-else class="bg-white border border-gray-300 rounded-2xl shadow-sm overflow-hidden">
          <div class="p-5 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-50/50">
            <div>
              <h4 class="text-lg font-bold text-gray-900 flex items-center gap-2">
                Domain Scan Results: {{ brandScanStatus.domain }}
                <span class="bg-blue-100 text-blue-800 text-xs px-2.5 py-0.5 rounded-full font-bold">
                  {{ brandScanStatus.total_found ?? brandScanStatus.results.length }} Found
                </span>
              </h4>
              <p class="text-xs text-gray-500 mt-1">Scan time: {{ formatDateTime(brandScanStatus.created_at) }}</p>
            </div>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-gray-100 text-gray-700 text-xs uppercase tracking-wider">
                  <th class="p-4 border-b border-gray-300 font-bold">Domain</th>
                  <th class="p-4 border-b border-gray-300 font-bold">Fuzzer</th>
                  <th class="p-4 border-b border-gray-300 font-bold">DNS A (IP)</th>
                  <th class="p-4 border-b border-gray-300 font-bold">DNS MX</th>
                  <th class="p-4 border-b border-gray-300 font-bold">urlscan Analysis</th>
                  <th class="p-4 border-b border-gray-300 font-bold text-center w-36">Action</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 text-sm">
                <tr v-for="res in brandScanStatus.results" :key="res.id" class="hover:bg-blue-50/40 transition-colors">
                  <td class="p-4">
                    <div class="font-mono font-bold text-gray-900">{{ res.domain }}</div>
                  </td>
                  <td class="p-4">
                    <span class="bg-gray-100 text-gray-700 text-xs font-semibold px-2 py-1 rounded">
                      {{ res.fuzzer || '-' }}
                    </span>
                  </td>
                  <td class="p-4 font-mono text-xs text-gray-700">
                    {{ formatDnsList(res.dns_a) }}
                  </td>
                  <td class="p-4 font-mono text-xs text-gray-700">
                    {{ formatDnsList(res.dns_mx) }}
                  </td>
                  <td class="p-4">
                    <!-- Status Pending -->
                    <div v-if="res.urlscan_status === 'pending'" class="flex items-center gap-2 text-xs font-medium text-amber-700 bg-amber-50 px-2.5 py-1.5 rounded-lg border border-amber-200">
                      <RefreshCwIcon class="w-3.5 h-3.5 animate-spin" />
                      <span>Scanning urlscan... ({{ urlscanAttempts[res.id] || 1 }}/24)</span>
                    </div>

                    <!-- Status Timeout -->
                    <div v-else-if="res.urlscan_status === 'timeout'" class="flex items-center gap-2 text-xs font-bold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-md border border-amber-300">
                      <ClockIcon class="w-3.5 h-3.5" />
                      <span>Timeout</span>
                    </div>

                    <!-- Status Failed -->
                    <div v-else-if="res.urlscan_status === 'failed'" class="text-xs font-bold text-red-800 bg-red-100 px-2.5 py-1 rounded-md inline-block">
                      Failed
                    </div>

                    <!-- Status Done -->
                    <div v-else-if="res.urlscan_status === 'done'" class="space-y-1.5">
                      <div class="flex items-center gap-2">
                        <span v-if="res.urlscan_malicious" class="bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded font-black">
                          MALICIOUS
                        </span>
                        <span v-else class="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded font-bold">
                          CLEAN
                        </span>
                        <span class="text-xs text-gray-600 font-semibold">Score: {{ res.urlscan_score ?? 0 }}</span>
                      </div>
                      <div class="text-xs text-gray-500">
                        IP: <span class="font-mono">{{ res.urlscan_ip || '-' }}</span> ({{ res.urlscan_country || '-' }})
                      </div>
                      <div class="flex items-center gap-3 pt-1">
                        <img 
                          v-if="res.urlscan_screenshot" 
                          :src="res.urlscan_screenshot" 
                          alt="Screenshot" 
                          class="w-16 h-10 object-cover rounded border border-gray-300 cursor-pointer hover:opacity-80 transition-opacity shadow-2xs"
                          @click="openScreenshotModal(res.urlscan_screenshot, res.domain)"
                        />
                        <a 
                          v-if="res.urlscan_report_url" 
                          :href="res.urlscan_report_url" 
                          target="_blank" 
                          class="text-xs font-bold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1 bg-blue-50 px-2 py-1 rounded hover:bg-blue-100 transition-colors"
                        >
                          <ExternalLinkIcon class="w-3.5 h-3.5" /> Report
                        </a>
                      </div>
                    </div>

                    <!-- Empty Status -->
                    <div v-else class="text-xs text-gray-400 italic">
                      Not scanned yet
                    </div>
                  </td>
                  <td class="p-4 text-center">
                    <button 
                      @click="runUrlscan(res)"
                      :disabled="res.urlscan_status === 'pending' || loadingUrlscanMap[res.id]"
                      class="px-3 py-1.5 text-xs font-bold rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors disabled:opacity-50 shadow-2xs inline-flex items-center gap-1.5"
                    >
                      <RefreshCwIcon class="w-3.5 h-3.5" :class="{'animate-spin': res.urlscan_status === 'pending' || loadingUrlscanMap[res.id]}" />
                      <span>{{ res.urlscan_status === 'done' ? 'Re-scan urlscan' : 'Scan urlscan' }}</span>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
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
              <p class="text-xs font-bold text-gray-500 uppercase">Category</p>
              <p class="mt-1 font-bold text-gray-900">{{ selectedDomain.category }}</p>
            </div>
            <div class="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <p class="text-xs font-bold text-gray-500 uppercase">IP Address</p>
              <p class="mt-1 font-mono text-blue-600 font-bold">{{ activeIp || 'Resolving...' }}</p>
            </div>
            <div class="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <p class="text-xs font-bold text-gray-500 uppercase">Source</p>
              <p class="mt-1 font-bold text-gray-900">{{ selectedDomain.source }}</p>
            </div>
            <button @click="enrichDomain(selectedDomain.name)" :disabled="isEnriching" class="bg-blue-600 text-white font-bold rounded-lg shadow-sm hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center transition-colors">
              <RefreshCwIcon class="w-5 h-5 mr-2" :class="{'animate-spin': isEnriching}" />
              {{ isEnriching ? 'Loading Data...' : 'Enrich & Scan' }}
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
                <p class="text-sm font-semibold text-gray-500">Click 'Enrich &amp; Scan'</p>
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
                <p class="text-sm font-semibold text-gray-500">Click 'Enrich &amp; Scan'</p>
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
                <p class="text-sm font-semibold text-gray-500">Click 'Enrich &amp; Scan'</p>
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
            SSL Certificate Detail
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
              <p class="text-xs font-bold text-gray-500 uppercase">Issuer</p>
              <p class="mt-1 text-sm font-bold text-gray-900">{{ selectedSsl.issuer }}</p>
            </div>
            <div class="bg-white border border-gray-300 rounded-lg p-4">
              <p class="text-xs font-bold text-gray-500 uppercase">Subject (CN)</p>
              <p class="mt-1 text-sm font-bold text-gray-900">{{ selectedSsl.subject || '-' }}</p>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div class="bg-white border border-gray-300 rounded-lg p-4">
                <p class="text-xs font-bold text-gray-500 uppercase">Valid From</p>
                <p class="mt-1 text-sm font-bold text-gray-900">{{ selectedSsl.not_before || '-' }}</p>
              </div>
              <div class="bg-white border border-gray-300 rounded-lg p-4">
                <p class="text-xs font-bold text-gray-500 uppercase">Expires On</p>
                <p class="mt-1 text-lg font-black" :class="selectedSsl.status === 'VALID' ? 'text-green-600' : 'text-red-600'">{{ selectedSsl.expired || '-' }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- SCREENSHOT PREVIEW MODAL -->
    <div v-if="previewScreenshotUrl" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/70">
      <div class="bg-white rounded-2xl shadow-2xl max-w-4xl w-full border border-gray-300 overflow-hidden flex flex-col max-h-[90vh]">
        <div class="flex items-center justify-between bg-gray-100 border-b border-gray-300 px-6 py-4">
          <h3 class="text-base font-bold text-gray-900">Screenshot: {{ previewScreenshotDomain }}</h3>
          <button @click="previewScreenshotUrl = null" class="text-gray-500 hover:text-red-600 p-1 rounded">
            <XIcon class="w-6 h-6" />
          </button>
        </div>
        <div class="p-4 bg-gray-900 flex items-center justify-center overflow-auto max-h-[75vh]">
          <img :src="previewScreenshotUrl" alt="Screenshot Full" class="max-w-full max-h-full object-contain rounded shadow" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import { 
  EyeIcon, ExternalLinkIcon, XIcon, ShieldAlertIcon, FlameIcon, 
  GlobeIcon, LockIcon, RefreshCwIcon, SearchIcon, 
  CheckCircleIcon, UsersIcon, ClockIcon 
} from 'lucide-vue-next';
import { debounce } from 'lodash';
import { storeToRefs } from 'pinia';
import ctiService from '@/services/ctiService';
import { useCtiStore } from '@/stores/cti';
import { useAuthStore } from '@/stores/auth';
import { useToastStore } from '@/stores/toast';
import { can } from '@/helpers/permissionHelper';
import Pagination from '@/components/admin/team/Pagination.vue';
import SearchInput from '@/components/common/SearchInput.vue';

const route = useRoute();
const authStore = useAuthStore();

const userRoles = computed(() =>
  (authStore.user?.roles || []).map((r) =>
    typeof r === 'string' ? r.toLowerCase() : (r?.name || '').toLowerCase()
  )
);

const hasFullBrandProtectionAccess = computed(() => {
  return (
    can('cti.brand-protection.view') ||
    userRoles.value.includes('admin') ||
    userRoles.value.includes('security')
  );
});

const canCheckAnyEmail = computed(() => {
  return (
    can('cti.email-breach.check-any') ||
    hasFullBrandProtectionAccess.value
  );
});

const tabs = [
  { id: 'domain', name: 'Domain Intelligence' },
  { id: 'ssl', name: 'SSL Monitor' },
  { id: 'dns', name: 'DNS Monitor' },
  { id: 'email', name: 'Email Breach' },
  { id: 'typosquatting', name: 'Typosquatting' },
];

const currentTab = ref(hasFullBrandProtectionAccess.value ? 'domain' : 'email');
const filterCategory = ref('');

// CTI Store & Toast
const ctiStore = useCtiStore();
const toast = useToastStore();
const { 
  breachChecks, 
  meta: breachMeta, 
  currentBreachResult, 
  loadingBreachCheck, 
  loadingCheckAll, 
  loadingBreachHistory,
  loadingUrlscan: loadingUrlscanMap,
} = storeToRefs(ctiStore);

// Helper Date Time Format
const formatDateTime = (dateStr) => {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return `${d.toLocaleString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'Asia/Jakarta',
    })} WIB`;
  } catch (e) {
    return dateStr;
  }
};

const formatDnsList = (val) => {
  if (!val) return '-';
  if (Array.isArray(val)) {
    return val.length > 0 ? val.join(', ') : '-';
  }
  return val || '-';
};

// === TAB 4: EMAIL BREACH STATE & HANDLERS ===
const breachEmailInput = ref('');
const breachSearchQuery = ref('');
const queuedCount = ref(null);
const breachServerOptions = ref({
  page: 1,
  row_per_page: 10,
});

const fetchBreachHistory = async () => {
  try {
    await ctiStore.fetchBreachChecks({
      page: breachServerOptions.value.page,
      row_per_page: breachServerOptions.value.row_per_page,
      search: breachSearchQuery.value || undefined,
    });
  } catch (err) {
    console.error('Failed to fetch breach history', err);
  }
};

const onBreachSearchChange = debounce(() => {
  breachServerOptions.value.page = 1;
  fetchBreachHistory();
}, 400);

const handleBreachPageChange = (page) => {
  breachServerOptions.value.page = page;
  fetchBreachHistory();
};

const handleBreachPerPageChange = (perPage) => {
  breachServerOptions.value.row_per_page = perPage;
  breachServerOptions.value.page = 1;
  fetchBreachHistory();
};

const handleCheckSingleEmail = async () => {
  if (!breachEmailInput.value) return;
  try {
    const res = await ctiStore.checkEmailBreach(breachEmailInput.value);
    if (res.is_breached) {
      toast.warning(`Email ${res.email} was detected in a data breach!`);
    } else {
      toast.success(`Email ${res.email} is safe from known data breaches.`);
    }
    fetchBreachHistory();
  } catch (err) {
    toast.error(typeof err === 'string' ? err : (err?.response?.data?.message || 'Failed to check email.'));
  }
};

const handleCheckAllEmployees = async () => {
  try {
    const res = await ctiStore.checkAllEmployeesBreach();
    queuedCount.value = res?.queued ?? 0;
    toast.success(`Bulk check successfully queued for ${queuedCount.value} employee emails.`);
    fetchBreachHistory();
  } catch (err) {
    toast.error(typeof err === 'string' ? err : (err?.response?.data?.message || 'Failed to queue bulk employee check.'));
  }
};

// === TAB 5: TYPOSQUATTING STATE & HANDLERS ===
const domainsList = ['herointiputra.com', 'hip.co.id', 'toyscity.id'];
const selectedBrandDomain = ref(domainsList[0]);
const brandScanStatus = ref(null);
const isScanningBrand = ref(false);
const loadingLatestBrandScan = ref(false);
let brandScanPollInterval = null;

const urlscanIntervals = {};
const urlscanAttempts = ref({});

const previewScreenshotUrl = ref(null);
const previewScreenshotDomain = ref('');

const openScreenshotModal = (url, domain) => {
  previewScreenshotUrl.value = url;
  previewScreenshotDomain.value = domain;
};

const startUrlscanPolling = (result) => {
  if (!result || !result.id) return;
  const resultId = result.id;

  if (urlscanIntervals[resultId]) {
    clearInterval(urlscanIntervals[resultId]);
    delete urlscanIntervals[resultId];
  }

  urlscanAttempts.value[resultId] = 0;
  urlscanIntervals[resultId] = setInterval(async () => {
    urlscanAttempts.value[resultId] = (urlscanAttempts.value[resultId] || 0) + 1;

    // Maximum 24 attempts (~2 minutes with 5-second polling interval)
    if (urlscanAttempts.value[resultId] >= 24) {
      clearInterval(urlscanIntervals[resultId]);
      delete urlscanIntervals[resultId];
      result.urlscan_status = 'timeout';
      toast.warning(`Urlscan check for ${result.domain} timed out after 2 minutes.`);
      return;
    }

    try {
      const resData = await ctiStore.getUrlscanResult(resultId);
      if (resData) {
        Object.assign(result, resData);
        if (resData.urlscan_status === 'done' || resData.urlscan_status === 'failed') {
          clearInterval(urlscanIntervals[resultId]);
          delete urlscanIntervals[resultId];
          if (resData.urlscan_status === 'done') {
            toast.success(`Urlscan completed for ${result.domain}.`);
          } else {
            toast.error(`Urlscan failed for ${result.domain}.`);
          }
        }
      }
    } catch (e) {
      // Ignore transient network errors, continue polling until timeout
    }
  }, 5000);
};

const loadLatestBrandScan = async (domain) => {
  if (!domain) return;

  if (brandScanPollInterval) {
    clearInterval(brandScanPollInterval);
    brandScanPollInterval = null;
  }

  loadingLatestBrandScan.value = true;
  try {
    const latest = await ctiStore.getLatestBrandScan(domain);
    brandScanStatus.value = latest || null;

    if (latest && (latest.status === 'pending' || latest.status === 'running')) {
      isScanningBrand.value = true;
      pollBrandScan(latest.id);
    } else {
      isScanningBrand.value = false;
      // Jika ada item hasil scan yang urlscan-nya masih pending, lanjutkan polling-nya
      if (latest?.results && Array.isArray(latest.results)) {
        latest.results.forEach((res) => {
          if (res.urlscan_status === 'pending' && res.urlscan_uuid) {
            startUrlscanPolling(res);
          }
        });
      }
    }
  } catch (err) {
    console.error('Failed to load latest brand scan:', err);
  } finally {
    loadingLatestBrandScan.value = false;
  }
};

watch(selectedBrandDomain, (newDomain) => {
  if (newDomain) {
    loadLatestBrandScan(newDomain);
  }
});

const startBrandScan = async () => {
  if (!selectedBrandDomain.value || isScanningBrand.value) return;

  if (brandScanPollInterval) {
    clearInterval(brandScanPollInterval);
    brandScanPollInterval = null;
  }

  isScanningBrand.value = true;

  try {
    const scan = await ctiStore.createBrandScan(selectedBrandDomain.value);
    brandScanStatus.value = scan;
    toast.success(`Scan for domain ${selectedBrandDomain.value} successfully queued.`);

    if (scan.status === 'pending' || scan.status === 'running') {
      pollBrandScan(scan.id);
    } else {
      isScanningBrand.value = false;
    }
  } catch (err) {
    isScanningBrand.value = false;
    toast.error(typeof err === 'string' ? err : (err?.response?.data?.message || 'Failed to start brand scan.'));
  }
};

const pollBrandScan = (scanId) => {
  brandScanPollInterval = setInterval(async () => {
    try {
      const updated = await ctiStore.getBrandScan(scanId);
      brandScanStatus.value = updated;
      if (updated.status === 'done' || updated.status === 'failed') {
        clearInterval(brandScanPollInterval);
        brandScanPollInterval = null;
        isScanningBrand.value = false;

        if (updated.status === 'done') {
          const count = updated.total_found ?? (updated.results?.length || 0);
          if (count === 0) {
            toast.info(`Scan completed. No active lookalike domains found.`);
          } else {
            toast.success(`Scan completed. Found ${count} lookalike domain(s).`);
          }
        } else {
          toast.error(updated.error || 'Scan failed to complete.');
        }
      }
    } catch (err) {
      clearInterval(brandScanPollInterval);
      brandScanPollInterval = null;
      isScanningBrand.value = false;
      toast.error('Failed to retrieve scan status.');
    }
  }, 5000);
};

const runUrlscan = async (result) => {
  if (!result || !result.id) return;
  const resultId = result.id;

  try {
    const updated = await ctiStore.triggerUrlscan(resultId);
    result.urlscan_status = updated.urlscan_status || 'pending';
    toast.success(`Urlscan for domain ${result.domain} started successfully.`);
    startUrlscanPolling(result);
  } catch (err) {
    toast.error(typeof err === 'string' ? err : (err?.response?.data?.message || 'Failed to start urlscan.'));
  }
};

// === EXISTING DOMAIN / SSL / DNS LOGIC (UNTOUCHED) ===
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
  domain: d, issuer: '', subject: '', status: 'PENDING', expired: '', not_before: '', sisaWaktu: '', terakhirCek: 'Just now'
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
  return `${diffDays} days`;
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
        sslMonitorData.value[i].terakhirCek = 'Just now';
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
  if (!hasFullBrandProtectionAccess.value) {
    currentTab.value = 'email';
  } else if (
    typeof route.query.tab === 'string' &&
    ['domain', 'ssl', 'dns', 'email', 'typosquatting'].includes(route.query.tab)
  ) {
    currentTab.value = route.query.tab;
  }
  if (!canCheckAnyEmail.value && authStore.user?.email) {
    breachEmailInput.value = authStore.user.email;
  }

  if (hasFullBrandProtectionAccess.value) {
    triggerAutomatedCrawl();
    crawlInterval = setInterval(triggerAutomatedCrawl, 3600000);
    loadLatestBrandScan(selectedBrandDomain.value);
  }
  fetchBreachHistory();
});

watch(
  () => route.query.tab,
  (newTab) => {
    if (
      hasFullBrandProtectionAccess.value &&
      typeof newTab === 'string' &&
      ['domain', 'ssl', 'dns', 'email', 'typosquatting'].includes(newTab)
    ) {
      currentTab.value = newTab;
    }
  }
);

onUnmounted(() => {
  if (crawlInterval) clearInterval(crawlInterval);
  if (brandScanPollInterval) clearInterval(brandScanPollInterval);
  Object.values(urlscanIntervals).forEach(interval => clearInterval(interval));
});
</script>
