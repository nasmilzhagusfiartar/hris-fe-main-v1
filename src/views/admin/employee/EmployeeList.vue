<script setup>
import Statisctics from "@/components/admin/employee/list/Statisctics.vue";
import CardList from "@/components/admin/employee/list/CardList.vue";
import { useEmployeeStore } from "@/stores/employee";
import { useOptionStore } from "@/stores/option";
import { useStoreStore } from "@/stores/store";
import { storeToRefs } from "pinia";
import { ref, onMounted, watch } from "vue";
import { useI18n } from "vue-i18n";
import { debounce } from "lodash";
import {
  Search,
  Building,
  Briefcase,
  CheckCircle,
  ChevronDown,
  Upload,
  UserPlus,
  Store,
  Tag,
} from "lucide-vue-next";
import Pagination from "@/components/admin/team/Pagination.vue";
import { can } from "@/helpers/permissionHelper";
import Alert from "@/components/common/Alert.vue";

const { t } = useI18n();

const employeeStore = useEmployeeStore();
const { employees, meta, loading, success } = storeToRefs(employeeStore);
const { fetchEmployeesPaginated } = employeeStore;

const optionStore = useOptionStore();
const { departments, employmentTypes, jobStatuses } = storeToRefs(optionStore);
const { fetchDepartments, fetchEmploymentTypes, fetchJobStatuses } = optionStore;

const storeStore = useStoreStore();
const { stores } = storeToRefs(storeStore);

const serverOptions = ref({
  page: 1,
  row_per_page: 10,
});

const filters = ref({
  search: null,
  department: "",
  store_id: "",
  vendor_name: "",
  type: "",
  status: "active",
});

const fetchData = async () => {
  await fetchEmployeesPaginated({
    ...serverOptions.value,
    ...filters.value,
  });
};

onMounted(async () => {
  await fetchData();
  await Promise.all([
    fetchDepartments(),
    fetchEmploymentTypes(),
    fetchJobStatuses(),
    storeStore.fetchStores({ is_active: 1 }).catch(() => {}),
  ]);
});

watch(
  filters,
  debounce(() => {
    serverOptions.value.page = 1; // Reset to first page when filtering
    fetchData();
  }, 300),
  { deep: true }
);

const handlePageChange = (page) => {
  serverOptions.value.page = page;
  fetchData();
};

const handlePerPageChange = (perPage) => {
  serverOptions.value.row_per_page = perPage;
  serverOptions.value.page = 1;
  fetchData();
};
</script>

<template>
  <Statisctics />

  <!-- Search Section -->
  <div class="bg-white border border-[#DCDEDD] rounded-[20px] mb-6 p-4">
    <div
      class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
    >
      <!-- Search Bar -->
      <div class="flex-1 relative">
        <div
          class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"
        >
          <Search class="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          class="w-full pl-12 pr-4 py-3 border border-[#DCDEDD] rounded-[16px] hover:border-[#0C51D9] hover:border-2 focus:border-[#0C51D9] focus:border-2 focus:bg-white transition-all duration-300"
          placeholder="Search employees by name, department, role..."
          v-model="filters.search"
        />
      </div>

      <!-- Filter and Action Buttons -->
      <div class="flex flex-wrap items-center gap-3">
        <!-- Department Filter -->
        <div class="relative">
          <div
            class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"
          >
            <Building class="h-4 w-4 text-gray-400" />
          </div>
          <select
            class="pl-10 pr-8 py-3 border border-[#DCDEDD] rounded-[16px] hover:border-[#0C51D9] hover:border-2 focus:border-[#0C51D9] focus:border-2 transition-all duration-300 bg-white appearance-none"
            v-model="filters.department"
          >
            <option value="">{{ t("employee.allDepartments") }}</option>
            <option
              v-for="dept in departments"
              :key="dept.value"
              :value="dept.value"
            >
              {{ dept.label }}
            </option>
          </select>
          <div
            class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"
          >
            <ChevronDown class="h-4 w-4 text-gray-400" />
          </div>
        </div>

        <!-- Store Filter -->
        <div class="relative">
          <div
            class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"
          >
            <Store class="h-4 w-4 text-gray-400" />
          </div>
          <select
            class="pl-10 pr-8 py-3 border border-[#DCDEDD] rounded-[16px] hover:border-[#0C51D9] hover:border-2 focus:border-[#0C51D9] focus:border-2 transition-all duration-300 bg-white appearance-none"
            v-model="filters.store_id"
          >
            <option value="">{{ t("employee.allStores") }}</option>
            <option
              v-for="store in stores"
              :key="store.id"
              :value="store.id"
            >
              {{ store.name }}
            </option>
          </select>
          <div
            class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"
          >
            <ChevronDown class="h-4 w-4 text-gray-400" />
          </div>
        </div>

        <!-- Type Filter -->
        <div class="relative">
          <div
            class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"
          >
            <Briefcase class="h-4 w-4 text-gray-400" />
          </div>
          <select
            class="pl-10 pr-8 py-3 border border-[#DCDEDD] rounded-[16px] hover:border-[#0C51D9] hover:border-2 focus:border-[#0C51D9] focus:border-2 transition-all duration-300 bg-white appearance-none"
            v-model="filters.type"
          >
            <option value="">All Types</option>
            <option
              v-for="employmentType in employmentTypes"
              :key="employmentType.value"
              :value="employmentType.value"
            >
              {{ employmentType.label }}
            </option>
          </select>
          <div
            class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"
          >
            <ChevronDown class="h-4 w-4 text-gray-400" />
          </div>
        </div>

        <!-- Vendor Name Filter -->
        <div class="relative">
          <div
            class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none"
          >
            <Tag class="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            v-model="filters.vendor_name"
            :placeholder="t('employee.filterVendor')"
            class="w-40 pl-9 pr-3 py-3 border border-[#DCDEDD] rounded-[16px] hover:border-[#0C51D9] hover:border-2 focus:border-[#0C51D9] focus:border-2 transition-all duration-300 bg-white text-sm"
          />
        </div>

        <!-- Status Filter -->
        <div class="relative">
          <div
            class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"
          >
            <CheckCircle class="h-4 w-4 text-gray-400" />
          </div>
          <select
            class="pl-10 pr-8 py-3 border border-[#DCDEDD] rounded-[16px] hover:border-[#0C51D9] hover:border-2 focus:border-[#0C51D9] focus:border-2 transition-all duration-300 bg-white appearance-none"
            v-model="filters.status"
          >
            <option value="">All Status</option>
            <option
              v-for="jobStatus in jobStatuses"
              :key="jobStatus.value"
              :value="jobStatus.value"
            >
              {{ jobStatus.label }}
            </option>
          </select>
          <div
            class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"
          >
            <ChevronDown class="h-4 w-4 text-gray-400" />
          </div>
        </div>
      </div>
    </div>
  </div>

  <Alert type="success" :title="success" :show="success" />

  <div class="bg-white border border-[#DCDEDD] rounded-[20px] mb-6 p-5">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h3
          class="text-[#0C1C3C] font-['Plus_Jakarta_Sans'] text-[20px] font-bold"
        >
          All Employees
        </h3>
        <p
          class="text-[#6B7280] font-['Plus_Jakarta_Sans'] text-[14px] font-normal mt-1"
        >
          Showing {{ meta.from }} - {{ meta.to }} of {{ meta.total }} employees
        </p>
      </div>
      <div class="flex items-center gap-[10px]">
        <button
          class="border border-[#DCDEDD] rounded-[8px] hover:border-[#0C51D9] hover:border-2 hover:bg-gray-50 transition-all duration-300 px-4 py-3 flex items-center gap-2"
        >
          <Upload class="w-4 h-4 text-gray-600" />
          <span class="text-brand-dark text-sm font-semibold">Import CSV</span>
        </button>
        <RouterLink
          :to="{ name: 'admin.employees.create' }"
          class="btn-primary rounded-[8px] border border-[#2151A0] hover:brightness-110 focus:ring-2 focus:ring-[#0C51D9] transition-all duration-300 blue-gradient blue-btn-shadow px-4 py-3"
          v-if="can('employee-create')"
        >
          <UserPlus class="w-4 h-4 text-white" />
          <span class="text-brand-white text-sm font-semibold"
            >Add Employee</span
          >
        </RouterLink>
      </div>
    </div>

    <!-- Employee Grid -->
    <div
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6"
    >
      <CardList
        v-for="employee in employees"
        :key="employee.id"
        :data="employee"
      />
    </div>

    <!-- Pagination -->
    <Pagination
      :meta="meta"
      :loading="loading"
      @page-change="handlePageChange"
      @per-page-change="handlePerPageChange"
    />
  </div>
</template>
