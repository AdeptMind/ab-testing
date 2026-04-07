export type AbBuckets = Record<string, boolean>;

declare global {
  interface Window {
    adeptmind_ab_testing: AbBuckets;
  }
}
