import { useState } from "react";
import { User } from "../types";
import { isAdmin } from "../utils";

export default function UsersPage() {
  // Client-side guard so non-admins don't see the management UI. This is a
  // convenience only — the real authorization MUST be enforced by the backend
  // on every /api/users request (see api_contract.md). See isAdmin() in utils.
  const [users, setUsers] = useState<User[]>([
    { id: "1", email: "admin@penguwave.io", role: "admin", status: "active" },
    { id: "2", email: "analyst@penguwave.io", role: "analyst", status: "active" },
    { id: "3", email: "viewer@penguwave.io", role: "viewer", status: "disabled" },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState("analyst");

  if (!isAdmin()) {
    return (
      <div className="page-container">
        <h1>User Management</h1>
        <p style={{ color: "var(--text-faint)" }}>
          You don't have permission to view this page. Admin access is required.
        </p>
      </div>
    );
  }

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

  const handleDelete = (id: string) => {
    if (!window.confirm("Delete this user? This cannot be undone.")) return;
    setUsers(users.filter((u) => u.id !== id));
  };

  return (
    <div className="page-container">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h1>User Management</h1>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "Add User"}
        </button>
      </div>

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
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>
                <span style={{ color: user.status === "active" ? "#16a34a" : "var(--text-faint)" }}>
                  {user.status}
                </span>
              </td>
              <td>
                <button
                  type="button"
                  onClick={() => handleDelete(user.id)}
                  style={{ color: "red", background: "none", border: "none", cursor: "pointer", padding: 0 }}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {users.length === 0 && <p style={{ color: "#999" }}>No users.</p>}
    </div>
  );
}
