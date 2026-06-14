import { useState } from "react";
import { SecurityEvent } from "../types";
import { severityColor } from "../severity";
import { formatTimestamp } from "../utils";

interface EventDetailProps {
  event: SecurityEvent;
  onClose: () => void;
}

export default function EventDetail({ event, onClose }: EventDetailProps) {
  const [showRaw, setShowRaw] = useState(false);

  const fields: { label: string; value: string }[] = [
    { label: "Asset hostname", value: event.assetHostname },
    { label: "Asset IP", value: event.assetIp },
    { label: "Source IP", value: event.sourceIp },
    { label: "Timestamp", value: formatTimestamp(event.timestamp) },
    { label: "User ID", value: event.userId },
  ];

  return (
    <div className="event-detail">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span className="severity-badge" style={{ backgroundColor: severityColor(event.severity) }}>
            {event.severity}
          </span>
          <h2 style={{ margin: 0 }}>{event.title}</h2>
        </div>
        <button onClick={onClose} style={{ cursor: "pointer" }}>
          Close
        </button>
      </div>

      {/* Rendered as plain text — never as HTML — to avoid injection. */}
      <p className="detail-description">{event.description}</p>

      <div className="detail-grid">
        {fields.map(({ label, value }) => (
          <div key={label} className="detail-field">
            <span className="detail-field-label">{label}</span>
            <span className="detail-field-value">{value}</span>
          </div>
        ))}
        <div className="detail-field detail-field-wide">
          <span className="detail-field-label">Tags</span>
          <div className="tag-list">
            {event.tags.length === 0 ? (
              <span className="detail-field-value">—</span>
            ) : (
              event.tags.map((tag) => (
                <span key={tag} className="tag-chip">
                  {tag}
                </span>
              ))
            )}
          </div>
        </div>
      </div>

      <button
        type="button"
        className="link-button"
        onClick={() => setShowRaw((v) => !v)}
        aria-expanded={showRaw}
      >
        {showRaw ? "Hide raw ▴" : "Show raw ▾"}
      </button>
      {showRaw && <pre>{JSON.stringify(event, null, 2)}</pre>}
    </div>
  );
}
