import axios from "axios";
import Cookies from "js-cookie";

let authToken = Cookies.get("wkl_access_token") ?? null;

export const setAuthToken = (token) => {
  authToken = token;
};

let _getStoreState = null;

export function configureAuthStore(getStateFn) {
  _getStoreState = getStateFn;
}

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
      window.location.href = "/login";
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
    if (config.url?.includes("/auth/")) {
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

    if (!error.response || error.response.status !== 401) {
      return Promise.reject(error);
    }

    if (originalRequest.url?.includes("/auth/")) {
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