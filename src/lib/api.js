import axios from "axios";
import Cookies from "js-cookie";
import { API_URL } from "./config.js";

let authToken = Cookies.get("wkl_access_token") ?? null;

export const setAuthToken = (token) => {
  authToken = token;
};

let _getStoreState = null;

export function configureAuthStore(getStateFn) {
  _getStoreState = getStateFn;
}

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ---------------------------------------------------------------------------
// Auth endpoint allowlist — used by both request and response interceptors
// ---------------------------------------------------------------------------
const AUTH_ENDPOINTS = ["/auth/login", "/auth/register", "/auth/refresh", "/auth/logout", "/auth/forgot-password", "/auth/reset-password"];
const isAuthEndpoint = (url = "") => AUTH_ENDPOINTS.some((p) => url.includes(p));

async function getAuthHelpers() {
  const [{ refreshAccessToken, normalizeAuthResponse }, { isTokenExpired }] = await Promise.all([
    import("../features/auth/services/auth-service.js"),
    import("../features/auth/utils/jwt.js"),
  ]);
  return { refreshAccessToken, normalizeAuthResponse, isTokenExpired };
}

// ---------------------------------------------------------------------------
// Single-flight refresh lock — shared by the proactive (request) and reactive
// (response 401) refresh paths so only one /auth/refresh call is ever in
// flight at a time, regardless of which path triggered it.
// ---------------------------------------------------------------------------
let isRefreshing = false;
let pendingQueue = []; // Array<{ resolve: Function, reject: Function }>

function processPendingQueue(error, token) {
  pendingQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  pendingQueue = [];
}

async function performRefresh() {
  if (isRefreshing) {
    return new Promise((resolve, reject) => {
      pendingQueue.push({ resolve, reject });
    });
  }

  isRefreshing = true;

  try {
    const { refreshAccessToken, normalizeAuthResponse } = await getAuthHelpers();
    const refreshToken = _getStoreState?.()?.refreshToken ?? null;
    if (!refreshToken) throw new Error("No refresh token available");

    const raw = await refreshAccessToken(refreshToken);
    const { token: newToken, refreshToken: newRefreshToken } = normalizeAuthResponse(raw);
    if (!newToken) throw new Error("Refresh response missing access_token");

    setAuthToken(newToken);
    _getStoreState?.().setToken(newToken, newRefreshToken ?? refreshToken);
    authToken = newToken;

    processPendingQueue(null, newToken);
    return newToken;
  } catch (refreshError) {
    processPendingQueue(refreshError, null);

    if (_getStoreState) {
      _getStoreState().clearAuth();
    }
    if (typeof window !== "undefined") {
      const publicPaths = ["/login", "/register", "/forgot-password", "/reset-password"];
      const isPublic = publicPaths.some((p) => window.location.pathname.startsWith(p));
      if (!isPublic) {
        window.location.href = "/login?session_expired=1";
      }
    }

    throw refreshError;
  } finally {
    isRefreshing = false;
  }
}

// ---------------------------------------------------------------------------
// Request Interceptor
// ---------------------------------------------------------------------------
api.interceptors.request.use(
  async (config) => {
    if (isAuthEndpoint(config.url)) {
      return config;
    }

    if (authToken && _getStoreState) {
      try {
        const { isTokenExpired } = await getAuthHelpers();
        if (isTokenExpired(authToken)) {
          try {
            await performRefresh();
          } catch {
            // performRefresh already cleared auth and redirected on hard failure;
            // for any other rejection, let the request proceed and fail naturally.
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
// Response Interceptor — reactive refresh on 401
// ---------------------------------------------------------------------------
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 403 password_change_required before 401
    if (
      error.response?.status === 403 &&
      error.response?.data?.error === "password_change_required"
    ) {
      // Flip the flag and let ProtectedRoute navigate client-side.
      // A `window.location.href` here would hard-reload the SPA and destroy the
      // router state carrying the temporary password from the login screen.
      _getStoreState?.().setMustChangePassword?.(true);
      return Promise.reject(error);
    }

    if (!error.response || error.response.status !== 401) {
      return Promise.reject(error);
    }

    if (isAuthEndpoint(originalRequest.url)) {
      return Promise.reject(error);
    }

    if (originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const newToken = await performRefresh();
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      return Promise.reject(refreshError);
    }
  }
);

export default api;