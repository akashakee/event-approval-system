import { useEffect } from "react";
import { useWorkflowStore } from "../store/workflowStore";

export function useProposals(enabled = true) {
  const proposals = useWorkflowStore((state) => state.proposals);
  const isLoading = useWorkflowStore((state) => state.isProposalLoading);
  const isSaving = useWorkflowStore((state) => state.isProposalSaving);
  const errorMessage = useWorkflowStore((state) => state.proposalErrorMessage);
  const refreshProposals = useWorkflowStore((state) => state.refreshProposals);
  const submitProposal = useWorkflowStore((state) => state.submitProposal);
  const clearProposalState = useWorkflowStore((state) => state.clearProposalState);

  useEffect(() => {
    if (enabled) {
      refreshProposals().catch(() => {});
      return;
    }

    clearProposalState();
  }, [clearProposalState, enabled, refreshProposals]);

  return {
    proposals,
    isLoading,
    isSaving,
    errorMessage,
    refreshProposals,
    submitProposal,
  };
}
