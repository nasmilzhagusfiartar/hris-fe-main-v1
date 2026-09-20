<script setup>
import { ref, computed, watch } from "vue";
import { X, KeyRound, Loader2, Sparkles, Pencil } from "lucide-vue-next";

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
  // Edit mode props
  editPermission: {
    type: Object,
    default: null, // { id, name, action, module }
  },
});

const emit = defineEmits(["close", "submit"]);

// Builder State
const selectedModule = ref("");
const customModule = ref("");
const isCustomModule = ref(false);

const selectedAction = ref("");
const customAction = ref("");
const isCustomAction = ref(false);

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

// Determine if we are in edit mode
const isEditMode = computed(() => !!props.editPermission);

// Reset state on open
watch(
  () => props.show,
  (val) => {
    if (val) {
      errorMessage.value = "";

      if (props.editPermission) {
        // Edit mode: parse existing permission name
        const perm = props.editPermission;
        const permModule = perm.module || "";
        const permAction = perm.action || "";

        // Set module
        if (props.existingModules.includes(permModule)) {
          selectedModule.value = permModule;
          isCustomModule.value = false;
          customModule.value = "";
        } else if (permModule) {
          isCustomModule.value = true;
          customModule.value = permModule;
          selectedModule.value = "";
        } else {
          // Try to parse from name
          const parts = perm.name.split("-");
          if (parts.length >= 2) {
            const mod = parts[0];
            if (props.existingModules.includes(mod)) {
              selectedModule.value = mod;
              isCustomModule.value = false;
            } else {
              isCustomModule.value = true;
              customModule.value = mod;
            }
          }
        }

        // Set action
        if (permAction && commonActions.includes(permAction)) {
          selectedAction.value = permAction;
          isCustomAction.value = false;
          customAction.value = "";
        } else if (permAction) {
          isCustomAction.value = true;
          customAction.value = permAction;
          selectedAction.value = "";
        } else {
          // Try to parse from name
          const parts = perm.name.split("-");
          if (parts.length >= 2) {
            const act = parts.slice(1).join("-");
            if (commonActions.includes(act)) {
              selectedAction.value = act;
              isCustomAction.value = false;
            } else {
              isCustomAction.value = true;
              customAction.value = act;
            }
          }
        }
      } else {
        // Create mode: reset to defaults
        selectedModule.value = props.existingModules[0] || "employee";
        customModule.value = "";
        isCustomModule.value = false;

        selectedAction.value = "view";
        customAction.value = "";
        isCustomAction.value = false;
      }
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
      "Nama permission harus menggunakan format modul-aksi (contoh: report-export).";
    return;
  }

  errorMessage.value = "";

  if (isEditMode.value) {
    emit("submit", { id: props.editPermission.id, name: permName });
  } else {
    emit("submit", permName);
  }
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
        class="bg-white rounded-[24px] shadow-2xl w-full max-w-xl overflow-hidden border border-[#DCDEDD]"
      >
        <!-- Header -->
        <div
          class="px-8 py-4 border-b border-[#E5E7EB] flex items-center justify-between"
        >
          <div class="flex items-center gap-4">
            <div
              class="w-12 h-12 rounded-2xl flex items-center justify-center font-bold shrink-0"
              :class="
                isEditMode
                  ? 'bg-amber-50 text-amber-600'
                  : 'bg-purple-50 text-purple-700'
              "
            >
              <Pencil v-if="isEditMode" class="w-5 h-5" />
              <KeyRound v-else class="w-5 h-5" />
            </div>
            <div>
              <h3 class="text-brand-dark text-lg font-bold leading-tight">
                {{ isEditMode ? "Edit Permission" : "Tambah Permission Baru" }}
              </h3>
              <p class="text-brand-light text-[13px] mt-1 leading-snug">
                {{
                  isEditMode
                    ? "Ubah konfigurasi permission yang sudah ada."
                    : "Daftarkan permission baru untuk dipasang pada role."
                }}
              </p>
            </div>
          </div>

          <button
            type="button"
            @click="emit('close')"
            class="w-9 h-9 rounded-xl border border-[#DCDEDD] flex items-center justify-center text-gray-400 hover:text-brand-dark hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 cursor-pointer shrink-0"
          >
            <X class="w-4 h-4" />
          </button>
        </div>

        <!-- Form Body -->
        <form @submit.prevent="handleSubmit" class="px-8 py-4 space-y-6">
          <!-- Module / Group -->
          <div>
            <div class="flex items-center justify-between mb-2">
              <label class="text-brand-dark text-[13px] font-semibold">
                Modul / Grup Fitur
              </label>
              <button
                type="button"
                @click="isCustomModule = !isCustomModule"
                class="text-[12px] text-[#0C51D9] font-medium hover:underline cursor-pointer transition-colors"
              >
                {{ isCustomModule ? "Pilih modul yang ada" : "+ Modul baru" }}
              </button>
            </div>

            <div v-if="!isCustomModule">
              <select
                v-model="selectedModule"
                class="w-full px-4 py-3 text-sm font-medium bg-white border border-[#DCDEDD] rounded-2xl focus:outline-none focus:border-[#0C51D9] focus:ring-2 focus:ring-[#0C51D9]/10 transition-all duration-200 appearance-none capitalize"
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
                class="w-full px-4 py-3 text-sm font-medium bg-white border border-[#DCDEDD] rounded-2xl focus:outline-none focus:border-[#0C51D9] focus:ring-2 focus:ring-[#0C51D9]/10 placeholder:text-gray-400 transition-all duration-200"
                autofocus
              />
            </div>
          </div>

          <!-- Action Name -->
          <div>
            <div class="flex items-center justify-between mb-2">
              <label class="text-brand-dark text-[13px] font-semibold">
                Aksi (Action)
              </label>
              <button
                type="button"
                @click="isCustomAction = !isCustomAction"
                class="text-[12px] text-[#0C51D9] font-medium hover:underline cursor-pointer transition-colors"
              >
                {{ isCustomAction ? "Pilih aksi umum" : "+ Aksi custom" }}
              </button>
            </div>

            <div v-if="!isCustomAction">
              <select
                v-model="selectedAction"
                class="w-full px-4 py-3 text-sm font-medium bg-white border border-[#DCDEDD] rounded-2xl focus:outline-none focus:border-[#0C51D9] focus:ring-2 focus:ring-[#0C51D9]/10 transition-all duration-200 appearance-none capitalize"
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
                class="w-full px-4 py-3 text-sm font-medium bg-white border border-[#DCDEDD] rounded-2xl focus:outline-none focus:border-[#0C51D9] focus:ring-2 focus:ring-[#0C51D9]/10 placeholder:text-gray-400 transition-all duration-200"
              />
            </div>
          </div>

          <!-- Live Preview Box -->
          <div
            class="bg-gradient-to-r from-blue-50/80 to-indigo-50/60 border border-blue-200/60 rounded-2xl px-5 py-4 flex items-center justify-between gap-3"
          >
            <div class="min-w-0">
              <p class="text-[11px] font-semibold text-blue-800/60 uppercase tracking-wider mb-1">
                Hasil Permission Key
              </p>
              <p class="text-[15px] font-bold text-blue-900 font-mono truncate">
                {{ generatedPermissionName || "—" }}
              </p>
            </div>
            <span
              v-if="generatedPermissionName"
              class="px-3 py-1.5 rounded-full text-[11px] font-bold shrink-0"
              :class="
                isEditMode
                  ? 'bg-amber-100 text-amber-700 border border-amber-200'
                  : 'bg-[#0C51D9] text-white'
              "
            >
              {{ isEditMode ? "Modified" : "Ready" }}
            </span>
          </div>

          <!-- Error Alert -->
          <div
            v-if="errorMessage"
            class="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-start gap-2.5"
          >
            <span class="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0"></span>
            <p class="text-red-600 text-[13px] font-medium">{{ errorMessage }}</p>
          </div>

          <!-- Footer Actions -->
          <div class="flex items-center justify-end gap-3 pt-4 border-t border-[#F0F2F1]">
            <button
              type="button"
              @click="emit('close')"
              :disabled="saving"
              class="px-6 py-3 rounded-2xl border border-[#DCDEDD] hover:bg-gray-50 text-sm font-semibold text-brand-dark transition-all duration-200 cursor-pointer disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              :disabled="saving || !generatedPermissionName"
              class="btn-primary px-6 py-3 rounded-2xl border border-[#2151A0] blue-gradient blue-btn-shadow hover:brightness-110 focus:ring-2 focus:ring-[#0C51D9] text-white text-sm font-semibold transition-all duration-200 flex items-center gap-2.5 cursor-pointer disabled:opacity-50"
            >
              <Loader2 v-if="saving" class="w-4 h-4 animate-spin" />
              <Sparkles v-else-if="!isEditMode" class="w-4 h-4" />
              <Pencil v-else class="w-4 h-4" />
              <span>{{
                saving
                  ? "Menyimpan..."
                  : isEditMode
                  ? "Simpan Perubahan"
                  : "Tambah Permission"
              }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </Transition>
</template>
