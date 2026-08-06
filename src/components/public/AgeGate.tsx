"use client";

import { useState, useSyncExternalStore, type ReactNode } from "react";
import styles from "./PublicPage.module.css";

/** Browser-wide: once confirmed, profile age gate is not shown again. */
const STORAGE_KEY = "Buttonly_age_confirmed_18";

function readConfirmed(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function writeConfirmed() {
  try {
    localStorage.setItem(STORAGE_KEY, "1");
  } catch {
    /* private mode / blocked storage */
  }
}

function subscribe(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  return () => window.removeEventListener("storage", onStoreChange);
}

export function AgeGate({
  enabled,
  preview = false,
  children,
}: {
  enabled: boolean;
  preview?: boolean;
  children: ReactNode;
}) {
  const storedConfirmed = useSyncExternalStore(
    subscribe,
    readConfirmed,
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

  if (entered) return <>{children}</>;

  const confirmAge = () => {
    writeConfirmed();
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
