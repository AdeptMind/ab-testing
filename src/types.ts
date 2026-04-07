export type AbBuckets = Record<string, boolean>;

declare global {
  interface Window {
    __adeptmind_ab__: AbBuckets;
  }
}
