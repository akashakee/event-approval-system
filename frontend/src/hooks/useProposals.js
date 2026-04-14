import { useEffect, useState } from "react";
import {
  createProposal,
  listMyProposals,
  updateProposal,
} from "../services/proposalService";

export function useProposals(enabled = true) {
  const [proposals, setProposals] = useState([]);
  const [isLoading, setIsLoading] = useState(enabled);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function refreshProposals() {
    if (!enabled) {
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const data = await listMyProposals();
      setProposals(data);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    refreshProposals();
  }, [enabled]);

  async function submitProposal(formValues, proposalId = null) {
    setIsSaving(true);
    setErrorMessage("");

    try {
      const savedProposal = proposalId
        ? await updateProposal(proposalId, formValues)
        : await createProposal(formValues);

      setProposals((currentProposals) => {
        const remaining = currentProposals.filter(
          (proposal) => proposal.id !== savedProposal.id,
        );
        return [savedProposal, ...remaining].sort(
          (left, right) =>
            new Date(right.updated_at).getTime() -
            new Date(left.updated_at).getTime(),
        );
      });

      return savedProposal;
    } catch (error) {
      setErrorMessage(error.message);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }

  return {
    proposals,
    isLoading,
    isSaving,
    errorMessage,
    refreshProposals,
    submitProposal,
  };
}
