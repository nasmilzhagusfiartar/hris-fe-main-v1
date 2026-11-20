<script setup lang="ts">
import { computed } from "vue";
import { AlertCircle, ArrowRight, X } from "lucide-vue-next";

interface Props {
  show: boolean;
  errors?: any;
  message?: string;
}

const props = withDefaults(defineProps<Props>(), {
  show: false,
  errors: () => ({}),
  message: "Please review and complete the invalid fields.",
});

const emit = defineEmits(["close", "goToStep"]);

const friendlyLabels: Record<string, { label: string; step: number; stepName: string }> = {
  // Step 1
  name: { label: "Full Name", step: 1, stepName: "Personal Info" },
  email: { label: "Email", step: 1, stepName: "Personal Info" },
  password: { label: "Password", step: 1, stepName: "Personal Info" },
  password_confirmation: { label: "Confirm Password", step: 1, stepName: "Personal Info" },
  identity_number: { label: "Identity Number (NIK/ID)", step: 1, stepName: "Personal Info" },
  phone: { label: "Phone Number", step: 1, stepName: "Personal Info" },
  date_of_birth: { label: "Date of Birth", step: 1, stepName: "Personal Info" },
  hobby: { label: "Hobby", step: 1, stepName: "Personal Info" },
  place_of_birth: { label: "Place of Birth", step: 1, stepName: "Personal Info" },
  gender: { label: "Gender", step: 1, stepName: "Personal Info" },
  address: { label: "Address", step: 1, stepName: "Personal Info" },
  city: { label: "City", step: 1, stepName: "Personal Info" },
  postal_code: { label: "Postal Code", step: 1, stepName: "Personal Info" },
  profile_photo: { label: "Profile Photo", step: 1, stepName: "Personal Info" },

  // Step 2
  job_title: { label: "Job Title", step: 2, stepName: "Job Info" },
  team_id: { label: "Team", step: 2, stepName: "Job Info" },
  years_experience: { label: "Years of Experience", step: 2, stepName: "Job Info" },
  status: { label: "Employment Status", step: 2, stepName: "Job Info" },
  employment_type: { label: "Employment Type", step: 2, stepName: "Job Info" },
  work_location: { label: "Work Location", step: 2, stepName: "Job Info" },
  start_date: { label: "Start Date", step: 2, stepName: "Job Info" },
  monthly_salary: { label: "Monthly Salary", step: 2, stepName: "Job Info" },
  skill_level: { label: "Skill Level", step: 2, stepName: "Job Info" },
  bank_name: { label: "Bank Name", step: 2, stepName: "Job Info" },
  account_number: { label: "Account Number", step: 2, stepName: "Job Info" },
  account_holder_name: { label: "Account Holder Name", step: 2, stepName: "Job Info" },
  bank_branch: { label: "Bank Branch", step: 2, stepName: "Job Info" },
  account_type: { label: "Account Type", step: 2, stepName: "Job Info" },
  role: { label: "User Role", step: 2, stepName: "Job Info" },
  roles: { label: "User Role", step: 2, stepName: "Job Info" },

  // Step 3
  emergency_contact_name: { label: "Emergency Contact Name", step: 3, stepName: "Emergency Contact" },
  emergency_contact_relationship: { label: "Contact Relationship", step: 3, stepName: "Emergency Contact" },
  emergency_contact_phone: { label: "Contact Phone Number", step: 3, stepName: "Emergency Contact" },
  emergency_contact_email: { label: "Emergency Contact Email", step: 3, stepName: "Emergency Contact" },
  preferred_language: { label: "Preferred Language", step: 3, stepName: "Emergency Contact" },
  additional_notes: { label: "Additional Notes", step: 3, stepName: "Emergency Contact" },
};

const formattedErrors = computed(() => {
  if (!props.errors) return [];
  const list: { field: string; label: string; message: string; step: number; stepName: string }[] = [];

  if (typeof props.errors === "string") {
    list.push({
      field: "general",
      label: "Error",
      message: props.errors,
      step: 1,
      stepName: "Form",
    });
    return list;
  }

  if (typeof props.errors === "object") {
    for (const [key, val] of Object.entries(props.errors)) {
      const msg = Array.isArray(val) ? val.join(", ") : String(val);
      let meta = friendlyLabels[key];

      if (!meta) {
        if (key.includes("emergency_contacts")) {
          meta = { label: "Emergency Contact", step: 3, stepName: "Emergency Contact" };
        } else if (key.startsWith("roles")) {
          meta = { label: "User Role", step: 2, stepName: "Job Info" };
        } else {
          meta = { label: key, step: 1, stepName: "Form" };
        }
      }

      list.push({
        field: key,
        label: meta.label,
        message: msg,
        step: meta.step,
        stepName: meta.stepName,
      });
    }
  }

  return list;
});

const handleJumpToStep = (step: number) => {
  emit("goToStep", step);
  emit("close");
};
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-300"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="show"
        class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        @click="emit('close')"
      >
        <Transition
          enter-active-class="transition-all duration-300"
          enter-from-class="opacity-0 scale-95"
          enter-to-class="opacity-100 scale-100"
          leave-active-class="transition-all duration-300"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-95"
        >
          <div
            v-if="show"
            @click.stop
            class="bg-white rounded-[24px] border border-[#DCDEDD] w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[85vh]"
          >
            <!-- Modal Header -->
            <div class="p-6 border-b border-[#DCDEDD] flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div
                  class="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0"
                >
                  <AlertCircle class="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 class="text-brand-dark text-lg font-bold">
                    Form Validation Failed
                  </h3>
                  <p class="text-brand-light text-xs font-normal">
                    {{ message || "Some fields need to be corrected" }}
                  </p>
                </div>
              </div>
              <button
                type="button"
                @click="emit('close')"
                class="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-colors"
              >
                <X class="w-5 h-5" />
              </button>
            </div>

            <!-- Modal Content (Scrollable list of errors) -->
            <div class="p-6 overflow-y-auto space-y-3 flex-1">
              <div
                v-for="(err, idx) in formattedErrors"
                :key="idx"
                class="bg-red-50/60 border border-red-200 rounded-xl p-3.5 flex items-start justify-between gap-3"
              >
                <div class="space-y-1 flex-1">
                  <div class="flex items-center gap-2">
                    <span
                      class="bg-red-100 text-red-700 text-[11px] font-semibold px-2 py-0.5 rounded-md"
                    >
                      Step {{ err.step }}: {{ err.stepName }}
                    </span>
                    <span class="text-brand-dark text-xs font-bold">
                      {{ err.label }}
                    </span>
                  </div>
                  <p class="text-red-700 text-xs leading-relaxed">
                    {{ err.message }}
                  </p>
                </div>

                <button
                  type="button"
                  @click="handleJumpToStep(err.step)"
                  class="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-white hover:bg-blue-50 border border-blue-200 rounded-lg px-2.5 py-1.5 transition-colors flex-shrink-0"
                >
                  <span>Fix</span>
                  <ArrowRight class="w-3 h-3" />
                </button>
              </div>

              <div
                v-if="formattedErrors.length === 0"
                class="text-center py-6 text-brand-light text-sm"
              >
                Please review the information you entered.
              </div>
            </div>

            <!-- Modal Footer -->
            <div class="p-4 border-t border-[#DCDEDD] bg-gray-50 flex items-center justify-end gap-3">
              <button
                type="button"
                @click="emit('close')"
                class="px-5 py-2.5 border border-[#DCDEDD] rounded-xl hover:bg-white text-brand-dark text-sm font-semibold transition-colors"
              >
                Close
              </button>
              <button
                v-if="formattedErrors.length > 0"
                type="button"
                @click="handleJumpToStep(formattedErrors[0].step)"
                class="btn-primary rounded-xl border border-[#2151A0] px-5 py-2.5 flex items-center gap-2 blue-gradient blue-btn-shadow text-white text-sm font-semibold"
              >
                <span>Fix in Step {{ formattedErrors[0].step }}</span>
                <ArrowRight class="w-4 h-4" />
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
