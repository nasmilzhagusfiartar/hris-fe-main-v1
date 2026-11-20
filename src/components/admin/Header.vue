<script setup>
import {
  BellIcon,
  ChevronDownIcon,
  UserIcon,
  SettingsIcon,
  LogOutIcon,
  MenuIcon,
  CheckCheckIcon,
  InboxIcon,
} from "lucide-vue-next";
import { useAuthStore } from "@/stores/auth";
import { useNotificationStore } from "@/stores/notification";
import { storeToRefs } from "pinia";
import { ref, computed, watch, onMounted, onUnmounted } from "vue";
import { useRoute, useRouter, RouterLink } from "vue-router";
import { useI18n } from "vue-i18n";
import _ from "lodash";
import { getImageUrl, handleImageError } from "@/helpers/imageHelper";
import { can } from "@/helpers/permissionHelper";
import { useClickOutside } from "@/composables/useClickOutside";
import { getTimeAgo } from "@/utils/dateUtils";
import { formatRoleLabel } from "@/plugins/i18n";
import LanguageToggle from "@/components/common/LanguageToggle.vue";

const { t, te } = useI18n();

const authStore = useAuthStore();
const { user } = storeToRefs(authStore);
const { logout } = authStore;

const notificationStore = useNotificationStore();
const {
  notifications,
  unreadCount,
  loading: loadingNotifications,
} = storeToRefs(notificationStore);

// Only one dropdown can be open at a time: 'notifications' | 'account' | null
const activeDropdown = ref(null);
const notificationDropdownRef = ref(null);
const accountDropdownRef = ref(null);

const emit = defineEmits(["toggle-sidebar"]);

const route = useRoute();
const router = useRouter();

const pageKey = computed(() => {
  const name = (route.name?.toString() || "admin.dashboard").replace(/\./g, "_");
  return te(`header.pages.${name}.title`) ? name : "admin_dashboard";
});

const pageTitle = computed(() => t(`header.pages.${pageKey.value}.title`));
const pageSubtitle = computed(() => t(`header.pages.${pageKey.value}.subtitle`));

const formattedUserRoles = computed(() => {
  const roles = user.value?.roles || [];
  return roles
    .map((r) => formatRoleLabel(typeof r === "string" ? r : r?.name))
    .join(", ");
});

const canAccessSettings = computed(() => {
  const roles = (user.value?.roles || []).map((r) =>
    typeof r === "string" ? r.toLowerCase() : (r?.name || "").toLowerCase()
  );
  return (
    can("setting-menu") ||
    can("setting-view") ||
    roles.length > 0
  );
});

const closeAllDropdowns = () => {
  activeDropdown.value = null;
};

const toggleNotificationsDropdown = async () => {
  if (activeDropdown.value === "notifications") {
    activeDropdown.value = null;
  } else {
    activeDropdown.value = "notifications";
    await notificationStore.fetchNotifications({ row_per_page: 10, page: 1 });
  }
};

const toggleAccountDropdown = () => {
  activeDropdown.value =
    activeDropdown.value === "account" ? null : "account";
};

const goToSettings = () => {
  closeAllDropdowns();
  router.push({ name: "admin.settings" });
};

const handleNotificationClick = async (item) => {
  if (!item.is_read) {
    await notificationStore.markAsRead(item.id);
  }
  closeAllDropdowns();

  const targetRouteName = item.route_name || "admin.dashboard";
  const targetParams = item.route_params || undefined;

  try {
    await router.push({ name: targetRouteName, params: targetParams });
  } catch (err) {
    await router.push({ name: "admin.dashboard" });
  }
};

const handleMarkAllRead = async () => {
  await notificationStore.markAllAsRead();
};

const handleLogout = async () => {
  closeAllDropdowns();
  if (confirm(t("header.confirmLogout"))) {
    notificationStore.reset();
    await logout();
  }
};

// Close dropdown when clicking outside
useClickOutside(notificationDropdownRef, () => {
  if (activeDropdown.value === "notifications") {
    activeDropdown.value = null;
  }
});

useClickOutside(accountDropdownRef, () => {
  if (activeDropdown.value === "account") {
    activeDropdown.value = null;
  }
});

// Close dropdown on Escape key
const handleKeydown = (event) => {
  if (event.key === "Escape" && activeDropdown.value !== null) {
    closeAllDropdowns();
  }
};

// Close dropdown on route change
watch(
  () => route.fullPath,
  () => {
    closeAllDropdowns();
  }
);

onMounted(() => {
  document.addEventListener("keydown", handleKeydown);
  notificationStore.startPolling(60000);
});

onUnmounted(() => {
  document.removeEventListener("keydown", handleKeydown);
  notificationStore.stopPolling();
});
</script>

<template>
  <header
    class="page-header bg-white border-b border-[#DCDEDD] px-3 sm:px-5 py-3 sm:py-4"
  >
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3 sm:gap-4">
        <button
          type="button"
          class="lg:hidden w-10 h-10 rounded-full border border-[#DCDEDD] flex items-center justify-center hover:border-[#0C51D9] hover:border-2 transition-all duration-200"
          @click="emit('toggle-sidebar')"
          aria-label="Toggle sidebar"
        >
          <MenuIcon class="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h2 class="text-brand-dark text-xl sm:text-2xl font-extrabold">
            {{ pageTitle }}
          </h2>
          <p class="hidden sm:block text-brand-light text-sm font-normal mt-1">
            {{ pageSubtitle }}
          </p>
        </div>
      </div>

      <div class="flex items-center gap-3 sm:gap-4">
        <!-- Language Toggle (EN | ID) -->
        <LanguageToggle />

        <!-- Action Buttons: Notifications & Settings (Chat Removed) -->
        <div class="flex items-center gap-2.5 sm:gap-3">
          <!-- Notification Bell & Dropdown -->
          <div ref="notificationDropdownRef" class="relative z-[20]">
            <button
              type="button"
              @click="toggleNotificationsDropdown"
              :aria-expanded="activeDropdown === 'notifications'"
              aria-haspopup="true"
              :aria-label="t('header.notifications')"
              class="relative w-10 h-10 rounded-full border border-[#DCDEDD] flex items-center justify-center hover:border-[#0C51D9] hover:border-2 transition-all duration-200 cursor-pointer"
              :class="{
                'border-[#0C51D9] border-2 bg-blue-50/40':
                  activeDropdown === 'notifications',
              }"
            >
              <BellIcon class="w-5 h-5 text-gray-600" />
              <span
                v-if="unreadCount > 0"
                class="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center shadow-xs"
              >
                {{ unreadCount > 99 ? "99+" : unreadCount }}
              </span>
            </button>

            <!-- Notifications Dropdown Panel -->
            <div
              v-if="activeDropdown === 'notifications'"
              class="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white border border-[#DCDEDD] rounded-[16px] shadow-xl z-[9999] overflow-hidden"
              role="menu"
            >
              <div
                class="px-4 py-3 border-b border-[#DCDEDD] flex items-center justify-between bg-gray-50/70"
              >
                <div class="flex items-center gap-2">
                  <h3 class="text-sm font-bold text-gray-900">{{ t("header.notifications") }}</h3>
                  <span
                    v-if="unreadCount > 0"
                    class="px-2 py-0.5 text-[11px] font-bold rounded-full bg-blue-100 text-[#0C51D9]"
                  >
                    {{ t("header.newCount", { count: unreadCount }) }}
                  </span>
                </div>
                <button
                  v-if="unreadCount > 0"
                  type="button"
                  @click="handleMarkAllRead"
                  class="inline-flex items-center gap-1 text-xs font-semibold text-[#0C51D9] hover:text-blue-800 transition-colors cursor-pointer"
                >
                  <CheckCheckIcon class="w-3.5 h-3.5" />
                  <span>{{ t("header.markAllRead") }}</span>
                </button>
              </div>

              <div class="max-h-80 overflow-y-auto divide-y divide-gray-100">
                <div
                  v-if="loadingNotifications"
                  class="py-8 px-4 text-center text-xs text-gray-500"
                >
                  {{ t("header.loadingNotifications") }}
                </div>

                <div
                  v-else-if="notifications.length === 0"
                  class="py-10 px-4 text-center"
                >
                  <InboxIcon class="w-9 h-9 text-gray-300 mx-auto mb-2" />
                  <p class="text-sm font-semibold text-gray-700">
                    {{ t("header.noNotifications") }}
                  </p>
                  <p class="text-xs text-gray-400 mt-0.5">
                    {{ t("header.noNotificationsSub") }}
                  </p>
                </div>

                <button
                  v-else
                  v-for="item in notifications"
                  :key="item.id"
                  type="button"
                  @click="handleNotificationClick(item)"
                  class="w-full text-left px-4 py-3 hover:bg-blue-50/40 transition-colors flex items-start gap-3 cursor-pointer"
                  :class="{ 'bg-blue-50/20': !item.is_read }"
                >
                  <span
                    class="mt-1.5 w-2 h-2 rounded-full shrink-0"
                    :class="item.is_read ? 'bg-gray-300' : 'bg-[#0C51D9]'"
                  ></span>
                  <div class="min-w-0 flex-1">
                    <div class="flex items-center justify-between gap-2">
                      <p
                        class="text-xs font-bold truncate"
                        :class="
                          item.is_read ? 'text-gray-700' : 'text-gray-900'
                        "
                      >
                        {{ item.title }}
                      </p>
                      <span class="text-[11px] text-gray-400 shrink-0">
                        {{ item.time_ago || getTimeAgo(item.created_at) }}
                      </span>
                    </div>
                    <p class="text-xs text-gray-600 mt-0.5 line-clamp-2">
                      {{ item.message }}
                    </p>
                  </div>
                </button>
              </div>
            </div>
          </div>

          <!-- Settings Button -->
          <button
            v-if="canAccessSettings"
            type="button"
            @click="goToSettings"
            aria-label="Settings"
            title="Settings"
            class="w-10 h-10 rounded-full border border-[#DCDEDD] flex items-center justify-center hover:border-[#0C51D9] hover:border-2 transition-all duration-200 cursor-pointer"
            :class="{
              'border-[#0C51D9] border-2 bg-blue-50/40':
                route.name === 'admin.settings',
            }"
          >
            <SettingsIcon class="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <!-- Divider -->
        <div class="hidden sm:block w-px h-8 bg-[#DCDEDD] mx-2"></div>

        <!-- User Account Profile Dropdown -->
        <div ref="accountDropdownRef" class="relative z-[20]">
          <button
            type="button"
            class="flex items-center gap-2 sm:gap-3 cursor-pointer focus:outline-none"
            @click="toggleAccountDropdown"
            :aria-expanded="activeDropdown === 'account'"
            aria-haspopup="true"
            aria-label="User Account Menu"
          >
            <img
              :src="getImageUrl(user?.profile_photo, user?.name)"
              :alt="user?.name || 'User Avatar'"
              class="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover"
              @error="(e) => handleImageError(e, user?.name)"
            />
            <div class="hidden md:block text-left">
              <p class="text-brand-dark text-sm sm:text-base font-semibold">
                {{ user?.name }}
              </p>
              <p
                class="text-brand-dark text-xs sm:text-sm font-normal leading-5 text-gray-500"
              >
                {{ formattedUserRoles }}
              </p>
            </div>
            <ChevronDownIcon
              class="w-4 h-4 text-gray-400 hidden sm:block transition-transform duration-200"
              :class="{ 'rotate-180': activeDropdown === 'account' }"
            />
          </button>

          <!-- Account Dropdown Menu -->
          <div
            v-if="activeDropdown === 'account'"
            class="absolute right-0 top-full mt-2 w-56 bg-white border border-[#DCDEDD] rounded-[14px] shadow-xl py-2 z-[9999]"
            role="menu"
          >
            <div class="px-4 py-3 border-b border-[#DCDEDD]">
              <p class="text-sm font-semibold text-gray-900 truncate">
                {{ user?.name }}
              </p>
              <p class="text-xs text-gray-600 truncate">{{ user?.email }}</p>
              <p class="text-xs text-gray-500 mt-0.5 font-medium">
                {{ formattedUserRoles }}
              </p>
            </div>

            <div class="py-1">
              <RouterLink
                :to="{ name: 'employee.profile.edit' }"
                class="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                @click="closeAllDropdowns"
              >
                <UserIcon class="w-4 h-4" />
                {{ t("header.userProfile") }}
              </RouterLink>
              <RouterLink
                v-if="canAccessSettings"
                :to="{ name: 'admin.settings' }"
                class="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                @click="closeAllDropdowns"
              >
                <SettingsIcon class="w-4 h-4" />
                {{ t("header.systemSettings") }}
              </RouterLink>
            </div>

            <div class="border-t border-[#DCDEDD] py-1">
              <button
                type="button"
                @click="handleLogout"
                class="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors cursor-pointer text-left"
              >
                <LogOutIcon class="w-4 h-4" />
                {{ t("header.logout") }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>
