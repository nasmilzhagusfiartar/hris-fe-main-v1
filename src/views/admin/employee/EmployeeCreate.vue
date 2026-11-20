<script setup lang="ts">
import { ref, inject, computed, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { useEmployeeStore } from "@/stores/employee";
import { useToastStore } from "@/stores/toast";
import { storeToRefs } from "pinia";
import { ArrowRight, ArrowLeft, UserPlus, RotateCcw } from "lucide-vue-next";
import { debounce } from "lodash";

import Step1PersonalInfo from "@/components/admin/employee/create/steps/Step1PersonalInfo.vue";
import Step2JobInfo from "@/components/admin/employee/create/steps/Step2JobInfo.vue";
import Step3EmergencyContact from "@/components/admin/employee/create/steps/Step3EmergencyContact.vue";
import Step4Preview from "@/components/admin/employee/create/steps/Step4Preview.vue";
import ErrorModal from "@/components/admin/employee/create/ErrorModal.vue";

const router = useRouter();
const toast = useToastStore();
const employeeStore = useEmployeeStore();
const { loading, error } = storeToRefs(employeeStore);

const DRAFT_STORAGE_KEY = "hris_employee_create_draft";

// Modal state
const showErrorModal = ref(false);

// Client-side validation errors
const clientErrors = ref<Record<string, string[]>>({});

// Inject step management from layout
const currentStep = inject<any>("currentStep");
const totalSteps = inject<any>("totalSteps");
const nextStep = inject<any>("nextStep");
const previousStep = inject<any>("previousStep");
const goToStep = inject<any>("goToStep");

// Initial form states
const initialStep1 = () => ({
  name: "",
  email: "",
  password: "",
  password_confirmation: "",
  identity_number: "",
  phone: "",
  date_of_birth: "",
  hobby: "",
  place_of_birth: "",
  gender: "",
  address: "",
  city: "",
  postal_code: "",
  profile_photo: null as File | null,
  profile_photo_url: "",
});

const initialStep2 = () => ({
  job_title: "",
  team_id: "",
  department: "",
  store_id: "",
  years_experience: "",
  status: "",
  employment_type: "",
  vendor_name: "",
  work_location: "",
  start_date: "",
  monthly_salary: "",
  skill_level: "",
  bank_name: "",
  account_number: "",
  account_holder_name: "",
  bank_branch: "",
  account_type: "",
  role: "",
});

const initialStep3 = () => ({
  emergency_contact_name: "",
  emergency_contact_relationship: "",
  emergency_contact_phone: "",
  emergency_contact_email: "",
  additional_notes: "",
  preferred_language: "",
});

// Form data for Steps
const step1Data = ref(initialStep1());
const step2Data = ref(initialStep2());
const step3Data = ref(initialStep3());

// Combined errors (merge backend errors and client validation errors)
const combinedErrors = computed(() => {
  const res: Record<string, string[]> = {};
  if (error.value && typeof error.value === "object") {
    for (const [k, v] of Object.entries(error.value)) {
      res[k] = Array.isArray(v) ? (v as string[]) : [String(v)];
    }
  }
  for (const [k, v] of Object.entries(clientErrors.value)) {
    res[k] = v;
  }
  return res;
});

const normalizeRupiah = (value: any) => {
  if (value === null || value === undefined) return "";
  return String(value).replace(/[^0-9]/g, "");
};

// Step Validation
const validateStep = (step: number): boolean => {
  const newErrors: Record<string, string[]> = { ...clientErrors.value };

  if (step === 1) {
    const step1Keys = [
      "name",
      "email",
      "password",
      "password_confirmation",
      "identity_number",
      "phone",
      "date_of_birth",
      "place_of_birth",
      "gender",
      "address",
      "city",
      "postal_code",
    ];
    step1Keys.forEach((k) => delete newErrors[k]);

    const s1 = step1Data.value;
    if (!s1.name?.trim()) newErrors.name = ["Full name is required."];

    if (!s1.email?.trim()) {
      newErrors.email = ["Email is required."];
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s1.email.trim())) {
      newErrors.email = [
        "Invalid email format (e.g., user@company.com).",
      ];
    }

    if (!s1.password) {
      newErrors.password = ["Password is required."];
    } else if (s1.password.length < 8) {
      newErrors.password = ["Password must be at least 8 characters."];
    }

    if (!s1.password_confirmation) {
      newErrors.password_confirmation = ["Password confirmation is required."];
    } else if (s1.password !== s1.password_confirmation) {
      newErrors.password_confirmation = [
        "Password confirmation does not match password.",
      ];
    }

    if (!s1.identity_number?.trim()) {
      newErrors.identity_number = ["Identity number (NIK/ID) is required."];
    }

    if (!s1.phone?.trim()) {
      newErrors.phone = ["Phone number is required."];
    }

    if (!s1.date_of_birth) {
      newErrors.date_of_birth = ["Date of birth is required."];
    } else {
      const dob = new Date(s1.date_of_birth);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (dob >= today) {
        newErrors.date_of_birth = ["Date of birth must be before today."];
      }
    }

    if (!s1.place_of_birth?.trim()) {
      newErrors.place_of_birth = ["Place of birth is required."];
    }

    if (!s1.gender) {
      newErrors.gender = ["Gender is required."];
    }

    if (!s1.address?.trim()) {
      newErrors.address = ["Address is required."];
    }

    if (!s1.city?.trim()) {
      newErrors.city = ["City is required."];
    }

    if (!s1.postal_code?.trim()) {
      newErrors.postal_code = ["Postal code is required."];
    }
  } else if (step === 2) {
    const step2Keys = [
      "job_title",
      "role",
      "years_experience",
      "status",
      "employment_type",
      "vendor_name",
      "work_location",
      "start_date",
      "monthly_salary",
      "skill_level",
      "bank_name",
      "account_number",
      "account_holder_name",
      "account_type",
    ];
    step2Keys.forEach((k) => delete newErrors[k]);

    const s2 = step2Data.value;
    if (!s2.job_title?.trim()) newErrors.job_title = ["Job title is required."];
    if (!s2.role) newErrors.role = ["Role is required."];

    if (
      s2.years_experience === "" ||
      s2.years_experience === null ||
      s2.years_experience === undefined
    ) {
      newErrors.years_experience = ["Years of experience is required."];
    } else if (Number(s2.years_experience) < 0) {
      newErrors.years_experience = ["Years of experience must be at least 0."];
    }

    if (!s2.status) newErrors.status = ["Employment status is required."];
    if (!s2.employment_type)
      newErrors.employment_type = ["Employment type is required."];
    if (s2.employment_type === "vendor" && !s2.vendor_name?.trim())
      newErrors.vendor_name = ["Vendor name is required for vendor employees."];
    if (!s2.work_location)
      newErrors.work_location = ["Work location is required."];
    if (!s2.start_date)
      newErrors.start_date = ["Start date is required."];

    const salaryNum = normalizeRupiah(s2.monthly_salary);
    if (!salaryNum || Number(salaryNum) <= 0) {
      newErrors.monthly_salary = ["Monthly salary must be greater than 0."];
    }

    if (!s2.skill_level)
      newErrors.skill_level = ["Skill level is required."];
    if (!s2.bank_name) newErrors.bank_name = ["Bank name is required."];
    if (!s2.account_number?.trim())
      newErrors.account_number = ["Account number is required."];
    if (!s2.account_holder_name?.trim())
      newErrors.account_holder_name = ["Account holder name is required."];
    if (!s2.account_type)
      newErrors.account_type = ["Account type is required."];
  } else if (step === 3) {
    const step3Keys = [
      "emergency_contact_name",
      "emergency_contact_relationship",
      "emergency_contact_phone",
      "emergency_contacts.0.full_name",
      "emergency_contacts.0.relationship",
      "emergency_contacts.0.phone",
    ];
    step3Keys.forEach((k) => delete newErrors[k]);

    const s3 = step3Data.value;
    if (!s3.emergency_contact_name?.trim()) {
      newErrors.emergency_contact_name = ["Emergency contact name is required."];
      newErrors["emergency_contacts.0.full_name"] = [
        "Emergency contact name is required.",
      ];
    }
    if (!s3.emergency_contact_relationship?.trim()) {
      newErrors.emergency_contact_relationship = [
        "Emergency contact relationship is required.",
      ];
      newErrors["emergency_contacts.0.relationship"] = [
        "Emergency contact relationship is required.",
      ];
    }
    if (!s3.emergency_contact_phone?.trim()) {
      newErrors.emergency_contact_phone = [
        "Emergency contact phone number is required.",
      ];
      newErrors["emergency_contacts.0.phone"] = [
        "Emergency contact phone number is required.",
      ];
    }
  }

  clientErrors.value = newErrors;

  let hasError = false;
  if (step === 1) {
    hasError = [
      "name",
      "email",
      "password",
      "password_confirmation",
      "identity_number",
      "phone",
      "date_of_birth",
      "place_of_birth",
      "gender",
      "address",
      "city",
      "postal_code",
    ].some((k) => !!newErrors[k]);
  } else if (step === 2) {
    hasError = [
      "job_title",
      "role",
      "years_experience",
      "status",
      "employment_type",
      "vendor_name",
      "work_location",
      "start_date",
      "monthly_salary",
      "skill_level",
      "bank_name",
      "account_number",
      "account_holder_name",
      "account_type",
    ].some((k) => !!newErrors[k]);
  } else if (step === 3) {
    hasError = [
      "emergency_contact_name",
      "emergency_contact_relationship",
      "emergency_contact_phone",
    ].some((k) => !!newErrors[k]);
  }

  if (hasError) {
    toast.error(
      `Please complete and review all required fields in Step ${step} before continuing.`,
      "Incomplete Validation"
    );
    return false;
  }

  return true;
};

// Handle Next Step
const handleNextStep = () => {
  if (validateStep(currentStep.value)) {
    nextStep();
  }
};

// Jump to step
const handleGoToStep = (step: number) => {
  showErrorModal.value = false;
  if (goToStep) {
    goToStep(step);
  } else {
    currentStep.value = step;
  }
};

// Draft Auto-Save & Restore
const saveDraft = debounce(() => {
  try {
    const draftPayload = {
      currentStep: currentStep.value,
      step1Data: {
        ...step1Data.value,
        profile_photo: null, // File object cannot be serialized
      },
      step2Data: step2Data.value,
      step3Data: step3Data.value,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draftPayload));
  } catch (err) {
    console.error("Failed to save employee draft:", err);
  }
}, 400);

const restoreDraft = () => {
  try {
    const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!saved) return;
    const parsed = JSON.parse(saved);

    if (parsed.step1Data) {
      step1Data.value = {
        ...step1Data.value,
        ...parsed.step1Data,
        profile_photo: null,
      };
    }
    if (parsed.step2Data) {
      step2Data.value = { ...step2Data.value, ...parsed.step2Data };
    }
    if (parsed.step3Data) {
      step3Data.value = { ...step3Data.value, ...parsed.step3Data };
    }
    if (parsed.currentStep && parsed.currentStep <= totalSteps) {
      handleGoToStep(parsed.currentStep);
    }
    toast.info("Your previous form draft has been restored.", "Draft Restored");
  } catch (err) {
    console.error("Failed to restore employee draft:", err);
  }
};

const handleResetForm = () => {
  if (
    confirm(
      "Are you sure you want to clear all fields and delete the saved draft?"
    )
  ) {
    localStorage.removeItem(DRAFT_STORAGE_KEY);
    step1Data.value = initialStep1();
    step2Data.value = initialStep2();
    step3Data.value = initialStep3();
    clientErrors.value = {};
    if (employeeStore.error) employeeStore.error = null;
    handleGoToStep(1);
    toast.success("Form draft has been reset.", "Form Reset");
  }
};

// Watchers for draft saving
watch(
  [step1Data, step2Data, step3Data, currentStep],
  () => {
    saveDraft();
  },
  { deep: true }
);

onMounted(() => {
  restoreDraft();
});

// Form submission
const handleSubmit = async () => {
  // Validate all steps before submitting
  for (let s = 1; s <= 3; s++) {
    if (!validateStep(s)) {
      handleGoToStep(s);
      return;
    }
  }

  try {
    const formData = new FormData();

    // Step 1 data (User & Employee Profile)
    formData.append("name", step1Data.value.name);
    formData.append("email", step1Data.value.email);
    formData.append("password", step1Data.value.password);
    formData.append("identity_number", step1Data.value.identity_number);
    formData.append("phone", step1Data.value.phone);
    formData.append("date_of_birth", step1Data.value.date_of_birth);
    formData.append("hobby", step1Data.value.hobby);
    formData.append("place_of_birth", step1Data.value.place_of_birth);
    formData.append("gender", step1Data.value.gender);
    formData.append("address", step1Data.value.address);
    formData.append("city", step1Data.value.city);
    formData.append("postal_code", step1Data.value.postal_code);

    if (step1Data.value.profile_photo) {
      formData.append("profile_photo", step1Data.value.profile_photo);
    }

    // Step 2 data (Job Information & Bank Information)
    formData.append("job_title", step2Data.value.job_title);
    if (step2Data.value.team_id) {
      formData.append("team_id", step2Data.value.team_id);
    }
    if (step2Data.value.department) {
      formData.append("department", step2Data.value.department);
    }
    if (step2Data.value.store_id) {
      formData.append("store_id", step2Data.value.store_id);
    }
    formData.append("years_experience", step2Data.value.years_experience);
    formData.append("status", step2Data.value.status);
    formData.append("employment_type", step2Data.value.employment_type);
    if (
      step2Data.value.employment_type === "vendor" &&
      step2Data.value.vendor_name
    ) {
      formData.append("vendor_name", step2Data.value.vendor_name);
    }
    formData.append("work_location", step2Data.value.work_location);
    formData.append("start_date", step2Data.value.start_date);
    formData.append(
      "monthly_salary",
      normalizeRupiah(step2Data.value.monthly_salary)
    );
    formData.append("skill_level", step2Data.value.skill_level);
    formData.append("bank_name", step2Data.value.bank_name);
    formData.append("account_number", step2Data.value.account_number);
    formData.append(
      "account_holder_name",
      step2Data.value.account_holder_name
    );
    formData.append("bank_branch", step2Data.value.bank_branch);
    formData.append("account_type", step2Data.value.account_type);
    formData.append("roles[]", step2Data.value.role);

    // Step 3 data (Emergency Contacts & Additional Info)
    formData.append(
      "emergency_contacts[0][full_name]",
      step3Data.value.emergency_contact_name
    );
    formData.append(
      "emergency_contacts[0][relationship]",
      step3Data.value.emergency_contact_relationship
    );
    formData.append(
      "emergency_contacts[0][phone]",
      step3Data.value.emergency_contact_phone
    );
    if (step3Data.value.emergency_contact_email) {
      formData.append(
        "emergency_contacts[0][email]",
        step3Data.value.emergency_contact_email
      );
    }

    formData.append("preferred_language", step3Data.value.preferred_language);
    formData.append("additional_notes", step3Data.value.additional_notes);

    await employeeStore.createEmployee(formData);

    // Clean up draft storage on success
    localStorage.removeItem(DRAFT_STORAGE_KEY);
    toast.success("Employee added successfully!", "Success");

    // Redirect to success page on success
    router.push({ name: "admin.employees.success" });
  } catch (err: any) {
    console.error("Error creating employee:", err);

    let errorSummary = "Failed to create employee. Please check the form details.";
    if (error.value) {
      if (typeof error.value === "object") {
        const firstMsg = Object.values(error.value).flat()[0];
        if (firstMsg) errorSummary = String(firstMsg);
      } else if (typeof error.value === "string") {
        errorSummary = error.value;
      }
    }
    toast.error(errorSummary, "Failed to Add Employee");

    // Show error modal with detailed list
    showErrorModal.value = true;
  }
};

const closeErrorModal = () => {
  showErrorModal.value = false;
};
</script>

<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <!-- Step 1: Personal Information -->
    <Step1PersonalInfo
      v-if="currentStep === 1"
      v-model="step1Data"
      :errors="combinedErrors"
    />

    <!-- Step 2: Job Information -->
    <Step2JobInfo
      v-if="currentStep === 2"
      v-model="step2Data"
      :errors="combinedErrors"
    />

    <!-- Step 3: Emergency Contact -->
    <Step3EmergencyContact
      v-if="currentStep === 3"
      v-model="step3Data"
      :errors="combinedErrors"
    />

    <!-- Step 4: Preview -->
    <Step4Preview
      v-if="currentStep === 4"
      :step1Data="step1Data"
      :step2Data="step2Data"
      :step3Data="step3Data"
    />

    <!-- Form Navigation -->
    <div class="bg-white border border-[#DCDEDD] rounded-[20px] p-6">
      <div
        class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div>
          <div class="flex items-center gap-3">
            <p class="text-brand-dark text-sm font-medium">
              {{
                currentStep === 4
                  ? "Ready to add this employee?"
                  : `Step ${currentStep} of ${totalSteps}`
              }}
            </p>
            <!-- Auto-save Draft indicator -->
            <span
              class="text-[11px] bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full font-medium"
            >
              Draft auto-saved
            </span>
          </div>
          <p class="text-brand-light text-xs font-normal mt-1">
            {{
              currentStep === 4
                ? "Review and confirm all information before submitting"
                : currentStep === 1
                ? "Fill in the personal information"
                : currentStep === 2
                ? "Fill in the job information"
                : "Fill in the emergency contact information"
            }}
          </p>
        </div>

        <div class="flex items-center flex-wrap gap-3">
          <!-- Reset / Clear Draft Button -->
          <button
            type="button"
            @click="handleResetForm"
            title="Clear form and delete draft"
            class="border border-gray-200 text-gray-600 hover:text-red-600 hover:border-red-200 hover:bg-red-50 rounded-[8px] transition-all duration-300 px-4 py-3 flex items-center gap-1.5 text-sm font-medium"
          >
            <RotateCcw class="w-3.5 h-3.5" />
            <span>Reset Form</span>
          </button>

          <button
            v-if="currentStep > 1"
            type="button"
            @click="previousStep"
            class="border border-[#DCDEDD] rounded-[8px] hover:border-[#0C51D9] hover:border-2 hover:bg-gray-50 transition-all duration-300 px-6 py-3 flex items-center gap-2"
          >
            <ArrowLeft class="w-4 h-4 text-gray-600" />
            <span class="text-brand-dark text-base font-semibold"
              >Previous</span
            >
          </button>
          <button
            v-else
            type="button"
            @click="previousStep"
            class="border border-[#DCDEDD] rounded-[8px] hover:border-[#0C51D9] hover:border-2 hover:bg-gray-50 transition-all duration-300 px-6 py-3 flex items-center gap-2"
          >
            <span class="text-brand-dark text-base font-semibold">Cancel</span>
          </button>

          <button
            v-if="currentStep < totalSteps"
            type="button"
            @click="handleNextStep"
            class="btn-primary rounded-[8px] border border-[#2151A0] hover:brightness-110 focus:ring-2 focus:ring-[#0C51D9] transition-all duration-300 blue-gradient blue-btn-shadow px-6 py-3 flex items-center gap-2"
          >
            <span class="text-brand-white text-base font-semibold">
              Next:
              {{
                currentStep === 1
                  ? "Job Info"
                  : currentStep === 2
                  ? "Emergency Contact"
                  : "Review"
              }}
            </span>
            <ArrowRight class="w-4 h-4 text-white" />
          </button>
          <button
            v-else
            type="submit"
            :disabled="loading"
            class="btn-primary rounded-[8px] border border-[#2151A0] hover:brightness-110 focus:ring-2 focus:ring-[#0C51D9] transition-all duration-300 blue-gradient blue-btn-shadow px-6 py-3 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <UserPlus class="w-4 h-4 text-white" />
            <span class="text-brand-white text-base font-semibold">
              {{ loading ? "Adding..." : "Add Employee" }}
            </span>
          </button>
        </div>
      </div>
    </div>
  </form>

  <!-- Error Modal -->
  <ErrorModal
    :show="showErrorModal"
    :errors="combinedErrors"
    @close="closeErrorModal"
    @goToStep="handleGoToStep"
  />
</template>
