import { useNavigate } from "react-router-dom";
import { useAuth } from "../useAuth";
import { ROLE_INFO } from "../auth";

interface NavbarProps {
  theme: "dark" | "light";
  onToggleTheme: () => void;
  onOpenChat: () => void;
}

/**
 * Top navigation bar. Primary page navigation now lives in the left sidebar;
 * the navbar holds the brand, the AI assistant launcher, the theme toggle, the
 * signed-in identity, and logout.
 */
export default function Navbar({ theme, onToggleTheme, onOpenChat }: NavbarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">PenguWave 🐧</div>
      <div className="navbar-links">
        <button
          onClick={onOpenChat}
          className="btn-secondary btn-sm"
          title="Open the AI security assistant (demo)"
        >
          🤖 Ask Pengu
        </button>
        <button
          onClick={onToggleTheme}
          className="btn-secondary btn-icon"
          title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          aria-label="Toggle color theme"
        >
          {theme === "dark" ? "☀️" : "🌙"}
        </button>
        {user && (
          <>
            <span className="navbar-user" title={`${user.email} · ${ROLE_INFO[user.role].label}`}>
              {user.email}
              <span className="navbar-role">{ROLE_INFO[user.role].label}</span>
            </span>
            <button onClick={handleLogout} className="btn-secondary btn-sm">
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
