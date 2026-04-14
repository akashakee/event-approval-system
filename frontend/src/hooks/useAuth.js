import { useSyncExternalStore } from "react";
import {
  clearStoredAuth,
  getStoredAuth,
  setStoredAuth,
} from "../store/authStore";

let authState = getStoredAuth();
const listeners = new Set();

function emitChange() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return authState;
}

export function login(authPayload) {
  authState = authPayload;
  setStoredAuth(authPayload);
  emitChange();
}

export function logout() {
  authState = null;
  clearStoredAuth();
  emitChange();
}

export function useAuth() {
  const session = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  return {
    accessToken: session?.accessToken ?? null,
    isAuthenticated: Boolean(session?.accessToken),
    user: session?.user ?? null,
  };
}
