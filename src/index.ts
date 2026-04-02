import { sendGa4Segment } from "./ga-utils";
import { getLocalJson, setLocalJson } from "./local-storage";
import type { TrackEvent } from "./types";

export type { TrackEvent };

export const parseEnvPct = (envVar: string | undefined): number => {
  const parsed = Number(envVar);
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 100) {
    throw new Error(`Invalid percentage env var value: "${envVar}"`);
  }
  return parsed;
};

export const drawFromUniform = (pctTrue: number): boolean =>
  Math.random() < pctTrue / 100;

export const trackExperiment = (
  gaMeasurementId: string,
  experimentName: string,
  variant: string,
  trackEvent: TrackEvent,
) => {
  sendGa4Segment(
    {
      gaMeasurementId,
      experimentName,
      variant,
    },
    trackEvent,
  );

  trackEvent({
    event: "session:add_segment",
    data: {
      segment: `ab:${experimentName}:${variant}`,
    },
  });
};

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

/**
 * Buckets the user and immediately tracks the result.
 * Combines getBucketedValue + trackExperiment for the common case.
 * The experimentName is used as both the localStorage key and the GA tracking name.
 *
 * @param storageKey
 * @param experimentName
 * @param pctTrue
 * @param gaMeasurementId
 * @param trackEvent
 * @param getVariant
 */
export const getBucketedValueAndTrack = (
  storageKey: string,
  experimentName: string,
  pctTrue: number,
  gaMeasurementId: string,
  trackEvent: TrackEvent,
  getVariant: (result: boolean) => string,
): boolean => {
  const result = getBucketedValue(storageKey, experimentName, pctTrue);
  trackExperiment(gaMeasurementId, experimentName, getVariant(result), trackEvent);
  return result;
};
