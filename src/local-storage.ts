/**
 * Reads a JSON value from localStorage and parses it.
 *
 * Returns `null` if the key doesn't exist or the stored value is not valid JSON.
 * Malformed data is handled gracefully — the error is logged and `null` is returned,
 * so callers can safely fall back to defaults.
 *
 * @param key - The localStorage key to read from.
 * @returns The parsed value, or `null` if missing or unparseable.
 *
 * @example
 * ```ts
 * const prefs = getLocalJson<{ theme: string }>("user-prefs");
 * // => { theme: "dark" } or null
 * ```
 */
export const getLocalJson = <T>(key: string): T | null => {
  const item = localStorage.getItem(key);
  if (item) {
    try {
      return JSON.parse(item) as T;
    } catch (e) {
      console.error(e);
    }
  }
  return null;
};

/**
 * Serializes a value as JSON and writes it to localStorage.
 *
 * @param key - The localStorage key to write to.
 * @param value - Any JSON-serializable value.
 *
 * @example
 * ```ts
 * setLocalJson("user-prefs", { theme: "dark" });
 * ```
 */
export const setLocalJson = <T>(key: string, value: T): void => {
  localStorage.setItem(key, JSON.stringify(value));
};
