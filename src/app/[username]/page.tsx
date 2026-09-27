import { unstable_cache } from "next/cache";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PublicPage } from "@/components/public/PublicPage";
import { FirebaseMissing } from "@/components/ui/FirebaseMissing";
import { AGE_CONFIRM_KEY, AGE_CONFIRM_VALUE } from "@/lib/ageGate";
import { getPageByUsername } from "@/lib/firebase/pages";
import { isFirebaseConfigured } from "@/lib/firebase/client";
import type { PageDocument } from "@/lib/types";
import {
  isValidUsername,
  normalizeUsername,
  RESERVED_USERNAMES,
} from "@/lib/validation";

/**
 * Server-side, cached loader for a user's public page.
 *
 * The cache tag is unique per user (`page-${username}`) so that saving one
 * user's page only invalidates that user's cached entry — never the cached
 * pages of other users. The username is part of both the cache key parts and
 * the tag, and both sides use the same normalized value.
 */
function loadCachedPageByUsername(username: string) {
  return unstable_cache(
    async (uname: string): Promise<PageDocument | null> =>
      getPageByUsername(uname),
    ["page-by-username", username],
    { tags: [`page-${username}`] },
  )(username);
}

/**
 * Open Graph / Twitter Card tags for link previews (messengers, socials).
 * The og:image itself comes from the ./opengraph-image file convention.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username: raw } = await params;
  const username = normalizeUsername(raw ?? "");
  if (
    !username ||
    RESERVED_USERNAMES.has(username) ||
    !isValidUsername(username)
  ) {
    return {};
  }
  if (!isFirebaseConfigured()) return {};
  let page: PageDocument | null;
  try {
    page = await loadCachedPageByUsername(username);
  } catch {
    return {};
  }
  if (!page) return {};
  const title = page.profile.displayName?.trim() || `@${username}`;
  const description =
    page.profile.description?.trim() || `Links by ${title} on Buttonly`;
  return {
    title,
    description,
    openGraph: { title, description, type: "profile", username },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function UserPublicPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username: raw } = await params;
  const username = normalizeUsername(raw ?? "");

  const invalidRoute =
    !username ||
    RESERVED_USERNAMES.has(username) ||
    !isValidUsername(username);

  if (!isFirebaseConfigured()) return <FirebaseMissing />;

  if (invalidRoute) {
    notFound();
  }

  let page: PageDocument | null;
  try {
    page = await loadCachedPageByUsername(username);
  } catch (e: unknown) {
    return (
      <div className="center-screen">
        <p>{e instanceof Error ? e.message : "Failed to load"}</p>
      </div>
    );
  }

  if (!page) notFound();

  // When a returning visitor already confirmed 18+ (cookie), render the page
  // content directly on the server so the age gate is not even sent to the
  // browser — this is what kills the "gate flashes for a split second" issue.
  const cookieStore = await cookies();
  const serverAgeConfirmed =
    (cookieStore.get(AGE_CONFIRM_KEY)?.value ?? "") === AGE_CONFIRM_VALUE;

  return (
    <PublicPage page={page} serverAgeConfirmed={serverAgeConfirmed} />
  );
}
