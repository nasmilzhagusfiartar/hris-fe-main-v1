<script setup>
import { ref, computed, onMounted, reactive } from "vue";
import { useI18n } from "vue-i18n";
import { storeToRefs } from "pinia";
import {
  Bell,
  ShieldCheck,
  Building,
} from "lucide-vue-next";
import { useSettingsStore } from "@/stores/settings";
import { useAuthStore } from "@/stores/auth";
import { can } from "@/helpers/permissionHelper";
import Input from "@/components/common/form/Input.vue";
import PasswordInput from "@/components/common/form/PasswordInput.vue";
import Select from "@/components/common/form/Select.vue";
import TextArea from "@/components/common/form/TextArea.vue";
import Alert from "@/components/common/Alert.vue";

const { t } = useI18n();
const settingsStore = useSettingsStore();
const authStore = useAuthStore();
const { company, notifications, loading, error, success } = storeToRefs(settingsStore);

const userRoles = computed(() =>
  (authStore.user?.roles || []).map((r) =>
    typeof r === "string" ? r.toLowerCase() : (r?.name || "").toLowerCase()
  )
);

const canEditCompany = computed(() => {
  if (userRoles.value.includes("employee") && !userRoles.value.some((r) => ["super-admin", "admin", "hr", "manager"].includes(r))) {
    return false;
  }
  return can("setting-edit") || userRoles.value.some((r) => ["super-admin", "admin", "hr", "manager"].includes(r));
});

const tabs = computed(() => {
  const list = [];
  if (canEditCompany.value) {
    list.push({ key: "general", label: t("settings.tabs.general"), icon: Building });
  }
  list.push(
    { key: "notifications", label: t("settings.tabs.notifications"), icon: Bell },
    { key: "security", label: t("settings.tabs.security"), icon: ShieldCheck }
  );
  return list;
});

const activeTab = ref("general");

const timezoneOptions = [
  { value: "Asia/Jakarta", label: "WIB - Asia/Jakarta" },
  { value: "Asia/Makassar", label: "WITA - Asia/Makassar" },
  { value: "Asia/Jayapura", label: "WIT - Asia/Jayapura" },
];

const companyForm = reactive({ ...company.value });
const passwordForm = reactive({
  current_password: "",
  new_password: "",
  new_password_confirmation: "",
});

onMounted(async () => {
  if (!canEditCompany.value) {
    activeTab.value = "notifications";
  }
  await settingsStore.fetchSettings();
  Object.assign(companyForm, company.value);
});

const saveCompanySettings = async () => {
  try {
    await settingsStore.updateCompanySettings(companyForm);
  } catch (e) {
    // Error handled in store
  }
};

const toggleNotification = async (key) => {
  try {
    await settingsStore.updateNotificationSettings({
      ...notifications.value,
      [key]: !notifications.value[key],
    });
  } catch (e) {
    // Error handled in store
  }
};

const currentPasswordRef = ref(null);
const newPasswordRef = ref(null);
const confirmPasswordRef = ref(null);

const submitPasswordChange = async () => {
  currentPasswordRef.value?.hide();
  newPasswordRef.value?.hide();
  confirmPasswordRef.value?.hide();
  try {
    await settingsStore.changePassword(passwordForm);
    passwordForm.current_password = "";
    passwordForm.new_password = "";
    passwordForm.new_password_confirmation = "";
  } catch (e) {
    // Error already reflected via settingsStore.error
  }
};
</script>

<template>
  <div>
    <div class="mb-6">
      <h1 class="text-brand-dark text-2xl font-bold">{{ t("settings.title") }}</h1>
      <p class="text-brand-light text-sm mt-1">
        {{
          canEditCompany
            ? t("settings.subtitleAdmin")
            : t("settings.subtitlePersonal")
        }}
      </p>
    </div>

    <Alert v-if="success" type="success" :title="t('common.success')" :message="success" :show="!!success" />
    <Alert
      v-if="error && typeof error === 'string'"
      type="danger"
      :title="t('settings.loadErrorTitle')"
      :message="error"
      :show="!!error"
    />

    <!-- Tab Navigation -->
    <div class="bg-white border border-[#DCDEDD] rounded-[16px] p-6 mb-6">
      <div class="flex items-center gap-2 flex-wrap">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          type="button"
          @click="activeTab = tab.key"
          :class="
            activeTab === tab.key
              ? 'px-6 py-3 rounded-[12px] bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold text-base transition-all duration-300'
              : 'px-6 py-3 rounded-[12px] border border-[#DCDEDD] bg-white text-brand-dark font-medium text-base hover:border-[#0C51D9] hover:border-2 transition-all duration-300'
          "
        >
          <component :is="tab.icon" class="w-5 h-5 inline mr-2" />
          {{ tab.label }}
        </button>
      </div>
    </div>

    <!-- General Tab (Admin / HR / Manager only) -->
    <form
      v-if="activeTab === 'general' && canEditCompany"
      @submit.prevent="saveCompanySettings"
      class="bg-white border border-[#DCDEDD] rounded-[16px] p-6"
    >
      <div class="flex items-center gap-3 mb-6">
        <div class="w-12 h-12 bg-blue-50 rounded-[12px] flex items-center justify-center">
          <Building class="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h3 class="text-brand-dark text-lg font-bold">Company Information</h3>
          <p class="text-brand-light text-sm">This information is used in headers, payslips, and reports.</p>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Input id="company_name" label="Company Name" v-model="companyForm.name" required />
        <Input id="company_email" type="email" label="Company Email" v-model="companyForm.email" required />
        <Input id="company_phone" label="Phone Number" v-model="companyForm.phone" />
        <Select
          id="timezone"
          label="Timezone"
          v-model="companyForm.timezone"
          :options="timezoneOptions"
        />
        <Input
          id="work_days"
          type="number"
          min="1"
          max="7"
          step="1"
          label="Work Days per Week"
          v-model="companyForm.work_days_per_week"
        />
      </div>

      <div class="mt-5">
        <TextArea
          id="company_address"
          label="Company Address"
          v-model="companyForm.address"
          placeholder="Enter full company address"
        />
      </div>

      <div class="flex justify-end mt-6">
        <button
          type="submit"
          :disabled="loading"
          class="btn-primary rounded-[12px] border border-[#2151A0] blue-gradient blue-btn-shadow hover:brightness-110 transition-all duration-300 px-6 py-3 disabled:opacity-60"
        >
          <span class="text-brand-white text-sm font-semibold">
            {{ loading ? "Saving..." : "Save Changes" }}
          </span>
        </button>
      </div>
    </form>

    <!-- Notifications Tab -->
    <div v-if="activeTab === 'notifications'" class="bg-white border border-[#DCDEDD] rounded-[16px] p-6">
      <div class="flex items-center gap-3 mb-6">
        <div class="w-12 h-12 bg-purple-50 rounded-[12px] flex items-center justify-center">
          <Bell class="w-6 h-6 text-purple-600" />
        </div>
        <div>
          <h3 class="text-brand-dark text-lg font-bold">Notification Preferences</h3>
          <p class="text-brand-light text-sm">Choose which notifications you want to receive.</p>
        </div>
      </div>

      <div class="space-y-3">
        <div
          v-for="(item, key) in {
            email_leave_request: 'Email when a new leave request is submitted',
            email_payroll_processed: 'Email when payroll processing is completed',
            email_attendance_alert: 'Email when there is a late attendance alert',
            push_task_assigned: 'Notification when a new task is assigned',
            push_task_due_soon: 'Notification when a task is approaching its deadline',
          }"
          :key="key"
          class="flex items-center justify-between p-4 border border-[#DCDEDD] rounded-[12px]"
        >
          <span class="text-brand-dark text-sm font-medium">{{ item }}</span>
          <button
            type="button"
            @click="toggleNotification(key)"
            class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300"
            :class="notifications[key] ? 'bg-[#0C51D9]' : 'bg-gray-300'"
          >
            <span
              class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300"
              :class="notifications[key] ? 'translate-x-6' : 'translate-x-1'"
            />
          </button>
        </div>
      </div>
    </div>

    <!-- Security Tab -->
    <form v-if="activeTab === 'security'" @submit.prevent="submitPasswordChange" class="bg-white border border-[#DCDEDD] rounded-[16px] p-6">
      <div class="flex items-center gap-3 mb-6">
        <div class="w-12 h-12 bg-red-50 rounded-[12px] flex items-center justify-center">
          <ShieldCheck class="w-6 h-6 text-red-600" />
        </div>
        <div>
          <h3 class="text-brand-dark text-lg font-bold">Change Password</h3>
          <p class="text-brand-light text-sm">Use a strong and unique password to keep your account secure.</p>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <PasswordInput
          ref="currentPasswordRef"
          id="current_password"
          label="Current Password"
          v-model="passwordForm.current_password"
          autocomplete="current-password"
          required
        />
        <div></div>
        <PasswordInput
          ref="newPasswordRef"
          id="new_password"
          label="New Password"
          v-model="passwordForm.new_password"
          autocomplete="new-password"
          required
        />
        <PasswordInput
          ref="confirmPasswordRef"
          id="new_password_confirmation"
          label="Confirm New Password"
          v-model="passwordForm.new_password_confirmation"
          autocomplete="new-password"
          required
        />
      </div>

      <div class="flex justify-end mt-6">
        <button
          type="submit"
          :disabled="loading"
          class="btn-primary rounded-[12px] border border-[#2151A0] blue-gradient blue-btn-shadow hover:brightness-110 transition-all duration-300 px-6 py-3 disabled:opacity-60"
        >
          <span class="text-brand-white text-sm font-semibold">
            {{ loading ? "Updating..." : "Update Password" }}
          </span>
        </button>
      </div>
    </form>
  </div>
</template>
