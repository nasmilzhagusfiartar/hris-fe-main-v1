import i18n, { getIntlLocale } from "@/plugins/i18n";
import { useSettingsStore } from "@/stores/settings";

const TIMEZONE_LABELS = {
  "Asia/Jakarta": "WIB",
  "Asia/Pontianak": "WIB",
  "Asia/Makassar": "WITA",
  "Asia/Jayapura": "WIT",
};

export const getCompanyTimezone = () => {
  try {
    const settingsStore = useSettingsStore();
    if (settingsStore?.company?.timezone) {
      return settingsStore.company.timezone;
    }
  } catch (e) {
    // Store may not be active yet
  }
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Jakarta";
  } catch (e) {
    return "Asia/Jakarta";
  }
};

export const getTimezoneLabel = (timeZone = getCompanyTimezone()) => {
  if (TIMEZONE_LABELS[timeZone]) {
    return TIMEZONE_LABELS[timeZone];
  }
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone,
      timeZoneName: "short",
    }).formatToParts(new Date());
    return parts.find((p) => p.type === "timeZoneName")?.value || timeZone;
  } catch (e) {
    return "WIB";
  }
};

export const formatDateTimeWithTz = (dateString, timeZone = getCompanyTimezone()) => {
  if (!dateString) return "-";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return String(dateString);
    const formatted = d.toLocaleString(getIntlLocale(), {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone,
    });
    return `${formatted} ${getTimezoneLabel(timeZone)}`;
  } catch (e) {
    return String(dateString);
  }
};

export const getTimeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInHours < 1) return i18n.global.t("time.justNow");
  if (diffInHours < 24) return i18n.global.t("time.hoursAgo", { count: diffInHours });
  if (diffInDays === 1) return i18n.global.t("time.oneDayAgo");
  return i18n.global.t("time.daysAgo", { count: diffInDays });
};

export const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString(getIntlLocale(), {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: getCompanyTimezone(),
  });
};

export const calculateDuration = (startDate, endDate) => {
  if (!startDate || !endDate) return "N/A";

  const start = new Date(startDate);
  const end = new Date(endDate);

  const diffInMs = end.getTime() - start.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays < 0) return i18n.global.t("time.invalidDates");
  if (diffInDays <= 1) return i18n.global.t("time.oneDay");
  if (diffInDays < 30) return i18n.global.t("time.days", { count: diffInDays });

  const months = Math.floor(diffInDays / 30);
  const days = diffInDays % 30;

  if (months === 1 && days === 0) return i18n.global.t("time.oneMonth");
  if (months === 1) return i18n.global.t("time.oneMonthDays", { days });
  if (days === 0) return i18n.global.t("time.months", { count: months });
  return i18n.global.t("time.monthsDays", { months, days });
};

export const formatDateShort = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString(getIntlLocale(), {
    month: "short",
    day: "numeric",
    timeZone: getCompanyTimezone(),
  });
};

export const formatDateLong = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleDateString(getIntlLocale(), {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: getCompanyTimezone(),
  });
};

export const formatRequestDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString(getIntlLocale(), {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: getCompanyTimezone(),
  });
};

export const formatRequestDateLong = (dateString) => {
  const tz = getCompanyTimezone();
  const date = new Date(dateString);
  const formatted = date.toLocaleDateString(getIntlLocale(), {
    weekday: "short",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: tz,
  });
  return `${formatted} ${getTimezoneLabel(tz)}`;
};

export const getDayName = (dateString) => {
  const date = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);

  if (date.getTime() === today.getTime()) {
    return i18n.global.t("time.today");
  }

  return date.toLocaleDateString(getIntlLocale(), {
    weekday: "long",
    timeZone: getCompanyTimezone(),
  });
};

export const formatTime = (dateString) => {
  if (!dateString) return "--:--";
  const date = new Date(dateString);
  return date.toLocaleTimeString(getIntlLocale(), {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    timeZone: getCompanyTimezone(),
  });
};

export const calculateWorkingHours = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return null;
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diffMs = end - start;
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(diffMins / 60);
  const minutes = diffMins % 60;
  return `${hours}h ${minutes}m`;
};

export const calculateWorkingDays = (startDate, endDate) => {
  if (!startDate || !endDate || new Date(startDate) > new Date(endDate)) {
    return 0;
  }

  const start = new Date(startDate);
  const end = new Date(endDate);
  let workingDays = 0;

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    if (d.getDay() !== 0 && d.getDay() !== 6) {
      workingDays++;
    }
  }

  return workingDays;
};
