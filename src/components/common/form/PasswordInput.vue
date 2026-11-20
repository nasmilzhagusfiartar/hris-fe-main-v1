<template>
  <div>
    <label
      v-if="label"
      :for="id"
      :class="
        compact
          ? 'block text-xs font-semibold text-gray-700 mb-1'
          : 'block mb-2 text-gray-700 font-semibold font-jakarta text-[14px]'
      "
    >
      {{ label }}
    </label>

    <div class="relative">
      <!-- Left Icon -->
      <div
        class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
      >
        <slot name="icon">
          <Lock :class="compact ? 'w-4 h-4 text-gray-400' : 'h-5 w-5 text-gray-400'" />
        </slot>
      </div>

      <input
        :id="id"
        :name="name || id"
        :type="isVisible ? 'text' : 'password'"
        :value="modelValue"
        :placeholder="placeholder"
        :required="required"
        :disabled="disabled"
        :autocomplete="autocomplete"
        :class="[
          compact
            ? 'w-full pl-10 pr-11 py-2.5 text-sm border rounded-xl focus:outline-none focus:border-[#0C51D9] transition-colors bg-white'
            : 'w-full pl-10 pr-12 border rounded-[16px] transition-all duration-300 hover:border-[#0C51D9] hover:border-2 focus:border-[#0C51D9] focus:border-2 focus:bg-white',
          borderColor,
        ]"
        :style="compact ? undefined : inputStyle"
        @input="emit('update:modelValue', $event.target.value)"
      />

      <!-- Right Toggle Visibility Button -->
      <button
        type="button"
        @click="toggleVisibility"
        :disabled="disabled"
        :aria-label="isVisible ? 'Hide password' : 'Show password'"
        :aria-pressed="isVisible"
        class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-700 focus:outline-none focus:text-[#0C51D9] transition-colors cursor-pointer disabled:opacity-50"
      >
        <EyeOff v-if="isVisible" :class="compact ? 'w-4 h-4' : 'w-5 h-5'" />
        <Eye v-else :class="compact ? 'w-4 h-4' : 'w-5 h-5'" />
      </button>
    </div>

    <p v-if="error" class="mt-2" :style="errorStyle">
      {{ error }}
    </p>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { Eye, EyeOff, Lock } from "lucide-vue-next";

const props = defineProps({
  id: { type: String, required: true },
  name: { type: String, default: "" },
  label: { type: String, default: "" },
  placeholder: { type: String, default: "" },
  required: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  compact: { type: Boolean, default: false },
  autocomplete: { type: String, default: "current-password" },
  modelValue: { type: String, default: "" },
  error: { type: String, default: "" },
});

const emit = defineEmits(["update:modelValue"]);

const isVisible = ref(false);

const toggleVisibility = () => {
  isVisible.value = !isVisible.value;
};

const hide = () => {
  isVisible.value = false;
};

defineExpose({ hide });

const borderColor = computed(() =>
  props.error ? "border-[#DC2626] border-2" : "border-[#DCDEDD]"
);

const inputStyle = {
  display: "flex",
  padding: "12px",
  paddingLeft: "40px",
  paddingRight: "46px",
  justifyContent: "flex-start",
  alignItems: "center",
  gap: "10px",
  background: "#ffffff",
};

const errorStyle = {
  color: "#dc2626",
  fontFamily: "Plus Jakarta Sans",
  fontSize: "14px",
  fontWeight: 400,
};
</script>
