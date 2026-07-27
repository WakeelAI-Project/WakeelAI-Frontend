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
      ...payload
    };
  } catch (error) {
    console.error("JWT decoding failed:", error);
    return null;
  }
}
