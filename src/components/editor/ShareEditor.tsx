"use client";

import { SHARE_PLATFORMS, type SharePlatform } from "@/lib/types";
import { SHARE_LABELS, shareAction } from "@/lib/share";
import { usePageEditor } from "@/context/PageEditorProvider";
import styles from "./editor.module.css";

export function ShareEditor() {
  const { page, setPage } = usePageEditor();
  if (!page) return null;

  const toggle = (platform: SharePlatform, enabled: boolean) => {
    setPage((prev) => {
      const set = new Set(prev.shareEnabled);
      if (enabled) set.add(platform);
      else set.delete(platform);
      return {
        ...prev,
        shareEnabled: SHARE_PLATFORMS.filter((p) => set.has(p)),
      };
    });
  };

  const enableAll = () => {
    setPage((prev) => ({
      ...prev,
      shareEnabled: [...SHARE_PLATFORMS],
    }));
  };

  const disableAll = () => {
    setPage((prev) => ({
      ...prev,
      shareEnabled: [],
    }));
  };

  return (
    <div className={styles.panel}>
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Share bar</h3>
        <p className={styles.hint}>
          Visitors can share <strong>your page URL</strong> (
          <code>/{page.username}</code>) to these networks. This does not link to your personal
          social profiles.
        </p>
        <div className={styles.buttonActions}>
          <button type="button" className={`${styles.btn} ${styles.btnSm}`} onClick={enableAll}>
            Enable all
          </button>
          <button type="button" className={`${styles.btn} ${styles.btnSm}`} onClick={disableAll}>
            Disable all
          </button>
        </div>
      </div>

      {SHARE_PLATFORMS.map((platform) => {
        const enabled = page.shareEnabled.includes(platform);
        const action = shareAction(platform);
        return (
          <div key={platform} className={styles.shareItem}>
            <div className={styles.shareTop}>
              <input
                id={`share-${platform}`}
                type="checkbox"
                checked={enabled}
                onChange={(e) => toggle(platform, e.target.checked)}
              />
              <label htmlFor={`share-${platform}`}>
                {SHARE_LABELS[platform]}
              </label>
            </div>
            <p className={styles.hint}>
              {action === "copy"
                ? "Copies your page link (paste into the app no web share API)."
                : `Opens ${SHARE_LABELS[platform]} share dialog with your page link.`}
            </p>
          </div>
        );
      })}
    </div>
  );
}
