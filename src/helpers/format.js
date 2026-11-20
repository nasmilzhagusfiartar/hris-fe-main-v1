import { DateTime } from 'luxon';

export function formatToClientTimezone(date, format = "dd MMM yyyy, HH:mm 'WIB'") {
  const originalDate = DateTime.fromISO(date, { zone: 'utc' });

  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  return originalDate.setZone(timezone).setLocale('en').toFormat(format);
}