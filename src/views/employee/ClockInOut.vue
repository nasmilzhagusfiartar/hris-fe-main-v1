<script setup>
import { ref, onMounted, onUnmounted, computed } from "vue";
import {
  Clock,
  MapPin,
  Camera,
  Video,
  RotateCcw,
  LogIn,
  LogOut,
  Info,
  Globe,
  Building,
  Loader2,
  AlertCircle,
  UserCheck,
  X,
} from "lucide-vue-next";
import { useAttendanceStore } from "@/stores/attendance";
import { useAuthStore } from "@/stores/auth";
import { storeToRefs } from "pinia";

const authStore = useAuthStore();
const attendanceStore = useAttendanceStore();
const { loading, todayAttendance } = storeToRefs(attendanceStore);
const { checkIn, checkOut, fetchTodayAttendance } = attendanceStore;

// Role check
const isEmployee = computed(() => {
  const roles = authStore.user?.roles || [];
  return roles.map(r => typeof r === "string" ? r : r.name).includes("employee");
});

// State
const currentTime = ref("");
const currentDate = ref("");
const currentStream = ref(null);
const capturedPhotoData = ref(null);
const currentLocation = ref(null);
const locationStatus = ref("default");
const locationName = ref("Location not detected");
const locationAddress = ref("Click 'Get Location' to detect your current position");
const locationCoords = ref("");
const isGettingLocation = ref(false);

// Notification feedback state
const feedbackMessage = ref({
  type: "", // 'success' | 'error' | 'warning'
  title: "",
  message: "",
});

const showFeedback = (type, title, message) => {
  feedbackMessage.value = { type, title, message };
  if (type === "success") {
    setTimeout(() => {
      if (feedbackMessage.value.type === "success") {
        feedbackMessage.value = { type: "", title: "", message: "" };
      }
    }, 6000);
  }
};

// Computed Attendance Lifecycle
const isAlreadyCheckedIn = computed(() => {
  return !!todayAttendance.value?.check_in;
});

const isCheckedIn = computed(() => {
  return !!todayAttendance.value?.check_in && !todayAttendance.value?.check_out;
});

const isCompleted = computed(() => {
  return !!todayAttendance.value?.check_in && !!todayAttendance.value?.check_out;
});

const canCheckIn = computed(() => {
  return currentLocation.value && !isAlreadyCheckedIn.value;
});

const canCheckOut = computed(() => {
  return currentLocation.value && isCheckedIn.value;
});

const checkInTime = computed(() => {
  if (!todayAttendance.value?.check_in) return "--:--";
  return new Date(todayAttendance.value.check_in).toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
  });
});

const checkOutTime = computed(() => {
  if (!todayAttendance.value?.check_out) return "--:--";
  return new Date(todayAttendance.value.check_out).toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
  });
});

const attendanceStatus = computed(() => {
  if (!todayAttendance.value) {
    return { text: "Not Clocked In", class: "bg-red-100 text-red-700" };
  }
  if (todayAttendance.value.check_in && !todayAttendance.value.check_out) {
    return { text: "Clocked In", class: "bg-green-100 text-green-700" };
  }
  if (todayAttendance.value.check_in && todayAttendance.value.check_out) {
    return { text: "Completed", class: "bg-blue-100 text-blue-700" };
  }
  return { text: "Not Clocked In", class: "bg-red-100 text-red-700" };
});

// Clock functions
const updateClock = () => {
  const now = new Date();

  const timeOptions = {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  };

  const dateOptions = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };

  currentTime.value = now.toLocaleTimeString("en-US", timeOptions);
  currentDate.value = now.toLocaleDateString("en-US", dateOptions);
};

// Location functions
const getCurrentLocation = async () => {
  if (!navigator.geolocation) {
    updateLocationDisplay(
      "error",
      "Geolocation not supported",
      "Your browser does not support location services"
    );
    return;
  }

  updateLocationDisplay(
    "loading",
    "Getting location...",
    "Please wait while we detect your position"
  );
  isGettingLocation.value = true;

  const options = {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 300000,
  };

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const coords = position.coords;
      currentLocation.value = {
        latitude: coords.latitude,
        longitude: coords.longitude,
        accuracy: coords.accuracy,
        timestamp: new Date().toISOString(),
      };

      updateLocationDisplay(
        "success",
        "Location detected",
        `Accuracy: ±${Math.round(coords.accuracy)}m`
      );

      locationCoords.value = `Lat: ${coords.latitude.toFixed(6)}, Lng: ${coords.longitude.toFixed(6)}`;

      // Try reverse geocoding
      try {
        await reverseGeocode(coords.latitude, coords.longitude);
      } catch (error) {
        console.error("Reverse geocoding failed:", error);
      }

      isGettingLocation.value = false;
    },
    (error) => {
      let errorMessage = "";
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = "Location access denied. Please enable location permissions.";
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage = "Location information unavailable.";
          break;
        case error.TIMEOUT:
          errorMessage = "Location request timed out. Please try again.";
          break;
        default:
          errorMessage = "An unknown error occurred while retrieving location.";
          break;
      }

      updateLocationDisplay("error", "Location failed", errorMessage);
      isGettingLocation.value = false;
    },
    options
  );
};

const updateLocationDisplay = (status, name, address) => {
  locationStatus.value = status;
  locationName.value = name;
  locationAddress.value = address;
};

const reverseGeocode = async (lat, lng) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
    );
    const data = await response.json();
    if (data && data.display_name) {
      const parts = data.display_name.split(",");
      const shortAddress = parts.slice(0, 3).join(",").trim();
      locationAddress.value = shortAddress;
    }
  } catch (error) {
    console.error("Reverse geocoding failed:", error);
  }
};

// Camera functions
const startCamera = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
    });

    currentStream.value = stream;
    const video = document.getElementById("webcamPreview");
    video.srcObject = stream;
  } catch (error) {
    console.error("Error accessing camera:", error);
    alert("Unable to access camera. Please check permissions and try again.");
  }
};

const capturePhoto = () => {
  const video = document.getElementById("webcamPreview");
  const canvas = document.getElementById("photoCanvas");

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  const ctx = canvas.getContext("2d");
  ctx.drawImage(video, 0, 0);

  capturedPhotoData.value = canvas.toDataURL("image/jpeg", 0.8);

  if (currentStream.value) {
    currentStream.value.getTracks().forEach((track) => track.stop());
    currentStream.value = null;
  }
};

const retakePhoto = () => {
  capturedPhotoData.value = null;
  if (currentStream.value) {
    currentStream.value.getTracks().forEach((track) => track.stop());
    currentStream.value = null;
  }
};

// Attendance actions
const handleCheckIn = async () => {
  if (isAlreadyCheckedIn.value) {
    showFeedback(
      "warning",
      "Presensi Sudah Tercatat",
      "Anda sudah melakukan check-in hari ini. Presensi harian hanya dapat dilakukan satu kali per hari."
    );
    return;
  }

  if (!currentLocation.value) {
    showFeedback(
      "warning",
      "Location Required",
      "Please click 'Get Location' first to detect your GPS position."
    );
    return;
  }

  try {
    await checkIn({
      check_in_lat: currentLocation.value.latitude,
      check_in_long: currentLocation.value.longitude,
    });

    showFeedback(
      "success",
      "Check-In Successful",
      "You have successfully clocked in! Have a productive workday."
    );
    resetForNextAction();
    await fetchTodayAttendance();
  } catch (error) {
    console.error("Check in failed:", error);
    let errorMsg = "Failed to clock in. Please try again.";
    const rawMsg = (typeof attendanceStore.error === "string" ? attendanceStore.error : error.response?.data?.message) || error.message || "";
    if (rawMsg.includes("sudah check in")) {
      errorMsg = "Presensi Sudah Tercatat: Anda sudah melakukan check-in untuk hari ini. Presensi baru dapat dilakukan kembali besok.";
    } else if (rawMsg) {
      errorMsg = rawMsg;
    }
    showFeedback("error", "Clock In Failed", errorMsg);
  }
};

const handleCheckOut = async () => {
  if (isCompleted.value) {
    showFeedback(
      "warning",
      "Presensi Selesai",
      "Anda sudah menyelesaikan presensi masuk dan keluar untuk hari ini."
    );
    return;
  }

  if (!currentLocation.value) {
    showFeedback(
      "warning",
      "Location Required",
      "Please click 'Get Location' first to detect your GPS position."
    );
    return;
  }

  try {
    await checkOut({
      check_out_lat: currentLocation.value.latitude,
      check_out_long: currentLocation.value.longitude,
    });

    showFeedback(
      "success",
      "Check-Out Successful",
      "You have successfully clocked out! Have a great evening."
    );
    resetForNextAction();
    await fetchTodayAttendance();
  } catch (error) {
    console.error("Check out failed:", error);
    let errorMsg = "Failed to clock out. Please try again.";
    const rawMsg = (typeof attendanceStore.error === "string" ? attendanceStore.error : error.response?.data?.message) || error.message || "";
    if (rawMsg) {
      errorMsg = rawMsg;
    }
    showFeedback("error", "Clock Out Failed", errorMsg);
  }
};

const resetForNextAction = () => {
  retakePhoto();
  currentLocation.value = null;
  updateLocationDisplay(
    "default",
    "Location not detected",
    "Please get location again for next attendance action"
  );
  locationCoords.value = "";
};

// Lifecycle
let clockInterval;

onMounted(async () => {
  await fetchTodayAttendance();
  updateClock();
  clockInterval = setInterval(updateClock, 1000);
});

onUnmounted(() => {
  if (clockInterval) clearInterval(clockInterval);
  if (currentStream.value) {
    currentStream.value.getTracks().forEach((track) => track.stop());
  }
});
</script>

<template>
  <div class="p-5">
    <!-- Non-Employee Notice Banner -->
    <div
      v-if="!isEmployee"
      class="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3 shadow-sm"
    >
      <Info class="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
      <div>
        <h4 class="font-bold text-sm">Mode Preview (Akun Non-Karyawan)</h4>
        <p class="text-xs text-amber-700 mt-1 leading-relaxed">
          Anda saat ini login sebagai akun Administrator/Manager (<strong>{{ authStore.user?.name || authStore.user?.email }}</strong>). Fitur presensi harian ini diproteksi khusus untuk akun dengan profil karyawan (misalnya: <code class="bg-amber-100 px-1 py-0.5 rounded font-semibold text-amber-900">employee@gmail.com</code> / password: <code class="bg-amber-100 px-1 py-0.5 rounded font-semibold text-amber-900">password</code>).
        </p>
      </div>
    </div>

    <!-- Live Feedback Notification Banner -->
    <div v-if="feedbackMessage.type" class="mb-6 animate-fade-in">
      <div
        :class="{
          'bg-green-50 border-green-200 text-green-900':
            feedbackMessage.type === 'success',
          'bg-red-50 border-red-200 text-red-900':
            feedbackMessage.type === 'error',
          'bg-amber-50 border-amber-200 text-amber-900':
            feedbackMessage.type === 'warning',
        }"
        class="p-4 rounded-xl border flex items-start justify-between gap-3 shadow-sm"
      >
        <div class="flex items-start gap-3">
          <AlertCircle
            v-if="feedbackMessage.type === 'error'"
            class="w-5 h-5 text-red-600 shrink-0 mt-0.5"
          />
          <UserCheck
            v-else-if="feedbackMessage.type === 'success'"
            class="w-5 h-5 text-green-600 shrink-0 mt-0.5"
          />
          <Info v-else class="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h4 class="font-bold text-sm">{{ feedbackMessage.title }}</h4>
            <p class="text-xs mt-1 leading-relaxed">{{ feedbackMessage.message }}</p>
          </div>
        </div>
        <button
          @click="feedbackMessage.type = ''"
          class="text-gray-400 hover:text-gray-600 p-1"
        >
          <X class="w-4 h-4" />
        </button>
      </div>
    </div>
    <!-- Current Time and Status Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <!-- Clock Section -->
      <div
        class="bg-white border border-[#DCDEDD] rounded-[20px] hover:border-[#0C51D9] hover:border-2 transition-all duration-300 p-8 text-center"
      >
        <div class="mb-6">
          <div class="flex items-center justify-center gap-3 mb-4">
            <div
              class="w-16 h-16 bg-blue-50 rounded-[16px] flex items-center justify-center"
            >
              <Clock class="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h3 class="text-brand-dark text-2xl font-bold">Current Time</h3>
              <p class="text-brand-light text-base">Jakarta, Indonesia</p>
            </div>
          </div>

          <!-- Live Clock Display -->
          <div
            class="bg-gradient-to-br from-primary-500 to-primary-600 rounded-[20px] p-8 text-white mb-4"
          >
            <div class="text-6xl font-extrabold mb-2">{{ currentTime }}</div>
            <div class="text-xl font-medium opacity-90">{{ currentDate }}</div>
          </div>

          <!-- Time Zone Info -->
          <p class="text-brand-light text-sm">
            <Globe class="w-4 h-4 inline mr-1" />
            GMT+7 (Western Indonesia Time)
          </p>
        </div>
      </div>

      <!-- Attendance Status -->
      <div
        class="bg-white border border-[#DCDEDD] rounded-[20px] hover:border-[#0C51D9] hover:border-2 transition-all duration-300 p-6"
      >
        <div class="flex items-center gap-3 mb-6">
          <div
            class="w-12 h-12 bg-green-50 rounded-[12px] flex items-center justify-center"
          >
            <UserCheck class="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h3 class="text-brand-dark text-xl font-bold">Today's Status</h3>
            <p class="text-brand-light text-sm">Your attendance for today</p>
          </div>
        </div>

        <div class="space-y-4">
          <!-- Current Status -->
          <div class="p-4 bg-gray-50 rounded-[12px] border border-[#DCDEDD]">
            <div class="flex items-center justify-between">
              <span class="text-brand-dark text-base font-medium">Status</span>
              <span
                :class="attendanceStatus.class"
                class="px-3 py-1 rounded-md text-sm font-semibold"
              >
                {{ attendanceStatus.text }}
              </span>
            </div>
          </div>

          <!-- Clock In Time -->
          <div class="p-4 bg-gray-50 rounded-[12px] border border-[#DCDEDD]">
            <div class="flex items-center justify-between">
              <span class="text-brand-dark text-base font-medium">Clock In</span>
              <span class="text-brand-light text-base">{{ checkInTime }}</span>
            </div>
          </div>

          <!-- Clock Out Time -->
          <div class="p-4 bg-gray-50 rounded-[12px] border border-[#DCDEDD]">
            <div class="flex items-center justify-between">
              <span class="text-brand-dark text-base font-medium">Clock Out</span>
              <span class="text-brand-light text-base">{{ checkOutTime }}</span>
            </div>
          </div>

          <!-- Working Hours -->
          <div class="p-4 bg-blue-50 rounded-[12px] border border-[#DCDEDD]">
            <div class="flex items-center justify-between">
              <span class="text-brand-dark text-base font-medium"
                >Working Hours</span
              >
              <span class="text-blue-600 text-base font-semibold">{{
                workingHours
              }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Location and Actions Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <!-- Location and Camera -->
      <div
        class="bg-white border border-[#DCDEDD] rounded-[20px] hover:border-[#0C51D9] hover:border-2 transition-all duration-300 p-6"
      >
        <div class="flex items-center gap-3 mb-6">
          <div
            class="w-12 h-12 bg-orange-50 rounded-[12px] flex items-center justify-center"
          >
            <MapPin class="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h3 class="text-brand-dark text-xl font-bold">Location & Photo</h3>
            <p class="text-brand-light text-sm">Capture your work location</p>
          </div>
        </div>

        <!-- Location Info -->
        <div class="mb-6">
          <!-- Current Location Display -->
          <div
            :class="{
              'bg-yellow-50': locationStatus === 'loading',
              'bg-green-50': locationStatus === 'success',
              'bg-red-50': locationStatus === 'error',
              'bg-gray-50': locationStatus === 'default',
            }"
            class="p-4 rounded-[12px] border border-[#DCDEDD] mb-3"
          >
            <div class="flex items-center gap-3">
              <Loader2
                v-if="locationStatus === 'loading'"
                class="w-5 h-5 text-yellow-600 animate-spin"
              />
              <MapPin
                v-else-if="locationStatus === 'success'"
                class="w-5 h-5 text-green-600"
              />
              <AlertCircle
                v-else-if="locationStatus === 'error'"
                class="w-5 h-5 text-red-600"
              />
              <MapPin v-else class="w-5 h-5 text-gray-600" />

              <div class="flex-1">
                <p class="text-brand-dark text-base font-semibold">
                  {{ locationName }}
                </p>
                <p class="text-brand-light text-sm">{{ locationAddress }}</p>
                <p v-if="locationCoords" class="text-brand-light text-xs mt-1">
                  {{ locationCoords }}
                </p>
              </div>
            </div>
          </div>

          <!-- Get Location Button -->
          <button
            @click="getCurrentLocation"
            :disabled="isGettingLocation"
            class="w-full border border-[#DCDEDD] rounded-[8px] hover:border-[#0C51D9] hover:border-2 hover:bg-gray-50 transition-all duration-300 px-4 py-2 flex items-center justify-center gap-2 mb-3 disabled:opacity-50"
          >
            <MapPin class="w-4 h-4 text-gray-600" />
            <span class="text-brand-dark text-sm font-semibold">
              {{ isGettingLocation ? "Getting Location..." : currentLocation ? "Refresh Location" : "Get Current Location" }}
            </span>
          </button>

          <!-- Office Location Reference -->
          <div class="p-4 bg-blue-50 rounded-[12px] border border-[#DCDEDD]">
            <div class="flex items-center gap-3">
              <Building class="w-5 h-5 text-blue-600" />
              <div>
                <p class="text-brand-dark text-base font-semibold">
                  Jakarta Office
                </p>
                <p class="text-brand-light text-sm">
                  Jl. Sudirman No. 123, Jakarta
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Webcam Section -->
        <div class="space-y-4">
          <div class="relative">
            <video
              id="webcamPreview"
              :class="{ hidden: !currentStream || capturedPhotoData }"
              class="w-full h-48 bg-gray-100 rounded-[12px] object-cover"
              autoplay
              muted
            ></video>
            <canvas id="photoCanvas" class="hidden"></canvas>

            <div
              v-if="!currentStream && !capturedPhotoData"
              class="w-full h-48 bg-gray-100 rounded-[12px] flex items-center justify-center border-2 border-dashed border-gray-300"
            >
              <div class="text-center">
                <Camera class="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p class="text-gray-500 text-sm">
                  Camera preview will appear here
                </p>
              </div>
            </div>

            <img
              v-if="capturedPhotoData"
              :src="capturedPhotoData"
              class="w-full h-48 rounded-[12px] object-cover"
              alt="Captured photo"
            />
          </div>

          <!-- Camera Controls -->
          <div v-if="!capturedPhotoData" class="flex gap-3">
            <button
              v-if="!currentStream"
              @click="startCamera"
              class="flex-1 border border-[#DCDEDD] rounded-[8px] hover:border-[#0C51D9] hover:border-2 hover:bg-gray-50 transition-all duration-300 px-4 py-2 flex items-center justify-center gap-2"
            >
              <Video class="w-4 h-4 text-gray-600" />
              <span class="text-brand-dark text-sm font-semibold"
                >Start Camera</span
              >
            </button>
            <button
              v-if="currentStream"
              @click="capturePhoto"
              class="flex-1 btn-primary rounded-[8px] border border-[#2151A0] hover:brightness-110 focus:ring-2 focus:ring-[#0C51D9] transition-all duration-300 blue-gradient blue-btn-shadow px-4 py-2 flex items-center justify-center gap-2"
            >
              <Camera class="w-4 h-4 text-white" />
              <span class="text-white text-sm font-semibold">Take Photo</span>
            </button>
          </div>

          <button
            v-if="capturedPhotoData"
            @click="retakePhoto"
            class="w-full border border-[#DCDEDD] rounded-[8px] hover:border-[#0C51D9] hover:border-2 hover:bg-gray-50 transition-all duration-300 px-4 py-2 flex items-center justify-center gap-2"
          >
            <RotateCcw class="w-4 h-4 text-gray-600" />
            <span class="text-brand-dark text-sm font-semibold"
              >Retake Photo</span
            >
          </button>
        </div>
      </div>

      <!-- Clock In/Out Action -->
      <div
        class="bg-white border border-[#DCDEDD] rounded-[20px] hover:border-[#0C51D9] hover:border-2 transition-all duration-300 p-8 text-center"
      >
        <div class="mb-6">
          <div
            class="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
            :class="{
              'bg-green-50 text-green-600': isCompleted,
              'bg-amber-50 text-amber-600': isCheckedIn,
              'bg-blue-50 text-blue-600': !isAlreadyCheckedIn,
            }"
          >
            <UserCheck v-if="isCompleted" class="w-10 h-10 text-green-600" />
            <LogOut v-else-if="isCheckedIn" class="w-10 h-10 text-amber-600" />
            <LogIn v-else class="w-10 h-10 text-blue-600" />
          </div>

          <h3 class="text-brand-dark text-2xl font-bold mb-2">
            <template v-if="isCompleted">Presensi Hari Ini Selesai</template>
            <template v-else-if="isCheckedIn">Siap untuk Clock Out?</template>
            <template v-else>Siap untuk Clock In?</template>
          </h3>

          <p class="text-brand-light text-base">
            <template v-if="isCompleted">
              Anda telah menyelesaikan presensi masuk dan keluar hari ini. Terima kasih atas kerja keras Anda!
            </template>
            <template v-else-if="isCheckedIn">
              Catat jam kepulangan kerja Anda beserta lokasi terkini.
            </template>
            <template v-else>
              Catat kehadiran kerja Anda hari ini beserta lokasi terkini.
            </template>
          </p>
        </div>

        <!-- 1. Completed State -->
        <div
          v-if="isCompleted"
          class="w-full p-4 rounded-[12px] bg-green-50 border border-green-200 text-green-800 flex items-center justify-center gap-3 font-semibold text-base shadow-sm"
        >
          <UserCheck class="w-5 h-5 text-green-600" />
          <span>Presensi Hari Ini Sudah Selesai</span>
        </div>

        <!-- 2. Clocked In State -> Clock Out Button -->
        <button
          v-else-if="isCheckedIn"
          @click="handleCheckOut"
          :disabled="!canCheckOut || loading"
          class="w-full btn-primary rounded-[12px] border border-[#2151A0] hover:brightness-110 focus:ring-2 focus:ring-[#0C51D9] transition-all duration-300 blue-gradient blue-btn-shadow px-8 py-4 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <LogOut class="w-6 h-6 text-white" />
          <span class="text-white text-lg font-bold">
            {{ loading ? "Processing..." : "Clock Out" }}
          </span>
        </button>

        <!-- 3. Not Clocked In Yet -> Clock In Button -->
        <button
          v-else
          @click="handleCheckIn"
          :disabled="!canCheckIn || loading"
          class="w-full btn-primary rounded-[12px] border border-[#2151A0] hover:brightness-110 focus:ring-2 focus:ring-[#0C51D9] transition-all duration-300 blue-gradient blue-btn-shadow px-8 py-4 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <LogIn class="w-6 h-6 text-white" />
          <span class="text-white text-lg font-bold">
            {{ loading ? "Processing..." : "Clock In" }}
          </span>
        </button>

        <p class="text-brand-light text-sm mt-4">
          <Info class="w-4 h-4 inline mr-1" />
          <template v-if="isCompleted">
            Satu hari kerja hanya memerlukan 1x presensi masuk dan 1x presensi keluar.
          </template>
          <template v-else>
            Pastikan koordinat lokasi sudah terdeteksi sebelum melakukan presensi.
          </template>
        </p>
      </div>
    </div>
  </div>
</template>
