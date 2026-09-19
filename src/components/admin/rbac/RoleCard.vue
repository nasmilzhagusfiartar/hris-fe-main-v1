<script setup>
import { ShieldCheck, Shield, Key, Edit, Trash2, Layers } from "lucide-vue-next";
import { capitalize } from "@/utils/formatUtils";

const props = defineProps({
  role: {
    type: Object,
    required: true,
  },
  totalAvailablePermissions: {
    type: Number,
    default: 45,
  },
});

const emit = defineEmits(["managePermissions", "editRole", "deleteRole"]);

const getRoleGradient = (roleName) => {
  const map = {
    manager: "from-blue-600 to-indigo-700",
    hr: "from-emerald-600 to-teal-700",
    finance: "from-amber-500 to-orange-600",
    employee: "from-purple-600 to-violet-700",
  };
  return map[roleName?.toLowerCase()] || "from-primary-500 to-primary-600";
};
</script>

<template>
  <div
    class="border border-[#DCDEDD] rounded-[16px] bg-white hover:border-[#0C51D9] hover:border-2 hover:shadow-lg transition-all duration-300 p-5 flex flex-col justify-between"
  >
    <div>
      <!-- Card Top: Avatar, Name & Badge -->
      <div class="flex items-start justify-between gap-3">
        <div class="flex items-center gap-3.5">
          <div
            class="w-14 h-14 relative flex items-center justify-center rounded-[12px] overflow-hidden shrink-0"
          >
            <div
              class="w-full h-full absolute bg-gradient-to-br rounded-[12px]"
              :class="getRoleGradient(role.name)"
            ></div>
            <ShieldCheck
              v-if="role.is_system_role"
              class="w-6 h-6 text-white relative z-10"
            />
            <Shield v-else class="w-6 h-6 text-white relative z-10" />
          </div>
          <div>
            <h4 class="text-brand-dark text-base font-bold capitalize">
              {{ role.name }}
            </h4>
            <p class="text-brand-light text-xs font-normal mt-0.5">
              Guard: <span class="font-mono text-gray-600 font-medium">{{ role.guard_name }}</span>
            </p>
          </div>
        </div>

        <span
          v-if="role.is_system_role"
          class="px-2.5 py-1 rounded-md text-xs font-semibold bg-[#EBF8FF] text-[#1E40AF] shrink-0"
        >
          System
        </span>
        <span
          v-else
          class="px-2.5 py-1 rounded-md text-xs font-semibold bg-purple-100 text-purple-700 shrink-0"
        >
          Custom
        </span>
      </div>

      <!-- Divider -->
      <div class="border-b border-[#DCDEDD] my-4"></div>

      <!-- Permissions Progress Bar -->
      <div class="mb-4">
        <div class="flex items-center justify-between text-xs mb-2">
          <span class="text-brand-light font-medium">Active Permissions</span>
          <span class="text-brand-dark font-bold">
            {{ role.permissions_count || 0 }}
            <span class="text-gray-400 font-normal">/ {{ totalAvailablePermissions }}</span>
          </span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            class="h-2 rounded-full transition-all duration-300 bg-[#0C51D9]"
            :style="{
              width: `${Math.min(
                Math.round(
                  ((role.permissions_count || 0) / (totalAvailablePermissions || 1)) * 100
                ),
                100
              )}%`,
            }"
          ></div>
        </div>
      </div>

      <!-- Permission Sample Chips -->
      <div class="space-y-2 mb-2">
        <div class="flex items-center gap-1.5 text-xs text-brand-light mb-1.5">
          <Layers class="w-3.5 h-3.5 text-gray-500" />
          <span class="font-medium">Hak Akses Terpasang:</span>
        </div>
        <div class="flex flex-wrap gap-1.5 min-h-[32px]">
          <template v-if="role.permissions && role.permissions.length > 0">
            <span
              v-for="p in role.permissions.slice(0, 3)"
              :key="typeof p === 'string' ? p : p.id"
              class="px-2 py-0.5 rounded-md text-[11px] font-medium bg-gray-100 text-gray-700 font-mono"
            >
              {{ typeof p === "string" ? p : p.name }}
            </span>
            <span
              v-if="role.permissions.length > 3"
              class="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-blue-50 text-[#0C51D9]"
            >
              +{{ role.permissions.length - 3 }} lainnya
            </span>
          </template>
          <span v-else class="text-xs text-gray-400 italic">
            Belum ada permission terpasang
          </span>
        </div>
      </div>
    </div>

    <div>
      <!-- Divider -->
      <div class="border-b border-[#DCDEDD] my-4"></div>

      <!-- Action Buttons -->
      <div class="flex items-center gap-2">
        <button
          type="button"
          @click="emit('managePermissions', role)"
          class="flex-1 border border-[#DCDEDD] rounded-[8px] hover:border-[#0C51D9] hover:border-2 hover:bg-gray-50 transition-all duration-300 py-2.5 px-3 flex items-center justify-center gap-2 cursor-pointer group"
        >
          <Key class="w-4 h-4 text-gray-600 group-hover:text-[#0C51D9] transition-colors" />
          <span class="text-brand-dark text-sm font-semibold group-hover:text-[#0C51D9] transition-colors">
            Kelola Permissions
          </span>
        </button>

        <!-- Custom Role Actions (Edit & Delete) -->
        <template v-if="!role.is_system_role">
          <button
            type="button"
            @click="emit('editRole', role)"
            title="Ubah Nama Role"
            class="border border-[#DCDEDD] rounded-[8px] hover:border-[#0C51D9] hover:border-2 hover:bg-gray-50 transition-all duration-300 p-2.5 flex items-center justify-center text-gray-600 hover:text-[#0C51D9] cursor-pointer"
          >
            <Edit class="w-4 h-4" />
          </button>
          <button
            type="button"
            @click="emit('deleteRole', role)"
            title="Hapus Role"
            class="border border-[#DCDEDD] rounded-[8px] hover:border-red-500 hover:border-2 hover:bg-red-50 transition-all duration-300 p-2.5 flex items-center justify-center text-gray-600 hover:text-red-600 cursor-pointer"
          >
            <Trash2 class="w-4 h-4" />
          </button>
        </template>
      </div>
    </div>
  </div>
</template>
