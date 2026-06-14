import { useEffect, useId, useRef, useState } from "react";

interface HelpTipProps {
  /** Explanation of the feature/metric this icon sits next to. */
  text: string;
  /** Tooltip placement relative to the icon. Defaults to "top". */
  position?: "top" | "bottom" | "left" | "right";
}

/**
 * A small "?" affordance that explains a feature or metric. The tooltip shows
 * on hover (mouse) and toggles on click/Enter (touch + keyboard), and closes on
 * Escape or an outside click — so it works across input modalities.
 */
export default function HelpTip({ text, position = "top" }: HelpTipProps) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLSpanElement>(null);
  const tooltipId = useId();

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <span
      ref={wrapRef}
      className="helptip"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        className="helptip-icon"
        aria-label="More information"
        aria-describedby={open ? tooltipId : undefined}
        aria-expanded={open}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
      >
        ?
      </button>
      {open && (
        <span role="tooltip" id={tooltipId} className={`helptip-bubble helptip-${position}`}>
          {text}
        </span>
      )}
    </span>
  );
}
