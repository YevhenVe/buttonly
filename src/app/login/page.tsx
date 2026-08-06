"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signInWithEmail, signInWithGoogle } from "@/lib/firebase/auth";
import { authErrorMessage } from "@/lib/firebase/authErrors";
import { userHasPage } from "@/lib/firebase/pages";
import { useAuth } from "@/context/AuthProvider";
import { FirebaseMissing } from "@/components/ui/FirebaseMissing";
import {
  MarketingShell,
  marketingStyles as shell,
} from "@/components/marketing/MarketingShell";
import styles from "../auth.module.css";

function GoogleGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3C33.7 33 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 8 3l5.7-5.7C34.2 6.1 29.4 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.3-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.7 16 19 12 24 12c3.1 0 5.8 1.2 8 3l5.7-5.7C34.2 6.1 29.4 4 24 4 16.3 4 9.6 8.3 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.2 0 10-2 13.6-5.2l-6.3-5.3C29.2 35.1 26.7 36 24 36c-5.3 0-9.7-3-11.3-7.4l-6.5 5C9.5 39.6 16.2 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.3 4.1-4.1 5.5l.1.1 6.3 5.3C39.2 37.3 44 33 44 24c0-1.2-.1-2.3-.4-3.5z"
      />
    </svg>
  );
}

export default function LoginPage() {
  const { user, loading, configured } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) router.replace("/dashboard");
  }, [user, loading, router]);

  if (!configured) return <FirebaseMissing />;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await signInWithEmail(email, password);
      router.replace("/dashboard");
    } catch (err: unknown) {
      setError(authErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const onGoogle = async () => {
    setBusy(true);
    setError(null);
    try {
      const u = await signInWithGoogle();
      const hasPage = await userHasPage(u.uid);
      if (!hasPage) {
        router.replace("/signup?google=1");
        return;
      }
      router.replace("/dashboard");
    } catch (err: unknown) {
      setError(authErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <MarketingShell active="login">
      <div className={`${shell.panel} ${shell.panelNarrow}`}>
        <form className={styles.card} onSubmit={(e) => void onSubmit(e)}>
          <h1>Log in</h1>
          <p>Email &amp; password or Google, then open your dashboard.</p>

          <div className={styles.field}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              className={styles.input}
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              className={styles.input}
              type="password"
              autoComplete="current-password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error ? <p className={styles.error}>{error}</p> : null}

          <button className={styles.btn} type="submit" disabled={busy}>
            {busy ? "Signing in…" : "Log in"}
          </button>

          <p className={styles.divider}>or</p>

          <button
            type="button"
            className={`${styles.btn} ${styles.btnGoogle}`}
            disabled={busy}
            onClick={() => void onGoogle()}
          >
            <GoogleGlyph />
            Continue with Google
          </button>

          <p className={styles.footer}>
            No account? <Link href="/signup">Sign up</Link>
          </p>
        </form>
      </div>
    </MarketingShell>
  );
}
