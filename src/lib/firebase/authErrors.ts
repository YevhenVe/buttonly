function errorCode(err: unknown): string {
  if (err && typeof err === "object" && "code" in err) {
    return String((err as { code?: string }).code);
  }
  return "";
}

/** Map Firebase Auth / Firestore error codes to short user-facing messages. */
export function authErrorMessage(err: unknown): string {
  const code = errorCode(err);
  const raw =
    err instanceof Error ? err.message : "Something went wrong. Try again.";

  // Firestore permission errors (common when rules not published)
  if (
    code === "permission-denied" ||
    /missing or insufficient permissions/i.test(raw)
  ) {
    return "Firestore blocked this write. Open Firebase Console → Firestore → Rules, paste the contents of firestore.rules from this project, click Publish, then try again.";
  }

  switch (code) {
    case "auth/email-already-in-use":
      return "This email is already registered. Try logging in.";
    case "auth/invalid-email":
      return "Enter a valid email address.";
    case "auth/weak-password":
      return "Password must be at least 6 characters.";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Incorrect email or password.";
    case "auth/too-many-requests":
      return "Too many attempts. Wait a moment and try again.";
    case "auth/popup-closed-by-user":
      return "Google sign-in was cancelled.";
    case "auth/popup-blocked":
      return "Pop-up blocked. Allow pop-ups for this site and try again.";
    case "auth/operation-not-allowed":
      return "This sign-in method is disabled in Firebase Console. Enable Email/Password and/or Google under Authentication → Sign-in method.";
    case "auth/unauthorized-domain":
      return "This domain is not authorized. Add it under Authentication → Settings → Authorized domains (e.g. localhost).";
    case "auth/network-request-failed":
      return "Network error. Check your connection.";
    case "auth/account-exists-with-different-credential":
      return "An account already exists with this email using a different sign-in method.";
    default:
      // Prefer our app-thrown messages (username taken, etc.)
      if (raw && !raw.startsWith("Firebase:")) return raw;
      return raw.replace(/^Firebase:\s*/i, "").replace(/\s*\(.*\)\s*$/, "") ||
        "Authentication failed.";
  }
}
