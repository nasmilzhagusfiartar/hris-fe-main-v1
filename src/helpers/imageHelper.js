const getBackendOrigin = () => {
  const apiBase =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:8001/api/v1";
  try {
    const url = new URL(apiBase);
    return url.origin;
  } catch {
    return "http://localhost:8001";
  }
};

export const getInitials = (name = "User") => {
  const clean = String(name || "User").trim();
  if (!clean) return "U";
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return clean.slice(0, 2).toUpperCase();
};

export const getAvatarFallbackUrl = (name = "User") => {
  const initials = getInitials(name);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120"><rect width="120" height="120" rx="24" fill="#EFF6FF"/><text x="50%" y="52%" dominant-baseline="middle" text-anchor="middle" fill="#0C51D9" font-family="Plus Jakarta Sans, Arial, sans-serif" font-size="44" font-weight="700">${initials}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

export const getImageUrl = (path, fallbackName = "") => {
  if (!path || typeof path !== "string") {
    return fallbackName ? getAvatarFallbackUrl(fallbackName) : "";
  }

  const trimmed = path.trim();
  if (!trimmed || trimmed.includes("via.placeholder.com")) {
    return fallbackName ? getAvatarFallbackUrl(fallbackName) : "";
  }

  if (trimmed.startsWith("data:") || trimmed.startsWith("blob:")) {
    return trimmed;
  }

  const origin = getBackendOrigin();

  // Fix legacy URLs that used http://localhost/storage/... without port :8001
  if (trimmed.startsWith("http://localhost/storage/")) {
    const rel = trimmed.replace("http://localhost/storage/", "");
    return `${origin}/storage/${rel}`;
  }

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  const cleanRel = trimmed
    .replace(/^\/+/, "")
    .replace(/^public\/+/, "")
    .replace(/^storage\/+/, "");

  return `${origin}/storage/${cleanRel}`;
};

export const handleImageError = (event, fallbackName = "User") => {
  const target = event?.target;
  if (!target) return;
  target.onerror = null;
  target.src = getAvatarFallbackUrl(fallbackName);
};

