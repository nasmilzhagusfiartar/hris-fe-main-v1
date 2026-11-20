<script setup>
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { setLocale } from "@/plugins/i18n";

const { locale, t } = useI18n();

const currentLocale = computed(() => locale.value);

const choose = (lang) => {
  setLocale(lang);
};
</script>

<template>
  <div
    class="inline-flex items-center rounded-full border border-[#DCDEDD] bg-gray-50 p-0.5 text-xs font-bold"
    role="group"
    :aria-label="t('common.switchLanguage')"
  >
    <button
      type="button"
      @click="choose('en')"
      :aria-pressed="currentLocale === 'en'"
      class="px-2.5 py-1 rounded-full transition-all duration-200 cursor-pointer"
      :class="
        currentLocale === 'en'
          ? 'bg-[#0C51D9] text-white shadow-xs'
          : 'text-gray-600 hover:text-gray-900'
      "
    >
      EN
    </button>
    <button
      type="button"
      @click="choose('id')"
      :aria-pressed="currentLocale === 'id'"
      class="px-2.5 py-1 rounded-full transition-all duration-200 cursor-pointer"
      :class="
        currentLocale === 'id'
          ? 'bg-[#0C51D9] text-white shadow-xs'
          : 'text-gray-600 hover:text-gray-900'
      "
    >
      ID
    </button>
  </div>
</template>
