"use client";

import { useCallback, useMemo, useState } from "react";
import type { PageDocument, SharePlatform } from "@/lib/types";
import {
  SHARE_LABELS,
  buildShareIntentUrl,
  publicPageUrl,
  shareAction,
} from "@/lib/share";
import { ShareIcon } from "./ShareIcons";
import styles from "./PublicPage.module.css";

export function ShareBar({
  page,
  preview = false,
}: {
  page: PageDocument;
  preview?: boolean;
}) {
  const [copied, setCopied] = useState<SharePlatform | null>(null);

  const pageUrl = useMemo(() => {
    if (typeof window === "undefined") return `/${page.username}`;
    return publicPageUrl(page.username);
  }, [page.username]);

  const shareText =
    page.profile.displayName || page.username
      ? `Check out ${page.profile.displayName || page.username}`
      : "Check out my links";

  const platforms = page.shareEnabled.filter((p) =>
    Boolean(SHARE_LABELS[p]),
  );

  const copyLink = useCallback(
    async (platform: SharePlatform) => {
      try {
        await navigator.clipboard.writeText(pageUrl);
        setCopied(platform);
        window.setTimeout(() => setCopied(null), 1800);
      } catch {
        // Fallback prompt
        window.prompt("Copy this link:", pageUrl);
      }
    },
    [pageUrl],
  );

  const onShare = useCallback(
    (platform: SharePlatform) => {
      if (preview) {
        // In editor preview just show copy feedback for copy platforms
        if (shareAction(platform) === "copy") {
          void copyLink(platform);
        }
        return;
      }

      if (shareAction(platform) === "copy") {
        void copyLink(platform);
        return;
      }

      const href = buildShareIntentUrl(platform, pageUrl, shareText);
      if (href) {
        window.open(href, "_blank", "noopener,noreferrer,width=600,height=500");
      }
    },
    [copyLink, pageUrl, preview, shareText],
  );

  if (!platforms.length) return null;

  return (
    <div className={styles.footer}>
      <p className={styles.shareLabel}>Share this page</p>
      <div className={styles.shareRow}>
        {platforms.map((platform) => {
          const action = shareAction(platform);
          const label =
            action === "copy"
              ? `Copy link for ${SHARE_LABELS[platform]}`
              : `Share on ${SHARE_LABELS[platform]}`;
          const isCopied = copied === platform;

          return (
            <button
              key={platform}
              type="button"
              className={styles.shareLink}
              onClick={() => onShare(platform)}
              aria-label={label}
              title={
                isCopied
                  ? "Link copied!"
                  : action === "copy"
                    ? `${SHARE_LABELS[platform]}: copy page link`
                    : `Share on ${SHARE_LABELS[platform]}`
              }
            >
              <ShareIcon platform={platform} />
              {isCopied ? (
                <span className={styles.shareCopiedTip}>Copied</span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
