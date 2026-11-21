<script setup>
import { onMounted, ref, watch, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useTeamStore } from "@/stores/team";
import { useEmployeeStore } from "@/stores/employee";
import { useToastStore } from "@/stores/toast";
import { storeToRefs } from "pinia";
import {
  Calendar,
  CheckCircle,
  Users,
  UserPlus,
  Mail,
  Crown,
  Phone,
  UserCheck,
  Settings,
  ListCheck,
  Check,
  Eye,
  Clock,
  Activity,
  AlertTriangle,
  Trash2,
  X,
  Edit,
  SearchX,
  UserMinus,
} from "lucide-vue-next";
import { debounce } from "lodash";
import { formatToClientTimezone } from "@/helpers/format";
import { can } from "@/helpers/permissionHelper";
import Alert from "@/components/common/Alert.vue";
import ConfirmationModal from "@/components/common/ConfirmationModal.vue";
import Header from "@/components/admin/team/detail/Header.vue";
import Statistic from "@/components/admin/team/detail/Statistic.vue";
import Chart from "@/components/admin/team/detail/Chart.vue";
import SearchInput from "@/components/common/SearchInput.vue";
import { getImageUrl, handleImageError } from "@/helpers/imageHelper";

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const toast = useToastStore();
const id = route.params.id;

const teamStore = useTeamStore();
const { loading, success, error } = storeToRefs(teamStore);
const { fetchTeam, updateTeam, deleteTeam, addMember, removeMember } = teamStore;

const employeeStore = useEmployeeStore();
const { employees } = storeToRefs(employeeStore);
const { fetchEmployees } = employeeStore;

const team = ref({});
const showDeleteModal = ref(false);
const showAddMemberModal = ref(false);
const showAssignLeadModal = ref(false);
const searchMember = ref("");
const searchLead = ref("");
const addingMember = ref(false);
const assigningLead = ref(false);
const removingMember = ref(false);
const showRemoveMemberModal = ref(false);
const memberToRemove = ref(null);
const showAllMembers = ref(false);

const canEditTeam = computed(() => can("team-edit"));
const canDeleteTeam = computed(() => can("team-delete"));

const membersList = computed(() =>
  Array.isArray(team.value?.members) ? team.value.members : []
);

const membersCount = computed(
  () => team.value?.members_count ?? membersList.value.length
);

const visibleMembers = computed(() =>
  showAllMembers.value ? membersList.value : membersList.value.slice(0, 4)
);

const responsibilitiesList = computed(() => {
  const raw = team.value?.responsibilities;
  if (!Array.isArray(raw)) return [];
  return raw.filter((item) => typeof item === "string" && item.trim() !== "");
});

const recentActivities = computed(() =>
  Array.isArray(team.value?.recent_activities)
    ? team.value.recent_activities.slice(0, 5)
    : []
);

const departmentLabel = computed(() => {
  const dept = team.value?.department;
  if (!dept) return "-";
  const key = `enums.${dept}`;
  return t(key) !== key ? t(key) : String(dept).replace(/_/g, " ");
});

const statusLabel = computed(() => {
  const st = team.value?.status;
  if (!st) return "-";
  const key = `enums.${st}`;
  return t(key) !== key ? t(key) : String(st);
});

const statusBadgeClass = computed(() => {
  const st = String(team.value?.status || "").toLowerCase();
  if (st === "active") return "bg-emerald-50 text-emerald-700 border border-emerald-200";
  if (st === "inactive") return "bg-gray-100 text-gray-600 border border-gray-200";
  return "bg-blue-50 text-blue-700 border border-blue-200";
});

const memberStatusClass = (status) => {
  const st = String(status || "").toLowerCase();
  if (st === "active") return "bg-emerald-50 text-emerald-700 border border-emerald-200";
  if (st === "on_leave") return "bg-amber-50 text-amber-700 border border-amber-200";
  return "bg-gray-100 text-gray-600 border border-gray-200";
};

const memberStatusLabel = (status) => {
  if (!status) return "-";
  const key = `enums.${status}`;
  return t(key) !== key ? t(key) : String(status).replace(/_/g, " ");
};

const formatRelativeTime = (iso) => {
  if (!iso) return "";
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 60) return t("time.justNow");
  const hours = Math.floor(mins / 60);
  if (hours < 24) return t("time.hoursAgo", { count: hours });
  const days = Math.floor(hours / 24);
  if (days === 1) return t("time.oneDayAgo");
  return t("time.daysAgo", { count: days });
};

const availableEmployees = computed(() => {
  const memberIds = membersList.value
    .map((member) => member.employee?.id)
    .filter(Boolean);
  return employees.value.filter((employee) => !memberIds.includes(employee.id));
});

const handleFetchTeam = async () => {
  const response = await fetchTeam(id);
  team.value = response || {};
};

const handleDeleteTeam = async () => {
  await deleteTeam(id);

  if (success.value) {
    showDeleteModal.value = false;
    router.push({ name: "admin.teams" });
  }
};

const openAddMemberModal = () => {
  showAddMemberModal.value = true;
  fetchEmployees({ limit: 12 });
};

const closeAddMemberModal = () => {
  showAddMemberModal.value = false;
  searchMember.value = "";
};

const handleAddMember = async (employee) => {
  try {
    addingMember.value = true;
    await addMember(id, employee.id);
    await handleFetchTeam();
    closeAddMemberModal();
  } catch (err) {
    console.error("Failed to add member:", err);
  } finally {
    addingMember.value = false;
  }
};

const openAssignLeadModal = () => {
  showAssignLeadModal.value = true;
  fetchEmployees({ limit: 12 });
};

const closeAssignLeadModal = () => {
  showAssignLeadModal.value = false;
  searchLead.value = "";
};

const handleAssignLead = async (employee) => {
  const userId = employee?.user?.id;
  if (!userId) return;
  try {
    assigningLead.value = true;
    const payload = {
      name: team.value.name,
      expected_size: team.value.expected_size || 1,
      description: team.value.description || "",
      department: team.value.department || "sales",
      status: team.value.status || "active",
      team_lead_id: userId,
      responsibilities:
        responsibilitiesList.value.length >= 3
          ? responsibilitiesList.value
          : [
              ...responsibilitiesList.value,
              ...Array(Math.max(0, 3 - responsibilitiesList.value.length)).fill("General team duty"),
            ],
    };
    await updateTeam(id, payload);
    if (error.value) {
      toast.error(typeof error.value === "string" ? error.value : t("team.assignLeadFailed"));
    } else {
      toast.success(t("team.assignLeadSuccess"));
      await handleFetchTeam();
      closeAssignLeadModal();
    }
  } catch (err) {
    toast.error(t("team.assignLeadFailed"));
  } finally {
    assigningLead.value = false;
  }
};

const handleRemoveMember = async (member) => {
  try {
    removingMember.value = true;
    await removeMember(id, member.employee.id);
    await handleFetchTeam();
  } catch (err) {
    console.error("Failed to remove member:", err);
  } finally {
    removingMember.value = false;
  }
};

const openRemoveMemberModal = (member) => {
  memberToRemove.value = member;
  showRemoveMemberModal.value = true;
};

const confirmRemoveMember = async () => {
  if (!memberToRemove.value) return;
  await handleRemoveMember(memberToRemove.value);
  showRemoveMemberModal.value = false;
  memberToRemove.value = null;
};

onMounted(async () => {
  await handleFetchTeam();
});

watch(
  searchMember,
  debounce(() => {
    fetchEmployees({
      limit: 12,
      search: searchMember.value,
    });
  }, 300)
);

watch(
  searchLead,
  debounce(() => {
    fetchEmployees({
      limit: 12,
      search: searchLead.value,
    });
  }, 300)
);
</script>

<template>
  <Alert type="success" :title="success" :show="success" />

  <Header :team="team" />

  <Statistic :team="team" />

  <Chart :team="team" />

  <!-- Row 1: Team Lead & Team Settings -->
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
    <!-- Team Lead Information -->
    <div class="bg-white border border-[#DCDEDD] rounded-[16px] p-6 flex flex-col">
      <div class="flex items-center justify-between mb-6 gap-2 flex-wrap">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 bg-green-50 rounded-[12px] flex items-center justify-center">
            <Crown class="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h3 class="text-brand-dark text-lg font-bold">{{ t("team.teamLead") }}</h3>
            <p class="text-brand-light text-sm">{{ t("team.teamLeadSub") }}</p>
          </div>
        </div>
        <button
          v-if="team.leader && canEditTeam"
          type="button"
          @click="openAssignLeadModal"
          class="text-xs font-semibold text-[#0C51D9] hover:underline cursor-pointer"
        >
          {{ t("team.changeLead") }}
        </button>
      </div>

      <div class="flex flex-col gap-4 flex-1" v-if="team.leader">
        <!-- Team Lead Profile -->
        <div class="border border-[#DCDEDD] rounded-[12px] p-4">
          <div class="flex items-center justify-between gap-3 flex-wrap">
            <div class="flex items-center gap-4 min-w-0">
              <div class="relative flex-shrink-0">
                <img
                  :src="getImageUrl(team.leader.profile_photo, team.leader?.name || 'Team Lead')"
                  :alt="team.leader?.name || 'Team Lead'"
                  @error="handleImageError($event, team.leader?.name || 'Team Lead')"
                  class="w-16 h-16 rounded-full object-cover"
                />
                <div class="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
              </div>
              <div class="min-w-0">
                <h4 class="text-brand-dark text-base font-bold truncate">
                  {{ team.leader?.name }}
                </h4>
                <p class="text-brand-light text-sm truncate">
                  {{ team.leader?.employee_profile?.job_information?.job_title || "-" }}
                </p>
              </div>
            </div>
            <span class="px-2.5 py-1 rounded-md text-xs font-semibold bg-[#EBF8FF] text-[#1E40AF]">
              {{ t("team.teamLead") }}
            </span>
          </div>
        </div>

        <!-- Contact Information -->
        <div class="space-y-2">
          <div class="flex items-center gap-3 p-2.5 rounded-[8px] bg-gray-50/70">
            <div class="w-8 h-8 bg-blue-50 rounded-[8px] flex items-center justify-center flex-shrink-0">
              <Mail class="w-4 h-4 text-blue-600" />
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-brand-light text-xs font-medium">Email</p>
              <p class="text-brand-dark text-sm font-semibold truncate">
                {{ team.leader.email || "-" }}
              </p>
            </div>
          </div>
          <div
            v-if="team.leader?.employee_profile?.phone"
            class="flex items-center gap-3 p-2.5 rounded-[8px] bg-gray-50/70"
          >
            <div class="w-8 h-8 bg-green-50 rounded-[8px] flex items-center justify-center flex-shrink-0">
              <Phone class="w-4 h-4 text-green-600" />
            </div>
            <div class="flex-1">
              <p class="text-brand-light text-xs font-medium">{{ t("settings.phoneNumber") }}</p>
              <p class="text-brand-dark text-sm font-semibold">
                {{ team.leader.employee_profile.phone }}
              </p>
            </div>
          </div>
        </div>

        <!-- View Profile Action -->
        <div class="mt-auto pt-4 border-t border-[#DCDEDD]">
          <RouterLink
            v-if="team.leader?.employee_profile?.id"
            :to="{
              name: 'admin.employees.detail',
              params: { id: team.leader.employee_profile.id },
            }"
            class="w-full border border-[#DCDEDD] rounded-[8px] hover:border-[#0C51D9] hover:border-2 hover:bg-gray-50 transition-all duration-300 px-4 py-2.5 flex items-center justify-center gap-2"
          >
            <UserCheck class="w-4 h-4 text-brand-light" />
            <span class="text-brand-dark text-sm font-semibold">{{ t("team.viewProfile") }}</span>
          </RouterLink>
        </div>
      </div>

      <!-- Empty State: No Team Lead -->
      <div class="flex flex-1 items-center justify-center min-h-[220px]" v-else>
        <div class="flex flex-col items-center justify-center text-center">
          <Crown class="w-12 h-12 text-gray-300 mb-3" />
          <h4 class="text-brand-dark text-base font-bold mb-1">
            {{ t("team.noLeadTitle") }}
          </h4>
          <p class="text-brand-light text-sm mb-4">
            {{ t("team.noLeadSub") }}
          </p>
          <button
            v-if="canEditTeam"
            type="button"
            @click="openAssignLeadModal"
            class="btn-primary rounded-[8px] border border-[#2151A0] hover:brightness-110 blue-gradient blue-btn-shadow px-4 py-2.5 text-white text-sm font-semibold inline-flex items-center gap-2 cursor-pointer"
          >
            <Crown class="w-4 h-4" />
            <span>{{ t("team.assignLead") }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Team Settings -->
    <div class="bg-white border border-[#DCDEDD] rounded-[16px] p-6 flex flex-col">
      <div class="flex items-center justify-between mb-6 gap-2">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 bg-purple-50 rounded-[12px] flex items-center justify-center">
            <Settings class="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h3 class="text-brand-dark text-lg font-bold">{{ t("team.settingsTitle") }}</h3>
            <p class="text-brand-light text-sm">{{ t("team.settingsSub") }}</p>
          </div>
        </div>
        <RouterLink
          v-if="canEditTeam"
          :to="{ name: 'admin.teams.edit', params: { id } }"
          class="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0C51D9] hover:underline"
        >
          <Edit class="w-3.5 h-3.5" />
          <span>{{ t("team.editTeam") }}</span>
        </RouterLink>
      </div>

      <div class="divide-y divide-gray-100 flex-1">
        <div class="py-3.5 flex justify-between items-center gap-4">
          <span class="text-brand-light text-sm">{{ t("employee.department") }}</span>
          <span class="text-brand-dark text-sm font-semibold text-right">
            {{ departmentLabel }}
          </span>
        </div>

        <div class="py-3.5 flex justify-between items-center gap-4">
          <span class="text-brand-light text-sm">{{ t("team.expectedSize") }}</span>
          <span class="text-brand-dark text-sm font-semibold text-right">
            {{ membersCount }} / {{ team.expected_size || 0 }} {{ t("team.membersUnit") }}
          </span>
        </div>

        <div class="py-3.5 flex justify-between items-center gap-4">
          <span class="text-brand-light text-sm">{{ t("team.createdDate") }}</span>
          <span class="text-brand-dark text-sm font-semibold text-right">
            {{ team.created_at ? formatToClientTimezone(team.created_at) : "-" }}
          </span>
        </div>

        <div class="py-3.5 flex justify-between items-center gap-4">
          <span class="text-brand-light text-sm">{{ t("store.status") }}</span>
          <span :class="['px-2.5 py-1 rounded-md text-xs font-semibold', statusBadgeClass]">
            {{ statusLabel }}
          </span>
        </div>
      </div>
    </div>
  </div>

  <!-- Team Responsibilities -->
  <div class="bg-white border border-[#DCDEDD] rounded-[16px] p-6 mb-6">
    <div class="flex items-center justify-between mb-6 gap-3 flex-wrap">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 bg-orange-50 rounded-[12px] flex items-center justify-center">
          <ListCheck class="w-6 h-6 text-orange-600" />
        </div>
        <div>
          <h3 class="text-brand-dark text-lg font-bold">{{ t("team.responsibilitiesTitle") }}</h3>
          <p class="text-brand-light text-sm">{{ t("team.responsibilitiesSub") }}</p>
        </div>
      </div>
    </div>

    <div
      v-if="responsibilitiesList.length > 0"
      class="grid grid-cols-1 md:grid-cols-2 gap-4"
    >
      <div
        class="flex items-start gap-3 p-4 bg-gray-50 rounded-[12px]"
        v-for="(responsibility, idx) in responsibilitiesList"
        :key="idx"
      >
        <div class="w-8 h-8 min-w-[32px] bg-blue-100 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
          <Check class="w-4 h-4 text-blue-600" />
        </div>
        <span class="text-brand-dark text-sm font-medium">{{ responsibility }}</span>
      </div>
    </div>

    <div v-else class="text-center py-8 bg-gray-50/70 rounded-[12px] border border-dashed border-gray-200">
      <ListCheck class="w-10 h-10 text-gray-300 mx-auto mb-2" />
      <p class="text-sm font-semibold text-gray-700 mb-1">{{ t("team.noResponsibilitiesTitle") }}</p>
      <p class="text-xs text-gray-500 mb-4">{{ t("team.noResponsibilitiesSub") }}</p>
      <RouterLink
        v-if="canEditTeam"
        :to="{ name: 'admin.teams.edit', params: { id } }"
        class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0C51D9] text-white text-xs font-semibold hover:bg-blue-700"
      >
        <Edit class="w-3.5 h-3.5" />
        <span>{{ t("team.editTeam") }}</span>
      </RouterLink>
    </div>
  </div>

  <!-- Team Members Section -->
  <div class="bg-white border border-[#DCDEDD] rounded-[16px] p-6 mb-6">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 bg-blue-50 rounded-[12px] flex items-center justify-center">
          <Users class="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h3 class="text-brand-dark text-lg font-bold">{{ t("team.membersTitle") }}</h3>
          <p class="text-brand-light text-sm">
            {{ membersCount }} / {{ team.expected_size || 0 }} {{ t("team.membersUnit") }}
          </p>
        </div>
      </div>
      <div class="flex items-center gap-3 flex-wrap">
        <button
          v-if="membersList.length > 4"
          type="button"
          @click="showAllMembers = !showAllMembers"
          class="bg-white border border-[#DCDEDD] text-brand-dark py-2.5 px-4 rounded-[8px] font-medium hover:bg-gray-50 transition-colors flex items-center gap-2 cursor-pointer"
        >
          <Eye class="w-4 h-4" />
          <span class="text-sm font-semibold">
            {{ showAllMembers ? t("team.showLess") : t("team.viewMore", { count: membersList.length - 4 }) }}
          </span>
        </button>
        <button
          v-if="canEditTeam"
          type="button"
          @click="openAddMemberModal"
          class="btn-primary rounded-[8px] border border-[#2151A0] hover:brightness-110 focus:ring-2 focus:ring-[#0C51D9] transition-all duration-300 blue-gradient blue-btn-shadow px-4 py-2.5 flex items-center gap-2 cursor-pointer"
        >
          <UserPlus class="w-4 h-4 text-white" />
          <span class="text-brand-white text-sm font-semibold">{{ t("team.addMember") }}</span>
        </button>
      </div>
    </div>

    <!-- Members Grid -->
    <div
      v-if="visibleMembers.length > 0"
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
    >
      <div
        class="relative border border-[#DCDEDD] rounded-[16px] hover:border-[#0C51D9] hover:border-2 hover:shadow-lg transition-all duration-300 p-4 flex flex-col"
        v-for="member in visibleMembers"
        :key="member.id"
      >
        <button
          v-if="canEditTeam"
          type="button"
          @click="openRemoveMemberModal(member)"
          :disabled="removingMember"
          :title="t('common.delete')"
          class="absolute top-3 right-3 w-8 h-8 rounded-full bg-red-50 border border-red-200 hover:bg-red-100 transition-all duration-300 flex items-center justify-center disabled:opacity-60 cursor-pointer"
        >
          <Trash2 class="w-4 h-4 text-red-600" />
        </button>
        <div class="flex flex-col items-center mb-3">
          <img
            :src="getImageUrl(member.employee?.user?.profile_photo, member.employee?.user?.name || 'Team Member')"
            :alt="member.employee?.user?.name || 'Team Member'"
            @error="handleImageError($event, member.employee?.user?.name || 'Team Member')"
            class="w-20 h-20 rounded-full object-cover mb-2"
          />
          <span
            v-if="member.employee?.job_information?.status"
            :class="['px-2 py-0.5 rounded-full text-[11px] font-semibold', memberStatusClass(member.employee.job_information.status)]"
          >
            {{ memberStatusLabel(member.employee.job_information.status) }}
          </span>
        </div>
        <div class="text-center mb-3">
          <h4 class="text-brand-dark text-base font-bold truncate">
            {{ member.employee?.user?.name || "-" }}
          </h4>
          <p class="text-brand-light text-xs truncate">
            {{ member.employee?.job_information?.job_title || "-" }}
          </p>
        </div>
        <div class="space-y-1 mb-4 text-xs text-gray-500">
          <div class="flex items-center gap-2">
            <Calendar class="w-3.5 h-3.5 flex-shrink-0" />
            <span class="truncate">{{ formatToClientTimezone(member.joined_at) }}</span>
          </div>
          <div class="flex items-center gap-2">
            <Clock class="w-3.5 h-3.5 flex-shrink-0" />
            <span>
              {{ t("employee.yearsExperience", { count: member.employee?.job_information?.years_experience ?? 0 }) }}
            </span>
          </div>
        </div>
        <RouterLink
          v-if="member.employee?.id"
          :to="{
            name: 'admin.employees.detail',
            params: { id: member.employee.id },
          }"
          class="mt-auto w-full border border-[#DCDEDD] rounded-[8px] hover:border-[#0C51D9] hover:border-2 hover:bg-gray-50 transition-all duration-300 px-3 py-2 flex items-center justify-center gap-2"
        >
          <Eye class="w-4 h-4 text-gray-600" />
          <span class="text-brand-dark text-sm font-semibold">{{ t("team.viewProfile") }}</span>
        </RouterLink>
      </div>
    </div>

    <!-- Empty State: No Members -->
    <div v-else class="text-center py-10 bg-gray-50/70 rounded-[12px] border border-dashed border-gray-200">
      <Users class="w-10 h-10 text-gray-300 mx-auto mb-2" />
      <p class="text-sm font-semibold text-gray-700 mb-1">{{ t("team.noMembersTitle") }}</p>
      <p class="text-xs text-gray-500 mb-4">{{ t("team.noMembersSub") }}</p>
      <button
        v-if="canEditTeam"
        type="button"
        @click="openAddMemberModal"
        class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0C51D9] text-white text-xs font-semibold hover:bg-blue-700 cursor-pointer"
      >
        <UserPlus class="w-3.5 h-3.5" />
        <span>{{ t("team.addMember") }}</span>
      </button>
    </div>
  </div>

  <!-- Recent Activity (Real data from Audit Log & Project Tasks) -->
  <div class="bg-white border border-[#DCDEDD] rounded-[16px] p-6 mb-6">
    <div class="flex items-center gap-3 mb-6">
      <div class="w-12 h-12 bg-gray-50 rounded-[12px] flex items-center justify-center">
        <Activity class="w-6 h-6 text-gray-600" />
      </div>
      <div>
        <h3 class="text-brand-dark text-lg font-bold">{{ t("dashboard.recentActivities") }}</h3>
        <p class="text-brand-light text-sm">{{ t("team.recentActivitySub") }}</p>
      </div>
    </div>

    <div v-if="recentActivities.length > 0" class="space-y-3">
      <div
        v-for="item in recentActivities"
        :key="item.id"
        class="flex items-center gap-4 p-4 bg-gray-50 rounded-[12px]"
      >
        <div
          :class="[
            'w-2.5 h-2.5 rounded-full flex-shrink-0',
            item.type === 'task_completed'
              ? 'bg-emerald-500'
              : item.type === 'member_added'
              ? 'bg-blue-500'
              : item.type === 'member_removed'
              ? 'bg-red-500'
              : 'bg-purple-500',
          ]"
        ></div>
        <div class="flex-1 min-w-0">
          <p class="text-brand-dark text-sm font-medium truncate">
            {{ item.title }}
          </p>
          <p class="text-brand-light text-xs">
            {{ formatRelativeTime(item.timestamp) }}
          </p>
        </div>
        <span class="inline-flex items-center gap-1 text-xs font-semibold text-gray-600 flex-shrink-0">
          <CheckCircle v-if="item.type === 'task_completed'" class="w-4 h-4 text-emerald-600" />
          <UserPlus v-else-if="item.type === 'member_added'" class="w-4 h-4 text-blue-600" />
          <UserMinus v-else-if="item.type === 'member_removed'" class="w-4 h-4 text-red-600" />
          <Activity v-else class="w-4 h-4 text-purple-600" />
          <span class="capitalize">{{ String(item.status || item.type).replace(/_/g, " ") }}</span>
        </span>
      </div>
    </div>

    <div v-else class="text-center py-8 text-gray-500">
      <Activity class="w-10 h-10 text-gray-300 mx-auto mb-2" />
      <p class="text-sm font-medium">{{ t("team.noRecentActivity") }}</p>
    </div>
  </div>

  <!-- Danger Zone -->
  <div v-if="canDeleteTeam" class="bg-white border border-[#FEE2E2] rounded-[16px] p-6">
    <div class="flex items-center gap-3 mb-6">
      <div class="w-12 h-12 bg-red-50 rounded-[12px] flex items-center justify-center">
        <AlertTriangle class="w-6 h-6 text-red-600" />
      </div>
      <div>
        <h3 class="text-brand-dark text-lg font-bold">Danger Zone</h3>
        <p class="text-brand-light text-sm">Irreversible and destructive actions</p>
      </div>
    </div>
    <div class="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center p-4 bg-red-50 rounded-[12px]">
      <div class="flex-1">
        <h4 class="text-brand-dark text-base font-bold mb-1">Disband Team</h4>
        <p class="text-brand-light text-sm">
          Permanently remove this team and reassign all members. This action cannot be undone.
        </p>
      </div>
      <button
        type="button"
        @click="showDeleteModal = true"
        class="btn-primary rounded-[8px] border border-[#A02121] hover:brightness-110 focus:ring-2 focus:ring-[#D90C0C] transition-all duration-300 bg-gradient-to-r from-red-500 to-red-600 shadow-lg px-6 py-3 flex items-center gap-2 cursor-pointer"
      >
        <Trash2 class="w-4 h-4 text-white" />
        <span class="text-brand-white text-sm font-semibold">Disband Team</span>
      </button>
    </div>
  </div>

  <!-- Confirmation Modals -->
  <ConfirmationModal
    :show="showDeleteModal"
    title="Disband Team"
    :message="`Are you sure you want to disband '${team.name}'? This will permanently remove the team and reassign all members. This action cannot be undone.`"
    confirmText="Disband Team"
    cancelText="Cancel"
    type="danger"
    :loading="loading"
    @confirm="handleDeleteTeam"
    @cancel="showDeleteModal = false"
  />

  <ConfirmationModal
    :show="showRemoveMemberModal"
    title="Remove Member"
    :message="`Are you sure you want to remove '${memberToRemove?.employee?.user?.name || ''}' from this team?`"
    confirmText="Remove"
    cancelText="Cancel"
    type="danger"
    :loading="loading"
    @confirm="confirmRemoveMember"
    @cancel="showRemoveMemberModal = false"
  />

  <!-- Add Member Modal -->
  <div
    class="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    v-if="showAddMemberModal"
    @click.self="closeAddMemberModal"
  >
    <div class="bg-white rounded-[20px] border border-[#DCDEDD] w-full max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
      <div class="p-6 border-b border-[#DCDEDD] flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 bg-blue-50 rounded-[12px] flex items-center justify-center">
            <UserPlus class="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 class="text-brand-dark text-xl font-bold">{{ t("team.addMember") }}</h3>
            <p class="text-brand-light text-sm">{{ t("team.addMemberSub") }}</p>
          </div>
        </div>
        <button
          type="button"
          @click="closeAddMemberModal"
          class="w-10 h-10 rounded-full border border-[#DCDEDD] flex items-center justify-center hover:border-[#0C51D9] hover:border-2 transition-all duration-200 cursor-pointer"
        >
          <X class="w-5 h-5 text-gray-600" />
        </button>
      </div>

      <div class="p-6 border-b border-[#DCDEDD]">
        <SearchInput v-model="searchMember" :placeholder="t('common.search')" size="lg" />
      </div>

      <div class="p-6 overflow-y-auto flex-1">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            class="border border-[#DCDEDD] rounded-[16px] hover:border-[#0C51D9] hover:border-2 hover:shadow-lg transition-all duration-300 p-4 cursor-pointer"
            v-for="employee in availableEmployees"
            :key="employee.id"
            @click="handleAddMember(employee)"
          >
            <div class="flex items-center gap-4">
              <img
                :src="getImageUrl(employee.user?.profile_photo, employee.user?.name || 'Employee')"
                :alt="employee.user?.name || 'Employee'"
                @error="handleImageError($event, employee.user?.name || 'Employee')"
                class="w-14 h-14 rounded-[12px] object-cover flex-shrink-0"
              />
              <div class="flex-1 min-w-0">
                <h4 class="text-brand-dark text-base font-bold truncate">
                  {{ employee.user?.name }}
                </h4>
                <p class="text-brand-light text-sm truncate">
                  {{ employee.job_information?.job_title || "-" }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div class="text-center py-8" v-if="availableEmployees.length === 0">
          <SearchX class="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h4 class="text-brand-dark text-base font-semibold mb-1">{{ t("team.noAvailableEmployees") }}</h4>
        </div>
      </div>
    </div>
  </div>

  <!-- Assign Team Lead Modal -->
  <div
    class="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    v-if="showAssignLeadModal"
    @click.self="closeAssignLeadModal"
  >
    <div class="bg-white rounded-[20px] border border-[#DCDEDD] w-full max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
      <div class="p-6 border-b border-[#DCDEDD] flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 bg-green-50 rounded-[12px] flex items-center justify-center">
            <Crown class="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h3 class="text-brand-dark text-xl font-bold">{{ t("team.assignLead") }}</h3>
            <p class="text-brand-light text-sm">{{ t("team.assignLeadSub") }}</p>
          </div>
        </div>
        <button
          type="button"
          @click="closeAssignLeadModal"
          class="w-10 h-10 rounded-full border border-[#DCDEDD] flex items-center justify-center hover:border-[#0C51D9] hover:border-2 transition-all duration-200 cursor-pointer"
        >
          <X class="w-5 h-5 text-gray-600" />
        </button>
      </div>

      <div class="p-6 border-b border-[#DCDEDD]">
        <SearchInput v-model="searchLead" :placeholder="t('common.search')" size="lg" />
      </div>

      <div class="p-6 overflow-y-auto flex-1">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            type="button"
            :disabled="assigningLead"
            class="text-left border border-[#DCDEDD] rounded-[16px] hover:border-[#0C51D9] hover:border-2 hover:shadow-lg transition-all duration-300 p-4 cursor-pointer disabled:opacity-50"
            v-for="employee in employees"
            :key="employee.id"
            @click="handleAssignLead(employee)"
          >
            <div class="flex items-center gap-4">
              <img
                :src="getImageUrl(employee.user?.profile_photo, employee.user?.name || 'Employee')"
                :alt="employee.user?.name || 'Employee'"
                @error="handleImageError($event, employee.user?.name || 'Employee')"
                class="w-14 h-14 rounded-[12px] object-cover flex-shrink-0"
              />
              <div class="flex-1 min-w-0">
                <h4 class="text-brand-dark text-base font-bold truncate">
                  {{ employee.user?.name }}
                </h4>
                <p class="text-brand-light text-sm truncate">
                  {{ employee.job_information?.job_title || "-" }}
                </p>
              </div>
            </div>
          </button>
        </div>

        <div class="text-center py-8" v-if="employees.length === 0">
          <SearchX class="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h4 class="text-brand-dark text-base font-semibold mb-1">{{ t("team.noAvailableEmployees") }}</h4>
        </div>
      </div>
    </div>
  </div>
</template>
