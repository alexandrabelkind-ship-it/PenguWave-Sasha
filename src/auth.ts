// Authentication & role-based access control (RBAC).
//
// NOTE: This is a MOCK auth layer for the prototype. The "login" accepts any
// credentials and the role is chosen by the user. Identity lives in
// localStorage so it survives reloads. As with isAdmin() in utils.ts, none of
// this is a real security control — the backend MUST enforce authorization on
// every request. Here it only decides what UI to show.

export const ROLES = ["admin", "analyst", "viewer"] as const;
export type Role = (typeof ROLES)[number];

/** The pages guarded by RBAC. */
export type Page = "dashboard" | "events" | "users";

export interface AuthUser {
  email: string;
  role: Role;
}

/** Human-friendly metadata for the role-picker on the login page. */
export const ROLE_INFO: Record<Role, { label: string; icon: string; blurb: string }> = {
  admin: {
    label: "Admin",
    icon: "🛡️",
    blurb: "Full access to every page, including user management.",
  },
  analyst: {
    label: "Analyst",
    icon: "🔬",
    blurb: "Investigate events and dashboards. No access to user management.",
  },
  viewer: {
    label: "Viewer",
    icon: "👁️",
    blurb: "Read-only access to the main dashboard overview.",
  },
};

// Which pages each role may access. Admin gets everything; analyst gets
// everything except Users; viewer is restricted to the Dashboard only.
const ACCESS: Record<Role, Page[]> = {
  admin: ["dashboard", "events", "users"],
  analyst: ["dashboard", "events"],
  viewer: ["dashboard"],
};

/** Whether a role is permitted to access a given page. */
export function canAccess(role: Role | null, page: Page): boolean {
  return role != null && ACCESS[role]?.includes(page);
}

const TOKEN_KEY = "token";
const ROLE_KEY = "role";
const EMAIL_KEY = "email";

function isRole(value: string | null): value is Role {
  return value != null && (ROLES as readonly string[]).includes(value);
}

/** Read the persisted auth user, or null when logged out. */
export function readAuth(): AuthUser | null {
  if (!localStorage.getItem(TOKEN_KEY)) return null;
  const role = localStorage.getItem(ROLE_KEY);
  const email = localStorage.getItem(EMAIL_KEY);
  if (!isRole(role) || !email) return null;
  return { email, role };
}

/**
 * Mock sign-in: succeeds for any email/password and trusts the chosen role.
 * Persists a throwaway token plus the identity so reloads stay logged in.
 */
export function mockLogin(role: Role, email: string): AuthUser {
  localStorage.setItem(TOKEN_KEY, `mock-${role}-token`);
  localStorage.setItem(ROLE_KEY, role);
  localStorage.setItem(EMAIL_KEY, email);
  return { email, role };
}

/** Clear the persisted session. */
export function clearAuth(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(ROLE_KEY);
  localStorage.removeItem(EMAIL_KEY);
}
