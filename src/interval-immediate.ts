/**
 * Poll until a condition is met or max attempts reached.
 * Calls the check function immediately, then at each interval.
 *
 * @param check - function that returns truthy value when condition is met
 * @param onSuccess - callback when condition is met
 * @param interval - interval in milliseconds between checks
 * @param maxAttempts - maximum number of attempts before giving up
 * @param onFailure - optional callback when max attempts reached
 */
export const pollUntil = (
  check: () => boolean,
  onSuccess: () => void,
  interval: number,
  maxAttempts: number,
  onFailure?: () => void,
): void => {
  let attempts = 0;

  const tryCheck = () => {
    attempts++;
    if (check()) {
      clearInterval(intervalId);
      onSuccess();
    } else if (attempts >= maxAttempts) {
      clearInterval(intervalId);
      onFailure?.();
    }
  };

  const intervalId = window.setInterval(tryCheck, interval);
  tryCheck();
};
