"use client";

import { usePageEditor } from "@/context/PageEditorProvider";
import styles from "./editor.module.css";

export function AgeRestrictedToggle() {
  const { page, setPage } = usePageEditor();
  if (!page) return null;

  const enabled = Boolean(page.is18Plus);

  return (
    <div className={styles.section}>
      <h3 className={styles.sectionTitle}>Age restriction</h3>
      <label className={styles.switchRow}>
        <span className={styles.switchText}>
          <strong>18+ content</strong>
          <span className={styles.hint}>
            Visitors must confirm they are 18 or older before seeing your page.
          </span>
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          className={`${styles.switch} ${enabled ? styles.switchOn : ""}`}
          onClick={() =>
            setPage((prev) => ({ ...prev, is18Plus: !prev.is18Plus }))
          }
        >
          <span className={styles.switchThumb} />
        </button>
      </label>

      {enabled ? (
        <div className={styles.warningBox} role="status">
          <strong>Warning:</strong> Your public page will show an 18+ age gate.
          Only people who confirm they are adults can view your links.
        </div>
      ) : null}
    </div>
  );
}
