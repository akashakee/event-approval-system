import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "../services/authService";
import { registerUnauthorizedHandler } from "../services/apiClient";
import { useAuthStore } from "../store/authStore";
import { useUiStore } from "../store/uiStore";

export function AuthBootstrap({ children }) {
  const navigate = useNavigate();
  const accessToken = useAuthStore((state) => state.accessToken);
  const isSessionChecking = useAuthStore((state) => state.isSessionChecking);
  const setSessionChecking = useAuthStore((state) => state.setSessionChecking);
  const setValidatedUser = useAuthStore((state) => state.setValidatedUser);
  const logout = useAuthStore((state) => state.logout);
  const pushToast = useUiStore((state) => state.pushToast);

  useEffect(() => {
    registerUnauthorizedHandler(() => {
      if (!useAuthStore.getState().accessToken) {
        return;
      }

      logout();
      pushToast({
        title: "Session expired",
        message: "Please sign in again to continue securely.",
        tone: "warning",
      });
      navigate("/login", { replace: true });
    });
  }, [logout, navigate, pushToast]);

  useEffect(() => {
    let isMounted = true;

    async function validateSession() {
      if (!accessToken) {
        setSessionChecking(false);
        return;
      }

      setSessionChecking(true);

      try {
        const user = await getCurrentUser(accessToken);
        if (isMounted) {
          setValidatedUser(user);
        }
      } catch {
        if (!isMounted) {
          return;
        }

        logout();
        pushToast({
          title: "Authentication required",
          message: "Your saved session is no longer valid. Please sign in again.",
          tone: "warning",
        });
        navigate("/login", { replace: true });
      } finally {
        if (isMounted) {
          setSessionChecking(false);
        }
      }
    }

    validateSession();

    return () => {
      isMounted = false;
    };
  }, [
    accessToken,
    logout,
    navigate,
    pushToast,
    setSessionChecking,
    setValidatedUser,
  ]);

  if (accessToken && isSessionChecking) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm uppercase tracking-[0.22em] text-brand-700">
          Session validation
        </p>
        <h2 className="mt-3 text-2xl font-semibold text-slate-900">
          Verifying your access token
        </h2>
        <p className="mt-3 text-slate-600">
          We are checking your session before unlocking protected routes.
        </p>
      </div>
    );
  }

  return children;
}
