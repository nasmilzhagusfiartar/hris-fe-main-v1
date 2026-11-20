<script setup>
import { ref, computed, watch } from "vue";
import {
  X,
  Check,
  Search,
  CheckSquare,
  Square,
  Shield,
  Loader2,
  Filter,
} from "lucide-vue-next";
import { capitalize } from "@/utils/formatUtils";
import SearchInput from "@/components/common/SearchInput.vue";

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  role: {
    type: Object,
    default: () => ({}),
  },
  groupedPermissions: {
    type: Object,
    default: () => ({}),
  },
  saving: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["close", "save"]);

const selectedPermissions = ref([]);
const searchQuery = ref("");

// Initialize selection when role or show changes
watch(
  () => [props.show, props.role],
  () => {
    if (props.show && props.role) {
      if (Array.isArray(props.role.permissions)) {
        selectedPermissions.value = props.role.permissions.map((p) =>
          typeof p === "string" ? p : p.name
        );
      } else {
        selectedPermissions.value = [];
      }
      searchQuery.value = "";
    }
  },
  { immediate: true }
);

// All permissions flattened
const allPermissions = computed(() => {
  const list = [];
  Object.values(props.groupedPermissions).forEach((group) => {
    if (Array.isArray(group)) {
      list.push(...group);
    }
  });
  return list;
});

const totalAvailable = computed(() => allPermissions.value.length);

// Filtered grouped permissions based on search query
const filteredGroupedPermissions = computed(() => {
  if (!searchQuery.value.trim()) {
    return props.groupedPermissions;
  }

  const query = searchQuery.value.toLowerCase().trim();
  const filtered = {};

  Object.entries(props.groupedPermissions).forEach(([groupName, items]) => {
    const matchingItems = items.filter(
      (item) =>
        item.name.toLowerCase().includes(query) ||
        (item.action && item.action.toLowerCase().includes(query)) ||
        groupName.toLowerCase().includes(query)
    );

    if (matchingItems.length > 0) {
      filtered[groupName] = matchingItems;
    }
  });

  return filtered;
});

// Single toggle handler
const togglePermission = (name) => {
  if (selectedPermissions.value.includes(name)) {
    selectedPermissions.value = selectedPermissions.value.filter((p) => p !== name);
  } else {
    selectedPermissions.value.push(name);
  }
};

// Master Global toggle: Select All
const handleSelectAllGlobal = () => {
  const allNames = allPermissions.value.map((p) => p.name);
  selectedPermissions.value = Array.from(new Set(allNames));
};

// Master Global toggle: Deselect All
const handleDeselectAllGlobal = () => {
  selectedPermissions.value = [];
};

// Per-Group toggle: Select All in Group
const handleSelectAllInGroup = (groupPermissions) => {
  const groupNames = groupPermissions.map((p) => p.name);
  selectedPermissions.value = Array.from(
    new Set([...selectedPermissions.value, ...groupNames])
  );
};

// Per-Group toggle: Deselect All in Group
const handleDeselectAllInGroup = (groupPermissions) => {
  const groupNamesSet = new Set(groupPermissions.map((p) => p.name));
  selectedPermissions.value = selectedPermissions.value.filter(
    (name) => !groupNamesSet.has(name)
  );
};

// Check if all permissions in group are selected
const isGroupFullySelected = (groupPermissions) => {
  if (!groupPermissions || groupPermissions.length === 0) return false;
  return groupPermissions.every((p) => selectedPermissions.value.includes(p.name));
};

// Check how many permissions in group are selected
const getGroupSelectedCount = (groupPermissions) => {
  if (!groupPermissions) return 0;
  return groupPermissions.filter((p) => selectedPermissions.value.includes(p.name))
    .length;
};

const handleSave = () => {
  emit("save", selectedPermissions.value);
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
        class="bg-white rounded-[24px] shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden border border-[#DCDEDD]"
      >
        <!-- Modal Header -->
        <div
          class="px-6 py-4 border-b border-[#DCDEDD] flex items-center justify-between bg-white shrink-0"
        >
          <div class="flex items-center gap-4">
            <div
              class="w-12 h-12 rounded-2xl flex items-center justify-center"
              style="background: linear-gradient(135deg, #0C51D9, #4338ca)"
            >
              <Shield class="w-6 h-6 text-white" />
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h2 class="text-brand-dark text-lg font-bold">
                  Manage Permissions
                </h2>
                <span
                  class="px-2 py-1 rounded-md text-xs font-semibold bg-blue-100 text-[#0C51D9]"
                >
                  {{ capitalize(role?.name) }}
                </span>
                <span
                  v-if="role?.is_system_role"
                  class="px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-600"
                >
                  System
                </span>
              </div>
              <p class="text-brand-light text-xs mt-1">
                Select the permissions allowed for this role.
              </p>
            </div>
          </div>

          <button
            type="button"
            @click="emit('close')"
            class="w-9 h-9 rounded-xl border border-[#DCDEDD] flex items-center justify-center text-gray-400 hover:text-brand-dark hover:border-gray-400 hover:bg-gray-50 transition-all cursor-pointer shrink-0"
          >
            <X class="w-4 h-4" />
          </button>
        </div>

        <!-- Filter & Global Controls Bar -->
        <div
          class="px-6 py-3 bg-gray-50 border-b border-[#DCDEDD] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0"
        >
          <!-- Search Input -->
          <div class="w-full sm:w-80">
            <SearchInput
              v-model="searchQuery"
              placeholder="Search permissions or modules..."
              input-class="py-2 text-sm bg-white border border-[#DCDEDD] rounded-xl focus:outline-none focus:border-[#0C51D9] focus:ring-1 focus:ring-[#0C51D9] transition-all"
            />
          </div>

          <!-- Total Counter & Master Buttons -->
          <div
            class="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto"
          >
            <div class="text-xs font-semibold text-brand-dark">
              Selected:
              <span class="text-[#0C51D9] font-bold text-sm">
                {{ selectedPermissions.length }}
              </span>
              <span class="text-gray-400 font-normal"> / {{ totalAvailable }}</span>
            </div>

            <div class="flex items-center gap-1 border-l border-gray-300 pl-3">
              <button
                type="button"
                @click="handleSelectAllGlobal"
                class="px-3 py-1 text-xs font-medium text-[#0C51D9] hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
              >
                <CheckSquare class="w-4 h-4" />
                <span>Select All</span>
              </button>
              <button
                type="button"
                @click="handleDeselectAllGlobal"
                class="px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Square class="w-4 h-4" />
                <span>Clear</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Scrollable Permission Matrix Groups -->
        <div class="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          <div
            v-if="Object.keys(filteredGroupedPermissions).length === 0"
            class="py-12 text-center"
          >
            <Filter class="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p class="text-brand-dark font-semibold text-base">
              No matching permissions found
            </p>
            <p class="text-gray-500 text-xs mt-1">
              Try a different search keyword.
            </p>
          </div>

          <div
            v-for="(permissions, groupName) in filteredGroupedPermissions"
            :key="groupName"
            class="border border-[#DCDEDD] rounded-[16px] overflow-hidden bg-white"
          >
            <!-- Module Group Header -->
            <div
              class="bg-gray-50/80 px-5 py-3 border-b border-[#E9EBEA] flex items-center justify-between flex-wrap gap-2"
            >
              <div class="flex items-center gap-2">
                <span
                  class="w-2 h-2 rounded-full"
                  :style="{
                    backgroundColor: isGroupFullySelected(permissions)
                      ? '#0C51D9'
                      : getGroupSelectedCount(permissions) > 0
                      ? '#f59e0b'
                      : '#d1d5db'
                  }"
                ></span>
                <h4 class="text-brand-dark text-sm font-bold capitalize">
                  {{ groupName }} Module
                </h4>
                <span class="text-xs text-brand-light font-medium">
                  ({{ getGroupSelectedCount(permissions) }} /
                  {{ permissions.length }} selected)
                </span>
              </div>

              <!-- Group Toggle Buttons -->
              <div class="flex items-center gap-1">
                <button
                  type="button"
                  @click="handleSelectAllInGroup(permissions)"
                  class="text-[11px] font-semibold text-[#0C51D9] hover:bg-blue-50 px-2 py-1 rounded transition-colors cursor-pointer"
                >
                  Select All
                </button>
                <span class="text-gray-300">•</span>
                <button
                  type="button"
                  @click="handleDeselectAllInGroup(permissions)"
                  class="text-[11px] font-semibold text-gray-500 hover:bg-gray-200 px-2 py-1 rounded transition-colors cursor-pointer"
                >
                  Clear
                </button>
              </div>
            </div>

            <!-- Permission Checkbox Grid -->
            <div class="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              <label
                v-for="perm in permissions"
                :key="perm.id"
                class="flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 cursor-pointer select-none text-left"
                :class="
                  selectedPermissions.includes(perm.name)
                    ? 'border-[#0C51D9] bg-blue-50/40'
                    : 'border-[#E9EBEA] hover:border-gray-300 hover:bg-gray-50/60'
                "
              >
                <input
                  type="checkbox"
                  class="hidden"
                  :value="perm.name"
                  :checked="selectedPermissions.includes(perm.name)"
                  @change="togglePermission(perm.name)"
                />
                <!-- Custom Checkbox -->
                <div
                  class="w-5 h-5 rounded-md border flex items-center justify-center transition-colors shrink-0"
                  :style="
                    selectedPermissions.includes(perm.name)
                      ? 'background-color: #0C51D9; border-color: #0C51D9;'
                      : 'border-color: #d1d5db; background-color: #fff;'
                  "
                >
                  <Check
                    v-if="selectedPermissions.includes(perm.name)"
                    class="w-3 h-3 text-white"
                    style="stroke-width: 3"
                  />
                </div>
                <div class="flex-1 min-w-0">
                  <p
                    class="text-xs font-semibold truncate"
                    :class="
                      selectedPermissions.includes(perm.name)
                        ? 'text-[#0C51D9]'
                        : 'text-brand-dark'
                    "
                  >
                    {{ perm.name }}
                  </p>
                  <p v-if="perm.action" class="text-[10px] text-gray-500 capitalize mt-1">
                    Action: {{ perm.action }}
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div
          class="px-6 py-4 border-t border-[#DCDEDD] bg-white flex items-center justify-between shrink-0"
        >
          <div class="text-xs text-gray-500">
            Changes will take effect immediately for users with this role.
          </div>

          <div class="flex items-center gap-3">
            <button
              type="button"
              @click="emit('close')"
              :disabled="saving"
              class="px-5 py-3 rounded-2xl border border-[#DCDEDD] hover:bg-gray-50 text-sm font-semibold text-brand-dark transition-all duration-200 cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              @click="handleSave"
              :disabled="saving"
              class="btn-primary px-6 py-3 rounded-2xl border border-[#2151A0] blue-gradient blue-btn-shadow hover:brightness-110 focus:ring-2 focus:ring-[#0C51D9] text-white text-sm font-semibold transition-all duration-200 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Loader2 v-if="saving" class="w-4 h-4 animate-spin" />
              <span>{{ saving ? "Saving..." : "Save Changes" }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>
