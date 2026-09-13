<script setup lang="ts">
import { useAuthStore } from "@/stores/auth";
import { ref } from "vue";
import Alert from "@/components/common/Alert.vue";
import Input from "@/components/common/form/Input.vue";
import { AtSign, BuildingIcon, Lock } from "lucide-vue-next";
import { storeToRefs } from "pinia";

const authStore = useAuthStore();
const { loading, error } = storeToRefs(authStore);
const { login } = authStore;

const form = ref({
  email: "",
  password: "",
});

const handleSubmit = async () => {
  await login(form.value);

  if (error.value === "Unauthorized") {
    form.value.password = null;
  }
};
</script>

<template>
  <!-- Right Side - Login Form -->
  <div
    class="w-full lg:w-1/2 flex items-center justify-center"
    style="padding: 20px"
  >
    <div class="w-full max-w-md space-y-8">
      <!-- Logo/Brand -->
      <div class="flex items-center gap-4">
        <div class="w-16 h-16 relative flex items-center justify-center">
          <!-- Background circle -->
          <div
            class="w-16 h-16 absolute bg-gradient-to-br from-primary-100 to-primary-200 rounded-full"
          ></div>
          <!-- Overlapping smaller circle -->
          <div
            class="w-10 h-10 absolute bg-gradient-to-br from-primary-500 to-primary-600 rounded-full opacity-90"
          ></div>
          <!-- Lucide icon -->
          <BuildingIcon class="w-5 h-5 text-white relative z-10" />
        </div>
        <div>
          <h1 class="text-brand-dark text-lg font-bold">HIP HRIS</h1>
          <p class="text-brand-dark text-xs font-normal">HIP Dashboard</p>
        </div>
      </div>

      <Alert
        type="danger"
        title="Invalid Credentials"
        message="The email or password you entered is incorrect. Please try again."
        :show="error === 'Unauthorized'"
      />

      <!-- Login Form -->
      <form class="space-y-6">
        <!-- Email Field -->
        <Input
          id="email"
          name="email"
          type="email"
          v-model="form.email"
          label="Email Address"
          placeholder="Enter your email"
          :required="true"
          :error="error?.email?.join(', ')"
        >
          <template #icon>
            <AtSign class="h-5 w-5 text-gray-400" />
          </template>
        </Input>

        <!-- Password Field -->
        <Input
          id="password"
          name="password"
          type="password"
          v-model="form.password"
          label="Password"
          placeholder="Enter your password"
          :required="true"
          :error="error?.password?.join(', ')"
        >
          <template #icon>
            <Lock class="h-5 w-5 text-gray-400" />
          </template>
        </Input>

        <!-- Remember Me & Forgot Password -->
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <input
              type="checkbox"
              id="remember"
              name="remember"
              class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label for="remember" class="ml-2 text-gray-400">
              Remember me
            </label>
          </div>
          <!-- <a
            href="#"
            class="hover:brightness-110 transition-all duration-300 text-primary-600"
          >
            Forgot password?
          </a> -->
        </div>

        <!-- Login Button -->
        <button
          type="submit"
          class="btn-primary rounded-[8px] border border-[#2151A0] hover:brightness-110 focus:ring-2 focus:ring-[#0C51D9] transition-all duration-300 blue-gradient blue-btn-shadow px-4 py-3 flex items-center gap-2 w-full justify-center bg-gradient-to-l from-[#0c51d9] via-[#6f96e3] to-[#0c51d9] shadow-[inset_-2px_2px_1px_0_#6197ff,inset_2px_2px_1px_0_rgba(97,151,255,0.55)] text-white font-plus-jakarta-sans text-[14px] font-semibold cursor-pointer"
          :disabled="loading"
          @click="handleSubmit"
        >
          Sign In
        </button>
      </form>

      <!-- Sign Up Link -->
      <!-- <div class="text-center">
        <p
          class="text-[#6b7280] font-plus-jakarta-sans text-[14px] font-normal"
        >
          Don't have an account?
          <a
            href="#"
            class="hover:brightness-110 transition-all duration-300 text-[#3b82f6] font-plus-jakarta-sans text-[14px] font-semibold"
          >
            Sign up here
          </a>
        </p>
      </div> -->
    </div>
  </div>
</template>
