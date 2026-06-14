import { createContext, useCallback, useContext, useMemo, useState } from "react";
import {
  AuthUser,
  Role,
  canAccess,
  clearAuth,
  mockLogin,
  readAuth,
  Page,
} from "./auth";

interface AuthContextValue {
  user: AuthUser | null;
  /** Mock sign-in with the chosen role; any credentials are accepted. */
  login: (role: Role, email: string) => void;
  logout: () => void;
  /** Whether the current user may access a given page. */
  can: (page: Page) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(readAuth);

  const login = useCallback((role: Role, email: string) => {
    setUser(mockLogin(role, email));
  }, []);

  const logout = useCallback(() => {
    clearAuth();
    setUser(null);
  }, []);

  const can = useCallback((page: Page) => canAccess(user?.role ?? null, page), [user]);

  const value = useMemo(() => ({ user, login, logout, can }), [user, login, logout, can]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/** Access the auth context. Throws if used outside <AuthProvider>. */
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
