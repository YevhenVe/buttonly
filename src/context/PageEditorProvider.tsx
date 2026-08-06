"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  getPageByUid,
  pageContentKey,
  savePage,
} from "@/lib/firebase/pages";
import type { PageDocument } from "@/lib/types";
import { useAuth } from "./AuthProvider";

type SaveStatus = "idle" | "saving" | "saved" | "error";

interface PageEditorContextValue {
  page: PageDocument | null;
  loading: boolean;
  /** True when local draft differs from last successful save. */
  isDirty: boolean;
  saveStatus: SaveStatus;
  saveError: string | null;
  setPage: (updater: (prev: PageDocument) => PageDocument) => void;
  replacePage: (page: PageDocument) => void;
  /** Persist current draft to Firestore (only on explicit Save). */
  saveNow: () => Promise<void>;
}

const PageEditorContext = createContext<PageEditorContextValue | null>(null);

function isResourceExhausted(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const code = "code" in err ? String((err as { code?: string }).code) : "";
  const msg = err instanceof Error ? err.message : String(err);
  return (
    code === "resource-exhausted" ||
    /resource-exhausted|maximum bandwidth for writes/i.test(msg)
  );
}

export function PageEditorProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [page, setPageState] = useState<PageDocument | null>(null);
  const [loading, setLoading] = useState(Boolean(user));
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  const latestRef = useRef<PageDocument | null>(null);
  const lastSavedRef = useRef<PageDocument | null>(null);
  const lastSavedKeyRef = useRef<string>("");
  const writingRef = useRef(false);
  const userId = user?.uid ?? null;

  useEffect(() => {
    if (!userId) {
      latestRef.current = null;
      lastSavedRef.current = null;
      lastSavedKeyRef.current = "";
      queueMicrotask(() => {
        setPageState(null);
        setLoading(false);
        setIsDirty(false);
        setSaveStatus("idle");
      });
      return;
    }

    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) setLoading(true);
    });

    getPageByUid(userId)
      .then((doc) => {
        if (cancelled) return;
        setPageState(doc);
        latestRef.current = doc;
        lastSavedRef.current = doc;
        lastSavedKeyRef.current = doc ? pageContentKey(doc) : "";
        setIsDirty(false);
        setSaveStatus("idle");
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        setSaveError(e instanceof Error ? e.message : "Failed to load page");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [userId]);

  const setPage = useCallback(
    (updater: (prev: PageDocument) => PageDocument) => {
      setPageState((prev) => {
        if (!prev) return prev;
        const next = updater(prev);
        if (pageContentKey(prev) === pageContentKey(next)) {
          return prev;
        }
        latestRef.current = next;
        const dirty = pageContentKey(next) !== lastSavedKeyRef.current;
        setIsDirty(dirty);
        if (dirty) {
          // Leaving "saved" state when user edits again
          setSaveStatus((s) => (s === "saved" ? "idle" : s));
        }
        return next;
      });
    },
    [],
  );

  const replacePage = useCallback((doc: PageDocument) => {
    setPageState(doc);
    latestRef.current = doc;
    const dirty = pageContentKey(doc) !== lastSavedKeyRef.current;
    setIsDirty(dirty);
    if (dirty) {
      setSaveStatus((s) => (s === "saved" ? "idle" : s));
    }
  }, []);

  const saveNow = useCallback(async () => {
    const doc = latestRef.current;
    if (!doc || writingRef.current) return;

    const key = pageContentKey(doc);
    if (key === lastSavedKeyRef.current) {
      setIsDirty(false);
      setSaveStatus("saved");
      return;
    }

    writingRef.current = true;
    setSaveStatus("saving");
    setSaveError(null);

    let attempt = 0;
    const maxAttempts = 4;

    while (attempt < maxAttempts) {
      try {
        const toSave = latestRef.current;
        if (!toSave) break;

        await savePage(toSave, lastSavedRef.current);
        lastSavedRef.current = toSave;
        lastSavedKeyRef.current = pageContentKey(toSave);
        setIsDirty(false);
        setSaveStatus("saved");
        break;
      } catch (e: unknown) {
        if (isResourceExhausted(e) && attempt < maxAttempts - 1) {
          attempt += 1;
          const wait = Math.min(30_000, 1000 * 2 ** attempt);
          setSaveError(
            `Firestore write limit hit, retrying in ${Math.round(wait / 1000)}s…`,
          );
          await new Promise((r) => setTimeout(r, wait));
          continue;
        }
        const msg = e instanceof Error ? e.message : "Failed to save";
        setSaveError(
          isResourceExhausted(e)
            ? "Firestore write bandwidth exceeded. Wait a minute, then try Save again."
            : msg,
        );
        setSaveStatus("error");
        break;
      }
    }

    writingRef.current = false;
  }, []);

  const value = useMemo(
    () => ({
      page,
      loading: userId ? loading : false,
      isDirty,
      saveStatus,
      saveError,
      setPage,
      replacePage,
      saveNow,
    }),
    [
      page,
      loading,
      userId,
      isDirty,
      saveStatus,
      saveError,
      setPage,
      replacePage,
      saveNow,
    ],
  );

  return (
    <PageEditorContext.Provider value={value}>
      {children}
    </PageEditorContext.Provider>
  );
}

export function usePageEditor() {
  const ctx = useContext(PageEditorContext);
  if (!ctx) {
    throw new Error("usePageEditor must be used within PageEditorProvider");
  }
  return ctx;
}
