import { Link } from "react-router-dom";

/**
 * Friendly "insufficient permissions" screen shown when an authenticated user
 * navigates to a page their role can't access (e.g. a Viewer/Analyst opening
 * the admin-only Users page via a direct URL).
 */
export default function AccessDenied({ pageName }: { pageName?: string }) {
  return (
    <div className="access-denied">
      <div className="access-denied-icon" aria-hidden="true">🔒</div>
      <h1>Access denied</h1>
      <p className="access-denied-lead">
        You don't have permission to view{" "}
        {pageName ? <strong>{pageName}</strong> : "this page"}.
      </p>
      <p className="access-denied-sub">
        This area is restricted to administrators. If you believe you should have
        access, contact your workspace admin.
      </p>
      <Link to="/dashboard" className="btn-primary">
        ← Back to Dashboard
      </Link>
    </div>
  );
}
