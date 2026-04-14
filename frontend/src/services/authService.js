import { apiClient } from "./apiClient";

export async function loginRequest(payload) {
  return apiClient("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getCurrentUser(accessToken) {
  return apiClient("/auth/me", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}
