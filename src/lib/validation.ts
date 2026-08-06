const USERNAME_RE = /^[a-z0-9_]{3,20}$/;

/** Reserved so /username never clashes with app routes. */
export const RESERVED_USERNAMES = new Set([
  "login",
  "signup",
  "dashboard",
  "admin",
  "api",
  "settings",
  "account",
  "auth",
  "u",
  "app",
  "www",
  "static",
  "public",
  "assets",
  "favicon",
  "robots",
  "sitemap",
  "next",
  "_next",
]);

export function normalizeUsername(value: string): string {
  return value.trim().toLowerCase();
}

export function isValidUsername(value: string): boolean {
  const v = normalizeUsername(value);
  return USERNAME_RE.test(v) && !RESERVED_USERNAMES.has(v);
}

export function usernameError(value: string): string | null {
  const v = normalizeUsername(value);
  if (!v) return "Username is required";
  if (v.length < 3) return "Username must be at least 3 characters";
  if (v.length > 20) return "Username must be at most 20 characters";
  if (!USERNAME_RE.test(v)) {
    return "Use only lowercase letters, numbers, and underscores";
  }
  if (RESERVED_USERNAMES.has(v)) {
    return "This username is reserved. Choose another.";
  }
  return null;
}

export function normalizeUrl(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export function isValidUrl(raw: string): boolean {
  try {
    const url = new URL(normalizeUrl(raw));
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function getHostname(raw: string): string | null {
  try {
    return new URL(normalizeUrl(raw)).hostname;
  } catch {
    return null;
  }
}
