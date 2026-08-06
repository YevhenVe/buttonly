"use client";

import { PublicPage } from "@/components/public/PublicPage";
import { usePageEditor } from "@/context/PageEditorProvider";
import styles from "./LivePreview.module.css";

/** Phone frame only — label lives in the dashboard grid for alignment. */
export function LivePreview() {
  const { page, loading } = usePageEditor();

  return (
    <div className={styles.wrap}>
      <div className={styles.phone}>
        {loading ? (
          <div className={styles.placeholder}>Loading…</div>
        ) : page ? (
          <div className={styles.scroll}>
            <PublicPage page={page} preview />
          </div>
        ) : (
          <div className={styles.placeholder}>No page data</div>
        )}
      </div>
    </div>
  );
}
