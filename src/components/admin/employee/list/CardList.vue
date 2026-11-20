<script setup>
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import { can, isSuperAdmin } from "@/helpers/permissionHelper";
import { getImageUrl, handleImageError } from "@/helpers/imageHelper";
import { axiosInstance } from "@/plugins/axios";
import { useToastStore } from "@/stores/toast";
import _ from "lodash";
import {
  Building,
  User,
  Calendar,
  Eye,
  Edit,
  ShieldCheck,
  ShieldOff,
  RotateCcw,
  Crown,
} from "lucide-vue-next";
import { useRouter } from "vue-router";

const { t } = useI18n();
const router = useRouter();
const toast = useToastStore();

const props = defineProps({
  data: {
    type: Object,
    required: true,
  },
});

const resettingMfa = ref(false);
const localMfaEnabled = ref(!!props.data?.user?.mfa_enabled);

const targetRoles = computed(() =>
  (props.data?.user?.roles || []).map((r) =>
    typeof r === "string" ? r.toLowerCase() : (r?.name || "").toLowerCase()
  )
);
const isTargetSuperAdmin = computed(() => targetRoles.value.includes("super-admin"));
const isTargetAdmin = computed(() => targetRoles.value.includes("admin"));
const isTargetVendor = computed(
  () => String(props.data?.job_information?.employment_type || "").toLowerCase() === "vendor"
);
const canResetTargetMfa = computed(() => {
  if (!can("mfa.reset-user") || !localMfaEnabled.value) return false;
  if (isTargetSuperAdmin.value || isTargetAdmin.value) {
    return isSuperAdmin();
  }
  return true;
});

const goToEdit = () => {
  router.push({ name: "admin.employees.edit", params: { id: props.data.id } });
};

const goToDetail = () => {
  router.push({
    name: "admin.employees.detail",
    params: { id: props.data.id },
  });
};

const handleResetMfa = async () => {
  const userId = props.data?.user?.id;
  if (!userId || resettingMfa.value) return;
  if (
    !confirm(
      t("employee.confirmResetMfa", { name: props.data?.user?.name || "this user" })
    )
  ) {
    return;
  }

  resettingMfa.value = true;
  try {
    await axiosInstance.post(`/users/${userId}/mfa/reset`);
    localMfaEnabled.value = false;
    if (props.data?.user) {
      props.data.user.mfa_enabled = false;
    }
    toast.success(t("employee.mfaResetSuccess", { name: props.data?.user?.name }));
  } catch (err) {
    toast.error(err?.response?.data?.message || t("employee.mfaResetFailed"));
  } finally {
    resettingMfa.value = false;
  }
};
</script>

<template>
  <!-- Employee Card 1 -->
  <div
    class="border border-[#DCDEDD] rounded-[16px] hover:border-[#0C51D9] hover:border-2 hover:shadow-lg transition-all duration-300 p-4"
  >
    <div class="flex flex-col items-center mb-3">
      <div class="relative">
        <img
          :src="getImageUrl(data?.user?.profile_photo, data?.user?.name)"
          :alt="data?.user?.name || 'Employee'"
          class="w-20 h-20 rounded-full object-cover mb-3"
          @error="(e) => handleImageError(e, data?.user?.name)"
        />
        <!-- Active Badge Overlapped at Bottom -->
        <span
          class="absolute bottom-2 left-1/2 transform -translate-x-1/2 px-2 py-1 rounded-md text-xs font-semibold bg-[#F0FDF4] text-[#166534]"
        >
          {{ _.capitalize(data?.job_information?.status) }}
        </span>
      </div>
    </div>
    <div class="flex items-center justify-between mb-3">
      <div class="text-left">
        <div class="flex items-center gap-1.5 flex-wrap">
          <h4
            class="text-[#0C1C3C] font-['Plus_Jakarta_Sans'] text-[16px] font-bold"
          >
            {{ data?.user?.name }}
          </h4>
          <span
            v-if="isTargetSuperAdmin"
            class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300"
          >
            <Crown class="w-3 h-3" />
            {{ t("roles.super-admin") }}
          </span>
          <span
            v-if="isTargetVendor"
            class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-purple-100 text-purple-800 border border-purple-200"
          >
            {{ t("enums.vendor") }}
          </span>
        </div>
        <p
          class="mt-1 text-[#6B7280] font-['Plus_Jakarta_Sans'] text-[14px] font-normal"
        >
          {{ _.capitalize(data?.job_information?.job_title) }}
        </p>
        <p
          v-if="isTargetVendor && data?.job_information?.vendor_name"
          class="text-xs text-purple-700 font-medium mt-0.5"
        >
          {{ data.job_information.vendor_name }}
          <span v-if="data?.job_information?.store?.name">
            • {{ data.job_information.store.name }}
          </span>
        </p>
        <p
          v-else-if="data?.job_information?.store?.name"
          class="text-xs text-blue-700 font-medium mt-0.5"
        >
          {{ data.job_information.store.name }}
        </p>
      </div>
      <span
        class="px-2 py-1 rounded-md text-xs font-semibold bg-[#EBF8FF] text-[#1E40AF]"
      >
        {{ _.capitalize(data?.job_information?.skill_level) }}
      </span>
    </div>

    <!-- Divider -->
    <div class="border-b border-[#DCDEDD] mb-3"></div>

    <!-- Employee Details -->
    <div class="space-y-2 mb-4">
      <div class="flex items-center gap-2 text-sm text-gray-500">
        <Building class="w-3.5 h-3.5" />
        <span>{{ _.capitalize(data?.job_information?.work_location) }}</span>
      </div>
      <div class="flex items-center gap-2 text-sm text-gray-500">
        <User class="w-3.5 h-3.5" />
        <span>{{ _.capitalize(data?.gender) }}</span>
      </div>
      <div class="flex items-center gap-2 text-sm text-gray-500">
        <Calendar class="w-3.5 h-3.5" />
        <span>{{ t("employee.yearsExperience", { count: data?.job_information?.years_experience || 0 }) }}</span>
      </div>
      <!-- MFA Status Badge & Admin Reset -->
      <div class="flex items-center justify-between gap-2 pt-1">
        <span
          class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold"
          :class="
            localMfaEnabled
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-gray-100 text-gray-600 border border-gray-200'
          "
        >
          <ShieldCheck v-if="localMfaEnabled" class="w-3.5 h-3.5" />
          <ShieldOff v-else class="w-3.5 h-3.5" />
          <span>{{ localMfaEnabled ? t("employee.mfaEnabled") : t("employee.mfaDisabled") }}</span>
        </span>

        <button
          v-if="canResetTargetMfa"
          type="button"
          @click="handleResetMfa"
          :disabled="resettingMfa"
          class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors cursor-pointer disabled:opacity-50"
        >
          <RotateCcw class="w-3 h-3" :class="{ 'animate-spin': resettingMfa }" />
          <span>{{ resettingMfa ? t("employee.resetting") : t("employee.resetMfa") }}</span>
        </button>
      </div>
    </div>
    <div class="flex gap-2">
      <button
        @click="goToEdit"
        class="flex-1 border border-[#DCDEDD] rounded-[8px] hover:border-[#0C51D9] hover:border-2 hover:bg-gray-50 transition-all duration-300 px-4 py-3 flex items-center justify-center gap-2"
        v-if="can('employee-edit') && !isTargetSuperAdmin"
      >
        <Edit class="w-4 h-4 text-gray-600" />
        <span class="text-brand-dark text-sm font-semibold">{{ t("common.edit") }}</span>
      </button>
      <button
        @click="goToDetail"
        class="flex-1 border border-[#DCDEDD] rounded-[8px] hover:border-[#0C51D9] hover:border-2 hover:bg-gray-50 transition-all duration-300 px-4 py-3 flex items-center justify-center gap-2"
      >
        <Eye class="w-4 h-4 text-gray-600" />
        <span class="text-brand-dark text-sm font-semibold">{{ t("common.view") }}</span>
      </button>
    </div>
  </div>
</template>
