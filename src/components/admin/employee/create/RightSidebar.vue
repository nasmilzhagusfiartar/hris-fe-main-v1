<script setup lang="ts">
import { Users, Folder } from "lucide-vue-next";
import FormTips from "@/components/common/FormTips.vue";
import ContextActions from "@/components/common/ContextActions.vue";

const projectTips = [
  { titleKey: "tips.project.scopeTitle", descKey: "tips.project.scopeDesc" },
  { titleKey: "tips.project.leaderTitle", descKey: "tips.project.leaderDesc" },
  { titleKey: "tips.project.timelineTitle", descKey: "tips.project.timelineDesc" },
  { titleKey: "tips.project.teamsTitle", descKey: "tips.project.teamsDesc" },
];

const projectActions = [
  {
    key: "view-projects",
    labelKey: "contextActions.project.viewAll",
    descKey: "contextActions.project.viewAllDesc",
    icon: Folder,
    to: { name: "admin.projects" },
    permission: "project-list",
  },
  {
    key: "browse-teams",
    labelKey: "contextActions.project.browseTeams",
    descKey: "contextActions.project.browseTeamsDesc",
    icon: Users,
    to: { name: "admin.teams" },
    permission: "team-list",
  },
];
</script>

<template>
  <div class="w-full lg:w-80 flex-shrink-0 space-y-6 lg:sticky lg:top-6">
    <FormTips
      title-key="tips.project.title"
      subtitle-key="tips.project.subtitle"
      :items="projectTips"
      accent="amber"
    />

    <ContextActions
      title-key="quickActions.title"
      subtitle-key="contextActions.project.subtitle"
      :actions="projectActions"
    />
  </div>
</template>
