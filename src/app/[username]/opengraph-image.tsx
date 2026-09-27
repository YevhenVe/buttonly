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
 */

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Buttonly link page preview";

function truncate(s: string, max: number): string {
  const t = s.trim().replace(/\s+/g, " ");
  return t.length > max ? t.slice(0, max - 1).trimEnd() + "…" : t;
}

export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username: raw } = await params;
  const username = normalizeUsername(raw ?? "");

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

  const fonts = await getOgFonts();

  const links = (page?.groups ?? [])
    .flatMap((g) => g.buttons.map((b) => b.label))
    .filter(Boolean)
    .slice(0, 3)
    .map((t) => truncate(t, 22));

  return new ImageResponse(
    (
      <OgCard
        data={{
          displayName: truncate(page?.profile.displayName || username || "Buttonly", 28),
          username: username || "buttonly",
          description: page?.profile.description
            ? truncate(page.profile.description, 110)
            : undefined,
          avatarDataUrl: page?.profile.avatarDataUrl ?? null,
          backgroundColor: page?.background.color || "#111827",
          backgroundImageDataUrl:
            page?.background.type === "image"
              ? (page.background.imageDataUrl ?? null)
              : null,
          links,
        }}
      />
    ),
    { ...size, fonts },
  );
}
