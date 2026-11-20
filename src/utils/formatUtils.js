import { formatEnumLabel } from "@/constants/labels";

export const formatCurrency = (amount) => {
  if (!amount) return "";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

export const formatRupiah = (amount) => {
  const n = Number(amount);
  if (!n) return "Rp 0";
  const sign = n < 0 ? "-" : "";
  return `${sign}Rp ${new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(Math.abs(n))}`;
};

export const formatRupiahCompact = (amount) => {
  const n = Number(amount);
  if (!n) return "Rp 0";
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";
  if (abs >= 1000000000) {
    return `Rp ${sign}${(abs / 1000000000).toFixed(1)}B`;
  } else if (abs >= 1000000) {
    return `Rp ${sign}${(abs / 1000000).toFixed(1)}M`;
  } else if (abs >= 1000) {
    return `Rp ${sign}${(abs / 1000).toFixed(1)}K`;
  }
  return formatRupiah(n);
};

export const capitalize = (str) => {
  if (!str) return "-";
  return formatEnumLabel(String(str));
};

export const getJobStatusText = (status) => {
  if (!status) return "";
  const map = {
    active: "Active",
    on_leave: "On Leave",
    resigned: "Resigned",
  };
  return map[status] || capitalize(status);
};
