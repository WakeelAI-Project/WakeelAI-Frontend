import { create } from "zustand";
import { decodeToken } from "../utils/jwt";
import { login as apiLogin } from "../services/auth-service";
import { setAuthToken } from "../../../lib/api";

const initialStoreState = {
  token: null,
  currentUser: null,
  isAuthenticated: false,
};

export const useAuthStore = create((set, get) => ({
  ...initialStoreState,

  // Action to set token directly (used during login, registration or auto-auth)
  setToken: (token) => {
    if (!token) {
      get().clearAuth();
      return;
    }

    const decoded = decodeToken(token);
    // Sync the token with the Axios interceptor
    setAuthToken(token);
    set({
      token,
      currentUser: decoded,
      isAuthenticated: true,
    });
  },

  // Action to perform login via credentials
  login: async (email, password) => {
    try {
      const data = await apiLogin(email, password);
      if (data && data.token) {
        get().setToken(data.token);
        return data;
      }
      throw new Error("Invalid response format");
    } catch (error) {
      get().clearAuth();
      throw error;
    }
  },

  // Action to clear auth and handle redirection
  logout: () => {
    get().clearAuth();
  },

  // Resets the state to initial values
  clearAuth: () => {
    setAuthToken(null);
    set(initialStoreState);
  },
}));
