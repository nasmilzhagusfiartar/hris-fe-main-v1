<script setup>
import { ref, computed, onMounted } from "vue";
import { onBeforeRouteLeave } from "vue-router";
import { axiosInstance } from "@/plugins/axios";
import { useAuthStore } from "@/stores/auth";
import { useToastStore } from "@/stores/toast";
import {
  ShieldCheck,
  ShieldAlert,
  Copy,
  Check,
  Download,
  RefreshCw,
  KeyRound,
  Lock,
  Loader2,
  X,
} from "lucide-vue-next";

const authStore = useAuthStore();
const toast = useToastStore();

const loadingStatus = ref(true);
const status = ref({
  mfa_enabled: false,
  mfa_required_by_role: false,
  mfa_global_enabled: true,
  recovery_codes_remaining: 0,
});

// Setup state
const setupData = ref(null);
const loadingSetup = ref(false);
const enableCode = ref("");
const enabling = ref(false);
const copiedSecret = ref(false);

// Recovery codes display state (shown once after enable / regenerate)
const freshRecoveryCodes = ref([]);
const savedCodesConfirmed = ref(false);
const copiedRecovery = ref(false);

// Disable / Regenerate modal state
const actionModal = ref(null); // 'disable' | 'regenerate' | null
const actionPassword = ref("");
const actionCode = ref("");
const actionLoading = ref(false);
const actionError = ref("");

const hasUnsavedRecoveryCodes = computed(
  () => freshRecoveryCodes.value.length > 0 && !savedCodesConfirmed.value
);

// Prevent navigating away before confirming recovery codes are saved
onBeforeRouteLeave(() => {
  if (hasUnsavedRecoveryCodes.value) {
    toast.warning(
      'Please check "I have saved my recovery codes" before leaving this page.'
    );
    return false;
  }
  return true;
});

const fetchStatus = async () => {
  loadingStatus.value = true;
  try {
    const res = await axiosInstance.get("/mfa/status");
    if (res.data?.data) {
      status.value = res.data.data;
    }
  } catch (err) {
    toast.error(err?.response?.data?.message || "Failed to load MFA status.");
  } finally {
    loadingStatus.value = false;
  }
};

const startSetup = async () => {
  loadingSetup.value = true;
  enableCode.value = "";
  try {
    const res = await axiosInstance.post("/mfa/setup");
    setupData.value = res.data?.data || null;
  } catch (err) {
    toast.error(err?.response?.data?.message || "Failed to start MFA setup.");
  } finally {
    loadingSetup.value = false;
  }
};

const cancelSetup = () => {
  setupData.value = null;
  enableCode.value = "";
};

const copySecret = async () => {
  if (!setupData.value?.secret) return;
  try {
    await navigator.clipboard.writeText(setupData.value.secret);
    copiedSecret.value = true;
    toast.success("Secret key copied to clipboard.");
    setTimeout(() => (copiedSecret.value = false), 2000);
  } catch (e) {
    toast.error("Failed to copy secret key.");
  }
};

const handleEnableMfa = async () => {
  const clean = enableCode.value.replace(/\D/g, "");
  if (clean.length !== 6) {
    toast.error("Please enter a valid 6-digit verification code.");
    return;
  }

  enabling.value = true;
  try {
    const res = await axiosInstance.post("/mfa/enable", { code: clean });
    freshRecoveryCodes.value = res.data?.data?.recovery_codes || [];
    savedCodesConfirmed.value = false;
    setupData.value = null;
    enableCode.value = "";
    toast.success("MFA enabled successfully! Please save your recovery codes.");
    await Promise.all([fetchStatus(), authStore.checkAuth()]);
  } catch (err) {
    toast.error(
      err?.response?.data?.message || "Invalid verification code. Please try again."
    );
  } finally {
    enabling.value = false;
  }
};

const copyRecoveryCodes = async () => {
  if (!freshRecoveryCodes.value.length) return;
  try {
    await navigator.clipboard.writeText(freshRecoveryCodes.value.join("\n"));
    copiedRecovery.value = true;
    toast.success("Recovery codes copied to clipboard.");
    setTimeout(() => (copiedRecovery.value = false), 2000);
  } catch (e) {
    toast.error("Failed to copy recovery codes.");
  }
};

const downloadRecoveryCodes = () => {
  if (!freshRecoveryCodes.value.length) return;
  const content = [
    "HIP HRIS - MFA Recovery Codes",
    `Account: ${authStore.user?.email || ""}`,
    `Generated: ${new Date().toISOString()}`,
    "",
    "Keep these codes in a safe place. Each code can only be used once.",
    "",
    ...freshRecoveryCodes.value,
  ].join("\n");

  const blob = new Blob([content], { type: "text/plain;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "hip-hris-mfa-recovery-codes.txt";
  link.click();
  URL.revokeObjectURL(url);
};

const dismissRecoveryCodes = () => {
  if (!savedCodesConfirmed.value) return;
  freshRecoveryCodes.value = [];
  savedCodesConfirmed.value = false;
};

const openActionModal = (type) => {
  actionModal.value = type;
  actionPassword.value = "";
  actionCode.value = "";
  actionError.value = "";
};

const closeActionModal = () => {
  actionModal.value = null;
  actionPassword.value = "";
  actionCode.value = "";
  actionError.value = "";
};

const submitActionModal = async () => {
  actionError.value = "";
  const cleanCode = actionCode.value.replace(/\D/g, "");
  if (!actionPassword.value || cleanCode.length !== 6) {
    actionError.value = "Please enter your password and a valid 6-digit code.";
    return;
  }

  actionLoading.value = true;
  try {
    if (actionModal.value === "disable") {
      await axiosInstance.post("/mfa/disable", {
        password: actionPassword.value,
        code: cleanCode,
      });
      toast.success("MFA has been disabled on your account.");
      closeActionModal();
      await Promise.all([fetchStatus(), authStore.checkAuth()]);
    } else if (actionModal.value === "regenerate") {
      const res = await axiosInstance.post("/mfa/recovery-codes/regenerate", {
        password: actionPassword.value,
        code: cleanCode,
      });
      freshRecoveryCodes.value = res.data?.data?.recovery_codes || [];
      savedCodesConfirmed.value = false;
      toast.success("New recovery codes generated. Please save them securely.");
      closeActionModal();
      await fetchStatus();
    }
  } catch (err) {
    actionError.value =
      err?.response?.data?.message || "Verification failed. Please try again.";
  } finally {
    actionLoading.value = false;
  }
};

onMounted(fetchStatus);
</script>

<template>
  <div class="bg-white border border-[#DCDEDD] rounded-[20px] p-6 space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-100 pb-5">
      <div class="flex items-center gap-3">
        <div
          class="w-12 h-12 rounded-[12px] flex items-center justify-center shrink-0"
          :class="status.mfa_enabled ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-[#0C51D9]'"
        >
          <ShieldCheck v-if="status.mfa_enabled" class="w-6 h-6" />
          <ShieldAlert v-else class="w-6 h-6" />
        </div>
        <div>
          <h3 class="text-brand-dark text-xl font-bold">
            Multi-Factor Authentication (MFA)
          </h3>
          <p class="text-brand-light text-sm">
            Protect your account with a 6-digit TOTP authenticator app (Google Authenticator, Authy, 1Password).
          </p>
        </div>
      </div>

      <span
        v-if="!loadingStatus"
        class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold self-start sm:self-auto"
        :class="
          status.mfa_enabled
            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
            : 'bg-gray-100 text-gray-700 border border-gray-200'
        "
      >
        <ShieldCheck v-if="status.mfa_enabled" class="w-3.5 h-3.5" />
        <ShieldAlert v-else class="w-3.5 h-3.5" />
        {{ status.mfa_enabled ? "MFA Enabled" : "MFA Disabled" }}
      </span>
    </div>

    <!-- Loading -->
    <div v-if="loadingStatus" class="py-8 text-center text-sm text-gray-500 flex items-center justify-center gap-2">
      <Loader2 class="w-4 h-4 animate-spin text-[#0C51D9]" />
      <span>Loading MFA settings...</span>
    </div>

    <!-- Disabled globally notice -->
    <div
      v-else-if="!status.mfa_global_enabled"
      class="p-4 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-600"
    >
      Multi-Factor Authentication is currently disabled in system configuration.
    </div>

    <template v-else>
      <!-- Mandatory Enrollment Banner -->
      <div
        v-if="status.mfa_required_by_role && !status.mfa_enabled"
        class="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3"
      >
        <ShieldAlert class="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <h4 class="font-bold text-sm">MFA Enrollment Required</h4>
          <p class="text-xs text-amber-800 mt-1">
            Your role requires Multi-Factor Authentication. Please complete MFA setup below to access all HIP HRIS features.
          </p>
        </div>
      </div>

      <!-- ONE-TIME RECOVERY CODES PANEL -->
      <div
        v-if="freshRecoveryCodes.length > 0"
        class="p-5 rounded-2xl bg-amber-50/70 border-2 border-amber-300 space-y-4"
      >
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 class="text-base font-bold text-amber-950 flex items-center gap-2">
              <KeyRound class="w-5 h-5 text-amber-700" />
              Save Your Recovery Codes
            </h4>
            <p class="text-xs text-amber-800 mt-1">
              These 8 recovery codes are shown <strong>only once</strong>. Store them safely in case you lose access to your authenticator app.
            </p>
          </div>
          <div class="flex items-center gap-2 shrink-0">
            <button
              type="button"
              @click="copyRecoveryCodes"
              class="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-white border border-amber-300 text-amber-900 hover:bg-amber-100 cursor-pointer"
            >
              <Check v-if="copiedRecovery" class="w-3.5 h-3.5 text-emerald-600" />
              <Copy v-else class="w-3.5 h-3.5" />
              <span>{{ copiedRecovery ? "Copied" : "Copy" }}</span>
            </button>
            <button
              type="button"
              @click="downloadRecoveryCodes"
              class="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-amber-600 text-white hover:bg-amber-700 cursor-pointer"
            >
              <Download class="w-3.5 h-3.5" />
              <span>Download (.txt)</span>
            </button>
          </div>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div
            v-for="(rc, idx) in freshRecoveryCodes"
            :key="idx"
            class="bg-white border border-amber-200 rounded-lg py-2.5 px-3 text-center font-mono text-sm font-bold text-gray-900 select-all"
          >
            {{ rc }}
          </div>
        </div>

        <div class="pt-3 border-t border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <label class="inline-flex items-center gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              v-model="savedCodesConfirmed"
              class="w-4 h-4 rounded border-amber-400 text-[#0C51D9] focus:ring-[#0C51D9]"
            />
            <span class="text-xs font-semibold text-amber-950">
              I have saved my recovery codes
            </span>
          </label>

          <button
            type="button"
            @click="dismissRecoveryCodes"
            :disabled="!savedCodesConfirmed"
            class="px-5 py-2 rounded-xl text-xs font-bold bg-[#0C51D9] text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>

      <!-- SETUP FLOW (QR CODE + MANUAL SECRET + 6-DIGIT VERIFY) -->
      <div
        v-if="setupData"
        class="p-6 rounded-2xl bg-gray-50 border border-[#DCDEDD] space-y-6"
      >
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <!-- Local Server SVG QR Code -->
          <div class="flex flex-col items-center justify-center bg-white border border-gray-200 rounded-2xl p-5">
            <div
              class="w-[220px] h-[220px] flex items-center justify-center"
              v-html="setupData.qr_code_svg"
            ></div>
            <p class="text-xs text-gray-500 mt-3 text-center">
              Scan this QR code with your authenticator app
            </p>
          </div>

          <!-- Manual Key & Verification Input -->
          <div class="space-y-4">
            <div>
              <p class="text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                Manual Entry Secret Key
              </p>
              <div class="flex items-center gap-2">
                <code
                  class="flex-1 bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 font-mono text-sm font-bold text-gray-900 break-all select-all"
                >
                  {{ setupData.secret }}
                </code>
                <button
                  type="button"
                  @click="copySecret"
                  class="px-3 py-2.5 rounded-xl border border-gray-300 bg-white hover:border-[#0C51D9] text-gray-700 cursor-pointer"
                  title="Copy secret"
                >
                  <Check v-if="copiedSecret" class="w-4 h-4 text-emerald-600" />
                  <Copy v-else class="w-4 h-4" />
                </button>
              </div>
            </div>

            <form @submit.prevent="handleEnableMfa" class="space-y-3 pt-2">
              <div>
                <label class="block text-xs font-semibold text-gray-700 mb-1.5">
                  Enter 6-Digit Code from Authenticator App
                </label>
                <input
                  v-model="enableCode"
                  type="text"
                  inputmode="numeric"
                  maxlength="6"
                  placeholder="000000"
                  class="w-full text-center tracking-[0.4em] font-mono text-xl font-bold py-3 px-4 bg-white border border-[#DCDEDD] rounded-xl focus:outline-none focus:border-[#0C51D9] focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div class="flex items-center gap-3">
                <button
                  type="submit"
                  :disabled="enabling || enableCode.replace(/\D/g, '').length !== 6"
                  class="flex-1 btn-primary rounded-xl border border-[#2151A0] blue-gradient blue-btn-shadow py-2.5 px-4 text-white text-sm font-semibold cursor-pointer disabled:opacity-50"
                >
                  {{ enabling ? "Verifying..." : "Verify & Enable MFA" }}
                </button>
                <button
                  type="button"
                  @click="cancelSetup"
                  :disabled="enabling"
                  class="px-4 py-2.5 rounded-xl border border-[#DCDEDD] bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- STATUS ACTIONS WHEN NOT IN SETUP -->
      <div v-else class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-200">
        <div class="space-y-1">
          <p class="text-sm font-bold text-gray-900">
            {{
              status.mfa_enabled
                ? "Two-factor authentication is active on your account."
                : "Two-factor authentication is not enabled yet."
            }}
          </p>
          <p v-if="status.mfa_enabled" class="text-xs text-gray-600">
            Remaining recovery codes: <strong>{{ status.recovery_codes_remaining }}</strong>
            <span v-if="status.mfa_required_by_role" class="ml-2 text-amber-700 font-semibold">
              • Required by your role
            </span>
          </p>
          <p v-else class="text-xs text-gray-500">
            Add an extra layer of security to your login by requiring a one-time code from your phone.
          </p>
        </div>

        <div class="flex items-center flex-wrap gap-2.5 shrink-0">
          <button
            v-if="!status.mfa_enabled"
            type="button"
            @click="startSetup"
            :disabled="loadingSetup"
            class="btn-primary rounded-xl border border-[#2151A0] blue-gradient blue-btn-shadow px-5 py-2.5 text-white text-sm font-semibold inline-flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Loader2 v-if="loadingSetup" class="w-4 h-4 animate-spin" />
            <ShieldCheck v-else class="w-4 h-4" />
            <span>{{ loadingSetup ? "Preparing..." : "Enable MFA" }}</span>
          </button>

          <template v-else>
            <button
              type="button"
              @click="openActionModal('regenerate')"
              class="px-4 py-2.5 rounded-xl border border-[#DCDEDD] bg-white hover:border-[#0C51D9] text-sm font-semibold text-brand-dark inline-flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw class="w-4 h-4" />
              <span>Regenerate Recovery Codes</span>
            </button>

            <button
              v-if="!status.mfa_required_by_role"
              type="button"
              @click="openActionModal('disable')"
              class="px-4 py-2.5 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-sm font-semibold text-red-700 inline-flex items-center gap-2 cursor-pointer"
            >
              <ShieldAlert class="w-4 h-4" />
              <span>Disable MFA</span>
            </button>
          </template>
        </div>
      </div>
    </template>

    <!-- MODAL: DISABLE MFA / REGENERATE RECOVERY CODES -->
    <div
      v-if="actionModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4"
      @click.self="closeActionModal"
    >
      <div class="bg-white rounded-2xl border border-[#DCDEDD] shadow-2xl w-full max-w-md overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h4 class="text-base font-bold text-gray-900">
            {{ actionModal === "disable" ? "Disable MFA" : "Regenerate Recovery Codes" }}
          </h4>
          <button
            type="button"
            @click="closeActionModal"
            class="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 cursor-pointer"
          >
            <X class="w-4 h-4" />
          </button>
        </div>

        <form @submit.prevent="submitActionModal" class="p-6 space-y-4">
          <p class="text-xs text-gray-600">
            {{
              actionModal === "disable"
                ? "Enter your current password and a 6-digit code from your authenticator app to disable MFA."
                : "Enter your current password and a 6-digit code to invalidate old recovery codes and generate 8 new ones."
            }}
          </p>

          <div
            v-if="actionError"
            class="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700"
          >
            {{ actionError }}
          </div>

          <div>
            <label class="block text-xs font-semibold text-gray-700 mb-1">
              Current Password
            </label>
            <div class="relative">
              <Lock class="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                v-model="actionPassword"
                type="password"
                required
                placeholder="Enter your password"
                class="w-full pl-10 pr-3 py-2.5 text-sm border border-[#DCDEDD] rounded-xl focus:outline-none focus:border-[#0C51D9]"
              />
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold text-gray-700 mb-1">
              6-Digit Authenticator Code
            </label>
            <input
              v-model="actionCode"
              type="text"
              inputmode="numeric"
              maxlength="6"
              required
              placeholder="000000"
              class="w-full text-center tracking-[0.4em] font-mono text-lg font-bold py-2.5 px-4 border border-[#DCDEDD] rounded-xl focus:outline-none focus:border-[#0C51D9]"
            />
          </div>

          <div class="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              @click="closeActionModal"
              class="px-4 py-2 rounded-xl border border-[#DCDEDD] text-sm font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="actionLoading"
              class="px-5 py-2 rounded-xl text-sm font-semibold text-white cursor-pointer disabled:opacity-50"
              :class="actionModal === 'disable' ? 'bg-red-600 hover:bg-red-700' : 'bg-[#0C51D9] hover:bg-blue-700'"
            >
              {{
                actionLoading
                  ? "Processing..."
                  : actionModal === "disable"
                  ? "Confirm Disable"
                  : "Regenerate Codes"
              }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
