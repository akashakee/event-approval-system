import { useAuthStore } from "../store/authStore";

export function login(authPayload) {
  useAuthStore.getState().login(authPayload);
}

export function logout() {
  useAuthStore.getState().logout();
}

export function useAuth() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const user = useAuthStore((state) => state.user);
  const isAuthenticating = useAuthStore((state) => state.isAuthenticating);
  const loginError = useAuthStore((state) => state.loginError);

  return {
    accessToken,
    isAuthenticated: Boolean(accessToken),
    isAuthenticating,
    loginError,
    user,
  };
}
