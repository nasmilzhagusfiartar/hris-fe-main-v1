<script setup lang="ts">
import FormTips from "@/components/common/FormTips.vue";

const step2Tips = [
  { titleKey: "tips.employeeStep2.roleTitle", descKey: "tips.employeeStep2.roleDesc" },
  { titleKey: "tips.employeeStep2.scheduleTitle", descKey: "tips.employeeStep2.scheduleDesc" },
  { titleKey: "tips.employeeStep2.bankTitle", descKey: "tips.employeeStep2.bankDesc" },
];
</script>

<template>
  <div class="w-full lg:w-80 flex-shrink-0 lg:sticky lg:top-6">
    <FormTips
      title-key="tips.employeeStep2.title"
      subtitle-key="tips.employeeStep2.subtitle"
      :items="step2Tips"
      accent="green"
    />
  </div>
</template>
