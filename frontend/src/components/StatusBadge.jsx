const statusMap = {
  under_review: "bg-amber-100 text-amber-800",
  approved: "bg-emerald-100 text-emerald-800",
  rejected: "bg-rose-100 text-rose-800",
  draft: "bg-slate-200 text-slate-700",
};

export function StatusBadge({ status }) {
  const label = status ? status.replaceAll("_", " ") : "unknown";
  const classes = statusMap[status] ?? statusMap.draft;

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${classes}`}
    >
      {label}
    </span>
  );
}
