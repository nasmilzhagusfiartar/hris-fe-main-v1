<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import VueApexCharts from "vue3-apexcharts";
import {
  TrendingUp,
  Target,
  Clock,
  Briefcase,
  PlayCircle,
} from "lucide-vue-next";
import { useProjectStore } from "@/stores/project";
import { storeToRefs } from "pinia";

const { t } = useI18n();
const projectStore = useProjectStore();
const { loadingStatistics } = storeToRefs(projectStore);

const total = computed(() => projectStore.statistics.total);
const active = computed(() => projectStore.statistics.active);
const trendMonths = computed(() => projectStore.statistics?.monthly_trend?.months || []);
const trendCounts = computed(() => projectStore.statistics?.monthly_trend?.counts || []);
const hasTrendData = computed(() => trendCounts.value.some((c: number) => c > 0));

onMounted(() => {
  projectStore.fetchStatistics();
});

// Chart configuration (driven by real DB monthly_trend)
const chartOptions = computed(() => ({
  chart: {
    type: "area",
    height: 250,
    toolbar: {
      show: false,
    },
    sparkline: {
      enabled: false,
    },
    animations: {
      enabled: true,
      easing: "easeinout",
      speed: 800,
    },
  },
  stroke: {
    curve: "smooth",
    width: 3,
    colors: ["#8A63F9"],
  },
  fill: {
    type: "gradient",
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.4,
      opacityTo: 0.05,
      stops: [0, 100],
      colorStops: [
        {
          offset: 0,
          color: "#8A63F9",
          opacity: 0.4,
        },
        {
          offset: 100,
          color: "#8A63F9",
          opacity: 0.05,
        },
      ],
    },
  },
  colors: ["#8A63F9"],
  grid: {
    borderColor: "#f1f1f1",
    strokeDashArray: 0,
    padding: {
      top: 20,
      right: 20,
      bottom: 20,
      left: 20,
    },
  },
  xaxis: {
    categories: trendMonths.value,
    axisBorder: {
      show: false,
    },
    axisTicks: {
      show: false,
    },
    labels: {
      style: {
        colors: "#6B7280",
        fontSize: "12px",
      },
    },
  },
  yaxis: {
    min: 0,
    forceNiceScale: true,
    labels: {
      style: {
        colors: "#6B7280",
        fontSize: "12px",
      },
      formatter: (value: number) => `${Math.round(value)}`,
    },
  },
  tooltip: {
    enabled: true,
    style: {
      fontSize: "12px",
    },
    y: {
      formatter: (value: number) => `${value}`,
    },
    theme: "light",
    fillSeriesColor: false,
  },
  dataLabels: {
    enabled: false,
  },
  legend: {
    show: false,
  },
  markers: {
    size: 5,
    colors: ["#8A63F9"],
    strokeColors: "#fff",
    strokeWidth: 2,
    hover: {
      size: 7,
    },
  },
  responsive: [
    {
      breakpoint: 768,
      options: {
        chart: {
          height: 200,
        },
      },
    },
  ],
}));

const chartSeries = computed(() => [
  {
    name: "Projects Created",
    data: trendCounts.value,
  },
]);
</script>

<template>
  <!-- Statistics Cards -->
  <div class="grid grid-cols-1 xl:grid-cols-3 gap-4 lg:gap-6 mb-6">
    <!-- Projects Stats Column -->
    <div
      class="xl:col-span-1 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-4"
    >
      <!-- Total Projects Card -->
      <div
        class="bg-white border border-[#DCDEDD] rounded-[20px] hover:border-[#0C51D9] hover:border-2 hover:shadow-lg transition-all duration-300 p-5 flex flex-col min-h-[186px] group"
      >
        <!-- Header with title and icon -->
        <div class="flex items-center justify-between mb-4">
          <p class="text-brand-dark text-base font-medium">{{ t("project.totalProjects") }}</p>
          <div
            class="w-12 h-12 bg-blue-50 rounded-[16px] flex items-center justify-center group-hover:bg-blue-100 transition-colors duration-300"
          >
            <Briefcase class="w-6 h-6 text-blue-600" />
          </div>
        </div>
        <!-- Value and status at bottom -->
        <div class="mt-auto">
          <p
            id="totalProjects"
            class="text-brand-dark text-3xl font-extrabold leading-tight mb-1"
          >
            {{ loadingStatistics ? "-" : total }}
          </p>
          <p class="text-success text-base font-medium">{{ t("project.allProjects") }}</p>
        </div>
      </div>

      <!-- Active Projects Card -->
      <div
        class="bg-white border border-[#DCDEDD] rounded-[20px] hover:border-[#0C51D9] hover:border-2 hover:shadow-lg transition-all duration-300 p-5 flex flex-col min-h-[186px] group"
      >
        <!-- Header with title and icon -->
        <div class="flex items-center justify-between mb-4">
          <p class="text-brand-dark text-base font-medium">{{ t("project.activeProjects") }}</p>
          <div
            class="w-12 h-12 bg-green-50 rounded-[16px] flex items-center justify-center group-hover:bg-green-100 transition-colors duration-300"
          >
            <PlayCircle class="w-6 h-6 text-green-600" />
          </div>
        </div>
        <!-- Value and status at bottom -->
        <div class="mt-auto">
          <p
            id="activeProjects"
            class="text-brand-dark text-3xl font-extrabold leading-tight mb-1"
          >
            {{ loadingStatistics ? "-" : active }}
          </p>
          <p class="text-success text-base font-medium">{{ t("project.inProgress") }}</p>
        </div>
      </div>
    </div>

    <!-- Charts Column -->
    <div
      class="xl:col-span-2 bg-white border border-[#DCDEDD] rounded-[16px] p-4 sm:p-6 hover:shadow-lg transition-shadow duration-300"
    >
      <div class="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
        <div
          class="w-12 h-12 bg-purple-50 rounded-[12px] flex items-center justify-center flex-shrink-0"
        >
          <TrendingUp class="w-6 h-6 text-purple-600" />
        </div>
        <div class="flex-1">
          <h3 class="text-brand-dark text-lg font-bold">{{ t("project.projectProgress") }}</h3>
          <p class="text-brand-light text-sm">
            {{ t("project.monthlyTrends") }}
          </p>
        </div>
      </div>

      <!-- Chart Container -->
      <div class="relative w-full" style="height: 250px">
        <div
          v-if="!loadingStatistics && !hasTrendData"
          class="h-full flex flex-col items-center justify-center text-center text-gray-500"
        >
          <Briefcase class="w-10 h-10 text-gray-300 mb-2" />
          <p class="text-sm font-semibold text-gray-600">{{ t("project.noTrendData") }}</p>
          <p class="text-xs text-gray-400 mt-1">{{ t("project.noTrendDataSub") }}</p>
        </div>
        <VueApexCharts
          v-else
          type="area"
          height="250"
          :options="chartOptions"
          :series="chartSeries"
          class="w-full"
        />
      </div>
    </div>
  </div>
</template>
