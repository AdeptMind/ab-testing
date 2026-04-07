import { afterEach, describe, expect, it, vi } from "vitest";
import { drawFromUniform, getBucketedValue, parseEnvPct } from "./index";

describe("parseEnvPct", () => {
  it("parses a valid percentage string like '75' to 75", () => {
    expect(parseEnvPct("75")).toBe(75);
  });

  it("parses boundary value '0' to 0", () => {
    expect(parseEnvPct("0")).toBe(0);
  });

  it("parses boundary value '100' to 100", () => {
    expect(parseEnvPct("100")).toBe(100);
  });

  it("throws on undefined (missing env var)", () => {
    expect(() => parseEnvPct(undefined)).toThrow(
      'Invalid percentage env var value: "undefined"',
    );
  });

  it("throws on values above 100", () => {
    expect(() => parseEnvPct("101")).toThrow("Invalid percentage env var");
  });

  it("throws on values below 0", () => {
    expect(() => parseEnvPct("-1")).toThrow("Invalid percentage env var");
  });

  it("throws on non-numeric strings like 'abc'", () => {
    expect(() => parseEnvPct("abc")).toThrow("Invalid percentage env var");
  });
});

describe("drawFromUniform", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns true when random value falls below threshold", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.3);

    expect(drawFromUniform(50)).toBe(true);
  });

  it("returns false when random value falls above threshold", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.8);

    expect(drawFromUniform(50)).toBe(false);
  });

  it("0% always returns false", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);

    expect(drawFromUniform(0)).toBe(false);
  });

  it("100% always returns true", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.99);

    expect(drawFromUniform(100)).toBe(true);
  });
});

describe("getBucketedValue", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("assigns a user to a bucket on first visit", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.3);

    const result = getBucketedValue("ab-tests", "homepage-redesign", 50);

    expect(result).toBe(true);
  });

  it("returns the same bucket on subsequent calls (sticky assignment)", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.3);
    getBucketedValue("ab-tests", "homepage-redesign", 50);

    vi.spyOn(Math, "random").mockReturnValue(0.9);
    const secondCall = getBucketedValue("ab-tests", "homepage-redesign", 50);

    expect(secondCall).toBe(true);
  });

  it("supports multiple experiments under one storage key independently", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.3);
    getBucketedValue("ab-tests", "experiment-a", 50);

    vi.spyOn(Math, "random").mockReturnValue(0.9);
    const resultB = getBucketedValue("ab-tests", "experiment-b", 50);

    expect(resultB).toBe(false);
  });

  it("new experiments don't overwrite existing experiment assignments", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.3);
    getBucketedValue("ab-tests", "experiment-a", 50);

    vi.spyOn(Math, "random").mockReturnValue(0.9);
    getBucketedValue("ab-tests", "experiment-b", 50);

    const storedA = getBucketedValue("ab-tests", "experiment-a", 50);
    expect(storedA).toBe(true);
  });
});
