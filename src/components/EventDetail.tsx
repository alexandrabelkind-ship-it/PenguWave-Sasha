import { useEffect, useState } from "react";
import { SecurityEvent } from "../types";
import { formatTimestamp } from "../utils";
import SeverityBadge from "./SeverityBadge";

interface EventDetailProps {
  event: SecurityEvent;
  onClose: () => void;
}

export default function EventDetail({ event, onClose }: EventDetailProps) {
  const [showRaw, setShowRaw] = useState(false);

  // Close on Escape, and lock background scroll while the drawer is open.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  const fields: { label: string; value: string }[] = [
    { label: "Asset hostname", value: event.assetHostname },
    { label: "Asset IP", value: event.assetIp },
    { label: "Source IP", value: event.sourceIp },
    { label: "Timestamp", value: formatTimestamp(event.timestamp) },
    { label: "User ID", value: event.userId },
  ];

  return (
    <div className="drawer-backdrop" onClick={onClose}>
      <div
        className="drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Event details"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="drawer-close" onClick={onClose} aria-label="Close details">
          ✕
        </button>

        <div className="drawer-header">
          <SeverityBadge severity={event.severity} />
          <h2>{event.title}</h2>
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
          className="btn-ghost btn-sm"
          onClick={() => setShowRaw((v) => !v)}
          aria-expanded={showRaw}
        >
          {showRaw ? "Hide raw ▴" : "Show raw ▾"}
        </button>
        {showRaw && <pre>{JSON.stringify(event, null, 2)}</pre>}
      </div>
    </div>
  );
}
