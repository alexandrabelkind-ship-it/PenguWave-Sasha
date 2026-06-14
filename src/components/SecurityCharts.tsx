import { useMemo, useState } from "react";
import { SecurityEvent } from "../types";
import { SEVERITIES, severityColor } from "../severity";
import HelpTip from "./HelpTip";

type TabKey = "severity" | "timeline" | "categories";

const TABS: { key: TabKey; label: string; help: string }[] = [
  {
    key: "severity",
    label: "Severity Mix",
    help: "How detected events break down by severity. A high share of CRITICAL/HIGH means more events demand immediate triage.",
  },
  {
    key: "timeline",
    label: "Events Over Time",
    help: "Daily event volume. Sudden spikes often indicate an active incident, campaign, or misconfiguration worth investigating.",
  },
  {
    key: "categories",
    label: "Top Threat Types",
    help: "The most common tags across events — your dominant attack techniques and threat categories. Useful for prioritizing defenses.",
  },
];

/**
 * Security visualizations for the dashboard. A tab switcher toggles between the
 * three views most useful to an analyst at a glance: the severity mix (what to
 * prioritize), event volume over time (when something is happening), and the
 * top threat categories (what kind of activity dominates).
 */
export default function SecurityCharts({ events }: { events: SecurityEvent[] }) {
  const [tab, setTab] = useState<TabKey>("severity");
  const activeHelp = TABS.find((t) => t.key === tab)!.help;

  return (
    <section className="chart-panel">
      <div className="chart-header">
        <h2 className="section-title">
          Security Insights
          <HelpTip text="Interactive charts summarizing your event data. Switch tabs to explore severity, trends over time, and threat categories." />
        </h2>
        <div className="chart-tabs" role="tablist" aria-label="Chart views">
          {TABS.map((t) => (
            <button
              key={t.key}
              role="tab"
              aria-selected={tab === t.key}
              className={`chart-tab${tab === t.key ? " active" : ""}`}
              onClick={() => setTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <p className="chart-caption">
        {activeHelp}
      </p>

      <div className="chart-body" role="tabpanel">
        {tab === "severity" && <SeverityDonut events={events} />}
        {tab === "timeline" && <EventsTimeline events={events} />}
        {tab === "categories" && <TopThreatsBar events={events} />}
      </div>
    </section>
  );
}

/* ----------------------------- Severity donut ---------------------------- */

const DONUT_R = 45;
const DONUT_C = 2 * Math.PI * DONUT_R;

function SeverityDonut({ events }: { events: SecurityEvent[] }) {
  const data = useMemo(() => {
    const counts: Record<string, number> = {};
    events.forEach((e) => (counts[e.severity] = (counts[e.severity] ?? 0) + 1));
    return SEVERITIES.map((s) => ({ severity: s, count: counts[s] ?? 0 })).filter(
      (d) => d.count > 0
    );
  }, [events]);

  const total = data.reduce((sum, d) => sum + d.count, 0);

  if (total === 0) return <EmptyChart />;

  let offset = 0;
  return (
    <div className="donut-wrap">
      <svg viewBox="0 0 120 120" className="donut-svg" role="img" aria-label="Events by severity">
        <g transform="rotate(-90 60 60)">
          {data.map((d) => {
            const len = (d.count / total) * DONUT_C;
            const seg = (
              <circle
                key={d.severity}
                cx="60"
                cy="60"
                r={DONUT_R}
                fill="none"
                stroke={severityColor(d.severity)}
                strokeWidth="18"
                strokeDasharray={`${len} ${DONUT_C - len}`}
                strokeDashoffset={-offset}
              />
            );
            offset += len;
            return seg;
          })}
        </g>
        <text x="60" y="56" textAnchor="middle" className="donut-total">
          {total}
        </text>
        <text x="60" y="70" textAnchor="middle" className="donut-sub">
          events
        </text>
      </svg>
      <ul className="donut-legend">
        {data.map((d) => (
          <li key={d.severity}>
            <span className="legend-swatch" style={{ background: severityColor(d.severity) }} />
            <span className="legend-label">{d.severity}</span>
            <span className="legend-value">
              {d.count} ({Math.round((d.count / total) * 100)}%)
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------------------------- Events timeline ---------------------------- */

const TL_W = 520;
const TL_H = 200;
const TL_PAD = { top: 12, right: 12, bottom: 28, left: 32 };

function EventsTimeline({ events }: { events: SecurityEvent[] }) {
  const series = useMemo(() => {
    const byDay = new Map<string, number>();
    events.forEach((e) => {
      const t = new Date(e.timestamp);
      if (isNaN(t.getTime())) return;
      const day = t.toISOString().slice(0, 10); // YYYY-MM-DD
      byDay.set(day, (byDay.get(day) ?? 0) + 1);
    });
    return [...byDay.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([day, count]) => ({ day, count }));
  }, [events]);

  if (series.length === 0) return <EmptyChart />;

  const maxCount = Math.max(...series.map((d) => d.count));
  const plotW = TL_W - TL_PAD.left - TL_PAD.right;
  const plotH = TL_H - TL_PAD.top - TL_PAD.bottom;

  // x position for a point; single-point series sits in the middle.
  const xAt = (i: number) =>
    TL_PAD.left + (series.length === 1 ? plotW / 2 : (i / (series.length - 1)) * plotW);
  const yAt = (count: number) => TL_PAD.top + plotH - (count / maxCount) * plotH;

  const linePoints = series.map((d, i) => `${xAt(i)},${yAt(d.count)}`).join(" ");
  const areaPoints = `${TL_PAD.left},${TL_PAD.top + plotH} ${linePoints} ${
    TL_PAD.left + plotW
  },${TL_PAD.top + plotH}`;

  const formatDay = (day: string) =>
    new Date(`${day}T00:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric" });

  return (
    <svg
      viewBox={`0 0 ${TL_W} ${TL_H}`}
      className="timeline-svg"
      role="img"
      aria-label="Event volume over time"
    >
      {/* horizontal gridlines + y labels at 0, mid, max */}
      {[0, 0.5, 1].map((frac) => {
        const y = TL_PAD.top + plotH - frac * plotH;
        const value = Math.round(frac * maxCount);
        return (
          <g key={frac}>
            <line
              x1={TL_PAD.left}
              y1={y}
              x2={TL_PAD.left + plotW}
              y2={y}
              className="chart-grid"
            />
            <text x={TL_PAD.left - 6} y={y + 3} textAnchor="end" className="chart-axis">
              {value}
            </text>
          </g>
        );
      })}

      <polygon points={areaPoints} className="timeline-area" />
      <polyline points={linePoints} className="timeline-line" />
      {series.map((d, i) => (
        <circle key={d.day} cx={xAt(i)} cy={yAt(d.count)} r="2.5" className="timeline-dot">
          <title>{`${d.day}: ${d.count} event(s)`}</title>
        </circle>
      ))}

      {/* first/last date labels along the x-axis */}
      <text x={xAt(0)} y={TL_H - 8} textAnchor="start" className="chart-axis">
        {formatDay(series[0].day)}
      </text>
      {series.length > 1 && (
        <text x={xAt(series.length - 1)} y={TL_H - 8} textAnchor="end" className="chart-axis">
          {formatDay(series[series.length - 1].day)}
        </text>
      )}
    </svg>
  );
}

/* --------------------------- Top threat types ---------------------------- */

function TopThreatsBar({ events }: { events: SecurityEvent[] }) {
  const data = useMemo(() => {
    const freq = new Map<string, number>();
    events.forEach((e) => e.tags.forEach((t) => freq.set(t, (freq.get(t) ?? 0) + 1)));
    return [...freq.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([tag, count]) => ({ tag, count }));
  }, [events]);

  if (data.length === 0) return <EmptyChart />;

  const max = Math.max(...data.map((d) => d.count));

  return (
    <div className="bars">
      {data.map((d) => (
        <div key={d.tag} className="bar-row">
          <span className="bar-label" title={d.tag}>{d.tag}</span>
          <div className="bar-track">
            <div className="bar-fill" style={{ width: `${(d.count / max) * 100}%` }} />
          </div>
          <span className="bar-value">{d.count}</span>
        </div>
      ))}
    </div>
  );
}

function EmptyChart() {
  return <div className="chart-empty">No data to chart yet.</div>;
}
