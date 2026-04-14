import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAuthStore = create(
  persist(
    (set) => ({
      accessToken: null,
      user: null,
      isAuthenticating: false,
      isSessionChecking: false,
      loginError: "",
      setAuthenticating(isAuthenticating) {
        set({ isAuthenticating });
      },
      setSessionChecking(isSessionChecking) {
        set({ isSessionChecking });
      },
      setLoginError(loginError) {
        set({ loginError });
      },
      setValidatedUser(user) {
        set({ user, isSessionChecking: false });
      },
      login(authPayload) {
        set({
          accessToken: authPayload.accessToken,
          user: authPayload.user,
          isAuthenticating: false,
          isSessionChecking: false,
          loginError: "",
        });
      },
      logout() {
        set({
          accessToken: null,
          user: null,
          isAuthenticating: false,
          isSessionChecking: false,
          loginError: "",
        });
      },
    }),
    {
      name: "event-approval-auth",
      partialize: (state) => ({
        accessToken: state.accessToken,
        user: state.user,
      }),
    },
  ),
);
