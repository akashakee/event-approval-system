import { useEffect } from "react";
import { useWorkflowStore } from "../store/workflowStore";

export function useFacultyReviews(enabled = true) {
  const pendingReviews = useWorkflowStore((state) => state.pendingReviews);
  const latestDecision = useWorkflowStore((state) => state.latestDecision);
  const isLoading = useWorkflowStore((state) => state.isReviewLoading);
  const isSaving = useWorkflowStore((state) => state.isReviewSaving);
  const errorMessage = useWorkflowStore((state) => state.reviewErrorMessage);
  const refreshPendingReviews = useWorkflowStore((state) => state.refreshPendingReviews);
  const submitDecision = useWorkflowStore((state) => state.submitReviewDecision);
  const clearReviewState = useWorkflowStore((state) => state.clearReviewState);

  useEffect(() => {
    if (enabled) {
      refreshPendingReviews().catch(() => {});
      return;
    }

    clearReviewState();
  }, [clearReviewState, enabled, refreshPendingReviews]);

  return {
    pendingReviews,
    latestDecision,
    isLoading,
    isSaving,
    errorMessage,
    refreshPendingReviews,
    submitDecision,
  };
}
