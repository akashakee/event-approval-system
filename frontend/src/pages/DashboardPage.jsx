import { useNavigate } from "react-router-dom";
import { logout, useAuth } from "../hooks/useAuth";

const roleCards = {
  student: [
    "Create proposal drafts",
    "Track approval status",
    "Update rejected proposals",
  ],
  faculty: [
    "Review pending proposals",
    "Approve or reject submissions",
    "Record remarks for decisions",
  ],
};

export function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const capabilities = roleCards[user?.role] ?? [];

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 rounded-3xl bg-slate-900 p-8 text-white shadow-xl lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-brand-100">
            Authenticated Session
          </p>
          <h2 className="mt-3 text-3xl font-bold">
            Welcome, {user?.role ?? "user"}
          </h2>
          <p className="mt-2 text-slate-300">{user?.email}</p>
        </div>
        <button
          className="rounded-xl bg-white px-5 py-3 font-semibold text-slate-900 transition hover:bg-slate-100"
          onClick={handleLogout}
          type="button"
        >
          Sign out
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {capabilities.map((item) => (
          <article
            key={item}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <p className="text-sm uppercase tracking-[0.2em] text-brand-700">
              {user?.role}
            </p>
            <h3 className="mt-2 text-xl font-semibold text-slate-900">{item}</h3>
          </article>
        ))}
      </div>
    </section>
  );
}
