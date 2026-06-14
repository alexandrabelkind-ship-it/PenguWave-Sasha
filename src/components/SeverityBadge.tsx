import { severityColor } from "../severity";

/** Pill-shaped severity badge with a coloured background, shared by the table
 * and the detail panel so severities look consistent everywhere. */
export default function SeverityBadge({ severity }: { severity: string }) {
  return (
    <span className="severity-badge" style={{ backgroundColor: severityColor(severity) }}>
      {severity}
    </span>
  );
}
