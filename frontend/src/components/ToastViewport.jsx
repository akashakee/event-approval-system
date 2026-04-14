import { useEffect } from "react";
import { useUiStore } from "../store/uiStore";

const toneClasses = {
  info: "border-sky-200 bg-sky-50 text-sky-900",
  success: "border-emerald-200 bg-emerald-50 text-emerald-900",
  warning: "border-amber-200 bg-amber-50 text-amber-900",
  error: "border-rose-200 bg-rose-50 text-rose-900",
};

function ToastItem({ toast, onDismiss }) {
  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      onDismiss(toast.id);
    }, toast.duration);

    return () => window.clearTimeout(timeoutId);
  }, [onDismiss, toast.duration, toast.id]);

  return (
    <article
      className={`pointer-events-auto rounded-2xl border px-4 py-3 shadow-lg backdrop-blur ${toneClasses[toast.tone] ?? toneClasses.info}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold">{toast.title}</p>
          <p className="mt-1 text-sm opacity-90">{toast.message}</p>
        </div>
        <button
          className="rounded-full px-2 py-1 text-xs font-semibold opacity-70 transition hover:opacity-100"
          onClick={() => onDismiss(toast.id)}
          type="button"
        >
          Close
        </button>
      </div>
    </article>
  );
}

export function ToastViewport() {
  const toasts = useUiStore((state) => state.toasts);
  const dismissToast = useUiStore((state) => state.dismissToast);

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-50 flex w-full max-w-sm flex-col gap-3">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} onDismiss={dismissToast} toast={toast} />
      ))}
    </div>
  );
}
