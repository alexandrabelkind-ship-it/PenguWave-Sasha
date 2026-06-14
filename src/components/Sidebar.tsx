import { NavLink } from "react-router-dom";
import { Page } from "../auth";
import { useAuth } from "../AuthContext";

interface NavItem {
  page: Page;
  to: string;
  label: string;
  icon: string;
}

const NAV_ITEMS: NavItem[] = [
  { page: "dashboard", to: "/dashboard", label: "Dashboard", icon: "📊" },
  { page: "events", to: "/events", label: "Events", icon: "🚨" },
  { page: "users", to: "/users", label: "Users", icon: "👥" },
];

/**
 * Left-hand navigation. Only the pages the current role may access are shown —
 * e.g. a Viewer sees just the Dashboard, and Users is admin-only. Direct URL
 * access to a forbidden page is still blocked by the route guard.
 */
export default function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { can } = useAuth();
  const items = NAV_ITEMS.filter((item) => can(item.page));

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        {items.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `sidebar-link${isActive ? " active" : ""}`}
            onClick={onNavigate}
          >
            <span className="sidebar-icon" aria-hidden="true">{icon}</span>
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
