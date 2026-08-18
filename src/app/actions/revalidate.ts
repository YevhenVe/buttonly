"use server";

import { revalidateTag } from "next/cache";
import { normalizeUsername } from "@/lib/validation";

/**
 * Invalidates the per-user cache tag used by the public page
 * (`page-${username}`, see `src/app/[username]/page.tsx`).
 *
 * Called by the dashboard immediately after a successful Firestore write, so
 * the user's own public page reflects their latest save. The username is
 * normalized identically on both the read and the write side to guarantee the
 * tags match exactly.
 */
export async function revalidatePage(username: string): Promise<void> {
  const uname = normalizeUsername(username);
  if (!uname) return;
  // "max" gives stale-while-revalidate: stale content is served while fresh
  // data is fetched in the background on the next visit to the page.
  revalidateTag(`page-${uname}`, "max");
}