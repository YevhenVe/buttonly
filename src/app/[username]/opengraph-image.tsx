import { ImageResponse } from "next/og";
import { OgCard } from "@/components/public/OgCard";
import { getOgFonts } from "@/lib/og-font";
import { getPageByUsername } from "@/lib/firebase/pages";
import { isFirebaseConfigured } from "@/lib/firebase/client";
import type { PageDocument } from "@/lib/types";
import {
  isValidUsername,
  normalizeUsername,
  RESERVED_USERNAMES,
} from "@/lib/validation";

/**
 * Dynamic Open Graph image for a public page: `/{username}/opengraph-image`.
 * Next.js picks this file up automatically and serves it as the page's
 * og:image (and twitter:image fallback) — no manual meta tags needed.
 *
 * Renders the page's background (image or color), avatar, display name,
 * description and first link titles at 1200×630.
 *
 * The route must never 500: crawlers treat a failed og:image as "no image",
 * so every external dependency (fonts, page data, images) degrades
 * gracefully and any unexpected error falls back to a minimal card.
 */

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Buttonly link page preview";

/**
 * Image formats Satori (via resvg) can decode. Notably WebP/AVIF are NOT
 * supported — passing one crashes the render ("failed to pipe response"),
 * so such images are skipped and the card falls back to a solid color.
 */
const DECODABLE_IMAGE_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/svg+xml",
]);

function sanitizeImageDataUrl(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const match = /^data:(image\/[a-z0-9+.-]+);base64,/i.exec(value);
  if (!match) return null;
  if (!DECODABLE_IMAGE_TYPES.has(match[1].toLowerCase())) return null;
  return value;
}

function truncate(s: string, max: number): string {
  const t = s.trim().replace(/\s+/g, " ");
  return t.length > max ? t.slice(0, max - 1).trimEnd() + "…" : t;
}

function asText(value: unknown): string {
  return typeof value === "string" ? value : "";
}

/** Minimal card with zero external dependencies — the last resort. */
function fallbackImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0b0f1a",
          color: "#ffffff",
          fontSize: 72,
          fontWeight: 800,
        }}
      >
        Buttonly
      </div>
    ),
    { ...size },
  );
}

async function renderCard(username: string) {
  let page: PageDocument | null = null;
  if (
    username &&
    !RESERVED_USERNAMES.has(username) &&
    isValidUsername(username) &&
    isFirebaseConfigured()
  ) {
    try {
      page = await getPageByUsername(username);
    } catch {
      page = null;
    }
  }

  // Fonts are nice-to-have: render with a fallback font if Google Fonts
  // is unreachable instead of failing the whole image.
  let fonts: Awaited<ReturnType<typeof getOgFonts>> | undefined;
  try {
    fonts = await getOgFonts();
  } catch {
    fonts = undefined;
  }

  const groups = Array.isArray(page?.groups) ? page.groups : [];
  const links = groups
    .flatMap((g) => (Array.isArray(g?.buttons) ? g.buttons : []))
    .map((b) => asText(b?.label).trim())
    .filter(Boolean)
    .slice(0, 3)
    .map((t) => truncate(t, 22));

  const profile = page?.profile;
  const background = page?.background;
  const displayName =
    asText(profile?.displayName).trim() || (username ? `@${username}` : "Buttonly");
  const description = asText(profile?.description).trim();

  return new ImageResponse(
    (
      <OgCard
        data={{
          displayName: truncate(displayName, 28),
          username: username || "buttonly",
          description: description ? truncate(description, 110) : undefined,
          avatarDataUrl: sanitizeImageDataUrl(profile?.avatarDataUrl),
          backgroundColor: asText(background?.color).trim() || "#111827",
          backgroundImageDataUrl:
            background?.type === "image"
              ? sanitizeImageDataUrl(background.imageDataUrl)
              : null,
          links,
        }}
      />
    ),
    { ...size, ...(fonts ? { fonts } : {}) },
  );
}

export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username: raw } = await params;
  const username = normalizeUsername(raw ?? "");
  try {
    return await renderCard(username);
  } catch {
    return fallbackImage();
  }
}
