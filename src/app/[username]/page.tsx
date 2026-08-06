"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  PublicPage,
  PublicPageNotFound,
} from "@/components/public/PublicPage";
import { FirebaseMissing } from "@/components/ui/FirebaseMissing";
import { getPageByUsername } from "@/lib/firebase/pages";
import { isFirebaseConfigured } from "@/lib/firebase/client";
import type { PageDocument } from "@/lib/types";
import {
  isValidUsername,
  normalizeUsername,
  RESERVED_USERNAMES,
} from "@/lib/validation";

export default function UserPublicPage() {
  const params = useParams<{ username: string }>();
  const username = normalizeUsername(params.username ?? "");
  const configured = isFirebaseConfigured();
  const [page, setPage] = useState<PageDocument | null | undefined>(
    configured ? undefined : null,
  );
  const [error, setError] = useState<string | null>(null);

  const invalidRoute =
    !username ||
    RESERVED_USERNAMES.has(username) ||
    !isValidUsername(username);

  useEffect(() => {
    if (!configured || invalidRoute) return;

    let cancelled = false;
    getPageByUsername(username)
      .then((doc) => {
        if (!cancelled) setPage(doc);
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load");
          setPage(null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [username, configured, invalidRoute]);

  if (!configured) return <FirebaseMissing />;

  if (invalidRoute) {
    return <PublicPageNotFound username={username || "unknown"} />;
  }

  if (page === undefined) {
    return (
      <div className="center-screen">
        <p>Loading…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="center-screen">
        <p>{error}</p>
      </div>
    );
  }

  if (!page) return <PublicPageNotFound username={username} />;

  return <PublicPage page={page} />;
}
