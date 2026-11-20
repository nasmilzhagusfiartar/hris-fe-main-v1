<script setup>
import { computed } from "vue";
import { RouterLink } from "vue-router";
import { useI18n } from "vue-i18n";
import { Zap } from "lucide-vue-next";
import { can } from "@/helpers/permissionHelper";

const props = defineProps({
  titleKey: { type: String, default: "quickActions.title" },
  subtitleKey: { type: String, default: "" },
  actions: {
    type: Array,
    required: true,
    // Each action: { key, labelKey, descKey?, icon, to?, onClick?, permission?, primary? }
  },
});

const { t } = useI18n();

const visibleActions = computed(() => {
  return (props.actions || []).filter((action) => {
    if (!action.to && typeof action.onClick !== "function") {
      return false;
    }
    if (action.permission) {
      return can(action.permission);
    }
    return true;
  });
});
</script>

<template>
  <div
    v-if="visibleActions.length > 0"
    class="bg-white border border-[#DCDEDD] rounded-[20px] p-5 sm:p-6"
  >
    <div class="flex items-center gap-3 mb-5">
      <div
        class="w-11 h-11 bg-blue-50 rounded-[12px] flex items-center justify-center shrink-0"
      >
        <Zap class="w-5 h-5 text-blue-600" />
      </div>
      <div>
        <h3 class="text-brand-dark text-base sm:text-lg font-bold leading-snug">
          {{ t(titleKey) }}
        </h3>
        <p v-if="subtitleKey" class="text-brand-light text-xs sm:text-sm font-normal">
          {{ t(subtitleKey) }}
        </p>
      </div>
    </div>

    <div class="space-y-3">
      <template v-for="action in visibleActions" :key="action.key">
        <RouterLink
          v-if="action.to"
          :to="action.to"
          :class="
            action.primary
              ? 'w-full rounded-[12px] border border-[#2151A0] blue-gradient blue-btn-shadow hover:brightness-110 px-4 py-3 flex items-center gap-3 text-left transition-all duration-200'
              : 'w-full border border-[#DCDEDD] rounded-[12px] hover:border-[#0C51D9] hover:border-2 hover:bg-gray-50 px-4 py-3 flex items-center gap-3 text-left transition-all duration-200'
          "
        >
          <component
            :is="action.icon"
            class="w-5 h-5 shrink-0"
            :class="action.primary ? 'text-white' : 'text-gray-600'"
          />
          <div class="flex-1 min-w-0">
            <h4
              class="text-sm font-semibold"
              :class="action.primary ? 'text-white' : 'text-brand-dark'"
            >
              {{ t(action.labelKey) }}
            </h4>
            <p
              v-if="action.descKey"
              class="text-xs mt-0.5"
              :class="action.primary ? 'text-blue-100' : 'text-brand-light'"
            >
              {{ t(action.descKey) }}
            </p>
          </div>
        </RouterLink>

        <button
          v-else
          type="button"
          @click="action.onClick"
          :class="
            action.primary
              ? 'w-full rounded-[12px] border border-[#2151A0] blue-gradient blue-btn-shadow hover:brightness-110 px-4 py-3 flex items-center gap-3 text-left transition-all duration-200 cursor-pointer'
              : 'w-full border border-[#DCDEDD] rounded-[12px] hover:border-[#0C51D9] hover:border-2 hover:bg-gray-50 px-4 py-3 flex items-center gap-3 text-left transition-all duration-200 cursor-pointer'
          "
        >
          <component
            :is="action.icon"
            class="w-5 h-5 shrink-0"
            :class="action.primary ? 'text-white' : 'text-gray-600'"
          />
          <div class="flex-1 min-w-0">
            <h4
              class="text-sm font-semibold"
              :class="action.primary ? 'text-white' : 'text-brand-dark'"
            >
              {{ t(action.labelKey) }}
            </h4>
            <p
              v-if="action.descKey"
              class="text-xs mt-0.5"
              :class="action.primary ? 'text-blue-100' : 'text-brand-light'"
            >
              {{ t(action.descKey) }}
            </p>
          </div>
        </button>
      </template>
    </div>
  </div>
</template>
