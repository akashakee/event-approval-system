import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ProposalCard } from "../components/ProposalCard";
import { ProposalForm } from "../components/ProposalForm";
import { StatusBadge } from "../components/StatusBadge";
import { logout, useAuth } from "../hooks/useAuth";
import { useProposals } from "../hooks/useProposals";

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(amount ?? 0));
}

export function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isStudent = user?.role === "student";
  const { proposals, isLoading, isSaving, errorMessage, submitProposal } =
    useProposals(isStudent);
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [editingProposal, setEditingProposal] = useState(null);

  const metrics = useMemo(() => {
    const summary = {
      total: proposals.length,
      under_review: 0,
      approved: 0,
      rejected: 0,
      totalBudget: 0,
    };

    proposals.forEach((proposal) => {
      summary[proposal.status] = (summary[proposal.status] ?? 0) + 1;
      summary.totalBudget += Number(proposal.estimated_budget ?? 0);
    });

    return summary;
  }, [proposals]);

  useEffect(() => {
    if (!selectedProposal && proposals.length) {
      setSelectedProposal(proposals[0]);
    }
  }, [proposals, selectedProposal]);

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  async function handleSubmit(formValues, proposalId) {
    const savedProposal = await submitProposal(formValues, proposalId);
    setSelectedProposal(savedProposal);
    setEditingProposal(null);
  }

  function beginEdit(proposal) {
    setEditingProposal(proposal);
    setSelectedProposal(proposal);
  }

  if (!isStudent) {
    return (
      <section className="space-y-6">
        <div className="flex flex-col gap-4 rounded-3xl bg-slate-900 p-8 text-white shadow-xl lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-brand-100">
              Authenticated Session
            </p>
            <h2 className="mt-3 text-3xl font-bold">Faculty workspace</h2>
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
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-sm uppercase tracking-[0.22em] text-brand-700">
            Faculty module
          </p>
          <h3 className="mt-2 text-2xl font-semibold text-slate-900">
            Student workflow is now production-ready
          </h3>
          <p className="mt-3 max-w-2xl text-slate-600">
            This phase focused on the student module. Faculty review screens can
            build on the same authenticated layout and API foundation in the
            next phase.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[2rem] bg-slate-900 p-8 text-white shadow-xl lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-brand-100">
            Student dashboard
          </p>
          <h2 className="mt-3 text-3xl font-bold">Submit and track proposals</h2>
          <p className="mt-2 max-w-2xl text-slate-300">
            Build a proposal, add dynamic budget items, and monitor its status
            from submission through faculty review.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-slate-100">
            Signed in as {user?.email}
          </div>
          <button
            className="rounded-xl bg-white px-5 py-3 font-semibold text-slate-900 transition hover:bg-slate-100"
            onClick={handleLogout}
            type="button"
          >
            Sign out
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-500">
            Total proposals
          </p>
          <p className="mt-3 text-3xl font-bold text-slate-900">{metrics.total}</p>
        </article>
        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-500">
            Under review
          </p>
          <p className="mt-3 text-3xl font-bold text-amber-700">
            {metrics.under_review}
          </p>
        </article>
        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-500">
            Approved / Rejected
          </p>
          <p className="mt-3 text-3xl font-bold text-slate-900">
            {metrics.approved} / {metrics.rejected}
          </p>
        </article>
        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-500">
            Budget submitted
          </p>
          <p className="mt-3 text-3xl font-bold text-slate-900">
            {formatCurrency(metrics.totalBudget)}
          </p>
        </article>
      </div>

      {errorMessage ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {errorMessage}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-6">
          <ProposalForm
            activeProposal={editingProposal}
            isSaving={isSaving}
            onCancelEdit={() => setEditingProposal(null)}
            onSubmit={handleSubmit}
          />

          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div>
              <p className="text-sm uppercase tracking-[0.22em] text-brand-700">
                Proposal history
              </p>
              <h3 className="mt-2 text-2xl font-semibold text-slate-900">
                View all submissions
              </h3>
            </div>

            <div className="mt-6 space-y-4">
              {isLoading ? (
                <div className="rounded-2xl bg-slate-50 px-4 py-8 text-center text-slate-500">
                  Loading proposals...
                </div>
              ) : proposals.length ? (
                proposals.map((proposal) => (
                  <ProposalCard
                    key={proposal.id}
                    isSelected={selectedProposal?.id === proposal.id}
                    onEdit={beginEdit}
                    onSelect={setSelectedProposal}
                    proposal={proposal}
                  />
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center">
                  <p className="text-lg font-semibold text-slate-900">
                    No proposals yet
                  </p>
                  <p className="mt-2 text-slate-600">
                    Create your first event proposal using the form above.
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm uppercase tracking-[0.22em] text-brand-700">
              Status view
            </p>
            <h3 className="mt-2 text-2xl font-semibold text-slate-900">
              {selectedProposal ? selectedProposal.title : "Select a proposal"}
            </h3>

            {selectedProposal ? (
              <div className="mt-6 space-y-5">
                <div className="flex items-center justify-between gap-4">
                  <StatusBadge status={selectedProposal.status} />
                  <p className="text-sm text-slate-500">
                    Event date{" "}
                    {new Date(selectedProposal.event_date).toLocaleDateString(
                      "en-IN",
                    )}
                  </p>
                </div>

                <p className="text-slate-600">{selectedProposal.description}</p>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Venue
                    </p>
                    <p className="mt-2 font-medium text-slate-900">
                      {selectedProposal.venue}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Estimated budget
                    </p>
                    <p className="mt-2 font-medium text-slate-900">
                      {formatCurrency(selectedProposal.estimated_budget)}
                    </p>
                  </div>
                </div>

                {selectedProposal.remarks ? (
                  <div className="rounded-2xl bg-rose-50 p-4 text-rose-700">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em]">
                      Review remarks
                    </p>
                    <p className="mt-2 text-sm">{selectedProposal.remarks}</p>
                  </div>
                ) : (
                  <div className="rounded-2xl bg-slate-50 p-4 text-slate-600">
                    No faculty remarks yet. Your current status is being tracked.
                  </div>
                )}

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Budget breakdown
                  </p>
                  <div className="mt-3 space-y-3">
                    {selectedProposal.budget_items.map((item) => (
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
              </div>
            ) : (
              <div className="mt-6 rounded-2xl bg-slate-50 px-4 py-8 text-center text-slate-600">
                Pick a proposal from the list to inspect its budget and review
                status.
              </div>
            )}
          </section>
        </aside>
      </div>
    </section>
  );
}
