import { create } from "zustand";
import { decodeToken, isTokenExpired } from "../utils/jwt";
import { login as apiLogin, logoutApi, normalizeAuthResponse, refreshAccessToken } from "../services/auth-service";
import { setAuthToken } from "../../../lib/api";
import {
  getAccessTokenCookie,
  getRefreshTokenCookie,
  getUserCookie,
  removeAllAuthCookies,
  setAccessTokenCookie,
  setRefreshTokenCookie,
  setUserCookie,
} from "../../../lib/cookies";

/**
 * Lazily-resolved reference to the assistant store's resetStore action.
 * The assistant store registers itself here after initialization, breaking
 * the circular module dependency that would occur with a static import.
 */
let _resetAssistantStore = null;
export const registerAssistantStoreReset = (fn) => { _resetAssistantStore = fn; };
const resetAssistantStore = () => { if (_resetAssistantStore) _resetAssistantStore(); };

// Bug 3c fix: the backend refresh token is an opaque random string, not a JWT.
// Attempting to JWT-decode it always throws and logs a console.error.
// Use a fixed 30-day TTL instead.
const REFRESH_TOKEN_DEFAULT_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days

// ---------------------------------------------------------------------------
// Auth state is held in Zustand (live React tree) AND persisted in cookies
// so it survives hard reloads.
//
// ⚠️  SECURITY NOTE: Cookies are JS-readable (not httpOnly). This is the
// accepted tradeoff for a pure-frontend SPA — same exposure as localStorage,
// but with cross-reload persistence and explicit logout clearing. See cookies.js.
// ---------------------------------------------------------------------------

const initialStoreState = {
  token: null,
  refreshToken: null,
  currentUser: null,
  isAuthenticated: false,
  mustChangePassword: false,
};

export const useAuthStore = create((set, get) => ({
  ...initialStoreState,

  /**
   * Stores the access token (and optionally the refresh token) in the store,
   * syncs the Axios interceptor, and persists both to cookies.
   *
   * @param {string} token - JWT access token
   * @param {string|null} [refreshToken] - Refresh token (optional)
   * @param {number|null} [expiresIn] - Access token TTL in seconds (from auth response)
   * @param {boolean} [mustChangePassword] - Whether password change is required.
   *   Omit (undefined) to PRESERVE the current value — a silent token refresh
   *   must never clear a pending password change.
   */
  setToken: (token, refreshToken, expiresIn, mustChangePassword) => {
    if (!token) {
      get().clearAuth();
      return;
    }

    const decoded = decodeToken(token);
    const nextMustChangePassword =
      mustChangePassword ?? get().mustChangePassword ?? false;

    // Sync the access token with the Axios request interceptor
    setAuthToken(token);

    // Persist to cookies — align expiry with token lifetime where known
    setAccessTokenCookie(token, expiresIn ?? null);
    setUserCookie({ ...decoded, mustChangePassword: nextMustChangePassword }, expiresIn ?? null);

    const newRefreshToken = refreshToken ?? get().refreshToken;
    if (newRefreshToken) {
      // Refresh token is opaque (not a JWT) — use a fixed 30-day TTL
      setRefreshTokenCookie(newRefreshToken, REFRESH_TOKEN_DEFAULT_TTL_SECONDS);
    }

    set({
      token,
      refreshToken: newRefreshToken,
      currentUser: decoded,
      isAuthenticated: true,
      mustChangePassword: nextMustChangePassword,
    });
  },

  /**
   * Stores only the refresh token without touching the access token or user state.
   * Used by the Axios auto-refresh interceptor after a silent token exchange.
   * Also persists the new refresh token to the cookie.
   *
   * @param {string|null} refreshToken
   */
  setRefreshToken: (refreshToken) => {
    if (refreshToken) {
      // Refresh token is opaque (not a JWT) — use a fixed 30-day TTL
      setRefreshTokenCookie(refreshToken, REFRESH_TOKEN_DEFAULT_TTL_SECONDS);
    }
    set({ refreshToken });
  },

  /**
   * Fetches and normalizes an auth response WITHOUT committing it to the store,
   * cookies, or the Axios interceptor. No session exists until commitSession()
   * is called with the result.
   *
   * This exists so callers can inspect the token's role claim *before* the app
   * considers the user signed in — an Employee (mobile-only) must never end up
   * with a web session, not even for a single render.
   *
   * @param {string} email
   * @param {string} password
   * @returns {Promise<object>} Normalized auth response with { password } attached
   */
  loginWithoutCommit: async (email, password) => {
    const raw = await apiLogin(email, password);
    const normalized = normalizeAuthResponse(raw);

    if (!normalized.token) {
      throw new Error("Invalid response format: missing access_token");
    }

    return { ...normalized, password };
  },

  /**
   * Commits a normalized auth response (from loginWithoutCommit) into the store,
   * cookies, and the Axios interceptor.
   *
   * @param {object} normalized - Result of loginWithoutCommit / normalizeAuthResponse
   */
  commitSession: (normalized) => {
    if (!normalized?.token) {
      get().clearAuth();
      return;
    }

    get().setToken(
      normalized.token,
      normalized.refreshToken,
      normalized.expiresIn,
      normalized.mustChangePassword,
    );
  },

  /**
   * Performs a login via credentials. Normalizes the backend response and
   * stores both the access token and refresh token (in memory + cookies).
   * Returns the normalized response including mustChangePassword flag.
   *
   * @param {string} email
   * @param {string} password
   * @returns {Promise<object>} Normalized auth response with { mustChangePassword, password } for navigation
   */
  login: async (email, password) => {
    try {
      const raw = await apiLogin(email, password);
      const normalized = normalizeAuthResponse(raw);

      if (!normalized.token) {
        throw new Error("Invalid response format: missing access_token");
      }

      // Pass expiresIn and mustChangePassword so they are stored in the auth state
      get().setToken(
        normalized.token, 
        normalized.refreshToken, 
        normalized.expiresIn,
        normalized.mustChangePassword
      );
      
      // Return the normalized response with the password for navigation state (TASK 2)
      return { ...normalized, password };
    } catch (error) {
      get().clearAuth();
      throw error;
    }
  },

  /**
   * Logs the user out.
   * Calls POST /Auth/logout on the backend with the refresh token (fire-and-forget,
   * errors swallowed), then always clears local auth state and cookies.
   */
  logout: async () => {
    const { refreshToken } = get();
    try {
      await logoutApi(refreshToken);
    } finally {
      get().clearAuth();
    }
  },

  /**
   * Sets the mustChangePassword flag on the store and mirrors it into the user
   * cookie so it survives a hard reload.
   *
   * Used by the Axios 403 `password_change_required` handler: flipping this flag
   * lets ProtectedRoute perform a client-side redirect to /change-password,
   * instead of a full page reload that would destroy router state.
   *
   * @param {boolean} value
   */
  setMustChangePassword: (value) => {
    const user = get().currentUser;
    if (user) {
      setUserCookie({ ...user, mustChangePassword: value }, null);
    }
    set({ mustChangePassword: value });
  },

  /**
   * Clears the mustChangePassword flag from the store and user cookie.
   * Should be called after successful password change.
   */
  clearMustChangePassword: () => {
    const user = get().currentUser;
    if (user) {
      setUserCookie({ ...user, mustChangePassword: false }, null);
    }
    set({ mustChangePassword: false });
  },

  /**
   * Resets all auth state to initial values, clears the Axios token,
   * and removes all auth cookies.
   */
  clearAuth: () => {
    setAuthToken(null);
    removeAllAuthCookies();
    set(initialStoreState);
    // Reset assistant store to prevent cross-user conversation leakage
    resetAssistantStore();
  },

  /**
   * Called once on application bootstrap.
   *
   * Reads persisted auth cookies on page load:
   *  1. If a valid (non-expired) access token cookie exists → restore state + re-arm Axios.
   *  2. If the access token is expired but a refresh token cookie exists → attempt a silent
   *     refresh before falling back to logged-out state.
   *  3. No usable cookie → no-op, user must log in.
   */
  bootstrapAuth: async () => {
    const cookieToken = getAccessTokenCookie();
    const cookieRefreshToken = getRefreshTokenCookie();
    const cookieUser = getUserCookie();

    // Case 1: valid access token in cookie
    if (cookieToken && !isTokenExpired(cookieToken)) {
      const decoded = cookieUser ?? decodeToken(cookieToken);
      setAuthToken(cookieToken);
      set({
        token: cookieToken,
        refreshToken: cookieRefreshToken ?? null,
        currentUser: decoded,
        isAuthenticated: true,
        mustChangePassword: cookieUser?.mustChangePassword ?? false,
      });
      return;
    }

    // Case 2: expired access token but refresh token available → silent refresh
    if (cookieRefreshToken) {
      try {
        const raw = await refreshAccessToken(cookieRefreshToken);
        const normalized = normalizeAuthResponse(raw);

        if (normalized.token) {
          // The refresh response only sometimes carries must_change_password.
          // When it does not, preserve what we already know (store, then cookie)
          // — defaulting to false here silently drops a pending password change
          // and the user lands on a dashboard that 403s on its first request.
          const rawFlag = raw?.must_change_password;
          const mustChangePassword =
            typeof rawFlag === "boolean"
              ? rawFlag
              : (get().mustChangePassword || cookieUser?.mustChangePassword || false);

          get().setToken(
            normalized.token,
            normalized.refreshToken ?? cookieRefreshToken,
            normalized.expiresIn,
            mustChangePassword,
          );
          return;
        }
      } catch {
        // Silent refresh failed — fall through to logged-out state
      }
    }

    // Case 3: no valid token — clear stale cookies and stay unauthenticated
    get().clearAuth();
  },
}));
