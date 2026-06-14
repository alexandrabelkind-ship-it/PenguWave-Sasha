import { useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../useAuth";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import ChatWidget from "./ChatWidget";

interface AppLayoutProps {
  theme: "dark" | "light";
  onToggleTheme: () => void;
}

/**
 * Authenticated app shell: top navbar + left sidebar + routed content. Anyone
 * who isn't signed in is bounced to the login page (preserving where they were
 * trying to go). The AI chat overlay is mounted here so it's reachable from any
 * page via the navbar button.
 */
export default function AppLayout({ theme, onToggleTheme }: AppLayoutProps) {
  const { user } = useAuth();
  const location = useLocation();
  const [chatOpen, setChatOpen] = useState(false);

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return (
    <>
      <Navbar
        theme={theme}
        onToggleTheme={onToggleTheme}
        onOpenChat={() => setChatOpen(true)}
      />
      <div className="app-shell">
        <Sidebar />
        <main className="app-main">
          <Outlet />
        </main>
      </div>
      {chatOpen && <ChatWidget onClose={() => setChatOpen(false)} />}
    </>
  );
}
