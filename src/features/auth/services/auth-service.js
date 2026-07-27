import api from "../../../lib/api";

/**
 * Sends a login request to the backend.
 * Works for both HR employees and Company Owners.
 * 
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<{token: string}>} Response containing the JWT token
 */
export async function login(email, password) {
  const response = await api.post("/api/auth/login", { email, password });
  return response.data;
}
