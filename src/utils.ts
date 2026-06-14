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
 * Serialize a list of records to CSV for export.
 */
export function toCsv(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const lines = rows.map((r) =>
    headers.map((h) => {
      const value = String(r[h] ?? "");
      return `"${value.replace(/"/g, '""')}"`;  // ← CHANGED: wrap in quotes, escape internal quotes
    }).join(",")
  );
  return [headers.join(","), ...lines].join("\n");
}

/**
 * Whether the current user has admin privileges.
 */
export function isAdmin(): boolean {
  return localStorage.getItem("role") === "admin";
}
