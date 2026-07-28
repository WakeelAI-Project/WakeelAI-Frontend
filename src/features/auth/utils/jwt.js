
import { jwtDecode } from "jwt-decode";

/**
 * Safely decodes a JWT token and returns its payload using the jwt-decode package.
 * Returns null if the token is invalid or decoding fails.
 *
 * @param {string} token - JWT token string
 * @returns {object|null} Decoded payload object containing role, companyId, and sub
 */
export function decodeToken(token) {
  if (!token || typeof token !== "string") return null;

  try {
    const payload = jwtDecode(token);

    // Extract expected properties
    return {
      role: payload.role || null,
      companyId: payload.companyId || null,
      sub: payload.sub || null,
      ...payload,
    };
  } catch (error) {
    console.error("JWT decoding failed:", error);
    return null;
  }
}

/**
 * Returns true if the JWT access token is expired or cannot be decoded.
 * Fail-safe: treats missing / malformed tokens as already expired.
 *
 * A 10-second clock-skew buffer is applied so the refresh happens slightly
 * before the real expiry, avoiding race conditions with in-flight requests.
 *
 * @param {string|null} token - JWT token string
 * @returns {boolean}
 */
export function isTokenExpired(token) {
  if (!token || typeof token !== "string") return true;

  try {
    const { exp } = jwtDecode(token);
    if (!exp) return true;

    const CLOCK_SKEW_SECONDS = 10;
    return Date.now() / 1000 >= exp - CLOCK_SKEW_SECONDS;
  } catch {
    return true;
  }
}

