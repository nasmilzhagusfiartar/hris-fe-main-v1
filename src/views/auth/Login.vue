<script setup lang="ts">
import { useAuthStore } from "@/stores/auth";
import { ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import Alert from "@/components/common/Alert.vue";
import Input from "@/components/common/form/Input.vue";
import PasswordInput from "@/components/common/form/PasswordInput.vue";
import LanguageToggle from "@/components/common/LanguageToggle.vue";
import {
  AtSign,
  BuildingIcon,
  Lock,
  ShieldCheck,
  KeyRound,
  ArrowLeft,
  AlertTriangle,
} from "lucide-vue-next";
import { storeToRefs } from "pinia";

const { t } = useI18n();
const authStore = useAuthStore();
const {
  loading,
  error,
  mfaRequired,
  mfaRemainingAttempts,
  mfaLocked,
  mfaLockoutMinutes,
  mfaError,
} = storeToRefs(authStore);
const { login, verifyMfa, cancelMfaChallenge } = authStore;

const form = ref({
  email: "",
  password: "",
});

const passwordInputRef = ref<InstanceType<typeof PasswordInput> | null>(null);
const totpCode = ref("");
const recoveryCode = ref("");
const useRecoveryMode = ref(false);

const handleSubmit = async (e?: Event) => {
  if (e) e.preventDefault();
  passwordInputRef.value?.hide();
  await login(form.value);

  if (error.value === "Unauthorized") {
    form.value.password = "";
  }
};

// Automatically hide password when transitioning to MFA verification step
watch(mfaRequired, (required) => {
  if (required) {
    passwordInputRef.value?.hide();
  }
});

const handleMfaSubmit = async () => {
  if (loading.value || mfaLocked.value) return;

  if (useRecoveryMode.value) {
    if (!recoveryCode.value.trim()) return;
    await verifyMfa({ recovery_code: recoveryCode.value.trim() });
  } else {
    const clean = totpCode.value.replace(/\D/g, "");
    if (clean.length !== 6) return;
    const ok = await verifyMfa({ code: clean });
    if (!ok) {
      totpCode.value = "";
    }
  }
};

// Auto-submit when 6 numeric digits are entered
watch(totpCode, (val) => {
  if (useRecoveryMode.value || !mfaRequired.value) return;
  const digits = String(val || "").replace(/\D/g, "").slice(0, 6);
  if (digits !== val) {
    totpCode.value = digits;
    return;
  }
  if (digits.length === 6 && !loading.value && !mfaLocked.value) {
    handleMfaSubmit();
  }
});

const toggleRecoveryMode = () => {
  useRecoveryMode.value = !useRecoveryMode.value;
  totpCode.value = "";
  recoveryCode.value = "";
};

const handleBackToLogin = () => {
  totpCode.value = "";
  recoveryCode.value = "";
  useRecoveryMode.value = false;
  cancelMfaChallenge();
};
</script>

<template>
  <!-- Right Side - Login Form -->
  <div
    class="w-full lg:w-1/2 flex items-center justify-center"
    style="padding: 20px"
  >
    <div class="w-full max-w-md space-y-8">
      <!-- Logo/Brand + Language Toggle -->
      <div class="flex items-center justify-between gap-4">
        <div class="flex items-center gap-4">
          <div class="w-16 h-16 relative flex items-center justify-center">
            <div
              class="w-16 h-16 absolute bg-gradient-to-br from-primary-100 to-primary-200 rounded-full"
            ></div>
            <div
              class="w-10 h-10 absolute bg-gradient-to-br from-primary-500 to-primary-600 rounded-full opacity-90"
            ></div>
            <BuildingIcon class="w-5 h-5 text-white relative z-10" />
          </div>
          <div>
            <h1 class="text-brand-dark text-lg font-bold">HIP HRIS</h1>
            <p class="text-brand-dark text-xs font-normal">{{ t("auth.brandSubtitle") }}</p>
          </div>
        </div>
        <LanguageToggle />
      </div>

      <!-- STEP 1: EMAIL & PASSWORD LOGIN -->
      <template v-if="!mfaRequired">
        <Alert
          type="danger"
          :title="t('auth.invalidCredentialsTitle')"
          :message="t('auth.invalidCredentialsMessage')"
          :show="error === 'Unauthorized'"
        />

        <div
          v-if="mfaLocked && error"
          class="p-4 rounded-xl bg-red-50 border border-red-200 text-red-900 flex items-start gap-3"
        >
          <AlertTriangle class="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <h4 class="font-bold text-sm">{{ t("auth.accountLockedTitle") }}</h4>
            <p class="text-xs text-red-700 mt-1 leading-relaxed">
              {{ error }}
            </p>
          </div>
        </div>

        <Alert
          v-else-if="error && typeof error === 'string' && error !== 'Unauthorized'"
          type="danger"
          :title="t('auth.signInFailedTitle')"
          :message="error"
          :show="true"
        />

        <form class="space-y-6" @submit.prevent="handleSubmit">
          <Input
            id="email"
            name="email"
            type="email"
            v-model="form.email"
            :label="t('auth.emailLabel')"
            :placeholder="t('auth.emailPlaceholder')"
            :required="true"
            :error="error?.email?.join(', ')"
          >
            <template #icon>
              <AtSign class="h-5 w-5 text-gray-400" />
            </template>
          </Input>

          <PasswordInput
            ref="passwordInputRef"
            id="password"
            name="password"
            v-model="form.password"
            :label="t('auth.passwordLabel')"
            :placeholder="t('auth.passwordPlaceholder')"
            :required="true"
            :error="error?.password?.join(', ')"
          >
            <template #icon>
              <Lock class="h-5 w-5 text-gray-400" />
            </template>
          </PasswordInput>

          <button
            type="submit"
            class="btn-primary rounded-[8px] border border-[#2151A0] hover:brightness-110 focus:ring-2 focus:ring-[#0C51D9] transition-all duration-300 blue-gradient blue-btn-shadow px-4 py-3 flex items-center gap-2 w-full justify-center bg-gradient-to-l from-[#0c51d9] via-[#6f96e3] to-[#0c51d9] shadow-[inset_-2px_2px_1px_0_#6197ff,inset_2px_2px_1px_0_rgba(97,151,255,0.55)] text-white font-plus-jakarta-sans text-[14px] font-semibold cursor-pointer disabled:opacity-60"
            :disabled="loading"
          >
            {{ loading ? t("auth.signingIn") : t("auth.signIn") }}
          </button>
        </form>
      </template>

      <!-- STEP 2: MFA VERIFICATION -->
      <template v-else>
        <div class="bg-white border border-[#DCDEDD] rounded-[20px] p-6 space-y-5 shadow-sm">
          <div class="flex items-start gap-3">
            <div class="w-11 h-11 rounded-[12px] bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
              <KeyRound v-if="useRecoveryMode" class="w-5 h-5 text-[#0C51D9]" />
              <ShieldCheck v-else class="w-5 h-5 text-[#0C51D9]" />
            </div>
            <div>
              <h2 class="text-brand-dark text-lg font-bold">
                {{ t("auth.mfaTitle") }}
              </h2>
              <p class="text-brand-light text-xs mt-1 leading-relaxed">
                {{
                  useRecoveryMode
                    ? t("auth.mfaSubtitleRecovery")
                    : t("auth.mfaSubtitleTotp")
                }}
              </p>
            </div>
          </div>

          <!-- Lockout Banner -->
          <div
            v-if="mfaLocked"
            class="p-4 rounded-xl bg-red-50 border border-red-200 text-red-900 flex items-start gap-3"
          >
            <AlertTriangle class="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <h4 class="font-bold text-sm">{{ t("auth.mfaLockedTitle") }}</h4>
              <p class="text-xs text-red-700 mt-1 leading-relaxed">
                {{ mfaError || `Too many failed attempts. Please try again in ${mfaLockoutMinutes || 15} minutes.` }}
              </p>
            </div>
          </div>

          <!-- Remaining Attempts / Error Banner -->
          <div
            v-else-if="mfaError"
            class="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1"
          >
            <p class="font-bold">{{ mfaError }}</p>
            <p v-if="mfaRemainingAttempts !== null" class="text-amber-700 font-medium">
              {{ t("auth.mfaRemainingAttempts") }} <strong>{{ mfaRemainingAttempts }}</strong>
            </p>
          </div>

          <form class="space-y-4" @submit.prevent="handleMfaSubmit">
            <div v-if="!useRecoveryMode">
              <label
                for="mfa-code"
                class="block text-xs font-semibold text-gray-700 mb-1.5"
              >
                {{ t("auth.mfaCodeLabel") }}
              </label>
              <input
                id="mfa-code"
                v-model="totpCode"
                type="text"
                inputmode="numeric"
                autocomplete="one-time-code"
                maxlength="6"
                placeholder="000000"
                :disabled="loading || mfaLocked"
                class="w-full text-center tracking-[0.5em] font-mono text-2xl font-bold py-3.5 px-4 border border-[#DCDEDD] rounded-[12px] focus:outline-none focus:border-[#0C51D9] focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
                autofocus
              />
            </div>

            <div v-else>
              <label
                for="mfa-recovery-code"
                class="block text-xs font-semibold text-gray-700 mb-1.5"
              >
                {{ t("auth.mfaRecoveryLabel") }}
              </label>
              <input
                id="mfa-recovery-code"
                v-model="recoveryCode"
                type="text"
                placeholder="XXXX-XXXX"
                :disabled="loading || mfaLocked"
                class="w-full text-center font-mono text-lg font-bold uppercase py-3 px-4 border border-[#DCDEDD] rounded-[12px] focus:outline-none focus:border-[#0C51D9] focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
                autofocus
              />
            </div>

            <button
              type="submit"
              :disabled="
                loading ||
                mfaLocked ||
                (!useRecoveryMode && totpCode.length !== 6) ||
                (useRecoveryMode && !recoveryCode.trim())
              "
              class="btn-primary rounded-[8px] border border-[#2151A0] hover:brightness-110 focus:ring-2 focus:ring-[#0C51D9] transition-all duration-300 blue-gradient blue-btn-shadow px-4 py-3 flex items-center gap-2 w-full justify-center text-white text-sm font-semibold cursor-pointer disabled:opacity-50"
            >
              {{ loading ? t("auth.verifying") : t("auth.verifyCode") }}
            </button>
          </form>

          <div class="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
            <button
              type="button"
              @click="toggleRecoveryMode"
              :disabled="mfaLocked"
              class="text-[#0C51D9] font-semibold hover:underline cursor-pointer disabled:opacity-50"
            >
              {{ useRecoveryMode ? t("auth.useAuthenticatorCode") : t("auth.useRecoveryCode") }}
            </button>

            <button
              type="button"
              @click="handleBackToLogin"
              class="inline-flex items-center gap-1 text-gray-600 font-semibold hover:text-gray-900 cursor-pointer"
            >
              <ArrowLeft class="w-3.5 h-3.5" />
              <span>{{ t("auth.backToLogin") }}</span>
            </button>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>
