import { createContext, useContext } from "react";
import { AuthUser, Page, Role } from "./auth";

export interface AuthContextValue {
  user: AuthUser | null;
  /** Mock sign-in with the chosen role; any credentials are accepted. */
  login: (role: Role, email: string) => void;
  logout: () => void;
  /** Whether the current user may access a given page. */
  can: (page: Page) => boolean;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

/** Access the auth context. Throws if used outside <AuthProvider>. */
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
