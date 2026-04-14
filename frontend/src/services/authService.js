import { apiClient } from "./apiClient";

export async function loginRequest(payload) {
  const response = await apiClient.post("/auth/login", payload);
  return response.data;
}

export async function getCurrentUser(accessToken) {
  const response = await apiClient.get("/auth/me", {
    skipAuthRedirect: true,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return response.data;
}
