<script setup>
import { ref, watch, computed } from "vue";
import { X, ShieldPlus, Edit, Loader2 } from "lucide-vue-next";

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  role: {
    type: Object,
    default: null,
  },
  saving: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["close", "submit"]);

const roleName = ref("");
const errorMessage = ref("");

const isEdit = computed(() => !!props.role?.id);

watch(
  () => [props.show, props.role],
  () => {
    if (props.show) {
      roleName.value = props.role?.name || "";
      errorMessage.value = "";
    }
  },
  { immediate: true }
);

const handleSubmit = () => {
  const trimmed = roleName.value.trim().toLowerCase();
  if (!trimmed) {
    errorMessage.value = "Nama role wajib diisi.";
    return;
  }
  if (trimmed.length < 2) {
    errorMessage.value = "Nama role minimal 2 karakter.";
    return;
  }
  errorMessage.value = "";
  emit("submit", trimmed);
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
        class="bg-white rounded-[24px] shadow-2xl w-full max-w-md overflow-hidden border border-[#DCDEDD] animate-in fade-in zoom-in-95 duration-200"
      >
        <!-- Modal Header -->
        <div
          class="px-6 py-5 border-b border-[#DCDEDD] flex items-center justify-between bg-white"
        >
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 rounded-xl bg-blue-50 text-[#0C51D9] flex items-center justify-center font-bold"
            >
              <Edit v-if="isEdit" class="w-5 h-5" />
              <ShieldPlus v-else class="w-5 h-5" />
            </div>
            <div>
              <h3 class="text-brand-dark text-lg font-bold">
                {{ isEdit ? "Ubah Nama Role" : "Tambah Role Baru" }}
              </h3>
              <p class="text-brand-light text-xs mt-0.5">
                {{
                  isEdit
                    ? "Perbarui nama role kustom ini."
                    : "Buat role baru untuk kebutuhan hak akses."
                }}
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

        <!-- Form Body -->
        <form @submit.prevent="handleSubmit" class="p-6 space-y-4">
          <div>
            <label class="block text-brand-dark text-sm font-semibold mb-2">
              Nama Role <span class="text-red-500">*</span>
            </label>
            <input
              type="text"
              v-model="roleName"
              placeholder="Contoh: team-leader, quality-assurance, supervisor"
              class="w-full px-4 py-3 text-sm bg-white border rounded-xl focus:outline-none focus:border-[#0C51D9] focus:ring-1 focus:ring-[#0C51D9] transition-all"
              :class="
                errorMessage
                  ? 'border-red-400 bg-red-50/20'
                  : 'border-[#DCDEDD]'
              "
              autofocus
            />
            <p v-if="errorMessage" class="text-red-500 text-xs mt-1.5 font-medium">
              {{ errorMessage }}
            </p>
            <p v-else class="text-gray-400 text-xs mt-1.5">
              Gunakan huruf kecil atau tanda strip (misal:
              <span class="font-mono text-gray-600">supervisor</span>).
            </p>
          </div>

          <!-- Footer Buttons -->
          <div class="flex items-center justify-end gap-3 pt-4 border-t border-[#F0F2F1]">
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
              :disabled="saving"
              class="btn-primary px-5 py-2.5 rounded-[8px] border border-[#2151A0] blue-gradient blue-btn-shadow hover:brightness-110 focus:ring-2 focus:ring-[#0C51D9] text-white text-sm font-semibold transition-all duration-200 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Loader2 v-if="saving" class="w-4 h-4 animate-spin" />
              <span>{{ saving ? "Menyimpan..." : isEdit ? "Perbarui" : "Buat Role" }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </Transition>
</template>
