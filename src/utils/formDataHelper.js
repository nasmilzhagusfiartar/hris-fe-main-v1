const FILE_FIELD_NAMES = new Set(["photo", "icon", "profile_photo", "avatar", "logo"]);
const IGNORED_PREVIEW_KEYS = new Set(["photo_url", "icon_url", "profile_photo_url"]);

/**
 * Convert a plain object (possibly containing File/Blob values) into FormData
 * suitable for Laravel multipart endpoints (including POST + _method=PUT spoofing).
 */
export function toFormData(payload, extraFields = {}) {
  if (payload instanceof FormData) {
    Object.entries(extraFields).forEach(([key, value]) => {
      if (value !== undefined && value !== null && !payload.has(key)) {
        payload.append(key, String(value));
      }
    });
    return payload;
  }

  const formData = new FormData();
  const merged = { ...(payload || {}), ...extraFields };

  Object.entries(merged).forEach(([key, value]) => {
    if (IGNORED_PREVIEW_KEYS.has(key) || value === undefined || value === null) {
      return;
    }

    if (value instanceof File || value instanceof Blob) {
      formData.append(key, value);
      return;
    }

    if (FILE_FIELD_NAMES.has(key)) {
      // Skip non-File placeholders (e.g. empty string or existing URL) on file fields
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item !== undefined && item !== null) {
          formData.append(`${key}[]`, typeof item === "boolean" ? (item ? "1" : "0") : String(item));
        }
      });
      return;
    }

    if (typeof value === "boolean") {
      formData.append(key, value ? "1" : "0");
      return;
    }

    if (typeof value === "object") {
      // Skip nested relation objects accidentally carried over from GET responses
      return;
    }

    formData.append(key, String(value));
  });

  return formData;
}
