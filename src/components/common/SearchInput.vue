<script setup lang="ts">
import { ref } from "vue";
import { SearchIcon, XIcon } from "lucide-vue-next";

interface Props {
  modelValue?: string;
  placeholder?: string;
  clearable?: boolean;
  disabled?: boolean;
  inputClass?: string;
  ariaLabel?: string;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: "",
  placeholder: "Cari...",
  clearable: true,
  disabled: false,
  inputClass:
    "py-2.5 border border-[#DCDEDD] rounded-[14px] text-sm bg-white hover:border-[#0C51D9] focus:border-[#0C51D9] focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all duration-200",
  ariaLabel: "Search input",
});

const emit = defineEmits<{
  (e: "update:modelValue", value: string): void;
  (e: "input", event: Event): void;
  (e: "clear"): void;
  (e: "enter", event: KeyboardEvent): void;
  (e: "keydown", event: KeyboardEvent): void;
  (e: "focus", event: FocusEvent): void;
}>();

const inputRef = ref<HTMLInputElement | null>(null);

const onInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  emit("update:modelValue", target.value);
  emit("input", event);
};

const onClear = () => {
  emit("update:modelValue", "");
  emit("clear");
  inputRef.value?.focus();
};

const focus = () => {
  inputRef.value?.focus();
};

defineExpose({ focus, inputRef });
</script>

<template>
  <div class="relative w-full">
    <span
      class="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none text-gray-400"
      style="top: 50%; transform: translateY(-50%); left: 14px; pointer-events: none;"
      aria-hidden="true"
    >
      <SearchIcon
        class="w-[18px] h-[18px] shrink-0 text-gray-400"
        style="width: 18px; height: 18px;"
      />
    </span>

    <input
      ref="inputRef"
      type="text"
      :value="props.modelValue"
      :placeholder="props.placeholder"
      :disabled="props.disabled"
      :aria-label="props.ariaLabel || props.placeholder"
      :class="['w-full pl-11 pr-10 text-brand-dark', props.inputClass]"
      style="padding-left: 2.75rem; padding-right: 2.5rem;"
      @input="onInput"
      @keyup.enter="(e) => emit('enter', e)"
      @keydown="(e) => emit('keydown', e)"
      @focus="(e) => emit('focus', e)"
    />

    <button
      v-if="props.clearable && props.modelValue"
      type="button"
      aria-label="Hapus pencarian"
      class="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
      style="top: 50%; transform: translateY(-50%); right: 12px;"
      @click="onClear"
    >
      <XIcon class="w-3.5 h-3.5 shrink-0" style="width: 14px; height: 14px;" />
    </button>
  </div>
</template>

