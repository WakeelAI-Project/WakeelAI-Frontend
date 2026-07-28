import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { decodeToken, isTokenExpired } from "../utils/jwt";
import { login as apiLogin, logoutApi, normalizeAuthResponse } from "../services/auth-service";
import { setAuthToken } from "../../../lib/api";

const initialStoreState = {
  token: null,
  refreshToken: null,
  currentUser: null,
  isAuthenticated: false,
};

export const useAuthStore = create(
  persist(
    (set, get) => ({
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
       * Reads the persisted token from localStorage (via Zustand persist middleware).
       * If the token exists and is not expired, re-syncs the Axios interceptor so
       * authenticated requests work immediately after a hard reload.
       * If the token is missing or expired, clears auth state to force re-login.
       */
      bootstrapAuth: () => {
        const { token } = get();

        if (token && !isTokenExpired(token)) {
          // Token is valid — re-arm the Axios interceptor
          setAuthToken(token);
        } else if (token) {
          // Token exists but has expired — clear everything
          get().clearAuth();
        }
        // No token → no-op, stays unauthenticated
      },
    }),
    {
      name: "wakeel-auth",                       // localStorage key
      storage: createJSONStorage(() => localStorage),
      // Only persist the raw token values — derive everything else on hydration
      partialize: (state) => ({
        token: state.token,
        refreshToken: state.refreshToken,
        currentUser: state.currentUser,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
