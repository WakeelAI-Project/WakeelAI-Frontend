const rawBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "";

if (!rawBaseUrl && import.meta.env.DEV) {
  console.error(
    "[config] VITE_API_BASE_URL is not defined. Add it to your .env file:\n  VITE_API_BASE_URL=http://localhost:5032"
  );
}

/** Origin of the backend, no trailing slash, no /api suffix. */
export const API_BASE_URL = rawBaseUrl.replace(/\/+$/, "");

/** Full REST prefix used by the axios instance. */
export const API_URL = import.meta.env.VITE_API_URL?.replace(/\/+$/, "") || `${API_BASE_URL}/api`;
