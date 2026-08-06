"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { PageEditorProvider, usePageEditor } from "@/context/PageEditorProvider";
import { AvatarEditor } from "@/components/editor/AvatarEditor";
import { DescriptionEditor } from "@/components/editor/DescriptionEditor";
import { AgeRestrictedToggle } from "@/components/editor/AgeRestrictedToggle";
import { ThemeToggle } from "@/components/editor/ThemeToggle";
import { BackgroundEditor } from "@/components/editor/BackgroundEditor";
import { ButtonRadiusSlider } from "@/components/editor/ButtonRadiusSlider";
import { GroupsEditor } from "@/components/editor/GroupsEditor";
import { ShareEditor } from "@/components/editor/ShareEditor";
import { LivePreview } from "@/components/editor/LivePreview";
import { BrandLogo } from "@/components/BrandLogo";
import { logOut } from "@/lib/firebase/auth";
import styles from "./dashboard.module.css";

type Tab = "profile" | "appearance" | "links" | "share";

const TABS: { id: Tab; label: string }[] = [
  { id: "profile", label: "Profile" },
  { id: "appearance", label: "Appearance" },
  { id: "links", label: "Links" },
  { id: "share", label: "Share" },
];

function SaveControls() {
  const { isDirty, saveStatus, saveError, saveNow } = usePageEditor();
  const saving = saveStatus === "saving";

  const statusLabel = useMemo(() => {
    if (saveStatus === "saving") return "Saving…";
    if (saveStatus === "error") return saveError || "Save failed";
    if (saveStatus === "saved" && !isDirty) return "All changes saved";
    if (isDirty) return "Unsaved changes";
    return "No changes";
  }, [saveStatus, saveError, isDirty]);

  return (
    <div className={styles.saveControls}>
      <span
        className={`${styles.saveBadge} ${
          saveStatus === "error" ? styles.saveError : ""
        } ${saveStatus === "saved" && !isDirty ? styles.saveOk : ""} ${
          isDirty ? styles.saveDirty : ""
        }`}
        title={saveError || undefined}
      >
        {statusLabel}
      </span>
      <button
        type="button"
        className={`${styles.btn} ${styles.btnSave}`}
        disabled={!isDirty || saving}
        onClick={() => void saveNow()}
      >
        {saving ? "Saving…" : "Save"}
      </button>
    </div>
  );
}

function DashboardInner() {
  const { page, loading, isDirty } = usePageEditor();
  const [tab, setTab] = useState<Tab>("profile");
  const [copied, setCopied] = useState(false);

  const publicPath = page ? `/${page.username}` : null;

  const copyLink = async () => {
    if (!publicPath || typeof window === "undefined") return;
    const url = `${window.location.origin}${publicPath}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.headerLeft}>
            <BrandLogo className={styles.logo} height={32} />
            {page ? (
              <Link className={styles.publicLink} href={publicPath!} target="_blank">
                /{page.username}
              </Link>
            ) : null}
          </div>
          <div className={styles.headerRight}>
            <SaveControls />
            {publicPath ? (
              <button type="button" className={styles.btn} onClick={() => void copyLink()}>
                {copied ? "Copied" : "Copy link"}
              </button>
            ) : null}
            <button
              type="button"
              className={styles.btn}
              onClick={() => {
                if (isDirty) {
                  const ok = window.confirm(
                    "You have unsaved changes. Log out anyway?",
                  );
                  if (!ok) return;
                }
                void logOut();
              }}
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      <div className={styles.body}>
        {/* Row 1: aligned 40px headers */}
        <div className={styles.tabs} role="tablist">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              className={`${styles.tab} ${tab === t.id ? styles.tabActive : ""}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className={styles.previewLabel}>Live preview</div>

        {/* Row 2: editor stack + phone, same top edge */}
        <div className={styles.panel}>
          {loading ? (
            <p className={styles.muted}>Loading your page…</p>
          ) : !page ? (
            <div className={styles.missingPage}>
              <p>No page found for this account.</p>
              <Link href="/signup?google=1">Claim a username</Link>
            </div>
          ) : (
            <>
              {tab === "profile" ? (
                <div className={styles.stack}>
                  <AvatarEditor />
                  <DescriptionEditor />
                  <AgeRestrictedToggle />
                </div>
              ) : null}
              {tab === "appearance" ? (
                <div className={styles.stack}>
                  <ThemeToggle />
                  <BackgroundEditor />
                  <ButtonRadiusSlider />
                </div>
              ) : null}
              {tab === "links" ? <GroupsEditor /> : null}
              {tab === "share" ? <ShareEditor /> : null}
            </>
          )}
        </div>

        <section className={styles.preview}>
          <LivePreview />
        </section>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <AuthGuard>
      <PageEditorProvider>
        <DashboardInner />
      </PageEditorProvider>
    </AuthGuard>
  );
}
