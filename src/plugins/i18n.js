import { createI18n } from "vue-i18n";
import en from "@/locales/en.json";
import id from "@/locales/id.json";

const STORAGE_KEY = "hip_locale";
const SUPPORTED_LOCALES = ["en", "id"];

function getSavedLocale() {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved && SUPPORTED_LOCALES.includes(saved)) {
      return saved;
    }
  } catch (e) {
    // Ignore storage access errors (e.g. private browsing / restricted storage)
  }
  return "en";
}

export const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: getSavedLocale(),
  fallbackLocale: "en",
  missingWarn: import.meta.env.DEV,
  fallbackWarn: import.meta.env.DEV,
  messages: {
    en,
    id,
  },
});

export function getLocale() {
  return i18n.global.locale.value;
}

export function setLocale(locale) {
  if (!SUPPORTED_LOCALES.includes(locale)) return;
  i18n.global.locale.value = locale;
  try {
    window.localStorage.setItem(STORAGE_KEY, locale);
  } catch (e) {
    // Ignore storage write errors
  }
  if (typeof document !== "undefined") {
    document.documentElement.lang = locale;
  }
}

export function getIntlLocale() {
  return getLocale() === "id" ? "id-ID" : "en-US";
}

export function formatRoleLabel(role) {
  if (!role) return "-";
  const key = String(role).toLowerCase().trim();
  const path = `roles.${key}`;
  if (i18n.global.te(path)) {
    return i18n.global.t(path);
  }
  return formatEnumLabel(role);
}

export function formatEnumLabel(val) {
  if (!val || typeof val !== "string") return "";
  const key = val.toLowerCase().trim();
  const enumPath = `enums.${key}`;
  if (i18n.global.te(enumPath)) {
    return i18n.global.t(enumPath);
  }
  const rolePath = `roles.${key}`;
  if (i18n.global.te(rolePath)) {
    return i18n.global.t(rolePath);
  }
  return val
    .split(/[_-\s]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

if (typeof document !== "undefined") {
  document.documentElement.lang = getLocale();
}

export default i18n;
