<script setup>
import { ref, computed, watch } from "vue";
import { X, KeyRound, Loader2, Sparkles, Plus, Layers } from "lucide-vue-next";

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  existingModules: {
    type: Array,
    default: () => [],
  },
  saving: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["close", "submit"]);

const inputMode = ref("builder"); // 'builder' or 'manual'

// Builder State
const selectedModule = ref("");
const customModule = ref("");
const isCustomModule = ref(false);

const selectedAction = ref("");
const customAction = ref("");
const isCustomAction = ref(false);

// Manual State
const manualName = ref("");
const errorMessage = ref("");

// Common action suggestions
const commonActions = [
  "view",
  "list",
  "create",
  "edit",
  "delete",
  "export",
  "import",
  "approve",
  "reject",
  "process",
  "menu",
];

// Reset state on open
watch(
  () => props.show,
  (val) => {
    if (val) {
      inputMode.value = "builder";
      selectedModule.value = props.existingModules[0] || "employee";
      customModule.value = "";
      isCustomModule.value = false;

      selectedAction.value = "view";
      customAction.value = "";
      isCustomAction.value = false;

      manualName.value = "";
      errorMessage.value = "";
    }
  },
  { immediate: true }
);

// Effective module name
const effectiveModule = computed(() => {
  if (isCustomModule.value) {
    return customModule.value.trim().toLowerCase().replace(/\s+/g, "-");
  }
  return selectedModule.value.trim().toLowerCase();
});

// Effective action name
const effectiveAction = computed(() => {
  if (isCustomAction.value) {
    return customAction.value.trim().toLowerCase().replace(/\s+/g, "-");
  }
  return selectedAction.value.trim().toLowerCase();
});

// Full generated permission name
const generatedPermissionName = computed(() => {
  if (inputMode.value === "manual") {
    return manualName.value.trim().toLowerCase().replace(/\s+/g, "-");
  }
  if (!effectiveModule.value || !effectiveAction.value) return "";
  return `${effectiveModule.value}-${effectiveAction.value}`;
});

const handleSubmit = () => {
  const permName = generatedPermissionName.value;

  if (!permName) {
    errorMessage.value = "Nama permission tidak boleh kosong.";
    return;
  }

  if (permName.length < 3) {
    errorMessage.value = "Nama permission minimal 3 karakter.";
    return;
  }

  if (!permName.includes("-")) {
    errorMessage.value =
      "Nama permission disarankan menggunakan format modul-aksi (contoh: report-export).";
    return;
  }

  errorMessage.value = "";
  emit("submit", permName);
};
</script>

<template>
  <Transition
    enter-active-class="transition duration-300 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="show"
      class="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      @click.self="emit('close')"
    >
      <div
        class="bg-white rounded-[24px] shadow-2xl w-full max-w-lg overflow-hidden border border-[#DCDEDD] animate-in fade-in zoom-in-95 duration-200"
      >
        <!-- Header -->
        <div
          class="px-6 py-5 border-b border-[#DCDEDD] flex items-center justify-between bg-white"
        >
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold"
            >
              <KeyRound class="w-5 h-5" />
            </div>
            <div>
              <h3 class="text-brand-dark text-lg font-bold">
                Tambah Permission Baru
              </h3>
              <p class="text-brand-light text-xs mt-0.5">
                Daftarkan permission baru ke dalam sistem untuk dipasang pada role.
              </p>
            </div>
          </div>

          <button
            type="button"
            @click="emit('close')"
            class="w-8 h-8 rounded-full border border-[#DCDEDD] flex items-center justify-center text-gray-400 hover:text-brand-dark hover:border-gray-400 transition-colors"
          >
            <X class="w-4 h-4" />
          </button>
        </div>

        <!-- Mode Tabs -->
        <div class="px-6 pt-4 bg-gray-50/50 border-b border-[#E9EBEA]">
          <div class="flex items-center gap-2">
            <button
              type="button"
              @click="inputMode = 'builder'"
              class="px-3 py-2 text-xs font-semibold rounded-t-xl border-b-2 transition-all flex items-center gap-1.5"
              :class="
                inputMode === 'builder'
                  ? 'border-[#0C51D9] text-[#0C51D9] bg-white'
                  : 'border-transparent text-gray-500 hover:text-brand-dark'
              "
            >
              <Sparkles class="w-3.5 h-3.5" />
              <span>Permission Builder (Direkomendasikan)</span>
            </button>
            <button
              type="button"
              @click="inputMode = 'manual'"
              class="px-3 py-2 text-xs font-semibold rounded-t-xl border-b-2 transition-all flex items-center gap-1.5"
              :class="
                inputMode === 'manual'
                  ? 'border-[#0C51D9] text-[#0C51D9] bg-white'
                  : 'border-transparent text-gray-500 hover:text-brand-dark'
              "
            >
              <Layers class="w-3.5 h-3.5" />
              <span>Input Langsung</span>
            </button>
          </div>
        </div>

        <!-- Form Body -->
        <form @submit.prevent="handleSubmit" class="p-6 space-y-5">
          <!-- BUILDER MODE -->
          <div v-if="inputMode === 'builder'" class="space-y-4">
            <!-- Module / Group -->
            <div>
              <div class="flex items-center justify-between mb-1.5">
                <label class="text-brand-dark text-xs font-semibold">
                  1. Modul / Grup Fitur
                </label>
                <button
                  type="button"
                  @click="isCustomModule = !isCustomModule"
                  class="text-[11px] text-[#0C51D9] font-medium hover:underline cursor-pointer"
                >
                  {{ isCustomModule ? "Pilih modul yang ada" : "+ Ketik modul baru" }}
                </button>
              </div>

              <div v-if="!isCustomModule">
                <select
                  v-model="selectedModule"
                  class="w-full px-3.5 py-2.5 text-sm bg-white border border-[#DCDEDD] rounded-xl focus:outline-none focus:border-[#0C51D9] focus:ring-1 focus:ring-[#0C51D9]"
                >
                  <option
                    v-for="mod in existingModules"
                    :key="mod"
                    :value="mod"
                  >
                    {{ mod }}
                  </option>
                </select>
              </div>

              <div v-else>
                <input
                  type="text"
                  v-model="customModule"
                  placeholder="Contoh: audit-log, recruitment, asset"
                  class="w-full px-3.5 py-2.5 text-sm bg-white border border-[#DCDEDD] rounded-xl focus:outline-none focus:border-[#0C51D9] focus:ring-1 focus:ring-[#0C51D9]"
                  autofocus
                />
              </div>
            </div>

            <!-- Action Name -->
            <div>
              <div class="flex items-center justify-between mb-1.5">
                <label class="text-brand-dark text-xs font-semibold">
                  2. Aksi (Action)
                </label>
                <button
                  type="button"
                  @click="isCustomAction = !isCustomAction"
                  class="text-[11px] text-[#0C51D9] font-medium hover:underline cursor-pointer"
                >
                  {{ isCustomAction ? "Pilih aksi umum" : "+ Ketik aksi custom" }}
                </button>
              </div>

              <div v-if="!isCustomAction">
                <select
                  v-model="selectedAction"
                  class="w-full px-3.5 py-2.5 text-sm bg-white border border-[#DCDEDD] rounded-xl focus:outline-none focus:border-[#0C51D9] focus:ring-1 focus:ring-[#0C51D9]"
                >
                  <option
                    v-for="act in commonActions"
                    :key="act"
                    :value="act"
                  >
                    {{ act }}
                  </option>
                </select>
              </div>

              <div v-else>
                <input
                  type="text"
                  v-model="customAction"
                  placeholder="Contoh: download-pdf, verify, sync"
                  class="w-full px-3.5 py-2.5 text-sm bg-white border border-[#DCDEDD] rounded-xl focus:outline-none focus:border-[#0C51D9] focus:ring-1 focus:ring-[#0C51D9]"
                />
              </div>
            </div>
          </div>

          <!-- MANUAL MODE -->
          <div v-else class="space-y-2">
            <label class="block text-brand-dark text-xs font-semibold">
              Nama Permission Lengkap
            </label>
            <input
              type="text"
              v-model="manualName"
              placeholder="Contoh: report-export, audit-log-view"
              class="w-full px-3.5 py-2.5 text-sm bg-white border border-[#DCDEDD] rounded-xl focus:outline-none focus:border-[#0C51D9] focus:ring-1 focus:ring-[#0C51D9]"
              autofocus
            />
            <p class="text-[11px] text-gray-400">
              Gunakan tanda strip sebagai pemisah (contoh:
              <span class="font-mono text-gray-600">inventory-manage</span>).
            </p>
          </div>

          <!-- Live Preview Box -->
          <div
            class="bg-blue-50/60 border border-blue-200/80 rounded-2xl p-4 flex items-center justify-between"
          >
            <div>
              <p class="text-[11px] font-semibold text-blue-900/70 uppercase tracking-wider">
                Hasil Nama Permission:
              </p>
              <p class="text-sm font-bold text-blue-900 font-mono mt-0.5">
                {{ generatedPermissionName || "(Lengkapi input terlebih dahulu)" }}
              </p>
            </div>
            <span
              v-if="generatedPermissionName"
              class="px-2.5 py-1 rounded-full text-xs font-bold bg-[#0C51D9] text-white"
            >
              Ready
            </span>
          </div>

          <!-- Error Alert -->
          <p v-if="errorMessage" class="text-red-500 text-xs font-medium">
            {{ errorMessage }}
          </p>

          <!-- Footer Actions -->
          <div class="flex items-center justify-end gap-3 pt-3 border-t border-[#F0F2F1]">
            <button
              type="button"
              @click="emit('close')"
              :disabled="saving"
              class="px-5 py-2.5 rounded-[8px] border border-[#DCDEDD] hover:bg-gray-50 text-sm font-semibold text-brand-dark transition-all duration-200 cursor-pointer disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              :disabled="saving || !generatedPermissionName"
              class="btn-primary px-5 py-2.5 rounded-[8px] border border-[#2151A0] blue-gradient blue-btn-shadow hover:brightness-110 focus:ring-2 focus:ring-[#0C51D9] text-white text-sm font-semibold transition-all duration-200 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Loader2 v-if="saving" class="w-4 h-4 animate-spin" />
              <span>{{ saving ? "Menyimpan..." : "Tambah Permission" }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </Transition>
</template>
