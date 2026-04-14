import { create } from "zustand";
import {
  approveProposalReview,
  createProposal,
  listMyProposals,
  listPendingReviews,
  rejectProposalReview,
  updateProposal,
} from "../services/proposalService";
import { useUiStore } from "./uiStore";

function sortByUpdatedAt(items) {
  return [...items].sort(
    (left, right) =>
      new Date(right.updated_at).getTime() - new Date(left.updated_at).getTime(),
  );
}

export const useWorkflowStore = create((set) => ({
  proposals: [],
  pendingReviews: [],
  latestDecision: null,
  proposalErrorMessage: "",
  reviewErrorMessage: "",
  isProposalLoading: false,
  isProposalSaving: false,
  isReviewLoading: false,
  isReviewSaving: false,
  clearProposalState() {
    set({
      proposals: [],
      proposalErrorMessage: "",
      isProposalLoading: false,
      isProposalSaving: false,
    });
  },
  clearReviewState() {
    set({
      pendingReviews: [],
      reviewErrorMessage: "",
      isReviewLoading: false,
      isReviewSaving: false,
      latestDecision: null,
    });
  },
  async refreshProposals() {
    set({ isProposalLoading: true, proposalErrorMessage: "" });
    try {
      const proposals = await listMyProposals();
      set({ proposals: sortByUpdatedAt(proposals) });
    } catch (error) {
      set({ proposalErrorMessage: error.message });
      throw error;
    } finally {
      set({ isProposalLoading: false });
    }
  },
  async submitProposal(formValues, proposalId = null) {
    set({ isProposalSaving: true, proposalErrorMessage: "" });
    try {
      const savedProposal = proposalId
        ? await updateProposal(proposalId, formValues)
        : await createProposal(formValues);

      set((state) => {
        const remaining = state.proposals.filter(
          (proposal) => proposal.id !== savedProposal.id,
        );
        return {
          proposals: sortByUpdatedAt([savedProposal, ...remaining]),
        };
      });

      useUiStore.getState().pushToast({
        title: proposalId ? "Proposal resubmitted" : "Proposal submitted",
        message: proposalId
          ? "Your revised proposal is back in the faculty review queue."
          : "Your event proposal has been submitted for faculty review.",
        tone: "success",
      });

      return savedProposal;
    } catch (error) {
      set({ proposalErrorMessage: error.message });
      useUiStore.getState().pushToast({
        title: "Proposal action failed",
        message: error.message,
        tone: "error",
      });
      throw error;
    } finally {
      set({ isProposalSaving: false });
    }
  },
  async refreshPendingReviews() {
    set({ isReviewLoading: true, reviewErrorMessage: "" });
    try {
      const pendingReviews = await listPendingReviews();
      set({ pendingReviews });
    } catch (error) {
      set({ reviewErrorMessage: error.message });
      throw error;
    } finally {
      set({ isReviewLoading: false });
    }
  },
  async submitReviewDecision(proposalId, decision, remarks) {
    set({ isReviewSaving: true, reviewErrorMessage: "" });
    try {
      const payload = { remarks };
      const updatedProposal =
        decision === "approved"
          ? await approveProposalReview(proposalId, payload)
          : await rejectProposalReview(proposalId, payload);

      set((state) => ({
        pendingReviews: state.pendingReviews.filter(
          (proposal) => proposal.id !== updatedProposal.id,
        ),
        latestDecision: updatedProposal.review_decisions.at(-1) ?? null,
      }));

      useUiStore.getState().pushToast({
        title:
          decision === "approved" ? "Proposal approved" : "Proposal rejected",
        message: `Faculty decision for "${updatedProposal.title}" has been recorded.`,
        tone: decision === "approved" ? "success" : "warning",
      });

      return updatedProposal;
    } catch (error) {
      set({ reviewErrorMessage: error.message });
      useUiStore.getState().pushToast({
        title: "Decision failed",
        message: error.message,
        tone: "error",
      });
      throw error;
    } finally {
      set({ isReviewSaving: false });
    }
  },
}));
