import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FacultyReviewPanel } from "../components/FacultyReviewPanel";
import { ProposalCard } from "../components/ProposalCard";
import { ProposalForm } from "../components/ProposalForm";
import { StatusBadge } from "../components/StatusBadge";
import { logout, useAuth } from "../hooks/useAuth";
import { useFacultyReviews } from "../hooks/useFacultyReviews";
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
  const isFaculty = user?.role === "faculty";
  const { proposals, isLoading, isSaving, errorMessage, submitProposal } =
    useProposals(isStudent);
  const {
    pendingReviews,
    isLoading: isLoadingReviews,
    isSaving: isSavingReview,
    errorMessage: reviewErrorMessage,
    submitDecision,
  } = useFacultyReviews(isFaculty);
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [editingProposal, setEditingProposal] = useState(null);
  const [latestDecision, setLatestDecision] = useState(null);

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

  useEffect(() => {
    if (isFaculty && !selectedProposal && pendingReviews.length) {
      setSelectedProposal(pendingReviews[0]);
    }
  }, [isFaculty, pendingReviews, selectedProposal]);

  async function handleFacultyDecision(proposalId, decision, remarks) {
    const reviewedProposal = await submitDecision(proposalId, decision, remarks);
    setLatestDecision(reviewedProposal.review_decisions.at(-1) ?? null);
    setSelectedProposal((currentValue) => {
      if (currentValue?.id === proposalId) {
        const nextProposal =
          pendingReviews.find((proposal) => proposal.id !== proposalId) ?? null;
        return nextProposal;
      }
      return currentValue;
    });
  }

  if (!isStudent) {
    const pendingBudget = pendingReviews.reduce(
      (sum, proposal) => sum + Number(proposal.estimated_budget ?? 0),
      0,
    );

    return (
      <section className="space-y-6">
        <div className="flex flex-col gap-4 rounded-3xl bg-slate-900 p-8 text-white shadow-xl lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-brand-100">
              Faculty dashboard
            </p>
            <h2 className="mt-3 text-3xl font-bold">Review student proposals</h2>
            <p className="mt-2 max-w-2xl text-slate-300">
              Evaluate pending submissions, record remarks, and move each proposal to
              an approved or rejected state.
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

        <div className="grid gap-4 md:grid-cols-3">
          <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500">
              Pending proposals
            </p>
            <p className="mt-3 text-3xl font-bold text-slate-900">
              {pendingReviews.length}
            </p>
          </article>
          <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500">
              Budget awaiting review
            </p>
            <p className="mt-3 text-3xl font-bold text-slate-900">
              {formatCurrency(pendingBudget)}
            </p>
          </article>
          <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500">
              Last decision
            </p>
            <p className="mt-3 text-lg font-bold capitalize text-slate-900">
              {latestDecision ? latestDecision.decision.replaceAll("_", " ") : "None yet"}
            </p>
          </article>
        </div>

        {reviewErrorMessage ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {reviewErrorMessage}
          </div>
        ) : null}

        <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div>
              <p className="text-sm uppercase tracking-[0.22em] text-brand-700">
                Pending queue
              </p>
              <h3 className="mt-2 text-2xl font-semibold text-slate-900">
                Faculty dashboard
              </h3>
            </div>

            <div className="mt-6 space-y-4">
              {isLoadingReviews ? (
                <div className="rounded-2xl bg-slate-50 px-4 py-8 text-center text-slate-500">
                  Loading proposals...
                </div>
              ) : pendingReviews.length ? (
                pendingReviews.map((proposal) => (
                  <article
                    key={proposal.id}
                    className={`rounded-3xl border p-5 shadow-sm transition ${
                      selectedProposal?.id === proposal.id
                        ? "border-brand-500 bg-brand-50/70"
                        : "border-slate-200 bg-white hover:border-brand-200"
                    }`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-sm uppercase tracking-[0.22em] text-slate-500">
                          Proposal #{proposal.id}
                        </p>
                        <h4 className="mt-2 text-xl font-semibold text-slate-900">
                          {proposal.title}
                        </h4>
                        <p className="mt-2 text-sm text-slate-600">
                          {proposal.student?.email}
                        </p>
                      </div>
                      <StatusBadge status={proposal.status} />
                    </div>

                    <div className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
                      <p>
                        Event date{" "}
                        {new Date(proposal.event_date).toLocaleDateString("en-IN")}
                      </p>
                      <p>Budget {formatCurrency(proposal.estimated_budget)}</p>
                    </div>

                    <button
                      className="mt-5 rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-brand-500 hover:text-brand-700"
                      onClick={() => setSelectedProposal(proposal)}
                      type="button"
                    >
                      Review proposal
                    </button>
                  </article>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center">
                  <p className="text-lg font-semibold text-slate-900">
                    Review queue cleared
                  </p>
                  <p className="mt-2 text-slate-600">
                    There are no pending proposals waiting for faculty action.
                  </p>
                </div>
              )}
            </div>
          </section>

          <FacultyReviewPanel
            isSaving={isSavingReview}
            latestDecision={latestDecision}
            onDecision={handleFacultyDecision}
            proposal={selectedProposal}
          />
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
