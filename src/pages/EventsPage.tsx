import { useCallback, useEffect, useState } from "react";
import mockEvents from "../../data/mock_events.json";
import { SecurityEvent } from "../types";
import { sanitizeHtml, toCsv, normalizeEvent } from "../utils";

type LoadStatus = "loading" | "error" | "success";

// Demo only: a small delay so the loading state is visible. Remove once the
// real API call (which has genuine latency) replaces the mock loader below.
const SIMULATED_LATENCY_MS = 600;

/**
 * Load and normalize events. Currently backed by the static mock import; swap
 * the body for `getEvents()` from ../api when the backend exists — the caller
 * already handles loading, error, and empty states.
 */
function loadEvents(): Promise<SecurityEvent[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve((mockEvents as Record<string, unknown>[]).map(normalizeEvent));
    }, SIMULATED_LATENCY_MS);
  });
}

/** Format a timestamp, falling back gracefully for missing/invalid values. */
function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  return isNaN(date.getTime()) ? "—" : date.toLocaleString();
}

/** Trigger a client-side file download for the given text content. */
function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

const severityColor = (s: string) => {
  if (s === "CRITICAL") return "#7c3aed"; // purple
  if (s === "HIGH") return "red";
  if (s === "MEDIUM") return "orange";
  if (s === "LOW") return "green";
  return "#999"; // unknown severity → neutral grey
};

/** Placeholder table shown while events are loading. */
function SkeletonTable() {
  return (
    <table aria-hidden="true">
      <thead>
        <tr>
          <th>Severity</th>
          <th>Title</th>
          <th>Asset</th>
          <th>Source IP</th>
          <th>Timestamp</th>
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: 6 }).map((_, row) => (
          <tr key={row}>
            {Array.from({ length: 5 }).map((__, col) => (
              <td key={col}>
                <span className="skeleton-bar" />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function EventsPage() {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState("ALL");
  const [selectedEvent, setSelectedEvent] = useState<SecurityEvent | null>(null);

  const fetchEvents = useCallback(() => {
    loadEvents()
      .then((data) => {
        setEvents(data);
        setStatus("success");
      })
      .catch(() => setStatus("error"));
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const retry = () => {
    setStatus("loading");
    fetchEvents();
  };

  const clearFilters = () => {
    setSearch("");
    setSeverityFilter("ALL");
  };

  const filtered = events.filter((e) => {
    const q = search.toLowerCase();
    const matchesSearch =
      e.title.toLowerCase().includes(q) ||
      e.description.toLowerCase().includes(q) ||
      e.assetHostname.toLowerCase().includes(q);
    const matchesSeverity = severityFilter === "ALL" || e.severity === severityFilter;
    return matchesSearch && matchesSeverity;
  });

  const hasActiveFilter = search !== "" || severityFilter !== "ALL";

  return (
    <div className="page-container">
      <h1>Security Events</h1>

      {status === "loading" && <SkeletonTable />}

      {status === "error" && (
        <div className="error-banner" role="alert">
          <span>Couldn't load events. Something went wrong.</span>
          <button onClick={retry} className="btn-primary">
            Retry
          </button>
        </div>
      )}

      {status === "success" && (
        <>
          <div style={{ marginBottom: 16, display: "flex", gap: 12, alignItems: "center" }}>
            <input
              type="text"
              placeholder="Search events..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: "100%", maxWidth: 400 }}
            />
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              style={{ width: 140 }}
            >
              <option value="ALL">All Severities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>

          {search && (
            <p>
              Showing results for: <strong>{search}</strong> ({filtered.length} events)
            </p>
          )}

          {events.length === 0 ? (
            // No events exist at all (empty data source).
            <div className="empty-state">
              <p>No events have been recorded yet.</p>
            </div>
          ) : filtered.length === 0 ? (
            // Events exist, but none match the current search/filter.
            <div className="empty-state">
              <p>No events match your search or filter.</p>
              {hasActiveFilter && (
                <button onClick={clearFilters} className="btn-primary">
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <>
              <table>
                <thead>
                  <tr>
                    <th>Severity</th>
                    <th>Title</th>
                    <th>Asset</th>
                    <th>Source IP</th>
                    <th>Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((event) => (
                    <tr
                      key={event.id}
                      onClick={() => setSelectedEvent(event)}
                      style={{ cursor: "pointer" }}
                    >
                      <td style={{ color: severityColor(event.severity), fontWeight: 600 }}>
                        {event.severity}
                      </td>
                      <td>{event.title}</td>
                      <td style={{ fontFamily: "monospace", fontSize: 13 }}>
                        {event.assetHostname}
                      </td>
                      <td style={{ fontFamily: "monospace", fontSize: 13 }}>
                        {event.sourceIp}
                      </td>
                      <td style={{ fontSize: 13 }}>{formatTimestamp(event.timestamp)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
                <button
                  onClick={() =>
                    downloadFile(
                      JSON.stringify(filtered, null, 2),
                      "penguwave_events_export.json",
                      "application/json"
                    )
                  }
                  style={{ fontSize: 13 }}
                >
                  Export Events (JSON)
                </button>
                <button
                  onClick={() =>
                    downloadFile(
                      toCsv(filtered as unknown as Record<string, unknown>[]),
                      "penguwave_events_export.csv",
                      "text/csv"
                    )
                  }
                  style={{ fontSize: 13 }}
                >
                  Export Events (CSV)
                </button>
              </div>
            </>
          )}

          {/* Inline event detail */}
          {selectedEvent && (
            <div className="event-detail">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h2>{selectedEvent.title}</h2>
                <button onClick={() => setSelectedEvent(null)} style={{ cursor: "pointer" }}>
                  Close
                </button>
              </div>
              <p>
                <strong>Severity:</strong>{" "}
                <span style={{ color: severityColor(selectedEvent.severity) }}>
                  {selectedEvent.severity}
                </span>
              </p>
              <p>
                <strong>Description:</strong>
              </p>
              {/* Descriptions may contain limited rich-text markup; sanitize before rendering. */}
              <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(selectedEvent.description) }} />
              <p>
                <strong>Asset:</strong> {selectedEvent.assetHostname} ({selectedEvent.assetIp})
              </p>
              <p>
                <strong>Source IP:</strong> {selectedEvent.sourceIp}
              </p>
              <p>
                <strong>Tags:</strong>{" "}
                {selectedEvent.tags?.length ? selectedEvent.tags.join(", ") : "—"}
              </p>
              <p>
                <strong>Timestamp:</strong> {formatTimestamp(selectedEvent.timestamp)}
              </p>
              <h3>Raw Event Data</h3>
              <pre>{JSON.stringify(selectedEvent, null, 2)}</pre>
            </div>
          )}
        </>
      )}
    </div>
  );
}
