import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  sendEmailVerification,
  GoogleAuthProvider,
  signOut,
  type User,
} from "firebase/auth";
import { getFirebaseAuth } from "./client";

function requireAuth() {
  const auth = getFirebaseAuth();
  if (!auth) throw new Error("Firebase is not configured");
  return auth;
}

/**
 * Creates the account and mails a confirmation link. The public handle is
 * claimed separately, once the address is confirmed — Firestore rules
 * reject the claim until then, which is what blocks scripted sign-ups.
 */
export async function signUpWithEmail(
  email: string,
  password: string,
): Promise<User> {
  const auth = requireAuth();
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await sendEmailVerification(cred.user);
  return cred.user;
}

export async function signInWithEmail(
  email: string,
  password: string,
): Promise<User> {
  const auth = requireAuth();
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

export async function signInWithGoogle(): Promise<User> {
  const auth = requireAuth();
  const provider = new GoogleAuthProvider();
  const cred = await signInWithPopup(auth, provider);
  return cred.user;
}

export async function resendVerification(user: User): Promise<void> {
  await sendEmailVerification(user);
}

/**
 * Re-reads the account after the user opens the emailed link. The ID token
 * must be force-refreshed too: `reload()` alone updates `user.emailVerified`
 * but leaves the cached token claiming `email_verified: false`, which is
 * what Firestore rules actually read.
 */
export async function refreshVerification(user: User): Promise<boolean> {
  await user.reload();
  await user.getIdToken(true);
  return user.emailVerified;
}

export async function logOut(): Promise<void> {
  const auth = requireAuth();
  await signOut(auth);
}
