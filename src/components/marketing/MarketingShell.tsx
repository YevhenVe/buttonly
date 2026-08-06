"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useAuth } from "@/context/AuthProvider";
import { BrandLogo } from "@/components/BrandLogo";
import styles from "./marketing.module.css";

export function MarketingShell({
  children,
  active,
}: {
  children: ReactNode;
  /** Highlight current auth route in the header */
  active?: "login" | "signup" | "home";
}) {
  const { user, loading } = useAuth();

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <BrandLogo className={styles.logo} height={36} />
        <nav className={styles.nav}>
          {!loading && user ? (
            <Link className={`${styles.btn} ${styles.btnPrimary}`} href="/dashboard">
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className={active === "login" ? styles.btn : undefined}
              >
                Log in
              </Link>
              <Link
                className={`${styles.btn} ${styles.btnPrimary}`}
                href="/signup"
              >
                Sign up
              </Link>
            </>
          )}
        </nav>
      </header>
      <main className={styles.main}>{children}</main>
    </div>
  );
}

export { styles as marketingStyles };
