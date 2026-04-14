import { apiClient } from "./apiClient";

export async function listMyProposals() {
  const response = await apiClient.get("/proposals/mine");
  return response.data;
}

export async function createProposal(payload) {
  const response = await apiClient.post("/proposals", payload);
  return response.data;
}

export async function updateProposal(proposalId, payload) {
  const response = await apiClient.put(`/proposals/${proposalId}`, payload);
  return response.data;
}
