import i18n, { formatEnumLabel, getIntlLocale } from "@/plugins/i18n";

export const formatCurrency = (amount) => {
  if (!amount) return "";
  return new Intl.NumberFormat(getIntlLocale(), {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

export const formatRupiah = (amount) => {
  const n = Number(amount);
  if (!n) return "Rp 0";
  const sign = n < 0 ? "-" : "";
  return `${sign}Rp ${new Intl.NumberFormat(getIntlLocale(), {
    maximumFractionDigits: 0,
  }).format(Math.abs(n))}`;
};

export const formatRupiahCompact = (amount) => {
  const n = Number(amount);
  if (!n) return "Rp 0";
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";
  const isId = getIntlLocale() === "id-ID";
  if (abs >= 1000000000) {
    return `Rp ${sign}${(abs / 1000000000).toFixed(1)}${isId ? " M" : "B"}`;
  } else if (abs >= 1000000) {
    return `Rp ${sign}${(abs / 1000000).toFixed(1)}${isId ? " Jt" : "M"}`;
  } else if (abs >= 1000) {
    return `Rp ${sign}${(abs / 1000).toFixed(1)}${isId ? " Rb" : "K"}`;
  }
  return formatRupiah(n);
};

export const capitalize = (str) => {
  if (!str) return "-";
  return formatEnumLabel(String(str));
};

export const getJobStatusText = (status) => {
  if (!status) return "";
  const key = String(status).toLowerCase().trim();
  const path = `enums.${key}`;
  if (i18n.global.te(path)) {
    return i18n.global.t(path);
  }
  return capitalize(status);
};
