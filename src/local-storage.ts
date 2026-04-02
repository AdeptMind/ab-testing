/**
 * Get JSON from local storage
 *
 * @param key - key to retrieve from local storage
 * @returns Value from local storage or null if not found
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
 * Set JSON to local storage
 *
 * @param key - key to store in local storage
 * @param value - value to store
 */
export const setLocalJson = <T>(key: string, value: T): void => {
  localStorage.setItem(key, JSON.stringify(value));
};
