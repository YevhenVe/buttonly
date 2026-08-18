/**
 * Shared 18+ age-gate confirmation helpers.
 *
 * The confirmation is stored in BOTH:
 *  - localStorage (used by the client component for instant, cross-page state)
 *  - a cookie with the same name (read server-side so the `/[username]`
 *    route can skip rendering the age gate entirely on repeat visits — this
 *    is what removes the "gate flashes for a split second" problem).
 */

export const AGE_CONFIRM_KEY = "Buttonly_age_confirmed_18";
export const AGE_CONFIRM_VALUE = "1";
/** 1 year, in seconds. */
export const AGE_COOKIE_MAX_AGE = 31536000;

function cookieHasValue(): boolean {
  return document.cookie
    .split("; ")
    .some((part) => part === `${AGE_CONFIRM_KEY}=${AGE_CONFIRM_VALUE}`);
}

/** True when this browser already confirmed 18+ (localStorage or cookie). */
export function readAgeConfirmed(): boolean {
  try {
    return (
      window.localStorage.getItem(AGE_CONFIRM_KEY) === AGE_CONFIRM_VALUE ||
      cookieHasValue()
    );
  } catch {
    return false;
  }
}

/** Persist the confirmation in localStorage and a long-lived cookie. */
export function writeAgeConfirmed(): void {
  try {
    window.localStorage.setItem(AGE_CONFIRM_KEY, AGE_CONFIRM_VALUE);
  } catch {
    /* private mode / blocked storage — cookie below is the fallback */
  }
  try {
    const secure = window.location.protocol === "https:" ? "; Secure" : "";
    document.cookie = `${AGE_CONFIRM_KEY}=${AGE_CONFIRM_VALUE}; path=/; samesite=lax; max-age=${AGE_COOKIE_MAX_AGE}${secure}`;
  } catch {
    /* cookies blocked — localStorage still remembers the confirmation */
  }
}

/**
 * Inline boot script injected by the root layout before React hydrates.
 *
 * It deliberately does NOT touch the DOM — mutating <html>/<body> here would
 * produce React hydration mismatches (the server-rendered HTML never contains
 * such markup). Its only job is to keep the confirmation backed up in both
 * storages: if the long-lived cookie was purged but localStorage still
 * remembers (or vice versa) it restores the missing one, so the NEXT request
 * goes through the server-side cookie path and the age gate never flashes.
 */
export const ageGateBootScript = `(function () {
  try {
    var KEY = ${JSON.stringify(AGE_CONFIRM_KEY)},
        VAL = ${JSON.stringify(AGE_CONFIRM_VALUE)};
    var local = localStorage.getItem(KEY) === VAL;
    var parts = (" " + document.cookie).split(" " + KEY + "=");
    var cookie = parts.length >= 2 && parts[1].split(";")[0] === VAL;
    if (local && !cookie) {
      document.cookie =
        KEY + "=" + VAL + "; path=/; samesite=lax; max-age=${AGE_COOKIE_MAX_AGE}" +
        (location.protocol === "https:" ? "; Secure" : "");
    } else if (cookie && !local) {
      localStorage.setItem(KEY, VAL);
    }
  } catch (e) {}
})();`;