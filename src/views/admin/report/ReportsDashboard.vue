<script setup>
import { ref, computed, onMounted, watch } from "vue";
import VueApexCharts from "vue3-apexcharts";
import {
  Users,
  CalendarCheck,
  Wallet,
  Folder,
  TrendingUp,
  TrendingDown,
  Download,
  FileSpreadsheet,
  Clock,
} from "lucide-vue-next";
import { useReportStore } from "@/stores/report";
import { storeToRefs } from "pinia";
import { formatRupiah, formatRupiahCompact } from "@/utils/formatUtils";
import { getTimeAgo } from "@/utils/dateUtils";
import Alert from "@/components/common/Alert.vue";

const reportStore = useReportStore();
const {
  overview,
  attendanceReport,
  payrollReport,
  employeeReport,
  activityLog,
  loading,
  error,
} = storeToRefs(reportStore);

const activeTab = ref("overview");
const period = ref("last_6_months");
const exporting = ref(false);

const tabs = [
  { key: "overview", label: "Overview", icon: TrendingUp },
  { key: "attendance", label: "Attendance", icon: CalendarCheck },
  { key: "payroll", label: "Payroll", icon: Wallet },
  { key: "employees", label: "Employees", icon: Users },
];

const loadAll = async () => {
  await Promise.all([
    reportStore.fetchOverview(),
    reportStore.fetchAttendanceReport({ period: period.value }),
    reportStore.fetchPayrollReport({ period: period.value }),
    reportStore.fetchEmployeeReport({ period: period.value }),
    reportStore.fetchActivityLog(),
  ]);
};

onMounted(loadAll);

watch(period, () => {
  reportStore.fetchAttendanceReport({ period: period.value });
  reportStore.fetchPayrollReport({ period: period.value });
});

// ----- Chart options -----
const attendanceTrendOptions = computed(() => ({
  chart: { type: "line", toolbar: { show: false } },
  colors: ["#10B981", "#F59E0B", "#DC2626"],
  stroke: { curve: "smooth", width: 3 },
  xaxis: { categories: attendanceReport.value?.trend.categories || [] },
  legend: { position: "top" },
  grid: { borderColor: "#e7e7e7", strokeDashArray: 4 },
}));

const attendanceTrendSeries = computed(() => [
  { name: "Present", data: attendanceReport.value?.trend.present || [] },
  { name: "Late", data: attendanceReport.value?.trend.late || [] },
  { name: "Absent", data: attendanceReport.value?.trend.absent || [] },
]);

const attendanceByDeptOptions = computed(() => ({
  chart: { type: "bar", toolbar: { show: false } },
  plotOptions: { bar: { borderRadius: 8, horizontal: true } },
  colors: ["#0C51D9"],
  dataLabels: { enabled: true, formatter: (v) => `${v}%` },
  xaxis: {
    categories: attendanceReport.value?.by_department.map((d) => d.department) || [],
    max: 100,
  },
  grid: { borderColor: "#e7e7e7", strokeDashArray: 4 },
}));

const attendanceByDeptSeries = computed(() => [
  { name: "Attendance Rate", data: attendanceReport.value?.by_department.map((d) => d.rate) || [] },
]);

const payrollTrendOptions = computed(() => ({
  chart: { type: "area", toolbar: { show: false } },
  colors: ["#0C51D9"],
  stroke: { curve: "smooth", width: 3 },
  fill: { type: "gradient", gradient: { opacityFrom: 0.4, opacityTo: 0.05 } },
  xaxis: { categories: payrollReport.value?.trend.categories || [] },
  yaxis: { labels: { formatter: (v) => formatRupiahCompact(v) } },
  grid: { borderColor: "#e7e7e7", strokeDashArray: 4 },
}));

const payrollTrendSeries = computed(() => [
  { name: "Total Payroll", data: payrollReport.value?.trend.amount || [] },
]);

const payrollByDeptOptions = computed(() => ({
  chart: { type: "donut" },
  labels: payrollReport.value?.by_department.map((d) => d.department) || [],
  colors: ["#0C51D9", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899"],
  legend: { position: "bottom" },
  dataLabels: { enabled: true, formatter: (v) => `${v.toFixed(1)}%` },
}));

const payrollByDeptSeries = computed(() => payrollReport.value?.by_department.map((d) => d.amount) || []);

const employeeByDeptOptions = computed(() => ({
  chart: { type: "bar", toolbar: { show: false } },
  plotOptions: { bar: { borderRadius: 8, columnWidth: "50%" } },
  colors: ["#10B981"],
  dataLabels: { enabled: false },
  xaxis: { categories: employeeReport.value?.by_department.map((d) => d.department) || [] },
  grid: { borderColor: "#e7e7e7", strokeDashArray: 4 },
}));

const employeeByDeptSeries = computed(() => [
  { name: "Employees", data: employeeReport.value?.by_department.map((d) => d.total) || [] },
]);

const employeeByTypeOptions = computed(() => ({
  chart: { type: "pie" },
  labels: employeeReport.value?.by_employment_type.map((d) => d.type) || [],
  colors: ["#0C51D9", "#F59E0B", "#8B5CF6"],
  legend: { position: "bottom" },
}));

const employeeByTypeSeries = computed(() => employeeReport.value?.by_employment_type.map((d) => d.total) || []);

// ----- Export -----
const exportCsv = () => {
  let rows = [];
  if (activeTab.value === "attendance" && attendanceReport.value) {
    rows = [["Department", "Attendance Rate (%)"], ...attendanceReport.value.by_department.map((d) => [d.department, d.rate])];
  } else if (activeTab.value === "payroll" && payrollReport.value) {
    rows = [["Department", "Total Amount (IDR)"], ...payrollReport.value.by_department.map((d) => [d.department, d.amount])];
  } else if (activeTab.value === "employees" && employeeReport.value) {
    rows = [["Department", "Total Employees"], ...employeeReport.value.by_department.map((d) => [d.department, d.total])];
  } else {
    rows = [["Metric", "Value"]];
    if (overview.value) {
      Object.entries(overview.value).forEach(([key, value]) => rows.push([key, value]));
    }
  }

  const csvContent = rows.map((r) => r.join(",")).join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `report-${activeTab.value}-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
};

const exportPdf = async () => {
  exporting.value = true;
  try {
    const { default: jsPDF } = await import("jspdf");
    await import("jspdf-autotable");

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`HIP HRIS Report - ${activeTab.value.toUpperCase()}`, 14, 18);
    doc.setFontSize(10);
    doc.text(`Generated on ${new Date().toLocaleDateString("id-ID")}`, 14, 25);

    let head = [["Department", "Value"]];
    let body = [];

    if (activeTab.value === "attendance" && attendanceReport.value) {
      body = attendanceReport.value.by_department.map((d) => [d.department, `${d.rate}%`]);
    } else if (activeTab.value === "payroll" && payrollReport.value) {
      body = payrollReport.value.by_department.map((d) => [d.department, formatRupiah(d.amount)]);
    } else if (activeTab.value === "employees" && employeeReport.value) {
      body = employeeReport.value.by_department.map((d) => [d.department, d.total]);
    } else if (overview.value) {
      head = [["Metric", "Value"]];
      body = Object.entries(overview.value).map(([key, value]) => [key.replaceAll("_", " "), value]);
    }

    doc.autoTable({ startY: 32, head, body, headStyles: { fillColor: [12, 81, 217] } });
    doc.save(`report-${activeTab.value}-${new Date().toISOString().slice(0, 10)}.pdf`);
  } finally {
    exporting.value = false;
  }
};
</script>

<template>
  <div>
    <!-- Header -->
    <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
      <div>
        <h1 class="text-brand-dark text-2xl font-bold">Reports</h1>
        <p class="text-brand-light text-sm mt-1">
          Ringkasan performa perusahaan dari attendance, payroll, hingga employee.
        </p>
      </div>

      <div class="flex items-center gap-3">
        <select
          v-model="period"
          class="border border-[#DCDEDD] rounded-[12px] px-4 py-2.5 text-sm font-medium text-brand-dark hover:border-[#0C51D9] focus:border-[#0C51D9] transition-all duration-300 cursor-pointer"
        >
          <option value="last_6_months">6 Bulan Terakhir</option>
          <option value="last_3_months">3 Bulan Terakhir</option>
          <option value="this_year">Tahun Ini</option>
        </select>

        <button
          @click="exportCsv"
          class="flex items-center gap-2 px-4 py-2.5 border border-[#DCDEDD] rounded-[12px] text-sm font-medium text-brand-dark hover:border-[#0C51D9] hover:border-2 transition-all duration-300"
        >
          <FileSpreadsheet class="w-4 h-4" />
          CSV
        </button>

        <button
          @click="exportPdf"
          :disabled="exporting"
          class="btn-primary rounded-[12px] border border-[#2151A0] blue-gradient blue-btn-shadow hover:brightness-110 transition-all duration-300 px-4 py-2.5 disabled:opacity-60"
        >
          <Download class="w-4 h-4 text-white" />
          <span class="text-brand-white text-sm font-semibold">
            {{ exporting ? "Exporting..." : "Export PDF" }}
          </span>
        </button>
      </div>
    </div>

    <Alert
      v-if="error && typeof error === 'string'"
      type="danger"
      title="Gagal memuat laporan"
      :message="error"
    />

    <!-- Overview stat cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div class="bg-white border border-[#DCDEDD] rounded-[20px] p-5">
        <div class="flex items-center justify-between mb-3">
          <div class="w-12 h-12 bg-blue-50 rounded-[12px] flex items-center justify-center">
            <Users class="w-6 h-6 text-blue-600" />
          </div>
          <span
            class="flex items-center gap-1 text-xs font-semibold"
            :class="(overview?.employee_growth || 0) >= 0 ? 'text-success' : 'text-danger'"
          >
            <component :is="(overview?.employee_growth || 0) >= 0 ? TrendingUp : TrendingDown" class="w-3.5 h-3.5" />
            {{ Math.abs(overview?.employee_growth || 0) }}%
          </span>
        </div>
        <p class="text-brand-dark text-2xl font-extrabold">{{ loading ? "..." : overview?.total_employees }}</p>
        <p class="text-brand-light text-sm">Total Employees</p>
      </div>

      <div class="bg-white border border-[#DCDEDD] rounded-[20px] p-5">
        <div class="flex items-center justify-between mb-3">
          <div class="w-12 h-12 bg-green-50 rounded-[12px] flex items-center justify-center">
            <CalendarCheck class="w-6 h-6 text-green-600" />
          </div>
          <span
            class="flex items-center gap-1 text-xs font-semibold"
            :class="(overview?.attendance_growth || 0) >= 0 ? 'text-success' : 'text-danger'"
          >
            <component :is="(overview?.attendance_growth || 0) >= 0 ? TrendingUp : TrendingDown" class="w-3.5 h-3.5" />
            {{ Math.abs(overview?.attendance_growth || 0) }}%
          </span>
        </div>
        <p class="text-brand-dark text-2xl font-extrabold">{{ loading ? "..." : `${overview?.attendance_rate}%` }}</p>
        <p class="text-brand-light text-sm">Attendance Rate</p>
      </div>

      <div class="bg-white border border-[#DCDEDD] rounded-[20px] p-5">
        <div class="flex items-center justify-between mb-3">
          <div class="w-12 h-12 bg-purple-50 rounded-[12px] flex items-center justify-center">
            <Wallet class="w-6 h-6 text-purple-600" />
          </div>
          <span
            class="flex items-center gap-1 text-xs font-semibold"
            :class="(overview?.payroll_growth || 0) >= 0 ? 'text-success' : 'text-danger'"
          >
            <component :is="(overview?.payroll_growth || 0) >= 0 ? TrendingUp : TrendingDown" class="w-3.5 h-3.5" />
            {{ Math.abs(overview?.payroll_growth || 0) }}%
          </span>
        </div>
        <p class="text-brand-dark text-2xl font-extrabold">
          {{ loading ? "..." : formatRupiahCompact(overview?.total_payroll) }}
        </p>
        <p class="text-brand-light text-sm">Total Payroll</p>
      </div>

      <div class="bg-white border border-[#DCDEDD] rounded-[20px] p-5">
        <div class="flex items-center justify-between mb-3">
          <div class="w-12 h-12 bg-orange-50 rounded-[12px] flex items-center justify-center">
            <Folder class="w-6 h-6 text-orange-600" />
          </div>
          <span
            class="flex items-center gap-1 text-xs font-semibold"
            :class="(overview?.project_growth || 0) >= 0 ? 'text-success' : 'text-danger'"
          >
            <component :is="(overview?.project_growth || 0) >= 0 ? TrendingUp : TrendingDown" class="w-3.5 h-3.5" />
            {{ Math.abs(overview?.project_growth || 0) }}%
          </span>
        </div>
        <p class="text-brand-dark text-2xl font-extrabold">{{ loading ? "..." : overview?.active_projects }}</p>
        <p class="text-brand-light text-sm">Active Projects</p>
      </div>
    </div>

    <!-- Tab Navigation -->
    <div class="bg-white border border-[#DCDEDD] rounded-[16px] p-6 mb-6">
      <div class="flex items-center gap-2 flex-wrap">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          @click="activeTab = tab.key"
          :class="
            activeTab === tab.key
              ? 'px-6 py-3 rounded-[12px] bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold text-base transition-all duration-300'
              : 'px-6 py-3 rounded-[12px] border border-[#DCDEDD] bg-white text-brand-dark font-medium text-base hover:border-[#0C51D9] hover:border-2 transition-all duration-300'
          "
        >
          <component :is="tab.icon" class="w-5 h-5 inline mr-2" />
          {{ tab.label }}
        </button>
      </div>
    </div>

    <!-- Overview Tab: Recent Activity -->
    <div v-if="activeTab === 'overview'" class="bg-white border border-[#DCDEDD] rounded-[16px] p-6">
      <h3 class="text-brand-dark text-lg font-bold mb-4">Recent Activity</h3>
      <div class="space-y-3">
        <div
          v-for="item in activityLog"
          :key="item.id"
          class="flex items-start gap-3 p-3 border border-[#DCDEDD] rounded-[12px]"
        >
          <div class="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
            <Clock class="w-4 h-4 text-blue-600" />
          </div>
          <div class="flex-1">
            <p class="text-brand-dark text-sm">
              <span class="font-semibold">{{ item.actor }}</span>
              {{ item.action }}
              <span class="font-semibold">{{ item.target }}</span>
            </p>
            <p class="text-brand-light text-xs mt-0.5">{{ getTimeAgo(item.created_at) }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Attendance Tab -->
    <div v-if="activeTab === 'attendance'" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="bg-white border border-[#DCDEDD] rounded-[16px] p-6 lg:col-span-2">
        <h3 class="text-brand-dark text-lg font-bold mb-4">Attendance Trend</h3>
        <VueApexCharts
          v-if="!loading"
          type="line"
          height="280"
          :options="attendanceTrendOptions"
          :series="attendanceTrendSeries"
        />
      </div>
      <div class="bg-white border border-[#DCDEDD] rounded-[16px] p-6 lg:col-span-2">
        <h3 class="text-brand-dark text-lg font-bold mb-4">Attendance Rate by Department</h3>
        <VueApexCharts
          v-if="!loading"
          type="bar"
          height="280"
          :options="attendanceByDeptOptions"
          :series="attendanceByDeptSeries"
        />
      </div>
    </div>

    <!-- Payroll Tab -->
    <div v-if="activeTab === 'payroll'" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="bg-white border border-[#DCDEDD] rounded-[16px] p-6 lg:col-span-2">
        <h3 class="text-brand-dark text-lg font-bold mb-4">Payroll Trend</h3>
        <VueApexCharts
          v-if="!loading"
          type="area"
          height="280"
          :options="payrollTrendOptions"
          :series="payrollTrendSeries"
        />
      </div>
      <div class="bg-white border border-[#DCDEDD] rounded-[16px] p-6 lg:col-span-2">
        <h3 class="text-brand-dark text-lg font-bold mb-4">Payroll Distribution by Department</h3>
        <VueApexCharts
          v-if="!loading"
          type="donut"
          height="320"
          :options="payrollByDeptOptions"
          :series="payrollByDeptSeries"
        />
      </div>
    </div>

    <!-- Employees Tab -->
    <div v-if="activeTab === 'employees'" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="bg-white border border-[#DCDEDD] rounded-[16px] p-6">
        <h3 class="text-brand-dark text-lg font-bold mb-4">Employees by Department</h3>
        <VueApexCharts
          v-if="!loading"
          type="bar"
          height="280"
          :options="employeeByDeptOptions"
          :series="employeeByDeptSeries"
        />
      </div>
      <div class="bg-white border border-[#DCDEDD] rounded-[16px] p-6">
        <h3 class="text-brand-dark text-lg font-bold mb-4">Employees by Type</h3>
        <VueApexCharts
          v-if="!loading"
          type="pie"
          height="280"
          :options="employeeByTypeOptions"
          :series="employeeByTypeSeries"
        />
      </div>
    </div>
  </div>
</template>
