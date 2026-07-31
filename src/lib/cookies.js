import Cookies from "js-cookie";

// ---------------------------------------------------------------------------
// Cookie-based auth persistence
//
// ⚠️  SECURITY NOTE: These cookies are NOT httpOnly — they are readable by JS.
// This is the same exposure as localStorage or in-memory state. Because this is
// a pure frontend SPA with no same-origin backend that could set httpOnly cookies,
// JS-readable cookies are the correct (and only) mechanism to persist auth state
// across page reloads. The tradeoff (XSS exposure vs UX persistence) was explicitly
// accepted. Do NOT add httpOnly here — it has no effect when set from JS.
// ---------------------------------------------------------------------------

const COOKIE_NAMES = {
  ACCESS_TOKEN: "wkl_access_token",
  REFRESH_TOKEN: "wkl_refresh_token",
  USER: "wkl_user",
};

/**
 * Derives secure cookie attributes based on the current environment.
 * - `secure: true` in production (HTTPS), false on localhost
 * - `sameSite: "lax"` — allows same-origin navigation without cookie loss,
 *   blocks cross-site request forgery. "lax" (not "strict") is appropriate
 *   because the app navigates internally without OAuth-style cross-origin redirects.
 *
 * @param {number} [expiresSeconds] - TTL in seconds. Omit for session-only.
 * @returns {import("js-cookie").CookieAttributes}
 */
function cookieAttrs(expiresSeconds) {
  const attrs = {
    sameSite: "lax",
    secure: typeof window !== "undefined" && window.location.protocol === "https:",
  };

  if (typeof expiresSeconds === "number" && expiresSeconds > 0) {
    // js-cookie `expires` accepts a Date or a number of days
    attrs.expires = new Date(Date.now() + expiresSeconds * 1000);
  }

  return attrs;
}

// ---------------------------------------------------------------------------
// Access token cookie
// ---------------------------------------------------------------------------

/**
 * Persists the access token in a cookie.
 *
 * @param {string} token - JWT access token
 * @param {number|null} [expiresIn] - Token TTL in seconds (from `expires_in` on auth response)
 */
export function setAccessTokenCookie(token, expiresIn) {
  Cookies.set(COOKIE_NAMES.ACCESS_TOKEN, token, cookieAttrs(expiresIn ?? undefined));
}

/**
 * Reads the persisted access token.
 *
 * @returns {string|undefined}
 */
export function getAccessTokenCookie() {
  return Cookies.get(COOKIE_NAMES.ACCESS_TOKEN);
}

/**
 * Removes the access token cookie.
 */
export function removeAccessTokenCookie() {
  Cookies.remove(COOKIE_NAMES.ACCESS_TOKEN);
}

// ---------------------------------------------------------------------------
// Refresh token cookie
// ---------------------------------------------------------------------------

/**
 * Persists the refresh token in a cookie.
 * Expiry is derived from the JWT `exp` claim — pass `expiresIn` in seconds.
 *
 * @param {string} token - Refresh token string
 * @param {number|null} [expiresSeconds] - TTL in seconds
 */
export function setRefreshTokenCookie(token, expiresSeconds) {
  Cookies.set(COOKIE_NAMES.REFRESH_TOKEN, token, cookieAttrs(expiresSeconds ?? undefined));
}

/**
 * Reads the persisted refresh token.
 *
 * @returns {string|undefined}
 */
export function getRefreshTokenCookie() {
  return Cookies.get(COOKIE_NAMES.REFRESH_TOKEN);
}

/**
 * Removes the refresh token cookie.
 */
export function removeRefreshTokenCookie() {
  Cookies.remove(COOKIE_NAMES.REFRESH_TOKEN);
}

// ---------------------------------------------------------------------------
// User claims cookie (minimal decoded JWT claims for bootstrapping)
// ---------------------------------------------------------------------------

/**
 * Persists the decoded user claims object as a JSON cookie.
 * Stores only what bootstrapAuth() needs: { role, companyId, sub }.
 *
 * @param {object} userClaims - Decoded JWT payload
 * @param {number|null} [expiresIn] - TTL in seconds (aligned with access token)
 */
export function setUserCookie(userClaims, expiresIn) {
  try {
    Cookies.set(COOKIE_NAMES.USER, JSON.stringify(userClaims), cookieAttrs(expiresIn ?? undefined));
  } catch {
    // JSON.stringify failure (circular ref etc.) — silently skip, bootstrap will re-decode
  }
}

/**
 * Reads and parses the user claims cookie.
 *
 * @returns {object|null}
 */
export function getUserCookie() {
  try {
    const raw = Cookies.get(COOKIE_NAMES.USER);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Removes the user claims cookie.
 */
export function removeUserCookie() {
  Cookies.remove(COOKIE_NAMES.USER);
}

// ---------------------------------------------------------------------------
// Bulk helpers
// ---------------------------------------------------------------------------

/**
 * Removes all three auth cookies at once. Called by clearAuth() and logout().
 */
export function removeAllAuthCookies() {
  removeAccessTokenCookie();
  removeRefreshTokenCookie();
  removeUserCookie();
}
