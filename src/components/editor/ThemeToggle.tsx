"use client";

import { usePageEditor } from "@/context/PageEditorProvider";
import styles from "./editor.module.css";

export function ThemeToggle() {
  const { page, setPage } = usePageEditor();
  if (!page) return null;

  return (
    <div className={styles.section}>
      <h3 className={styles.sectionTitle}>Theme</h3>
      <div className={styles.toggle} role="group" aria-label="Theme">
        <button
          type="button"
          className={page.theme === "light" ? styles.active : ""}
          onClick={() => setPage((p) => ({ ...p, theme: "light" }))}
        >
          Light
        </button>
        <button
          type="button"
          className={page.theme === "dark" ? styles.active : ""}
          onClick={() => setPage((p) => ({ ...p, theme: "dark" }))}
        >
          Dark
        </button>
      </div>
    </div>
  );
}
