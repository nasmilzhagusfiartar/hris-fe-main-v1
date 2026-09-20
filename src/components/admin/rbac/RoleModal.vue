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
          class="border-b border-[#E5E7EB] flex items-center justify-between bg-white"
          style="padding: 18px 24px;"
        >
          <div class="flex items-center gap-3.5">
            <div
              class="w-11 h-11 rounded-2xl flex items-center justify-center font-bold shrink-0"
              :class="
                isEdit
                  ? 'bg-amber-50 text-amber-600'
                  : 'bg-blue-50 text-[#0C51D9]'
              "
            >
              <Edit v-if="isEdit" class="w-5 h-5" />
              <ShieldPlus v-else class="w-5 h-5" />
            </div>
            <div>
              <h3 class="text-brand-dark text-base font-bold leading-tight">
                {{ isEdit ? "Ubah Nama Role" : "Tambah Role Baru" }}
              </h3>
              <p class="text-brand-light text-xs mt-1 leading-snug">
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
            class="w-9 h-9 rounded-xl border border-[#DCDEDD] flex items-center justify-center text-gray-400 hover:text-brand-dark hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 cursor-pointer shrink-0"
          >
            <X class="w-4 h-4" />
          </button>
        </div>

        <!-- Form Body -->
        <form @submit.prevent="handleSubmit" class="space-y-5" style="padding: 22px 24px;">
          <div>
            <label class="block text-brand-dark text-sm font-semibold mb-2">
              Nama Role <span class="text-red-500">*</span>
            </label>
            <input
              type="text"
              v-model="roleName"
              placeholder="Contoh: team-leader, quality-assurance, supervisor"
              class="w-full px-4 py-3 text-sm font-medium bg-white border rounded-2xl focus:outline-none focus:border-[#0C51D9] focus:ring-2 focus:ring-[#0C51D9]/10 placeholder:text-gray-400 transition-all"
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
              <span class="font-mono text-gray-600 font-medium">supervisor</span>).
            </p>
          </div>

          <!-- Footer Buttons -->
          <div class="flex items-center justify-end gap-3 pt-6 border-t border-[#F0F2F1]" style="padding-top: 20px;">
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
              :disabled="saving"
              class="btn-primary px-6 py-3 rounded-2xl border border-[#2151A0] blue-gradient blue-btn-shadow hover:brightness-110 focus:ring-2 focus:ring-[#0C51D9] text-white text-sm font-semibold transition-all duration-200 flex items-center gap-2 cursor-pointer disabled:opacity-50"
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
