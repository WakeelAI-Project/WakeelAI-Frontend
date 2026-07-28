
import { create } from "zustand";
import { decodeToken } from "../utils/jwt";
import { login as apiLogin, logoutApi, normalizeAuthResponse } from "../services/auth-service";
import { setAuthToken } from "../../../lib/api";

const initialStoreState = {
  token: null,
  refreshToken: null,
  currentUser: null,
  isAuthenticated: false,
};

export const useAuthStore = create((set, get) => ({
  ...initialStoreState,

  /**
   * Stores the access token (and optionally the refresh token) in the store.
   * Also decodes the JWT to populate currentUser and syncs the Axios interceptor.
   *
   * @param {string} token - JWT access token
   * @param {string|null} [refreshToken] - Refresh token (optional, backward-compatible)
   */
  setToken: (token, refreshToken) => {
    if (!token) {
      get().clearAuth();
      return;
    }

    const decoded = decodeToken(token);
    // Sync the access token with the Axios request interceptor
    setAuthToken(token);
    set({
      token,
      refreshToken: refreshToken ?? get().refreshToken,
      currentUser: decoded,
      isAuthenticated: true,
    });
  },

  /**
   * Stores only the refresh token without touching the access token or user state.
   * Used by the Axios auto-refresh interceptor after a silent token exchange.
   *
   * @param {string|null} refreshToken
   */
  setRefreshToken: (refreshToken) => {
    set({ refreshToken });
  },

  /**
   * Performs a login via credentials. Normalizes the backend response and
   * stores both the access token and refresh token.
   *
   * @param {string} email
   * @param {string} password
   * @returns {Promise<object>} Normalized auth response
   */
  login: async (email, password) => {
    try {
      const raw = await apiLogin(email, password);
      const normalized = normalizeAuthResponse(raw);

      if (!normalized.token) {
        throw new Error("Invalid response format: missing access_token");
      }

      get().setToken(normalized.token, normalized.refreshToken);
      return normalized;
    } catch (error) {
      get().clearAuth();
      throw error;
    }
  },

  /**
   * Logs the user out.
   * Calls POST /auth/logout on the backend (fire-and-forget, errors swallowed),
   * then always clears local auth state.
   */
  logout: async () => {
    try {
      await logoutApi();
    } finally {
      get().clearAuth();
    }
  },

  /**
   * Resets all auth state to initial values and clears the Axios token.
   */
  clearAuth: () => {
    setAuthToken(null);
    set(initialStoreState);
  },

  /**
   * Called once on application bootstrap.
   * Because this app uses in-memory auth only (no localStorage), a hard page
   * refresh always starts unauthenticated. This action exists to re-sync the
   * Axios interceptor if the store is ever seeded by server-side means in the
   * future, and as a central hook for any bootstrap logic.
   */
  bootstrapAuth: () => {
    const { token } = get();
    if (token) {
      // Re-sync the Axios interceptor (handles SSR hydration or future persistence)
      setAuthToken(token);
    }
    // No-op on normal in-memory-only hard refresh (token is null)
  },
}));

