"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthProvider";
import {
  MarketingShell,
  marketingStyles as styles,
} from "@/components/marketing/MarketingShell";

export default function Home() {
  const { user, configured } = useAuth();

  return (
    <MarketingShell active="home">
      <div className={`${styles.panel} ${styles.panelWide}`}>
        <h1>One link for everything you share</h1>
        <p className={styles.panelLead}>
          Customize your avatar, background, buttons, and share bar. Your page
          lives at a personal URL, free for all.
        </p>
        <div className={styles.ctaRow}>
          {user ? (
            <Link className={`${styles.btn} ${styles.btnPrimary}`} href="/dashboard">
              Open dashboard
            </Link>
          ) : (
            <Link className={`${styles.btn} ${styles.btnPrimary}`} href="/signup">
              Create your page
            </Link>
          )}
          <Link className={styles.btn} href="/login">
            I already have an account
          </Link>
        </div>
        {!configured ? (
          <p className={styles.tip}>
            Tip: add Firebase keys to <code>.env.local</code> before signing up.
          </p>
        ) : null}
      </div>
    </MarketingShell>
  );
}
