"use client";

import { useState, type MouseEvent } from "react";
import { faviconUrlFromLink } from "@/lib/icons";
import styles from "./PublicPage.module.css";

function LinkIconFallback() {
  return (
    <svg
      className={styles.linkIconFallback}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

export function LinkButton({
  label,
  url,
  iconUrl,
  is18Plus = false,
  preview = false,
}: {
  label: string;
  url: string;
  iconUrl?: string | null;
  is18Plus?: boolean;
  preview?: boolean;
}) {
  const resolved = iconUrl || faviconUrlFromLink(url);
  const [failed, setFailed] = useState(false);
  const [showWarning, setShowWarning] = useState(false);

  const openLink = () => {
    if (preview) return;
    window.open(url, "_blank", "noopener,noreferrer");
    setShowWarning(false);
  };

  const onClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (!is18Plus) return;
    e.preventDefault();
    if (preview) {
      setShowWarning(true);
      return;
    }
    setShowWarning(true);
  };

  return (
    <>
      <a
        className={`${styles.linkButton} ${is18Plus ? styles.linkButtonAdult : ""}`}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onClick}
      >
        {resolved && !failed ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className={styles.linkIcon}
            src={resolved}
            alt=""
            width={22}
            height={22}
            onError={() => setFailed(true)}
          />
        ) : (
          <LinkIconFallback />
        )}
        <span className={styles.linkLabel}>{label}</span>
        {is18Plus ? (
          <span className={styles.linkAdultBadge} title="18+ content">
            18+
          </span>
        ) : null}
      </a>

      {showWarning ? (
        <div
          className={styles.linkAgeBackdrop}
          role="dialog"
          aria-modal="true"
          aria-labelledby="link-age-title"
        >
          <div className={styles.linkAgeCard}>
            <p className={styles.ageTag}>18+</p>
            <h2 id="link-age-title" className={styles.linkAgeTitle}>
              Adult link warning
            </h2>
            <p className={styles.linkAgeText}>
              <strong>{label}</strong> is marked as 18+. You must be at least 18
              years old to continue.
            </p>
            <div className={styles.linkAgeActions}>
              {preview ? (
                <button
                  type="button"
                  className={styles.ageEnter}
                  onClick={() => setShowWarning(false)}
                >
                  Got it (preview)
                </button>
              ) : (
                <button
                  type="button"
                  className={styles.ageEnter}
                  onClick={openLink}
                >
                  I am 18+ - Open link
                </button>
              )}
              <button
                type="button"
                className={styles.linkAgeCancel}
                onClick={() => setShowWarning(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
