/**
 * Cookie-consent helpers for the consent banner.
 *
 * Best-practice model: the banner shows once; the visitor either accepts
 * ("Accept all") or declines ("Decline"). The decision is stored for one year
 * in a `Buttonly_cookie_consent` cookie (`SameSite=Lax`, `Secure` on HTTPS),
 * mirrored to localStorage as a fallback for browsers that block cookies.
 *
 * The app only sets essential cookies today; `hasConsent()` is the gate that
 * any FUTURE analytics / optional scripts must check before loading.
 */

export const CONSENT_KEY = "Buttonly_cookie_consent";
export const CONSENT_ACCEPTED = "accepted";
export const CONSENT_DECLINED = "declined";

export type ConsentDecision = typeof CONSENT_ACCEPTED | typeof CONSENT_DECLINED;

/** 1 year, in seconds. */
export const CONSENT_MAX_AGE = 31536000;

function readCookieValue(): ConsentDecision | null {
  try {
    const pair = document.cookie
      .split("; ")
      .find((part) => part.startsWith(`${CONSENT_KEY}=`));
    if (!pair) return null;
    const value = pair.slice(CONSENT_KEY.length + 1);
    return value === CONSENT_ACCEPTED || value === CONSENT_DECLINED
      ? value
      : null;
  } catch {
    return null;
  }
}

function readLocalValue(): ConsentDecision | null {
  try {
    const value = window.localStorage.getItem(CONSENT_KEY);
    return value === CONSENT_ACCEPTED || value === CONSENT_DECLINED
      ? value
      : null;
  } catch {
    return null;
  }
}

function readConsent(): ConsentDecision | null {
  return readCookieValue() ?? readLocalValue();
}

/** True once the visitor made a decision (accept OR decline). */
export function hasConsentDecision(): boolean {
  return readConsent() !== null;
}

/** True for consent to non-essential cookies/analytics. */
export function hasConsent(): boolean {
  return readConsent() === CONSENT_ACCEPTED;
}

/** Persist the visitor's decision in a long-lived cookie + localStorage. */
export function setConsent(decision: ConsentDecision): void {
  try {
    window.localStorage.setItem(CONSENT_KEY, decision);
  } catch {
    /* storage blocked — cookie fallback below */
  }
  try {
    const secure = window.location.protocol === "https:" ? "; Secure" : "";
    document.cookie = `${CONSENT_KEY}=${decision}; path=/; samesite=lax; max-age=${CONSENT_MAX_AGE}${secure}`;
  } catch {
    /* cookies blocked — localStorage mirror still remembers */
  }
}