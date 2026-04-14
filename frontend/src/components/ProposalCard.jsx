import { StatusBadge } from "./StatusBadge";

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(amount ?? 0));
}

function formatDate(value) {
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function ProposalCard({ proposal, isSelected, onSelect, onEdit }) {
  const canEdit = proposal.status === "rejected";

  return (
    <article
      className={`rounded-3xl border p-5 shadow-sm transition ${
        isSelected
          ? "border-brand-500 bg-brand-50/70"
          : "border-slate-200 bg-white hover:border-brand-200"
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-[0.22em] text-slate-500">
            Proposal #{proposal.id}
          </p>
          <h3 className="mt-2 text-xl font-semibold text-slate-900">
            {proposal.title}
          </h3>
        </div>
        <StatusBadge status={proposal.status} />
      </div>

      <div className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
        <p>Event date: {formatDate(proposal.event_date)}</p>
        <p>Venue: {proposal.venue}</p>
        <p>Estimated budget: {formatCurrency(proposal.estimated_budget)}</p>
        <p>Items: {proposal.budget_items.length}</p>
      </div>

      {proposal.remarks ? (
        <div className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
          Faculty remarks: {proposal.remarks}
        </div>
      ) : null}

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-brand-500 hover:text-brand-700"
          onClick={() => onSelect(proposal)}
          type="button"
        >
          View details
        </button>
        {canEdit ? (
          <button
            className="rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
            onClick={() => onEdit(proposal)}
            type="button"
          >
            Revise proposal
          </button>
        ) : null}
      </div>
    </article>
  );
}
