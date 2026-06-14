import { useEffect, useMemo, useState } from "react";
import { SecurityEvent } from "../types";
import { SEVERITIES, severityColor, SEVERITY_DESCRIPTIONS } from "../severity";
import { loadEvents } from "../eventsData";
import SecurityCharts from "../components/SecurityCharts";
import HelpTip from "../components/HelpTip";
import { useAuth } from "../useAuth";

type LoadStatus = "loading" | "error" | "success";

export default function DashboardPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [status, setStatus] = useState<LoadStatus>("loading");

  useEffect(() => {
    let active = true;
    loadEvents()
      .then((data) => {
        if (!active) return;
        setEvents(data);
        setStatus("success");
      })
      .catch(() => active && setStatus("error"));
    return () => {
      active = false;
    };
  }, []);

  const severityCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    events.forEach((e) => (counts[e.severity] = (counts[e.severity] ?? 0) + 1));
    return counts;
  }, [events]);

  return (
    <div className="page-container">
      <h1>
        Dashboard
        <HelpTip text="A high-level overview of your security posture: total event volume, the severity breakdown, and visual insights." />
      </h1>
      <p className="dashboard-greeting">
        Welcome back{user ? `, ${user.email}` : ""} — here's the current state of your environment.
      </p>

      {status === "loading" && (
        <div className="dashboard-summary">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="summary-stat">
              <span className="skeleton-bar" style={{ width: 60, height: 28 }} />
              <span className="skeleton-bar" style={{ width: 80 }} />
            </div>
          ))}
        </div>
      )}

      {status === "error" && (
        <div className="error-banner" role="alert">
          <span>Couldn't load dashboard data. Something went wrong.</span>
        </div>
      )}

      {status === "success" && (
        <>
          <section className="dashboard-summary">
            <div className="summary-stat summary-total">
              <span className="summary-stat-label">
                Total events
                <HelpTip text="The total number of security events currently recorded across all monitored assets." />
              </span>
              <span className="summary-stat-value">{events.length}</span>
            </div>

            {SEVERITIES.map((severity) => (
              <div key={severity} className="summary-stat">
                <span className="summary-stat-label">
                  <span
                    className="summary-dot"
                    style={{ background: severityColor(severity) }}
                    aria-hidden="true"
                  />
                  {severity}
                  <HelpTip position="bottom" text={SEVERITY_DESCRIPTIONS[severity]} />
                </span>
                <span className="summary-stat-value" style={{ color: severityColor(severity) }}>
                  {severityCounts[severity] ?? 0}
                </span>
              </div>
            ))}
          </section>

          <section className="severity-legend">
            <h2 className="section-title">
              What the severity levels mean
              <HelpTip text="Use these definitions to prioritize your response. Higher severities demand faster action." />
            </h2>
            <dl className="severity-legend-list">
              {SEVERITIES.map((severity) => (
                <div key={severity} className="severity-legend-item">
                  <dt>
                    <span className="severity-badge" style={{ backgroundColor: severityColor(severity) }}>
                      {severity}
                    </span>
                  </dt>
                  <dd>{SEVERITY_DESCRIPTIONS[severity]}</dd>
                </div>
              ))}
            </dl>
          </section>

          <SecurityCharts events={events} />
        </>
      )}
    </div>
  );
}
