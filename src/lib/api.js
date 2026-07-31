
import axios from "axios";
import Cookies from "js-cookie";

// ---------------------------------------------------------------------------
// In-memory auth token
// Stored here (not in the store) to avoid circular imports:
//   auth-store → api (setAuthToken)  ✅
//   api → auth-store                 ❌ would create a cycle
// The store reference is injected lazily via configureAuthStore().
//
// On module init we pre-populate from the cookie so the interceptor has a token
// immediately, before bootstrapAuth() (which is async) finishes its work.
// This prevents unauthenticated requests during the startup window.
// ---------------------------------------------------------------------------
let authToken = Cookies.get("wkl_access_token") ?? null;

export const setAuthToken = (token) => {
  authToken = token;
};


// ---------------------------------------------------------------------------
// Lazy store reference — injected once from App.jsx at module load time.
// Using getState() (not a hook) so this works outside React render cycles.
// ---------------------------------------------------------------------------
let _getStoreState = null;

/**
 * Injects the Zustand auth store's getState function into the Axios layer.
 * Must be called once, before any authenticated request is made.
 *
 * Usage in App.jsx (module level, outside any component):
 *   import { configureAuthStore } from './lib/api'
 *   import { useAuthStore } from './features/auth/store/auth-store'
 *   configureAuthStore(useAuthStore.getState)
 *
 * @param {Function} getStateFn - Zustand store's getState reference
 */
export function configureAuthStore(getStateFn) {
  _getStoreState = getStateFn;
}

// ---------------------------------------------------------------------------
// Shared Axios instance
// ---------------------------------------------------------------------------
if (!import.meta.env.VITE_API_URL) {
  console.error(
    "[api] VITE_API_URL is not defined. Add it to your .env file:\n  VITE_API_URL=http://localhost:5032/api"
  );
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ---------------------------------------------------------------------------
// Lazy helpers
// auth-service imports `api` from this file, so we cannot import auth-service
// at the top level without creating a circular dependency. We resolve both
// modules lazily inside the interceptor bodies — by that time all modules
// are fully initialized and the cycle is not a problem.
// ---------------------------------------------------------------------------
async function getAuthHelpers() {
  const [{ refreshAccessToken, normalizeAuthResponse }, { isTokenExpired }] = await Promise.all([
    import("../features/auth/services/auth-service.js"),
    import("../features/auth/utils/jwt.js"),
  ]);
  return { refreshAccessToken, normalizeAuthResponse, isTokenExpired };
}

// ---------------------------------------------------------------------------
// Request Interceptor
// Attaches Authorization header. If the in-memory token is already known to be
// expired and we have a refresh token, the refresh is triggered proactively
// before the request goes out — avoiding a guaranteed 401 round-trip.
// ---------------------------------------------------------------------------
api.interceptors.request.use(
  async (config) => {
    // Never intercept auth endpoints themselves — that would cause loops
    if (config.url?.includes("/auth/")) {
      return config;
    }

    // Proactive refresh: if we know the token is expired before even sending
    if (authToken && _getStoreState) {
      try {
        const { isTokenExpired, refreshAccessToken, normalizeAuthResponse } = await getAuthHelpers();

        if (isTokenExpired(authToken)) {
          const { refreshToken } = _getStoreState();
          if (refreshToken) {
            try {
              const raw = await refreshAccessToken(refreshToken);
              const { token: newToken, refreshToken: newRefreshToken } = normalizeAuthResponse(raw);
              if (newToken) {
                setAuthToken(newToken);
                _getStoreState().setToken(newToken, newRefreshToken ?? refreshToken);
                authToken = newToken;
              }
            } catch {
              // Proactive refresh failed — let the request proceed;
              // the reactive response interceptor will handle the 401.
            }
          }
        }
      } catch {
        // Module resolution failed — ignore and continue
      }
    }

    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ---------------------------------------------------------------------------
// Silent refresh state
// Only one refresh request may be in flight at a time. Concurrent requests
// that receive a 401 while a refresh is already running are queued and
// retried automatically once the new token arrives.
// ---------------------------------------------------------------------------
let isRefreshing = false;
let pendingQueue = []; // Array<{ resolve: Function, reject: Function }>

function processPendingQueue(error, token) {
  pendingQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  pendingQueue = [];
}

// ---------------------------------------------------------------------------
// Response Interceptor — reactive silent refresh
// ---------------------------------------------------------------------------
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only handle 401s
    if (!error.response || error.response.status !== 401) {
      return Promise.reject(error);
    }

    // Pass through 401s on auth endpoints (login/refresh failures etc.)
    // so the UI can display credential errors.
    if (originalRequest.url?.includes("/auth/")) {
      return Promise.reject(error);
    }

    // Guard: never retry a request more than once
    if (originalRequest._retry) {
      return Promise.reject(error);
    }

    // If a refresh is already in progress, queue this request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingQueue.push({ resolve, reject });
      }).then((newToken) => {
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const { refreshAccessToken, normalizeAuthResponse } = await getAuthHelpers();
      const refreshToken = _getStoreState?.()?.refreshToken ?? null;
      if (!refreshToken) throw new Error("No refresh token available");

      const raw = await refreshAccessToken(refreshToken);
      const { token: newToken, refreshToken: newRefreshToken } = normalizeAuthResponse(raw);

      if (!newToken) throw new Error("Refresh response missing access_token");

      // Update the Axios in-memory token and the Zustand store
      setAuthToken(newToken);
      _getStoreState?.().setToken(newToken, newRefreshToken ?? refreshToken);

      // Flush all queued requests with the new token
      processPendingQueue(null, newToken);

      // Retry the original request
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      // Refresh failed — clear auth and send all queued requests to failure
      processPendingQueue(refreshError, null);

      if (_getStoreState) {
        _getStoreState().clearAuth();
      }

      // Navigate to login without importing React Router (works outside components)
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }

      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;

