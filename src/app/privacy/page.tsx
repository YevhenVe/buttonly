import type { Metadata } from "next";
import Link from "next/link";
import {
  MarketingShell,
  marketingStyles as styles,
} from "@/components/marketing/MarketingShell";
import privacyStyles from "./privacy.module.css";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Buttonly handles your data, cookies, and your choices about them.",
};

export default function PrivacyPolicyPage() {
  return (
    <MarketingShell>
      <div className={`${styles.panel} ${styles.panelWide} ${privacyStyles.wrap}`}>
        <h1>Privacy Policy</h1>
        <p className={styles.panelLead}>
          Last updated: August 18, 2026. This page explains what data Buttonly
          collects, how it is used, and the choices you have.
        </p>

        <div className={privacyStyles.prose}>
          <h2>Data you provide</h2>
          <p>
            When you create an account we store the email you signed up with
            and either a password (secured by Firebase Authentication) or your
            Google sign-in.
          </p>
          <p>
            Your public page content — username, display name, description,
            avatar and background images, buttons, and share settings — is
            stored in Firestore and publicly accessible at your personal link
            page (<code>/[username]</code>).
          </p>

          <h2>Data collected automatically</h2>
          <p>
            We do not run analytics or advertising trackers today. Like most
            hosting setups, our servers may record basic request information
            (such as IP address, user agent, and requested URL) in access logs
            to keep the service secure and operational.
          </p>

          <h2>Cookies and local storage</h2>
          <p>
            We use the following cookies. Both are essential for the service to
            work and are set with <code>SameSite=Lax</code> for up to one year.
          </p>
          <ul>
            <li>
              <strong>Buttonly_age_confirmed_18</strong> — remembers that you
              confirmed you are 18 or older, so the adult-content warning is
              not shown again on this device.
            </li>
            <li>
              <strong>Buttonly_cookie_consent</strong> — remembers whether you
              accepted or declined optional cookies from the consent banner.
            </li>
          </ul>
          <p>
            Your cookie choice is also mirrored in your browser&apos;s local
            storage as a fallback. We do not use advertising or third-party
            tracking cookies. Any future analytics will only load after you
            click <em>Accept all</em>.
          </p>

          <h2>Your choices</h2>
          <ul>
            <li>
              <strong>Cookie banner:</strong> choose <em>Accept all</em> or{" "}
              <em>Decline</em> — we will not ask you again for one year.
            </li>
            <li>
              <strong>Clear site data:</strong> you can delete cookies and
              local storage for this site at any time in your browser settings;
              the banner will then appear again on the next visit.
            </li>
            <li>
              <strong>Delete your account:</strong> contact us (see below) and
              we will remove your account, username, and public page data.
            </li>
          </ul>

          <h2>Age-restricted pages</h2>
          <p>
            Pages marked 18+ require confirmation before viewing. That
            confirmation is stored with the essential cookie described above so
            the warning appears only once per device.
          </p>

          <h2>Changes to this policy</h2>
          <p>
            We may update this policy from time to time. Any changes will be
            posted on this page with a new &ldquo;last updated&rdquo; date.
          </p>

          <h2>Contact</h2>
          <p>
            If you have questions about your data or want to request deletion,
            reach out through the contact channels available on the Buttonly
            website.
          </p>
        </div>

        <Link className={`${styles.btn} ${styles.btnPrimary}`} href="/">
          Back to home
        </Link>
      </div>
    </MarketingShell>
  );
}