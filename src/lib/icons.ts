import { getHostname } from "./validation";

export function faviconUrlFromLink(url: string, size = 64): string | null {
  const host = getHostname(url);
  if (!host) return null;
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=${size}`;
}
