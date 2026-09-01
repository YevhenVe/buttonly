"use client";

import { useState } from "react";
import type { User } from "firebase/auth";
import { refreshVerification, resendVerification } from "@/lib/firebase/auth";
import { authErrorMessage } from "@/lib/firebase/authErrors";
import styles from "@/app/auth.module.css";

interface Props {
  user: User;
  onVerified: () => void;
}

/** Holding step between sign-up and claiming a handle. */
export function VerifyEmailNotice({ user, onVerified }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    setError(null);
    try {
      await fn();
    } catch (err: unknown) {
      setError(authErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const onCheck = () =>
    run(async () => {
      if (await refreshVerification(user)) {
        onVerified();
      } else {
        setError("Not confirmed yet. Open the link in your inbox, then retry.");
      }
    });

  const onResend = () =>
    run(async () => {
      await resendVerification(user);
      setSent(true);
    });

  return (
    <div className={styles.card}>
      <h1>Confirm your email</h1>
      <p>
        We sent a link to <strong>{user.email}</strong>. Open it, then continue
        here to pick your username.
      </p>

      {error ? <p className={styles.error}>{error}</p> : null}

      <button className={styles.btn} disabled={busy} onClick={() => void onCheck()}>
        {busy ? "Checking…" : "I've confirmed it"}
      </button>

      <button
        type="button"
        className={`${styles.btn} ${styles.btnGoogle}`}
        disabled={busy || sent}
        onClick={() => void onResend()}
      >
        {sent ? "Link sent" : "Resend link"}
      </button>
    </div>
  );
}
