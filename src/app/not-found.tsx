import type { Metadata } from "next";
import Link from "next/link";
import {
  MarketingShell,
  marketingStyles as styles,
} from "@/components/marketing/MarketingShell";
import notFoundStyles from "./not-found.module.css";

export const metadata: Metadata = {
  title: "Page not found",
  description: "The page you are looking for could not be found.",
};

export default function NotFound() {
  return (
    <MarketingShell>
      <div
        className={`${styles.panel} ${styles.panelWide} ${notFoundStyles.wrap}`}
      >
        <p className={notFoundStyles.code}>404</p>
        <h1>Page not found</h1>
        <p className={styles.panelLead}>
          The page you are looking for doesn&apos;t exist, may have been moved,
          or never lived at this address.
        </p>
        <Link className={`${styles.btn} ${styles.btnPrimary}`} href="/">
          Back to home
        </Link>
      </div>
    </MarketingShell>
  );
}