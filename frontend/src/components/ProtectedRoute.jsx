import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export function ProtectedRoute({ allowedRoles, children }) {
  const location = useLocation();
  const { isAuthenticated, isSessionChecking, user } = useAuth();

  if (isSessionChecking) {
    return (
      <section className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm uppercase tracking-[0.22em] text-brand-700">
          Access control
        </p>
        <p className="mt-3 text-slate-600">
          Confirming your permissions before loading this route.
        </p>
      </section>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!user) {
    return (
      <section className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm uppercase tracking-[0.22em] text-brand-700">
          Restoring session
        </p>
        <p className="mt-3 text-slate-600">
          Finishing secure session recovery before opening the app.
        </p>
      </section>
    );
  }

  if (allowedRoles?.length && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
