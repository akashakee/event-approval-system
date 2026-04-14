import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAuthStore = create(
  persist(
    (set) => ({
      accessToken: null,
      user: null,
      isAuthenticating: false,
      loginError: "",
      setAuthenticating(isAuthenticating) {
        set({ isAuthenticating });
      },
      setLoginError(loginError) {
        set({ loginError });
      },
      login(authPayload) {
        set({
          accessToken: authPayload.accessToken,
          user: authPayload.user,
          isAuthenticating: false,
          loginError: "",
        });
      },
      logout() {
        set({
          accessToken: null,
          user: null,
          isAuthenticating: false,
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
