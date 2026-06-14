import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div style={{ textAlign: "center", padding: "80px 20px" }}>
      <pre style={{ fontSize: 14, lineHeight: 1.3, display: "inline-block", textAlign: "left" }}>
{`
       .--.
      |o_o |
      |:_/ |
     //   \\ \\
    (|     | )
   /'\\_   _/\`\\
   \\___)=(___/
`}
      </pre>
      <h1 style={{ fontSize: 48, margin: "20px 0 10px", color: "var(--text)" }}>404</h1>
      <p style={{ fontSize: 18, color: "var(--text-muted)", marginBottom: 8 }}>
        This penguin got lost at sea 🐧
      </p>
      <p style={{ color: "var(--text-faint)", marginBottom: 30 }}>
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link to="/events" style={{ color: "var(--primary)" }}>
        ← Back to shore
      </Link>
    </div>
  );
}
