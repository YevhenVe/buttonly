import type { SharePlatform } from "./types";

export const SHARE_LABELS: Record<SharePlatform, string> = {
  twitter: "X / Twitter",
  facebook: "Facebook",
  instagram: "Instagram",
  threads: "Threads",
  tiktok: "TikTok",
  reddit: "Reddit",
};

/** Platforms that open a native “share this URL” web intent. */
export type ShareAction = "intent" | "copy";

export function shareAction(platform: SharePlatform): ShareAction {
  // Instagram & TikTok have no public web share-intent for arbitrary URLs.
  if (platform === "instagram" || platform === "tiktok") return "copy";
  return "intent";
}

/**
 * Build a social share URL for the visitor’s page link
 * (not the owner’s profile on that network).
 */
export function buildShareIntentUrl(
  platform: SharePlatform,
  pageUrl: string,
  text: string,
): string | null {
  const url = encodeURIComponent(pageUrl);
  const title = encodeURIComponent(text);

  switch (platform) {
    case "twitter":
      return `https://twitter.com/intent/tweet?url=${url}&text=${title}`;
    case "facebook":
      return `https://www.facebook.com/sharer/sharer.php?u=${url}`;
    case "reddit":
      return `https://www.reddit.com/submit?url=${url}&title=${title}`;
    case "threads":
      return `https://www.threads.net/intent/post?text=${encodeURIComponent(`${text} ${pageUrl}`)}`;
    case "instagram":
    case "tiktok":
      return null;
  }
}

export function publicPageUrl(username: string, origin?: string): string {
  const base =
    origin ||
    (typeof window !== "undefined" ? window.location.origin : "");
  return `${base}/${username}`;
}
