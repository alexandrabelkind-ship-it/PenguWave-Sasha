import { Navigate, useLocation } from "react-router-dom";
import { Page } from "../auth";
import { useAuth } from "../useAuth";
import AccessDenied from "./AccessDenied";

interface RequireAccessProps {
  /** The page being guarded; omit to require only that the user is signed in. */
  page?: Page;
  pageName?: string;
  children: React.ReactNode;
}

/**
 * Route guard. Unauthenticated users are redirected to the login page (with the
 * attempted location preserved). Authenticated users who lack access to the
 * requested page get a friendly Access Denied screen instead of the content.
 *
 * Reminder: this only controls the UI. Real authorization must be enforced
 * server-side on every request.
 */
export default function RequireAccess({ page, pageName, children }: RequireAccessProps) {
  const { user, can } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (page && !can(page)) {
    return <AccessDenied pageName={pageName} />;
  }

  return <>{children}</>;
}
