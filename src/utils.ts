// Shared helpers for PenguWave.
import DOMPurify from "dompurify";
import { SecurityEvent } from "./types";

/**
 * Sanitize a string before rendering it as HTML.
 * Strips dangerous markup so values can be safely shown to the user.
 */
export function sanitizeHtml(input: string): string {
  return DOMPurify.sanitize(input);
}

/**
 * Escape a single CSV field: wrap in double quotes and double any internal
 * quotes so commas, quotes, and newlines can't break the row structure.
 * Also neutralizes spreadsheet formula injection (=, +, -, @) by prefixing
 * a single quote when a value starts with one of those characters.
 */
function escapeCsvField(value: unknown): string {
  let str = value == null ? "" : String(value);
  if (/^[=+\-@]/.test(str)) {
    str = `'${str}`;
  }
  return `"${str.replace(/"/g, '""')}"`;
}

/**
 * Serialize a list of records to CSV for export.
 * Column headers are the union of all keys across rows so no field is dropped
 * when later rows have keys missing from the first one.
 */
export function toCsv(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return "";
  const headers = Array.from(
    rows.reduce((set, row) => {
      Object.keys(row).forEach((k) => set.add(k));
      return set;
    }, new Set<string>())
  );
  const lines = rows.map((r) => headers.map((h) => escapeCsvField(r[h])).join(","));
  return [headers.map(escapeCsvField).join(","), ...lines].join("\n");
}

/** Human-readable fallbacks for missing or empty event fields. */
const EVENT_FALLBACK = {
  text: "—",
  title: "Untitled event",
  description: "No description provided",
  userId: "Unknown",
} as const;

/** Coerce an unknown value to a trimmed string ("" if it isn't a string). */
function asTrimmedString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

/**
 * Normalize a raw (possibly messy, partial, or null-laden) event record into a
 * SecurityEvent that is safe to render. Missing/null/empty fields get
 * human-readable fallbacks. Unknown severities are preserved verbatim (upper-
 * cased) so the UI shows what was reported and colours it neutrally.
 *
 * Run this on load so the rest of the app can assume clean, complete events.
 */
export function normalizeEvent(raw: Record<string, unknown> | null | undefined): SecurityEvent {
  const e = raw ?? {};
  const tags = Array.isArray(e.tags)
    ? e.tags.filter((t): t is string => typeof t === "string")
    : [];

  return {
    id: asTrimmedString(e.id) || crypto.randomUUID(),
    timestamp: asTrimmedString(e.timestamp),
    severity: (asTrimmedString(e.severity).toUpperCase() || "UNKNOWN") as SecurityEvent["severity"],
    title: asTrimmedString(e.title) || EVENT_FALLBACK.title,
    description: asTrimmedString(e.description) || EVENT_FALLBACK.description,
    assetHostname: asTrimmedString(e.assetHostname) || EVENT_FALLBACK.text,
    assetIp: asTrimmedString(e.assetIp) || EVENT_FALLBACK.text,
    sourceIp: asTrimmedString(e.sourceIp) || EVENT_FALLBACK.text,
    tags,
    userId: asTrimmedString(e.userId) || EVENT_FALLBACK.userId,
  };
}

/**
 * Whether the current user has admin privileges.
 *
 * NOTE: This is a client-side convenience for hiding UI only. It is NOT a
 * security control — the value comes from localStorage and is trivially
 * spoofable. Authorization must be enforced by the backend on every request.
 */
export function isAdmin(): boolean {
  return localStorage.getItem("role") === "admin";
}
