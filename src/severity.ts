// Shared severity metadata so colours, ordering, and the canonical list stay
// consistent across the table, summary chips, and detail panel.

export const SEVERITIES = ["CRITICAL", "HIGH", "MEDIUM", "LOW"] as const;
export type Severity = (typeof SEVERITIES)[number];

const SEVERITY_COLORS: Record<string, string> = {
  CRITICAL: "#7c3aed", // purple
  HIGH: "#dc2626", // red
  MEDIUM: "#ea580c", // orange
  LOW: "#16a34a", // green
};

/** Colour for a severity; unknown/unexpected values fall through to grey. */
export function severityColor(severity: string): string {
  return SEVERITY_COLORS[severity] ?? "#999";
}

const SEVERITY_RANK: Record<string, number> = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };

/** Numeric rank for sorting (higher = more severe); unknowns sort lowest. */
export function severityRank(severity: string): number {
  return SEVERITY_RANK[severity] ?? 0;
}
