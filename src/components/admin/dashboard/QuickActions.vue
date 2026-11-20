<script setup lang="ts">
import { computed, onMounted } from "vue";
import { RouterLink } from "vue-router";
import { useDashboardStore } from "@/stores/dashboard";
import { can } from "@/helpers/permissionHelper";
import { quickActionsConfig } from "@/config/quickActions";

const dashboardStore = useDashboardStore();

// Purely permission-based filtering from authStore.user.permissions
const visibleActions = computed(() => {
  return quickActionsConfig.filter((item) => can(item.permission));
});

const getBadgeValue = (badgeKey?: string): number => {
  if (!badgeKey) return 0;
  const counts = dashboardStore.quickActionCounts as Record<string, number>;
  return Number(counts?.[badgeKey] || 0);
};

onMounted(() => {
  dashboardStore.fetchQuickActionCounts();
});
</script>

<template>
  <!-- Quick Actions Section -->
  <section
    v-if="visibleActions.length > 0"
    aria-labelledby="quick-actions-heading"
    class="bg-white border border-[#DCDEDD] rounded-[20px] p-4 sm:p-6 transition-all duration-300"
  >
    <div class="flex items-center justify-between gap-2 mb-4">
      <div>
        <h3
          id="quick-actions-heading"
          class="text-brand-dark text-base sm:text-lg font-bold leading-tight"
        >
          Quick Actions
        </h3>
        <p class="text-xs text-gray-500 mt-0.5">
          Quick shortcuts based on your permissions
        </p>
      </div>
      <span
        class="text-xs text-[#0C51D9] bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-full font-semibold shrink-0"
      >
        {{ visibleActions.length }} Shortcuts
      </span>
    </div>

    <div
      class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
      role="group"
      aria-label="Quick Actions"
    >
      <RouterLink
        v-for="(action, index) in visibleActions"
        :key="action.key"
        :to="action.route"
        :aria-label="action.ariaLabel || action.label"
        :class="[
          action.primary || index === 0
            ? 'border-[#2151A0] blue-gradient blue-btn-shadow text-white hover:brightness-110 active:scale-[0.98]'
            : 'border-[#DCDEDD] bg-white text-brand-dark hover:border-[#0C51D9] hover:bg-blue-50/40 hover:shadow-sm active:bg-blue-50/80 active:scale-[0.98]',
        ]"
        class="group rounded-[16px] border p-4 flex flex-col items-center justify-center text-center gap-2.5 min-h-[112px] min-w-0 w-full transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0C51D9] focus-visible:ring-offset-2"
      >
        <div class="flex items-center justify-center gap-1.5">
          <div
            :class="[
              action.primary || index === 0
                ? 'bg-white/20 text-white'
                : 'bg-blue-50 text-[#0C51D9] group-hover:bg-blue-100',
            ]"
            class="w-10 h-10 rounded-[12px] flex items-center justify-center shrink-0 transition-colors"
          >
            <component :is="action.icon" class="w-5 h-5" />
          </div>

          <!-- Contextual Badge -->
          <span
            v-if="action.badgeKey && getBadgeValue(action.badgeKey) > 0"
            :class="action.badgeColor || 'bg-blue-600 text-white'"
            class="min-w-[22px] h-5 px-1.5 rounded-full text-[11px] font-bold inline-flex items-center justify-center shadow-sm shrink-0"
            :title="`${getBadgeValue(action.badgeKey)} item(s) need attention`"
          >
            {{ getBadgeValue(action.badgeKey) }}
          </span>
        </div>

        <span
          :class="[
            action.primary || index === 0
              ? 'text-brand-white font-semibold'
              : 'text-brand-dark font-semibold group-hover:text-[#0C51D9]',
          ]"
          class="w-full text-xs sm:text-sm leading-snug line-clamp-2 text-ellipsis overflow-hidden break-words transition-colors"
        >
          {{ action.label }}
        </span>
      </RouterLink>
    </div>
  </section>
</template>
