import { useAuthStore } from "../store/auth-store";

/**
 * Custom React Hook that exposes the Zustand auth store state and actions.
 */
export function useAuth() {
  const token = useAuthStore((state) => state.token);
  const currentUser = useAuthStore((state) => state.currentUser);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const login = useAuthStore((state) => state.login);
  const logout = useAuthStore((state) => state.logout);
  const setToken = useAuthStore((state) => state.setToken);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  return {
    token,
    currentUser,
    isAuthenticated,
    login,
    logout,
    setToken,
    clearAuth,
  };
}
