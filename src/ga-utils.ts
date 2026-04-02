import { pollUntil } from "./interval-immediate";

/**
 * Format properties for the Adeptmind AB exposure event.
 * Returns a string of key-value pairs sorted by key in the following format:
 * key1:value1;key2:value2;...
 *
 * @param properties - The properties to format.
 * @returns A formatted string of properties.
 */
export const formatProperties = (properties: Record<string, string>): string =>
  Object.entries(properties)
    .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
    .map(([key, value]) => `${key}:${value}`)
    .join(";");

export const withGtag = (fn: () => void, onFailure?: () => void) => {
  pollUntil(() => !!window.gtag, fn, 200, 80, onFailure);
};

export const sendGa4Segment = (params: {
  gaMeasurementId: string;
  experimentName: string;
  variant: string;
}) => {
  withGtag(() => {
    window.gtag?.("event", "adeptmind_ab_exposure", {
      send_to: params.gaMeasurementId,
      adeptmind_ab_event: formatProperties({
        [params.experimentName]: params.variant,
      }),
    });
  });
};
