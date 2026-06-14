import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ROLES, ROLE_INFO, Role } from "../auth";
import { useAuth } from "../AuthContext";

/**
 * Dedicated, full-page login. The user first picks a role, which reveals the
 * email/password form. Authentication is mocked: any credentials succeed and
 * the chosen role determines what the user can access.
 */
export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Return the user to wherever they were headed before being bounced to login.
  const from = (location.state as { from?: string } | null)?.from ?? "/dashboard";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) return;
    // Mock auth: accept whatever was typed and log in as the selected role.
    login(selectedRole, email.trim() || `${selectedRole}@penguwave.io`);
    navigate(from, { replace: true });
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand">PenguWave 🐧</div>
        <h1 className="login-title">Sign in to your workspace</h1>
        <p className="login-subtitle">Choose a role to continue</p>

        <div className="role-grid" role="radiogroup" aria-label="Select a role">
          {ROLES.map((role) => {
            const info = ROLE_INFO[role];
            const active = selectedRole === role;
            return (
              <button
                key={role}
                type="button"
                role="radio"
                aria-checked={active}
                className={`role-card${active ? " active" : ""}`}
                onClick={() => setSelectedRole(role)}
              >
                <span className="role-icon" aria-hidden="true">{info.icon}</span>
                <span className="role-label">{info.label}</span>
                <span className="role-blurb">{info.blurb}</span>
              </button>
            );
          })}
        </div>

        {selectedRole && (
          <form className="login-form" onSubmit={handleSubmit}>
            <div style={{ marginBottom: 12 }}>
              <label htmlFor="login-email">Email</label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                autoFocus
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label htmlFor="login-password">Password</label>
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <button type="submit" className="btn-primary" style={{ width: "100%" }}>
              Login as {ROLE_INFO[selectedRole].label}
            </button>
            <p className="login-hint">
              Demo mode — any email and password will sign you in.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
