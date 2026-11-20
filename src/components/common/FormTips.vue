<script setup>
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import { Lightbulb, Check, ChevronDown, ChevronUp } from "lucide-vue-next";

const props = defineProps({
  titleKey: { type: String, required: true },
  subtitleKey: { type: String, default: "" },
  items: {
    type: Array,
    required: true,
    // Each item: { titleKey: string, descKey: string }
  },
  defaultOpen: { type: Boolean, default: true },
  accent: {
    type: String,
    default: "amber", // 'amber' | 'green' | 'blue'
  },
});

const { t } = useI18n();
const isOpen = ref(props.defaultOpen);

const accentClasses = computed(() => {
  if (props.accent === "green") {
    return {
      iconBg: "bg-green-50",
      iconText: "text-green-600",
    };
  }
  if (props.accent === "blue") {
    return {
      iconBg: "bg-blue-50",
      iconText: "text-blue-600",
    };
  }
  return {
    iconBg: "bg-yellow-50",
    iconText: "text-yellow-600",
  };
});

const visibleItems = computed(() => (props.items || []).slice(0, 4));
</script>

<template>
  <div class="bg-white border border-[#DCDEDD] rounded-[20px] p-5 sm:p-6">
    <button
      type="button"
      @click="isOpen = !isOpen"
      :aria-expanded="isOpen"
      class="w-full flex items-center justify-between gap-3 text-left cursor-pointer"
    >
      <div class="flex items-center gap-3 min-w-0">
        <div
          class="w-11 h-11 rounded-[12px] flex items-center justify-center shrink-0"
          :class="accentClasses.iconBg"
        >
          <Lightbulb class="w-5 h-5" :class="accentClasses.iconText" />
        </div>
        <div class="min-w-0">
          <h3 class="text-brand-dark text-base sm:text-lg font-bold leading-snug">
            {{ t(titleKey) }}
          </h3>
          <p v-if="subtitleKey" class="text-brand-light text-xs sm:text-sm font-normal">
            {{ t(subtitleKey) }}
          </p>
        </div>
      </div>

      <span
        class="w-8 h-8 rounded-full border border-[#DCDEDD] flex items-center justify-center text-gray-500 hover:border-[#0C51D9] hover:text-[#0C51D9] transition-colors shrink-0"
      >
        <ChevronUp v-if="isOpen" class="w-4 h-4" />
        <ChevronDown v-else class="w-4 h-4" />
      </span>
    </button>

    <div v-show="isOpen" class="space-y-4 mt-5 pt-4 border-t border-gray-100">
      <div
        v-for="(item, idx) in visibleItems"
        :key="idx"
        class="flex items-start gap-3"
      >
        <div
          class="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center shrink-0 mt-0.5"
        >
          <Check class="w-3 h-3 text-green-600" />
        </div>
        <div>
          <p class="text-brand-dark text-sm font-semibold">
            {{ t(item.titleKey) }}
          </p>
          <p class="text-brand-light text-xs font-normal mt-0.5 leading-relaxed">
            {{ t(item.descKey) }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
