import { useEffect, useState } from "react";
import {
  approveProposalReview,
  listPendingReviews,
  rejectProposalReview,
} from "../services/proposalService";

export function useFacultyReviews(enabled = true) {
  const [pendingReviews, setPendingReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(enabled);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function refreshPendingReviews() {
    if (!enabled) {
      setPendingReviews([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const data = await listPendingReviews();
      setPendingReviews(data);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    refreshPendingReviews();
  }, [enabled]);

  async function submitDecision(proposalId, decision, remarks) {
    setIsSaving(true);
    setErrorMessage("");

    try {
      const payload = { remarks };
      const updatedProposal =
        decision === "approved"
          ? await approveProposalReview(proposalId, payload)
          : await rejectProposalReview(proposalId, payload);

      setPendingReviews((currentProposals) =>
        currentProposals.filter((proposal) => proposal.id !== updatedProposal.id),
      );

      return updatedProposal;
    } catch (error) {
      setErrorMessage(error.message);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }

  return {
    pendingReviews,
    isLoading,
    isSaving,
    errorMessage,
    refreshPendingReviews,
    submitDecision,
  };
}
