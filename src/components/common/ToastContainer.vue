<script setup>
import { useToastStore } from "@/stores/toast";
import { storeToRefs } from "pinia";
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  X,
} from "lucide-vue-next";

const toastStore = useToastStore();
const { toasts } = storeToRefs(toastStore);
const { removeToast } = toastStore;
</script>

<template>
  <div
    class="fixed top-5 right-5 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none px-4 sm:px-0"
    aria-live="assertive"
  >
    <TransitionGroup
      enter-active-class="transform ease-out duration-300 transition"
      enter-from-class="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-4"
      enter-to-class="translate-y-0 opacity-100 sm:translate-x-0"
      leave-active-class="transition ease-in duration-200"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="pointer-events-auto w-full bg-white rounded-[16px] border shadow-lg overflow-hidden flex items-start p-4 gap-3 transition-all duration-300"
        :class="{
          'border-green-200 shadow-green-100/50': toast.type === 'success',
          'border-red-200 shadow-red-100/50': toast.type === 'error',
          'border-amber-200 shadow-amber-100/50': toast.type === 'warning',
          'border-blue-200 shadow-blue-100/50': toast.type === 'info',
        }"
      >
        <!-- Type Icon -->
        <div class="shrink-0 mt-0.5">
          <div
            class="w-8 h-8 rounded-full flex items-center justify-center"
            :class="{
              'bg-green-100 text-green-600': toast.type === 'success',
              'bg-red-100 text-red-600': toast.type === 'error',
              'bg-amber-100 text-amber-600': toast.type === 'warning',
              'bg-blue-100 text-blue-600': toast.type === 'info',
            }"
          >
            <CheckCircle2 v-if="toast.type === 'success'" class="w-4 h-4" />
            <AlertCircle v-else-if="toast.type === 'error'" class="w-4 h-4" />
            <AlertTriangle v-else-if="toast.type === 'warning'" class="w-4 h-4" />
            <Info v-else class="w-4 h-4" />
          </div>
        </div>

        <!-- Content -->
        <div class="flex-1 min-w-0">
          <h4
            v-if="toast.title"
            class="text-sm font-bold text-brand-dark leading-tight mb-0.5"
          >
            {{ toast.title }}
          </h4>
          <p class="text-xs text-gray-600 leading-relaxed break-words">
            {{ toast.message }}
          </p>
        </div>

        <!-- Close button -->
        <button
          @click="removeToast(toast.id)"
          class="shrink-0 text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100 transition-colors"
        >
          <X class="w-4 h-4" />
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>
