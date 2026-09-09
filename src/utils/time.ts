const pad = (value: number) => String(value).padStart(2, "0");

/** Formats a countdown as mm:ss, e.g. 30 -> "00:30". */
export function formatCountdown(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  return `${pad(Math.floor(safe / 60))}:${pad(safe % 60)}`;
}
