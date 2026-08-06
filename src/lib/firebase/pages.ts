import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  runTransaction,
  type DocumentData,
  type UpdateData,
} from "firebase/firestore";
import { getFirebaseDb } from "./client";
import {
  createDefaultPage,
  normalizePageDocument,
  type PageDocument,
  type UsernameDoc,
} from "../types";
import { normalizeUsername } from "../validation";

function requireDb() {
  const db = getFirebaseDb();
  if (!db) throw new Error("Firebase is not configured");
  return db;
}

function stripUndefined<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

/** Stable snapshot for equality (ignore updatedAt). */
export function pageContentKey(page: PageDocument): string {
  // Exclude updatedAt so pure timestamp churn does not count as a change
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { updatedAt, ...rest } = page;
  return JSON.stringify(rest);
}

export async function claimUsernameAndCreatePage(
  uid: string,
  username: string,
): Promise<PageDocument> {
  const db = requireDb();
  const uname = normalizeUsername(username);
  const page = createDefaultPage(uid, uname);

  await runTransaction(db, async (tx) => {
    const usernameRef = doc(db, "usernames", uname);
    const existing = await tx.get(usernameRef);
    if (existing.exists()) {
      throw new Error("Username is already taken");
    }

    const usernameDoc: UsernameDoc = {
      uid,
      createdAt: Date.now(),
    };

    tx.set(usernameRef, usernameDoc);
    tx.set(doc(db, "pages", uid), stripUndefined(page));
  });

  return page;
}

export async function getPageByUid(uid: string): Promise<PageDocument | null> {
  const db = requireDb();
  const snap = await getDoc(doc(db, "pages", uid));
  if (!snap.exists()) return null;
  return normalizePageDocument(snap.data() as PageDocument);
}

export async function getPageByUsername(
  username: string,
): Promise<PageDocument | null> {
  const db = requireDb();
  const uname = normalizeUsername(username);
  const usernameSnap = await getDoc(doc(db, "usernames", uname));
  if (!usernameSnap.exists()) return null;
  const { uid } = usernameSnap.data() as UsernameDoc;
  return getPageByUid(uid);
}

/** Fallback query if needed */
export async function findPageByUsernameField(
  username: string,
): Promise<PageDocument | null> {
  const db = requireDb();
  const q = query(
    collection(db, "pages"),
    where("username", "==", normalizeUsername(username)),
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return snap.docs[0]!.data() as PageDocument;
}

/**
 * Build a minimal Firestore update so large base64 fields are only
 * re-uploaded when they actually change (prevents write bandwidth blowups).
 */
export function buildPageUpdate(
  previous: PageDocument | null,
  next: PageDocument,
): UpdateData<DocumentData> {
  const n = stripUndefined(next) as PageDocument;
  const updates: UpdateData<DocumentData> = {
    updatedAt: Date.now(),
    uid: n.uid,
    username: n.username,
    is18Plus: Boolean(n.is18Plus),
    theme: n.theme,
    shareEnabled: n.shareEnabled ?? [],
    share: n.share ?? {},
    groups: n.groups ?? [],
    "buttonStyle.borderRadius": n.buttonStyle.borderRadius,
    "buttonStyle.opacity": n.buttonStyle.opacity,
    "buttonStyle.blur": n.buttonStyle.blur,
    "buttonStyle.backgroundColor": n.buttonStyle.backgroundColor ?? "#ffffff",
    "buttonStyle.textColor": n.buttonStyle.textColor ?? "#111111",
    "profile.displayName": n.profile.displayName,
    "profile.description": n.profile.description,
    "profile.descriptionFont": n.profile.descriptionFont,
    "profile.descriptionColor": n.profile.descriptionColor,
    "profile.nameBackground.enabled": Boolean(
      n.profile.nameBackground?.enabled,
    ),
    "profile.nameBackground.color":
      n.profile.nameBackground?.color ?? "#ffffff",
    "profile.descriptionBackground.enabled": Boolean(
      n.profile.descriptionBackground?.enabled,
    ),
    "profile.descriptionBackground.color":
      n.profile.descriptionBackground?.color ?? "#ffffff",
    "groupTitleStyle.background.enabled": Boolean(
      n.groupTitleStyle?.background?.enabled,
    ),
    "groupTitleStyle.background.color":
      n.groupTitleStyle?.background?.color ?? "#ffffff",
    "background.type": n.background.type,
    "background.color": n.background.color,
    "background.blur": n.background.blur,
    "background.zoom":
      typeof n.background.zoom === "number" ? n.background.zoom : 100,
  };

  const prevAvatar = previous?.profile.avatarDataUrl ?? null;
  const nextAvatar = n.profile.avatarDataUrl ?? null;
  if (prevAvatar !== nextAvatar) {
    updates["profile.avatarDataUrl"] = nextAvatar;
  }

  const prevBg = previous?.background.imageDataUrl ?? null;
  const nextBg = n.background.imageDataUrl ?? null;
  if (prevBg !== nextBg) {
    updates["background.imageDataUrl"] = nextBg;
  }

  return updates;
}

/**
 * Save page. Prefer delta updates so avatar/background base64
 * are not rewritten on every slider tick.
 */
export async function savePage(
  page: PageDocument,
  previous: PageDocument | null = null,
): Promise<void> {
  const db = requireDb();
  const ref = doc(db, "pages", page.uid);

  if (!previous) {
    // First write / unknown previous: full set (still needed for brand-new docs)
    await setDoc(
      ref,
      stripUndefined({
        ...page,
        updatedAt: Date.now(),
      }),
      { merge: true },
    );
    return;
  }

  // Skip network entirely if content identical
  if (pageContentKey(previous) === pageContentKey(page)) {
    return;
  }

  const updates = buildPageUpdate(previous, page);
  await updateDoc(ref, updates);
}

export async function patchPage(
  uid: string,
  partial: Partial<PageDocument>,
): Promise<void> {
  const db = requireDb();
  await updateDoc(doc(db, "pages", uid), {
    ...stripUndefined(partial),
    updatedAt: Date.now(),
  });
}

export async function userHasPage(uid: string): Promise<boolean> {
  const page = await getPageByUid(uid);
  return page !== null;
}
