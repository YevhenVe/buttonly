import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  type User,
} from "firebase/auth";
import { getFirebaseAuth } from "./client";
import { claimUsernameAndCreatePage } from "./pages";
import { normalizeUsername, usernameError } from "../validation";

function requireAuth() {
  const auth = getFirebaseAuth();
  if (!auth) throw new Error("Firebase is not configured");
  return auth;
}

export async function signUpWithEmail(
  email: string,
  password: string,
  username: string,
): Promise<User> {
  const err = usernameError(username);
  if (err) throw new Error(err);

  const auth = requireAuth();
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  try {
    await claimUsernameAndCreatePage(cred.user.uid, normalizeUsername(username));
  } catch (e) {
    // Roll back auth user if username claim fails
    try {
      await cred.user.delete();
    } catch {
      /* ignore */
    }
    throw e;
  }
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

export async function signInWithGoogle(username?: string): Promise<User> {
  const auth = requireAuth();
  const provider = new GoogleAuthProvider();
  const cred = await signInWithPopup(auth, provider);

  // New Google users need a username to create their page.
  if (username) {
    const { userHasPage } = await import("./pages");
    const hasPage = await userHasPage(cred.user.uid);
    if (!hasPage) {
      const err = usernameError(username);
      if (err) throw new Error(err);
      await claimUsernameAndCreatePage(
        cred.user.uid,
        normalizeUsername(username),
      );
    }
  }

  return cred.user;
}

export async function logOut(): Promise<void> {
  const auth = requireAuth();
  await signOut(auth);
}
