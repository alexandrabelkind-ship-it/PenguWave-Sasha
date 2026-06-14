import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./AuthContext";
import AppLayout from "./components/AppLayout";
import RequireAccess from "./components/RequireAccess";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import EventsPage from "./pages/EventsPage";
import UsersPage from "./pages/UsersPage";
import NotFound from "./pages/NotFound";

type Theme = "dark" | "light";

function readTheme(): Theme {
  return localStorage.getItem("theme") === "light" ? "light" : "dark";
}

function App() {
  const [theme, setTheme] = useState<Theme>(readTheme);

  const toggleTheme = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("theme", next);
    document.documentElement.setAttribute("data-theme", next);
  };

  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        {/* Authenticated app shell (navbar + sidebar). */}
        <Route element={<AppLayout theme={theme} onToggleTheme={toggleTheme} />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route
            path="/dashboard"
            element={
              <RequireAccess page="dashboard">
                <DashboardPage />
              </RequireAccess>
            }
          />
          <Route
            path="/events"
            element={
              <RequireAccess page="events" pageName="Events">
                <EventsPage />
              </RequireAccess>
            }
          />
          <Route
            path="/users"
            element={
              <RequireAccess page="users" pageName="User Management">
                <UsersPage />
              </RequireAccess>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;
