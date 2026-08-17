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
   * @param {boolean} [mustChangePassword] - Whether password change is required (optional)
   */
  setToken: (token, refreshToken, expiresIn, mustChangePassword) => {
    if (!token) {
      get().clearAuth();
      return;
    }

    const decoded = decodeToken(token);

    // Sync the access token with the Axios request interceptor
    setAuthToken(token);

    // Persist to cookies — align expiry with token lifetime where known
    setAccessTokenCookie(token, expiresIn ?? null);
    setUserCookie({ ...decoded, mustChangePassword: mustChangePassword ?? false }, expiresIn ?? null);

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
      mustChangePassword: mustChangePassword ?? false,
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
          get().setToken(normalized.token, normalized.refreshToken ?? cookieRefreshToken, normalized.expiresIn);
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
