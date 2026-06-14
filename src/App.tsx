import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import LoginModal from "./components/LoginModal";
import EventsPage from "./pages/EventsPage";
import UsersPage from "./pages/UsersPage";
import NotFound from "./pages/NotFound";
import { logout } from "./api";

/** Read the current auth identity from localStorage (null when logged out). */
function readEmail(): string | null {
  return localStorage.getItem("token") ? localStorage.getItem("email") : null;
}

function App() {
  // Show the login modal on first visit unless it was already dismissed this
  // session. Computed lazily so we don't trigger an extra render via useEffect.
  const [showLogin, setShowLogin] = useState(
    () => !sessionStorage.getItem("login-dismissed")
  );
  const [userEmail, setUserEmail] = useState<string | null>(readEmail);

  const handleCloseLogin = () => {
    sessionStorage.setItem("login-dismissed", "true");
    setShowLogin(false);
    // A successful login persisted token/email; reflect it in the navbar.
    setUserEmail(readEmail());
  };

  const handleLogout = async () => {
    await logout();
    setUserEmail(null);
  };

  return (
    <>
      <Navbar
        userEmail={userEmail}
        onLoginClick={() => setShowLogin(true)}
        onLogout={handleLogout}
      />
      <div className="container">
        <Routes>
          <Route path="/" element={<Navigate to="/events" replace />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      {showLogin && <LoginModal onClose={handleCloseLogin} />}
    </>
  );
}

export default App;
