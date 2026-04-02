import { getLocalJson, setLocalJson } from "./local-storage";

export const parseEnvPct = (envVar: string | undefined): number => {
  const parsed = Number(envVar);
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 100) {
    throw new Error(`Invalid percentage env var value: "${envVar}"`);
  }
  return parsed;
};

export const drawFromUniform = (pctTrue: number): boolean =>
  Math.random() < pctTrue / 100;

/**
 * Returns the bucketed boolean for an experiment, persisting it to localStorage
 * so returning users stay in the same bucket.
 *
 * On first call: draws from a uniform distribution at `pctTrue`% probability
 * and stores the result. On subsequent calls: returns the stored value.
 *
 * @param storageKey
 * @param experimentName
 * @param pctTrue
 */
export const getBucketedValue = (
  storageKey: string,
  experimentName: string,
  pctTrue: number,
): boolean => {
  const stored = getLocalJson<Record<string, boolean>>(storageKey) ?? {};
  if (experimentName in stored) return stored[experimentName];
  const result = drawFromUniform(pctTrue);
  setLocalJson(storageKey, { ...stored, [experimentName]: result });
  return result;
};
