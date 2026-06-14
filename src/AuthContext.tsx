import { useCallback, useMemo, useState } from "react";
import { Role, canAccess, clearAuth, mockLogin, readAuth, Page } from "./auth";
import { AuthContext } from "./useAuth";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState(readAuth);

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
