import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { login, useAuth } from "../hooks/useAuth";
import { loginRequest } from "../services/authService";
import { useAuthStore } from "../store/authStore";
import { useUiStore } from "../store/uiStore";
import { validateLoginForm } from "../utils/validation";

const demoAccounts = [
  {
    role: "student",
    email: "student@university.edu",
    password: "Student@123",
  },
  {
    role: "faculty",
    email: "faculty@university.edu",
    password: "Faculty@123",
  },
];

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isAuthenticating, loginError } = useAuth();
  const [formState, setFormState] = useState(demoAccounts[0]);
  const [fieldErrors, setFieldErrors] = useState({});
  const setAuthenticating = useAuthStore((state) => state.setAuthenticating);
  const setLoginError = useAuthStore((state) => state.setLoginError);
  const pushToast = useUiStore((state) => state.pushToast);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const validationErrors = validateLoginForm(formState);
    setFieldErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setAuthenticating(true);
    setLoginError("");

    try {
      const response = await loginRequest(formState);
      login({
        accessToken: response.access_token,
        user: response.user,
      });
      pushToast({
        title: "Signed in",
        message: `Welcome back, ${response.user.role}.`,
        tone: "success",
      });

      const destination = location.state?.from?.pathname ?? "/dashboard";
      navigate(destination, { replace: true });
    } catch (error) {
      setLoginError(error.message);
      pushToast({
        title: "Sign-in failed",
        message: error.message,
        tone: "error",
      });
    } finally {
      setAuthenticating(false);
    }
  }

  function updateField(fieldName, value) {
    setFormState((currentValue) => ({
      ...currentValue,
      [fieldName]: value,
    }));
  }

  function applyDemoAccount(role) {
    const selectedAccount = demoAccounts.find((account) => account.role === role);
    if (selectedAccount) {
      setFormState(selectedAccount);
      setLoginError("");
      setFieldErrors({});
    }
  }

  return (
    <section className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
      <div className="rounded-3xl bg-slate-900 p-8 text-white shadow-xl">
        <p className="text-sm uppercase tracking-[0.3em] text-brand-100">
          Phase 8
        </p>
        <h2 className="mt-4 text-4xl font-bold">Scalable state, smoother flow</h2>
        <p className="mt-4 max-w-xl text-slate-300">
          Centralized app state, clearer validation, toast feedback, and cleaner
          loading/error states across student and faculty experiences.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {demoAccounts.map((account) => (
            <button
              key={account.role}
              className="rounded-2xl border border-white/15 bg-white/5 p-4 text-left transition hover:bg-white/10"
              onClick={() => applyDemoAccount(account.role)}
              type="button"
            >
              <p className="text-sm uppercase tracking-[0.2em] text-brand-100">
                {account.role}
              </p>
              <p className="mt-2 font-semibold">{account.email}</p>
              <p className="mt-1 text-sm text-slate-300">{account.password}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h3 className="text-2xl font-semibold text-slate-900">Sign in</h3>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">
              Role
            </span>
            <select
              className={`w-full rounded-xl border px-4 py-3 outline-none transition focus:border-brand-500 ${fieldErrors.role ? "border-rose-400 bg-rose-50" : "border-slate-300"}`}
              onChange={(event) => applyDemoAccount(event.target.value)}
              value={formState.role}
            >
              <option value="student">Student</option>
              <option value="faculty">Faculty</option>
            </select>
            {fieldErrors.role ? (
              <span className="mt-2 block text-sm text-rose-700">
                {fieldErrors.role}
              </span>
            ) : null}
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">
              Email
            </span>
            <input
              className={`w-full rounded-xl border px-4 py-3 outline-none transition focus:border-brand-500 ${fieldErrors.email ? "border-rose-400 bg-rose-50" : "border-slate-300"}`}
              onChange={(event) => updateField("email", event.target.value)}
              placeholder="student@university.edu"
              type="email"
              value={formState.email}
            />
            {fieldErrors.email ? (
              <span className="mt-2 block text-sm text-rose-700">
                {fieldErrors.email}
              </span>
            ) : null}
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">
              Password
            </span>
            <input
              className={`w-full rounded-xl border px-4 py-3 outline-none transition focus:border-brand-500 ${fieldErrors.password ? "border-rose-400 bg-rose-50" : "border-slate-300"}`}
              onChange={(event) => updateField("password", event.target.value)}
              placeholder="Enter password"
              type="password"
              value={formState.password}
            />
            {fieldErrors.password ? (
              <span className="mt-2 block text-sm text-rose-700">
                {fieldErrors.password}
              </span>
            ) : null}
          </label>

          {loginError ? (
            <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {loginError}
            </p>
          ) : null}

          <button
            className="w-full rounded-xl bg-brand-500 px-4 py-3 font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-70"
            disabled={isAuthenticating}
            type="submit"
          >
            {isAuthenticating ? "Signing in..." : "Continue"}
          </button>
        </form>
      </div>
    </section>
  );
}
