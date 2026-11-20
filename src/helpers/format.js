import { DateTime } from "luxon";
import { getLocale } from "@/plugins/i18n";
import { getCompanyTimezone, getTimezoneLabel } from "@/utils/dateUtils";

export function formatToClientTimezone(date, format = "dd MMM yyyy, HH:mm") {
  if (!date) return "-";
  const timezone = getCompanyTimezone();
  const tzLabel = getTimezoneLabel(timezone);
  const originalDate = DateTime.fromISO(date, { zone: "utc" });
  const formatted = originalDate.setZone(timezone).setLocale(getLocale()).toFormat(format);
  return `${formatted} ${tzLabel}`;
}
