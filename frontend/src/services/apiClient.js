import axios from "axios";
import { getStoredAuth } from "../store/authStore";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000/api";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const session = getStoredAuth();
  if (session?.accessToken) {
    config.headers.Authorization = `Bearer ${session.accessToken}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const errorMessage =
      error.response?.data?.detail ||
      error.message ||
      "Something went wrong while contacting the API.";

    return Promise.reject(new Error(errorMessage));
  },
);
