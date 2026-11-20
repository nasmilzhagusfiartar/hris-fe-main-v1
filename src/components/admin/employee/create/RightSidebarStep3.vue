<script setup lang="ts">
import FormTips from "@/components/common/FormTips.vue";

const step3Tips = [
  { titleKey: "tips.employeeStep3.contactTitle", descKey: "tips.employeeStep3.contactDesc" },
  { titleKey: "tips.employeeStep3.relationTitle", descKey: "tips.employeeStep3.relationDesc" },
  { titleKey: "tips.employeeStep3.reviewTitle", descKey: "tips.employeeStep3.reviewDesc" },
];
</script>

<template>
  <div class="w-full lg:w-80 flex-shrink-0 lg:sticky lg:top-6">
    <FormTips
      title-key="tips.employeeStep3.title"
      subtitle-key="tips.employeeStep3.subtitle"
      :items="step3Tips"
      accent="green"
    />
  </div>
</template>
