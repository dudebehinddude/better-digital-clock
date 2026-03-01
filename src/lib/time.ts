/**
 * Options for formatting elapsed time.
 */
export interface FormatElapsedOptions {
  /** When true, always show the hours field (e.g. "00:00:00" instead of "00:00"). */
  alwaysShowHours?: boolean;
  /** When true, append milliseconds (e.g. ".000"). Defaults to true. */
  showMillis?: boolean;
}

/**
 * Returns a zero-duration string based on options (e.g. "00:00.000" or "00:00:00").
 * @internal
 */
function formatZero(options: FormatElapsedOptions): string {
  const { alwaysShowHours = false, showMillis = true } = options;
  const parts: string[] = [];
  if (alwaysShowHours) parts.push("00");
  parts.push("00", "00");
  let time = parts.join(":");
  if (showMillis) time += ".000";
  return time;
}

/**
 * Formats elapsed time between a start date and now (e.g. "00:01:23.456" or "01:23").
 * If `start` is undefined, returns a zero-duration string based on options.
 *
 * @param start - Start time, or undefined for zero duration
 * @param options - Format options (alwaysShowHours, showMillis)
 * @returns Formatted elapsed time string
 */
export function formatElapsed(
  start: Date | undefined,
  options: FormatElapsedOptions,
): string;
/**
 * Formats elapsed time between a start and end date.
 * If `start` is undefined, returns a zero-duration string based on options.
 *
 * @param start - Start time, or undefined for zero duration
 * @param end - End time
 * @param options - Format options (alwaysShowHours, showMillis)
 * @returns Formatted elapsed time string
 */
export function formatElapsed(
  start: Date | undefined,
  end: Date,
  options: FormatElapsedOptions,
): string;
export function formatElapsed(
  start: Date | undefined,
  endOrOptions: Date | FormatElapsedOptions,
  maybeOptions?: FormatElapsedOptions,
): string {
  const options: FormatElapsedOptions =
    endOrOptions instanceof Date ? (maybeOptions ?? {}) : (endOrOptions ?? {});
  const end = endOrOptions instanceof Date ? endOrOptions : new Date();

  if (start === undefined) {
    return formatZero(options);
  }

  const { alwaysShowHours = false, showMillis = true } = options;
  const millisecondsElapsed = end.getTime() - start.getTime();
  const secondsElapsed = Math.floor(millisecondsElapsed / 1000);
  const minutesElapsed = Math.floor(secondsElapsed / 60);
  const hours = Math.floor(minutesElapsed / 60);
  const minutes = minutesElapsed % 60;
  const seconds = secondsElapsed % 60;
  const milliseconds = millisecondsElapsed % 1000;

  let time =
    alwaysShowHours || hours > 0 ? `${hours.toString().padStart(2, "0")}:` : "";
  time += `${minutes.toString().padStart(2, "0")}:`;
  time += `${seconds.toString().padStart(2, "0")}`;
  if (showMillis && (hours === 0 || alwaysShowHours)) {
    time += `.${milliseconds.toString().padStart(3, "0")}`;
  }

  return time;
}

/**
 * Formats time remaining until a target date (countdown). If the target is in the past,
 * returns a zero-duration string based on options. Reuses the same formatting as
 * {@link formatElapsed}.
 *
 * @param target - Target time to count down to
 * @param options - Format options (alwaysShowHours, showMillis)
 * @returns Formatted time-remaining string, or zero string if target has passed
 */
export function formatUntil(
  target: Date,
  options: FormatElapsedOptions = { showMillis: false },
): string {
  const now = new Date();
  if (target.getTime() <= now.getTime()) {
    return formatElapsed(undefined, options);
  }
  return formatElapsed(now, target, options);
}

/**
 * Parses a flexible timer duration string to "HH:MM:SS".
 * - "90" → 90 seconds → "00:01:30"
 * - "70:00" → 70 min, 0 sec → "01:10:00"
 * - "1:10:00" or "01:10:00" → "01:10:00"
 * @returns Parsed "HH:MM:SS" or null if invalid
 */
export function parseTimerDuration(input: string): string | null {
  const raw = input.trim();
  if (raw === "") return "00:00:00";

  const parts = raw.split(":").map((p) => p.trim());
  let totalSeconds: number;

  if (parts.length === 1) {
    const s = parseInt(parts[0], 10);
    if (Number.isNaN(s) || s < 0) return null;
    totalSeconds = s;
  } else if (parts.length === 2) {
    const m = parseInt(parts[0], 10);
    const s = parseInt(parts[1], 10);
    if (Number.isNaN(m) || Number.isNaN(s) || m < 0 || s < 0 || s >= 60)
      return null;
    totalSeconds = m * 60 + s;
  } else if (parts.length === 3) {
    const h = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    const s = parseInt(parts[2], 10);
    if (
      Number.isNaN(h) ||
      Number.isNaN(m) ||
      Number.isNaN(s) ||
      h < 0 ||
      m < 0 ||
      s < 0 ||
      m >= 60 ||
      s >= 60
    )
      return null;
    totalSeconds = h * 3600 + m * 60 + s;
  } else {
    return null;
  }

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [
    hours.toString().padStart(2, "0"),
    minutes.toString().padStart(2, "0"),
    seconds.toString().padStart(2, "0"),
  ].join(":");
}
