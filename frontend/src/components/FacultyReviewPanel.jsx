import { useEffect, useState } from "react";
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

export function FacultyReviewPanel({
  proposal,
  isSaving,
  onDecision,
  latestDecision,
}) {
  const [remarks, setRemarks] = useState("");
  const [validationError, setValidationError] = useState("");

  useEffect(() => {
    setRemarks("");
    setValidationError("");
  }, [proposal?.id]);

  if (!proposal) {
    return (
      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm uppercase tracking-[0.22em] text-brand-700">
          Review page
        </p>
        <div className="mt-6 rounded-2xl bg-slate-50 px-4 py-10 text-center text-slate-600">
          Select a pending proposal to inspect its details, add remarks, and record a decision.
        </div>
      </section>
    );
  }

  async function handleDecision(decision) {
    const cleanedRemarks = remarks.trim();
    if (!cleanedRemarks) {
      setValidationError("Remarks are required before approving or rejecting.");
      return;
    }

    setValidationError("");
    await onDecision(proposal.id, decision, cleanedRemarks);
  }

  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm uppercase tracking-[0.22em] text-brand-700">
        Review page
      </p>
      <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="text-2xl font-semibold text-slate-900">{proposal.title}</h3>
          <p className="mt-2 text-slate-600">
            Submitted by {proposal.student?.email ?? "Unknown student"}
          </p>
        </div>
        <StatusBadge status={proposal.status} />
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Event date
          </p>
          <p className="mt-2 font-medium text-slate-900">
            {formatDate(proposal.event_date)}
          </p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Venue
          </p>
          <p className="mt-2 font-medium text-slate-900">{proposal.venue}</p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Estimated budget
          </p>
          <p className="mt-2 font-medium text-slate-900">
            {formatCurrency(proposal.estimated_budget)}
          </p>
        </div>
      </div>

      <div className="mt-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          Proposal summary
        </p>
        <p className="mt-3 text-slate-600">{proposal.description}</p>
      </div>

      <div className="mt-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          Budget breakdown
        </p>
        <div className="mt-3 space-y-3">
          {proposal.budget_items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3"
            >
              <div>
                <p className="font-medium text-slate-900">{item.name}</p>
                <p className="text-sm text-slate-500">
                  {item.quantity} x {formatCurrency(item.cost_per_unit)}
                </p>
              </div>
              <p className="font-semibold text-slate-900">
                {formatCurrency(item.total_cost)}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 rounded-3xl bg-slate-950 p-5 text-white">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-brand-100">
              Faculty decision
            </p>
            <h4 className="mt-2 text-xl font-semibold">Approve or reject proposal</h4>
          </div>
          {latestDecision ? (
            <div className="rounded-2xl bg-white/10 px-4 py-3 text-sm text-slate-100">
              Latest outcome: {latestDecision.decision.replaceAll("_", " ")}
            </div>
          ) : null}
        </div>

        <label className="mt-5 block">
          <span className="mb-2 block text-sm font-medium text-slate-200">
            Remarks
          </span>
          <textarea
            className="min-h-32 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-brand-300"
            onChange={(event) => setRemarks(event.target.value)}
            placeholder="Document the reason for approval or the changes required."
            value={remarks}
          />
        </label>

        {validationError ? (
          <p className="mt-4 rounded-2xl bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {validationError}
          </p>
        ) : null}

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            className="rounded-xl bg-emerald-500 px-5 py-3 font-semibold text-white transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-70"
            disabled={isSaving}
            onClick={() => handleDecision("approved")}
            type="button"
          >
            {isSaving ? "Saving..." : "Approve"}
          </button>
          <button
            className="rounded-xl border border-rose-300 px-5 py-3 font-semibold text-rose-100 transition hover:bg-rose-500/10 disabled:cursor-not-allowed disabled:opacity-70"
            disabled={isSaving}
            onClick={() => handleDecision("rejected")}
            type="button"
          >
            {isSaving ? "Saving..." : "Reject"}
          </button>
        </div>
      </div>
    </section>
  );
}
