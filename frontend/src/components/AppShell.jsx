import { ToastViewport } from "./ToastViewport";

export function AppShell({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50 via-white to-slate-100">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-700">
              Event Approval System
            </p>
            <h1 className="text-xl font-bold text-slate-900">
              Project Setup Starter
            </h1>
          </div>
          <span className="rounded-full bg-brand-100 px-3 py-1 text-sm font-medium text-brand-700">
            React + Vite + Tailwind
          </span>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
      <ToastViewport />
    </div>
  );
}
