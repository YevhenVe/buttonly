"use client";

import { useState, useSyncExternalStore, type ReactNode } from "react";
import { readAgeConfirmed, writeAgeConfirmed } from "@/lib/ageGate";
import styles from "./PublicPage.module.css";

function subscribe(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  return () => window.removeEventListener("storage", onStoreChange);
}

export function AgeGate({
  enabled,
  preview = false,
  serverConfirmed = false,
  children,
}: {
  enabled: boolean;
  preview?: boolean;
  /** True when the server already saw a matching confirmation cookie. */
  serverConfirmed?: boolean;
  children: ReactNode;
}) {
  const storedConfirmed = useSyncExternalStore(
    subscribe,
    readAgeConfirmed,
    () => false,
  );
  const [localEntered, setLocalEntered] = useState(false);
  const entered = storedConfirmed || localEntered;

  // Preview: overlay badge only, keep height chain so .bgImage stays 100%.
  if (!enabled) return <>{children}</>;

  if (preview) {
    return (
      <div className={styles.agePreviewWrap}>
        <div className={styles.ageBadge} role="status">
          18+ age gate enabled
        </div>
        {children}
      </div>
    );
  }

  if (serverConfirmed || entered) return <>{children}</>;

  const confirmAge = () => {
    writeAgeConfirmed();
    setLocalEntered(true);
  };

  return (
    <div
      className={styles.ageGate}
      role="dialog"
      aria-modal="true"
      aria-labelledby="age-gate-title"
    >
      <div className={styles.ageCard}>
        <p className={styles.ageTag}>18+</p>
        <h1 id="age-gate-title" className={styles.ageTitle}>
          Adult content warning
        </h1>
        <p className={styles.ageText}>
          This page is marked as <strong>18+</strong>. You must be at least 18
          years old to continue. By entering, you confirm that you are of legal
          age in your region. You will only be asked once on this device.
        </p>
        <div className={styles.ageActions}>
          <button
            type="button"
            className={styles.ageEnter}
            onClick={confirmAge}
          >
            I am 18 or older - Enter
          </button>
          <a className={styles.ageLeave} href="https://www.google.com">
            Leave
          </a>
        </div>
      </div>
    </div>
  );
}
