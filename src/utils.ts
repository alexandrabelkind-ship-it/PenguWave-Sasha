// Shared helpers for PenguWave.
import DOMPurify from "dompurify";

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
