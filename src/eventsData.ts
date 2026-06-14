// Shared events loader used by both the Events page and the Dashboard so the
// loading source lives in one place.
import mockEvents from "../data/mock_events.json";
import { SecurityEvent } from "./types";
import { normalizeEvent } from "./utils";

// Demo only: a small delay so the loading state is visible. Remove once the
// real API call (which has genuine latency) replaces the mock loader below.
const SIMULATED_LATENCY_MS = 600;

/**
 * Load and normalize events. Currently backed by the static mock import; swap
 * the body for `getEvents()` from ./api when the backend exists — callers
 * already handle loading, error, and empty states.
 */
export function loadEvents(): Promise<SecurityEvent[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve((mockEvents as Record<string, unknown>[]).map(normalizeEvent));
    }, SIMULATED_LATENCY_MS);
  });
}
