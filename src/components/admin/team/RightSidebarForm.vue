<script setup>
import { Users, Building2 } from "lucide-vue-next";
import FormTips from "@/components/common/FormTips.vue";
import ContextActions from "@/components/common/ContextActions.vue";

const teamTips = [
  { titleKey: "tips.team.nameTitle", descKey: "tips.team.nameDesc" },
  { titleKey: "tips.team.leadTitle", descKey: "tips.team.leadDesc" },
  { titleKey: "tips.team.membersTitle", descKey: "tips.team.membersDesc" },
];

const teamActions = [
  {
    key: "view-teams",
    labelKey: "contextActions.team.viewAll",
    descKey: "contextActions.team.viewAllDesc",
    icon: Building2,
    to: { name: "admin.teams" },
    permission: "team-list",
  },
  {
    key: "browse-employees",
    labelKey: "contextActions.team.browseEmployees",
    descKey: "contextActions.team.browseEmployeesDesc",
    icon: Users,
    to: { name: "admin.employees" },
    permission: "employee-list",
  },
];
</script>

<template>
  <div class="w-full lg:w-80 flex-shrink-0 space-y-6 lg:sticky lg:top-6">
    <FormTips
      title-key="tips.team.title"
      subtitle-key="tips.team.subtitle"
      :items="teamTips"
      accent="amber"
    />

    <ContextActions
      title-key="quickActions.title"
      subtitle-key="contextActions.team.subtitle"
      :actions="teamActions"
    />
  </div>
</template>
