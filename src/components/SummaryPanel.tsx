import { SEVERITIES, severityColor } from "../severity";

interface SummaryPanelProps {
  total: number;
  /** Count per severity, computed over the search/date/tag-filtered set. */
  severityCounts: Record<string, number>;
  /** Currently active severity filter ("ALL" when none). */
  activeSeverity: string;
  onSelectSeverity: (severity: string) => void;
  topTags: { tag: string; count: number }[];
}

export default function SummaryPanel({
  total,
  severityCounts,
  activeSeverity,
  onSelectSeverity,
  topTags,
}: SummaryPanelProps) {
  return (
    <div className="summary-panel">
      <div className="stat-card">
        <span className="stat-label">Total events</span>
        <span className="stat-total">{total}</span>
      </div>

      <div className="stat-card">
        <span className="stat-label">By severity</span>
        <div className="severity-chips">
          {SEVERITIES.map((severity) => {
            const active = activeSeverity === severity;
            return (
              <button
                key={severity}
                type="button"
                className={`severity-chip${active ? " active" : ""}`}
                style={{ backgroundColor: severityColor(severity) }}
                onClick={() => onSelectSeverity(severity)}
                aria-pressed={active}
                title={`Filter by ${severity}`}
              >
                {severity} <span className="chip-count">{severityCounts[severity] ?? 0}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="stat-card">
        <span className="stat-label">Top tags</span>
        <div className="tag-list">
          {topTags.length === 0 ? (
            <span style={{ color: "#999", fontSize: 13 }}>—</span>
          ) : (
            topTags.map(({ tag, count }) => (
              <span key={tag} className="tag-chip">
                {tag} <span className="chip-count">{count}</span>
              </span>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
