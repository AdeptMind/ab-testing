export type TrackEvent = (params: {
  event: string;
  data?: Record<string, unknown>;
}) => void;
