<script setup>
import { ref, onMounted, watch } from "vue";
import { useI18n } from "vue-i18n";
import { storeToRefs } from "pinia";
import { debounce } from "lodash";
import {
  Store as StoreIcon,
  Plus,
  Search,
  Edit,
  Trash2,
  MapPin,
  Users,
  X,
  CheckCircle2,
  XCircle,
} from "lucide-vue-next";
import { useStoreStore } from "@/stores/store";
import { useToastStore } from "@/stores/toast";
import { can } from "@/helpers/permissionHelper";
import Pagination from "@/components/admin/team/Pagination.vue";

const { t } = useI18n();
const storeStore = useStoreStore();
const toast = useToastStore();
const { stores, meta, loading } = storeToRefs(storeStore);

const BRANDS = ["Toys City", "Intex Indonesia"];

const serverOptions = ref({
  page: 1,
  row_per_page: 15,
});

const filters = ref({
  search: "",
  brand: "",
  city: "",
  is_active: "",
});

const showModal = ref(false);
const editingStore = ref(null);
const saving = ref(false);
const formErrors = ref({});
const form = ref({
  code: "",
  name: "",
  brand: "Toys City",
  city: "",
  address: "",
  is_active: true,
});

const loadStores = async () => {
  await storeStore.fetchStoresPaginated({
    ...serverOptions.value,
    search: filters.value.search || undefined,
    brand: filters.value.brand || undefined,
    city: filters.value.city || undefined,
    is_active: filters.value.is_active !== "" ? filters.value.is_active : undefined,
  });
};

const openCreateModal = () => {
  editingStore.value = null;
  formErrors.value = {};
  form.value = {
    code: "",
    name: "",
    brand: "Toys City",
    city: "",
    address: "",
    is_active: true,
  };
  showModal.value = true;
};

const openEditModal = (item) => {
  editingStore.value = item;
  formErrors.value = {};
  form.value = {
    code: item.code || "",
    name: item.name || "",
    brand: item.brand || "Toys City",
    city: item.city || "",
    address: item.address || "",
    is_active: Boolean(item.is_active),
  };
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  editingStore.value = null;
  formErrors.value = {};
};

const handleSubmit = async () => {
  saving.value = true;
  formErrors.value = {};
  try {
    const payload = {
      code: form.value.code || null,
      name: form.value.name,
      brand: form.value.brand,
      city: form.value.city,
      address: form.value.address || null,
      is_active: Boolean(form.value.is_active),
    };
    if (editingStore.value) {
      await storeStore.updateStore(editingStore.value.id, payload);
      toast.success(t("store.updatedSuccess"));
    } else {
      await storeStore.createStore(payload);
      toast.success(t("store.createdSuccess"));
    }
    closeModal();
    await loadStores();
  } catch (err) {
    if (err?.response?.status === 422 && err?.response?.data?.errors) {
      formErrors.value = err.response.data.errors;
    } else {
      toast.error(err?.response?.data?.message || t("store.saveFailed"));
    }
  } finally {
    saving.value = false;
  }
};

const handleDelete = async (item) => {
  if (!confirm(t("store.confirmDelete", { name: item.name }))) {
    return;
  }
  try {
    await storeStore.deleteStore(item.id);
    toast.success(t("store.deletedSuccess"));
    await loadStores();
  } catch (err) {
    toast.error(err?.response?.data?.message || t("store.deleteFailed"));
  }
};

const handlePageChange = (page) => {
  serverOptions.value.page = page;
  loadStores();
};

const handlePerPageChange = (perPage) => {
  serverOptions.value.row_per_page = perPage;
  serverOptions.value.page = 1;
  loadStores();
};

watch(
  filters,
  debounce(() => {
    serverOptions.value.page = 1;
    loadStores();
  }, 300),
  { deep: true }
);

onMounted(loadStores);
</script>

<template>
  <div class="space-y-6">
    <!-- Toolbar / Filters -->
    <div class="bg-white border border-[#DCDEDD] rounded-[20px] p-4 sm:p-5 space-y-4">
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div class="flex-1 relative">
          <Search class="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            v-model="filters.search"
            type="text"
            :placeholder="t('store.searchPlaceholder')"
            class="w-full pl-10 pr-4 py-2.5 text-sm border border-[#DCDEDD] rounded-[12px] focus:outline-none focus:border-[#0C51D9]"
          />
        </div>

        <div class="flex flex-wrap items-center gap-2.5">
          <select
            v-model="filters.brand"
            class="px-3.5 py-2.5 text-sm border border-[#DCDEDD] rounded-[12px] bg-white focus:outline-none focus:border-[#0C51D9]"
          >
            <option value="">{{ t("store.allBrands") }}</option>
            <option v-for="b in BRANDS" :key="b" :value="b">{{ b }}</option>
          </select>

          <input
            v-model="filters.city"
            type="text"
            :placeholder="t('store.filterCity')"
            class="px-3.5 py-2.5 text-sm border border-[#DCDEDD] rounded-[12px] bg-white focus:outline-none focus:border-[#0C51D9] w-40"
          />

          <select
            v-model="filters.is_active"
            class="px-3.5 py-2.5 text-sm border border-[#DCDEDD] rounded-[12px] bg-white focus:outline-none focus:border-[#0C51D9]"
          >
            <option value="">{{ t("store.allStatus") }}</option>
            <option value="1">{{ t("enums.active") }}</option>
            <option value="0">{{ t("enums.inactive") }}</option>
          </select>

          <button
            v-if="can('store-create')"
            type="button"
            @click="openCreateModal"
            class="btn-primary rounded-[12px] border border-[#2151A0] blue-gradient blue-btn-shadow hover:brightness-110 px-4 py-2.5 text-white text-sm font-semibold inline-flex items-center gap-2 cursor-pointer"
          >
            <Plus class="w-4 h-4" />
            <span>{{ t("store.addStore") }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Stores List Table -->
    <div class="bg-white border border-[#DCDEDD] rounded-[20px] overflow-hidden">
      <div v-if="loading" class="p-10 text-center text-sm text-gray-500">
        {{ t("common.loading") }}
      </div>

      <div v-else-if="stores.length === 0" class="p-12 text-center space-y-3">
        <StoreIcon class="w-12 h-12 text-gray-300 mx-auto" />
        <h3 class="text-base font-bold text-gray-800">{{ t("store.emptyTitle") }}</h3>
        <p class="text-xs text-gray-500">{{ t("store.emptySub") }}</p>
        <button
          v-if="can('store-create')"
          type="button"
          @click="openCreateModal"
          class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0C51D9] text-white text-xs font-semibold hover:bg-blue-700 cursor-pointer"
        >
          <Plus class="w-4 h-4" />
          <span>{{ t("store.addStore") }}</span>
        </button>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-gray-50 border-b border-[#DCDEDD] text-xs uppercase tracking-wider text-gray-600">
              <th class="p-4 font-bold">{{ t("store.code") }}</th>
              <th class="p-4 font-bold">{{ t("store.name") }}</th>
              <th class="p-4 font-bold">{{ t("store.brand") }}</th>
              <th class="p-4 font-bold">{{ t("store.city") }}</th>
              <th class="p-4 font-bold">{{ t("store.activeEmployees") }}</th>
              <th class="p-4 font-bold">{{ t("store.status") }}</th>
              <th class="p-4 font-bold text-right">{{ t("store.actions") }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 text-sm">
            <tr v-for="item in stores" :key="item.id" class="hover:bg-blue-50/30">
              <td class="p-4 font-mono text-xs text-gray-600">{{ item.code || "-" }}</td>
              <td class="p-4">
                <p class="font-semibold text-brand-dark">{{ item.name }}</p>
                <p v-if="item.address" class="text-xs text-gray-500 mt-0.5 line-clamp-1">
                  {{ item.address }}
                </p>
              </td>
              <td class="p-4">
                <span class="px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-50 text-[#0C51D9] border border-blue-100">
                  {{ item.brand }}
                </span>
              </td>
              <td class="p-4 text-gray-700">
                <span class="inline-flex items-center gap-1">
                  <MapPin class="w-3.5 h-3.5 text-gray-400" />
                  {{ item.city }}
                </span>
              </td>
              <td class="p-4">
                <span class="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-700">
                  <Users class="w-3.5 h-3.5 text-gray-400" />
                  {{ item.active_employees_count }}
                </span>
              </td>
              <td class="p-4">
                <span
                  v-if="item.is_active"
                  class="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200"
                >
                  <CheckCircle2 class="w-3.5 h-3.5" />
                  {{ t("enums.active") }}
                </span>
                <span
                  v-else
                  class="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-200"
                >
                  <XCircle class="w-3.5 h-3.5" />
                  {{ t("enums.inactive") }}
                </span>
              </td>
              <td class="p-4 text-right">
                <div class="inline-flex items-center gap-2">
                  <button
                    v-if="can('store-edit')"
                    type="button"
                    @click="openEditModal(item)"
                    :title="t('common.edit')"
                    class="p-2 rounded-lg border border-[#DCDEDD] text-gray-600 hover:border-[#0C51D9] hover:text-[#0C51D9] cursor-pointer"
                  >
                    <Edit class="w-4 h-4" />
                  </button>
                  <button
                    v-if="can('store-delete')"
                    type="button"
                    @click="handleDelete(item)"
                    :title="t('common.delete')"
                    class="p-2 rounded-lg border border-[#DCDEDD] text-gray-600 hover:border-red-500 hover:text-red-600 cursor-pointer"
                  >
                    <Trash2 class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="meta && meta.total > 0" class="p-4 border-t border-gray-200">
        <Pagination
          :meta="meta"
          :loading="loading"
          @page-change="handlePageChange"
          @per-page-change="handlePerPageChange"
        />
      </div>
    </div>

    <!-- Create / Edit Store Modal -->
    <div
      v-if="showModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4"
      @click.self="closeModal"
    >
      <div class="bg-white rounded-2xl border border-[#DCDEDD] shadow-2xl w-full max-w-lg overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 class="text-lg font-bold text-brand-dark">
            {{ editingStore ? t("store.editStore") : t("store.addStore") }}
          </h3>
          <button
            type="button"
            @click="closeModal"
            class="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 cursor-pointer"
          >
            <X class="w-4 h-4" />
          </button>
        </div>

        <form @submit.prevent="handleSubmit" class="p-6 space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-gray-700 mb-1">
                {{ t("store.code") }}
              </label>
              <input
                v-model="form.code"
                type="text"
                placeholder="TC-JKT-01"
                class="w-full px-3.5 py-2.5 text-sm border border-[#DCDEDD] rounded-xl focus:outline-none focus:border-[#0C51D9]"
              />
              <p v-if="formErrors.code" class="text-xs text-red-600 mt-1">{{ formErrors.code[0] }}</p>
            </div>

            <div>
              <label class="block text-xs font-semibold text-gray-700 mb-1">
                {{ t("store.brand") }} *
              </label>
              <select
                v-model="form.brand"
                required
                class="w-full px-3.5 py-2.5 text-sm border border-[#DCDEDD] rounded-xl bg-white focus:outline-none focus:border-[#0C51D9]"
              >
                <option v-for="b in BRANDS" :key="b" :value="b">{{ b }}</option>
              </select>
              <p v-if="formErrors.brand" class="text-xs text-red-600 mt-1">{{ formErrors.brand[0] }}</p>
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold text-gray-700 mb-1">
              {{ t("store.name") }} *
            </label>
            <input
              v-model="form.name"
              type="text"
              required
              :placeholder="t('store.namePlaceholder')"
              class="w-full px-3.5 py-2.5 text-sm border border-[#DCDEDD] rounded-xl focus:outline-none focus:border-[#0C51D9]"
            />
            <p v-if="formErrors.name" class="text-xs text-red-600 mt-1">{{ formErrors.name[0] }}</p>
          </div>

          <div>
            <label class="block text-xs font-semibold text-gray-700 mb-1">
              {{ t("store.city") }} *
            </label>
            <input
              v-model="form.city"
              type="text"
              required
              :placeholder="t('store.cityPlaceholder')"
              class="w-full px-3.5 py-2.5 text-sm border border-[#DCDEDD] rounded-xl focus:outline-none focus:border-[#0C51D9]"
            />
            <p v-if="formErrors.city" class="text-xs text-red-600 mt-1">{{ formErrors.city[0] }}</p>
          </div>

          <div>
            <label class="block text-xs font-semibold text-gray-700 mb-1">
              {{ t("store.address") }}
            </label>
            <textarea
              v-model="form.address"
              rows="3"
              :placeholder="t('store.addressPlaceholder')"
              class="w-full px-3.5 py-2.5 text-sm border border-[#DCDEDD] rounded-xl focus:outline-none focus:border-[#0C51D9]"
            ></textarea>
          </div>

          <label class="inline-flex items-center gap-2.5 cursor-pointer select-none">
            <input
              v-model="form.is_active"
              type="checkbox"
              class="w-4 h-4 rounded border-gray-300 text-[#0C51D9] focus:ring-[#0C51D9]"
            />
            <span class="text-sm font-medium text-gray-700">{{ t("store.isActiveLabel") }}</span>
          </label>

          <div class="flex items-center justify-end gap-2.5 pt-2 border-t border-gray-100">
            <button
              type="button"
              @click="closeModal"
              class="px-4 py-2 rounded-xl border border-[#DCDEDD] text-sm font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
            >
              {{ t("common.cancel") }}
            </button>
            <button
              type="submit"
              :disabled="saving"
              class="px-5 py-2 rounded-xl bg-[#0C51D9] text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
            >
              {{ saving ? t("common.saving") : t("common.save") }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
