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

/**
 * What each severity level means for PenguWave alerts. Shared so the dashboard,
 * tooltips, and any future legend describe severities consistently.
 */
export const SEVERITY_DESCRIPTIONS: Record<Severity, string> = {
  CRITICAL:
    "Active or imminent compromise — e.g. confirmed breach, ransomware, or data exfiltration. Requires immediate response.",
  HIGH:
    "Strong indicator of malicious activity, such as credential theft or a successful intrusion attempt. Investigate urgently.",
  MEDIUM:
    "Suspicious or anomalous behavior that warrants review but isn't confirmed malicious — e.g. policy violations or unusual access.",
  LOW:
    "Informational or low-risk events, like minor misconfigurations or benign anomalies. Useful for context and trend analysis.",
};

const SEVERITY_RANK: Record<string, number> = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };

/** Numeric rank for sorting (higher = more severe); unknowns sort lowest. */
export function severityRank(severity: string): number {
  return SEVERITY_RANK[severity] ?? 0;
}
