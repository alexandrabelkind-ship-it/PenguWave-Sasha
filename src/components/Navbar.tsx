import { Link, useLocation } from "react-router-dom";

interface NavbarProps {
  userEmail: string | null;
  theme: "dark" | "light";
  onToggleTheme: () => void;
  onLoginClick: () => void;
  onLogout: () => void;
}

export default function Navbar({
  userEmail,
  theme,
  onToggleTheme,
  onLoginClick,
  onLogout,
}: NavbarProps) {
  const location = useLocation();

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/events" style={{ textDecoration: "none", color: "inherit" }}>
          PenguWave 🐧
        </Link>
      </div>
      <div className="navbar-links">
        <Link
          to="/events"
          className={location.pathname.startsWith("/events") ? "active" : ""}
        >
          Events
        </Link>
        <Link
          to="/users"
          className={location.pathname === "/users" ? "active" : ""}
        >
          Users
        </Link>
        <button
          onClick={onToggleTheme}
          className="btn-secondary btn-icon"
          title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          aria-label="Toggle color theme"
        >
          {theme === "dark" ? "☀️" : "🌙"}
        </button>
        {userEmail ? (
          <>
            <span className="navbar-user" title={userEmail}>
              {userEmail}
            </span>
            <button onClick={onLogout} className="btn-secondary btn-sm">
              Logout
            </button>
          </>
        ) : (
          <button onClick={onLoginClick} className="btn-secondary btn-sm">
            Login
          </button>
        )}
      </div>
    </nav>
  );
}
