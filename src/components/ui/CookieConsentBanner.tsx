"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  CONSENT_ACCEPTED,
  CONSENT_DECLINED,
  hasConsentDecision,
  setConsent,
} from "@/lib/cookieConsent";
import styles from "./CookieConsentBanner.module.css";

/**
 * Non-blocking cookie-consent banner (bottom bar).
 *
 * Rendered only on the client after mounting:
 *  - when a decision already exists (cookie/localStorage) it never appears;
 *  - otherwise it slides in shortly after load, so there is no hydration
 *    mismatch and no annoying flash.
 */
export function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);
  const [decided, setDecided] = useState(false);
  const bannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Show only when the visitor has not answered yet.
    if (!hasConsentDecision()) setVisible(true);
  }, []);

  // Announce the banner to assistive tech once it appears.
  useEffect(() => {
    if (visible) {
      bannerRef.current?.focus({ preventScroll: true });
    }
  }, [visible]);

  // Escape dismisses the banner for this session WITHOUT recording a decision.
  useEffect(() => {
    if (!visible) return;
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") setVisible(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [visible]);

  if (!visible || decided) return null;

  const accept = () => {
    setConsent(CONSENT_ACCEPTED);
    setDecided(true);
  };

  const decline = () => {
    setConsent(CONSENT_DECLINED);
    setDecided(true);
  };

  return (
    <div
      ref={bannerRef}
      tabIndex={-1}
      role="region"
      aria-label="Cookie consent"
      className={styles.banner}
    >
      <div className={styles.copy}>
        <p className={styles.title}>We value your privacy</p>
        <p className={styles.text}>
          We use essential cookies to keep Buttonly working — for example, to
          remember your 18+ confirmation and to store your cookie choice.
          Analytics and other optional cookies only load if you accept.{" "}
          <Link className={styles.link} href="/privacy">
            Read our Privacy Policy
          </Link>
          .
        </p>
      </div>
      <div className={styles.actions}>
        <button type="button" className={styles.decline} onClick={decline}>
          Decline
        </button>
        <button type="button" className={styles.accept} onClick={accept}>
          Accept all
        </button>
      </div>
    </div>
  );
}