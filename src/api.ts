// API client for the PenguWave backend.
//
// The base URL is configurable via VITE_API_URL so the same build can target
// different environments. Secrets are NEVER hardcoded here — anything shipped
// to the browser bundle is public. The per-user bearer token (obtained at
// login) is the only credential the client holds.
const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

function authHeaders(extra: Record<string, string> = {}): Record<string, string> {
  const token = localStorage.getItem("token");
  return {
    ...extra,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

/**
 * Wrapper around fetch that enforces a consistent error contract: non-2xx
 * responses throw with the server-provided message, and the parsed JSON body
 * is returned on success. Without this, error bodies silently flow back to
 * callers as if they were valid data.
 */
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, init);
  let body: unknown = null;
  try {
    body = await res.json();
  } catch {
    // Response had no JSON body (e.g. a 204 or a network/proxy error page).
  }

  if (!res.ok) {
    const message =
      (body as { error?: string } | null)?.error ?? `Request failed (${res.status})`;
    throw new Error(message);
  }
  return body as T;
}

export interface AuthResponse {
  token: string;
  user: { id: string; email: string; role: string };
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const data = await request<AuthResponse>("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  localStorage.setItem("token", data.token);
  if (data.user?.role) {
    localStorage.setItem("role", data.user.role);
  }
  return data;
}

export async function logout(): Promise<void> {
  try {
    await request("/api/auth/logout", { method: "POST", headers: authHeaders() });
  } finally {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
  }
}

export async function getEvents() {
  return request("/api/events", { headers: authHeaders() });
}

export async function getUsers() {
  return request("/api/users", { headers: authHeaders() });
}

export async function createUser(user: { email: string; password: string; role: string }) {
  return request("/api/users", {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(user),
  });
}

export async function deleteUser(id: string) {
  return request(`/api/users/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
}
