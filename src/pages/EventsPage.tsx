import { useCallback, useEffect, useMemo, useState } from "react";
import mockEvents from "../../data/mock_events.json";
import { SecurityEvent } from "../types";
import { toCsv, normalizeEvent, formatTimestamp } from "../utils";
import { severityRank } from "../severity";
import SummaryPanel from "../components/SummaryPanel";
import EventDetail from "../components/EventDetail";
import SeverityBadge from "../components/SeverityBadge";

type LoadStatus = "loading" | "error" | "success";
type SortKey = "severity" | "title" | "assetHostname" | "sourceIp" | "timestamp";
type SortDir = "asc" | "desc";

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
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("asc");
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
    setDateFrom("");
    setDateTo("");
    setSelectedTags([]);
  };

  // Every unique tag, ordered by frequency, for the tag-filter chips.
  const allTags = useMemo(() => {
    const freq = new Map<string, number>();
    events.forEach((e) => e.tags.forEach((t) => freq.set(t, (freq.get(t) ?? 0) + 1)));
    return [...freq.entries()].sort((a, b) => b[1] - a[1]).map(([tag]) => tag);
  }, [events]);

  // Apply search + date + tags first. Severity is applied separately so the
  // severity chips can show meaningful counts within the current scope and act
  // as a severity switcher rather than collapsing to the active one.
  const baseFiltered = useMemo(() => {
    const q = search.toLowerCase();
    const fromTime = dateFrom ? new Date(`${dateFrom}T00:00:00`).getTime() : null;
    const toTime = dateTo ? new Date(`${dateTo}T23:59:59.999`).getTime() : null;

    return events.filter((e) => {
      const matchesSearch =
        e.title.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.assetHostname.toLowerCase().includes(q);

      let matchesDate = true;
      if (fromTime !== null || toTime !== null) {
        const t = new Date(e.timestamp).getTime();
        if (isNaN(t)) matchesDate = false;
        else if (fromTime !== null && t < fromTime) matchesDate = false;
        else if (toTime !== null && t > toTime) matchesDate = false;
      }

      // OR semantics: an event matches if it carries any of the selected tags.
      const matchesTags =
        selectedTags.length === 0 || e.tags.some((t) => selectedTags.includes(t));

      return matchesSearch && matchesDate && matchesTags;
    });
  }, [events, search, dateFrom, dateTo, selectedTags]);

  const filtered = useMemo(
    () => baseFiltered.filter((e) => severityFilter === "ALL" || e.severity === severityFilter),
    [baseFiltered, severityFilter]
  );

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    const copy = [...filtered];
    copy.sort((a, b) => {
      let cmp: number;
      if (sortKey === "severity") {
        cmp = severityRank(a.severity) - severityRank(b.severity);
      } else if (sortKey === "timestamp") {
        cmp = (new Date(a.timestamp).getTime() || 0) - (new Date(b.timestamp).getTime() || 0);
      } else {
        cmp = a[sortKey].localeCompare(b[sortKey]);
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return copy;
  }, [filtered, sortKey, sortDir]);

  // Severity counts use baseFiltered so chips stay informative even while a
  // severity is selected; total and top tags reflect the final filtered view.
  const severityCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    baseFiltered.forEach((e) => {
      counts[e.severity] = (counts[e.severity] ?? 0) + 1;
    });
    return counts;
  }, [baseFiltered]);

  const topTags = useMemo(() => {
    const freq = new Map<string, number>();
    filtered.forEach((e) => e.tags.forEach((t) => freq.set(t, (freq.get(t) ?? 0) + 1)));
    return [...freq.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([tag, count]) => ({ tag, count }));
  }, [filtered]);

  const hasActiveFilter =
    search !== "" ||
    severityFilter !== "ALL" ||
    dateFrom !== "" ||
    dateTo !== "" ||
    selectedTags.length > 0;

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const handleSelectSeverity = (severity: string) => {
    setSeverityFilter((prev) => (prev === severity ? "ALL" : severity));
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const sortIndicator = (key: SortKey) =>
    sortKey === key ? (sortDir === "asc" ? " ▲" : " ▼") : "";

  const columns: { key: SortKey; label: string }[] = [
    { key: "severity", label: "Severity" },
    { key: "title", label: "Title" },
    { key: "assetHostname", label: "Asset" },
    { key: "sourceIp", label: "Source IP" },
    { key: "timestamp", label: "Timestamp" },
  ];

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
          <SummaryPanel
            total={filtered.length}
            severityCounts={severityCounts}
            activeSeverity={severityFilter}
            onSelectSeverity={handleSelectSeverity}
            topTags={topTags}
          />

          <div className="filter-bar">
            <input
              type="text"
              placeholder="Search events..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ flex: "1 1 240px", maxWidth: 400 }}
            />
            <label className="date-field">
              From
              <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            </label>
            <label className="date-field">
              To
              <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            </label>
            {hasActiveFilter && (
              <button type="button" className="link-button" onClick={clearFilters}>
                Clear filters
              </button>
            )}
            <span className="result-count">
              Showing {sorted.length} of {events.length} events
            </span>
          </div>

          {allTags.length > 0 && (
            <div className="tag-filter">
              {allTags.map((tag) => {
                const active = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    className={`tag-chip clickable${active ? " active" : ""}`}
                    onClick={() => toggleTag(tag)}
                    aria-pressed={active}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          )}

          {events.length === 0 ? (
            <div className="empty-state">
              <p>No events have been recorded yet.</p>
            </div>
          ) : sorted.length === 0 ? (
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
                    {columns.map(({ key, label }) => (
                      <th
                        key={key}
                        className="sortable"
                        onClick={() => handleSort(key)}
                        aria-sort={
                          sortKey === key ? (sortDir === "asc" ? "ascending" : "descending") : "none"
                        }
                      >
                        {label}
                        <span className="sort-indicator">{sortIndicator(key)}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((event) => (
                    <tr
                      key={event.id}
                      onClick={() => setSelectedEvent(event)}
                      className={selectedEvent?.id === event.id ? "selected" : undefined}
                      style={{ cursor: "pointer" }}
                    >
                      <td>
                        <SeverityBadge severity={event.severity} />
                      </td>
                      <td>{event.title}</td>
                      <td style={{ fontFamily: "monospace", fontSize: 13 }}>
                        {event.assetHostname}
                      </td>
                      <td style={{ fontFamily: "monospace", fontSize: 13 }}>{event.sourceIp}</td>
                      <td style={{ fontSize: 13 }}>{formatTimestamp(event.timestamp)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{ marginTop: 12, display: "flex", gap: 8, alignItems: "center" }}>
                <span style={{ fontSize: 13, color: "#666" }}>Export {sorted.length}:</span>
                <button
                  onClick={() =>
                    downloadFile(
                      JSON.stringify(sorted, null, 2),
                      "penguwave_events_export.json",
                      "application/json"
                    )
                  }
                  style={{ fontSize: 13 }}
                >
                  JSON
                </button>
                <button
                  onClick={() =>
                    downloadFile(
                      toCsv(sorted as unknown as Record<string, unknown>[]),
                      "penguwave_events_export.csv",
                      "text/csv"
                    )
                  }
                  style={{ fontSize: 13 }}
                >
                  CSV
                </button>
              </div>
            </>
          )}

          {selectedEvent && (
            <EventDetail event={selectedEvent} onClose={() => setSelectedEvent(null)} />
          )}
        </>
      )}
    </div>
  );
}
