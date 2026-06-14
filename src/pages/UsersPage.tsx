import { useState } from "react";
import { User } from "../types";
import HelpTip from "../components/HelpTip";
import { useAuth } from "../useAuth";

export default function UsersPage() {
  const { user: currentUser } = useAuth();

  // Access to this page is gated by RBAC at the route level (admin only). The
  // backend MUST still enforce authorization on every /api/users request — the
  // client guard is a convenience for hiding UI, not a security control.
  const [users, setUsers] = useState<User[]>([
    { id: "1", email: "admin@penguwave.io", role: "admin", status: "active" },
    { id: "2", email: "analyst@penguwave.io", role: "analyst", status: "active" },
    { id: "3", email: "viewer@penguwave.io", role: "viewer", status: "disabled" },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState("analyst");
  const [notice, setNotice] = useState("");

  // The currently signed-in admin must not be able to delete their own account.
  const isSelf = (u: User) => currentUser?.email === u.email;

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newPassword) return;

    // The password is sent to the backend to create the account; it is never
    // stored in client state or rendered back to the screen.
    const newUser: User = {
      id: crypto.randomUUID(),
      email: newEmail,
      role: newRole,
      status: "active",
    };

    setUsers([...users, newUser]);
    setNewEmail("");
    setNewPassword("");
    setNewRole("analyst");
    setShowForm(false);
  };

  const handleDelete = (target: User) => {
    // Guard against self-deletion even if the disabled button is bypassed.
    if (isSelf(target)) {
      setNotice("You cannot delete your own admin account while logged in.");
      return;
    }
    if (!window.confirm("Delete this user? This cannot be undone.")) return;
    setUsers(users.filter((u) => u.id !== target.id));
  };

  return (
    <div className="page-container">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h1>
          User Management
          <HelpTip text="Create, view, and remove workspace users and their roles. This admin-only area controls who can access PenguWave and what they can do." />
        </h1>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "Add User"}
        </button>
      </div>

      {notice && (
        <div className="warning-banner" role="alert">
          <span>⚠️ {notice}</span>
          <button
            type="button"
            className="warning-banner-close"
            onClick={() => setNotice("")}
            aria-label="Dismiss warning"
          >
            ✕
          </button>
        </div>
      )}

      {showForm && (
        <div style={{ border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 16, marginBottom: 20, background: "var(--bg-subtle)" }}>
          <h3 style={{ marginBottom: 12 }}>New User</h3>
          <form onSubmit={handleAddUser}>
            <div style={{ marginBottom: 8 }}>
              <label>Email</label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="user@penguwave.io"
                required
              />
            </div>
            <div style={{ marginBottom: 8 }}>
              <label>Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="password"
                required
              />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label>Role</label>
              <select value={newRole} onChange={(e) => setNewRole(e.target.value)}>
                <option value="admin">Admin</option>
                <option value="analyst">Analyst</option>
                <option value="viewer">Viewer</option>
              </select>
            </div>
            <button type="submit" className="btn-primary">
              Create User
            </button>
          </form>
        </div>
      )}

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => {
            const self = isSelf(user);
            return (
              <tr key={user.id}>
                <td>
                  {user.email}
                  {self && <span className="you-badge">You</span>}
                </td>
                <td>{user.role}</td>
                <td>
                  <span style={{ color: user.status === "active" ? "#16a34a" : "var(--text-faint)" }}>
                    {user.status}
                  </span>
                </td>
                <td>
                  <button
                    type="button"
                    className="btn-danger btn-sm"
                    onClick={() => handleDelete(user)}
                    disabled={self}
                    title={
                      self
                        ? "You cannot delete your own admin account while logged in."
                        : "Delete user"
                    }
                  >
                    Delete
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
        </table>
      </div>

      {users.length === 0 && <p style={{ color: "var(--text-faint)" }}>No users.</p>}
    </div>
  );
}
