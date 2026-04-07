import { getLocalJson, setLocalJson } from "./local-storage";
import "./types";

/**
 * Parses an environment variable string as a percentage (0–100).
 *
 * Useful for configuring experiment rollout percentages from environment
 * variables (e.g., `REACT_APP_EXPERIMENT_PCT`).
 *
 * @param envVar - The raw string value from `process.env`. Must be a finite
 *   number between 0 and 100 inclusive.
 * @returns The parsed percentage as a number.
 * @throws If the value is `undefined`, non-numeric, or outside the 0–100 range.
 *
 * @example
 * ```ts
 * const pct = parseEnvPct(process.env.EXPERIMENT_ROLLOUT_PCT);
 * // "75" => 75
 * ```
 */
export const parseEnvPct = (envVar: string | undefined): number => {
  const parsed = Number(envVar);
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 100) {
    throw new Error(`Invalid percentage env var value: "${envVar}"`);
  }
  return parsed;
};

/**
 * Draws a boolean from a uniform random distribution.
 *
 * Returns `true` with probability `pctTrue / 100`. For example, `drawFromUniform(30)`
 * returns `true` ~30% of the time.
 *
 * Note: This is a **non-sticky** random draw — each call is independent.
 * For sticky (persistent) bucketing, use {@link getBucketedValue} instead.
 *
 * @param pctTrue - Probability of returning `true`, from 0 to 100 (not 0–1).
 * @returns `true` if the random draw falls within the percentage; `false` otherwise.
 *
 * @example
 * ```ts
 * if (drawFromUniform(50)) {
 *   showVariantA();
 * } else {
 *   showVariantB();
 * }
 * ```
 */
export const drawFromUniform = (pctTrue: number): boolean =>
  Math.random() < pctTrue / 100;

/**
 * Returns the bucketed boolean for an experiment, persisting it to localStorage
 * so returning users stay in the same bucket.
 *
 * - **First call**: draws from a uniform distribution at `pctTrue`% probability
 *   and stores the result under `storageKey → experimentName`.
 * - **Subsequent calls**: returns the stored value, ignoring `pctTrue`.
 *
 * Multiple experiments can share the same `storageKey` — each `experimentName`
 * is tracked independently within a single JSON object.
 *
 * @param storageKey - The localStorage key used to store all experiment assignments
 *   (e.g., `"ab-tests"`).
 * @param experimentName - A unique identifier for the experiment
 *   (e.g., `"homepage-redesign"`).
 * @param pctTrue - Probability (0–100) of assigning `true` on first draw.
 * @returns `true` if the user is in the experiment group; `false` for control.
 *
 * @remarks
 * Also sets `window.__adeptmind_ab__[experimentName]` so downstream systems
 * (e.g., Adobe Target) can read bucket assignments post-hydration.
 *
 * @example
 * ```ts
 * const overlayHPDP = getBucketedValue("ab-tests", "am-hpdp", 50);
 * if (overlayHPDP) {
 *   overlayHpdp();
 * }
 * ```
 */
export const getBucketedValue = (
  storageKey: string,
  experimentName: string,
  pctTrue: number,
): boolean => {
  const stored = getLocalJson<Record<string, boolean>>(storageKey) ?? {};
  const result =
    experimentName in stored
      ? stored[experimentName]
      : drawFromUniform(pctTrue);

  if (!(experimentName in stored)) {
    setLocalJson(storageKey, { ...stored, [experimentName]: result });
  }

  window.__adeptmind_ab__ ??= {};
  window.__adeptmind_ab__[experimentName] = result;

  return result;
};
