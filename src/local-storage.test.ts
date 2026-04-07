import { describe, expect, it, vi } from "vitest";
import { getLocalJson, setLocalJson } from "./local-storage";

describe("getLocalJson", () => {
  it("returns null for a key that doesn't exist", () => {
    expect(getLocalJson("nonexistent")).toBeNull();
  });

  it("returns the parsed value for a stored JSON object", () => {
    localStorage.setItem("user", JSON.stringify({ name: "Alice", age: 30 }));

    expect(getLocalJson("user")).toEqual({ name: "Alice", age: 30 });
  });

  it("returns null when stored value is malformed JSON", () => {
    localStorage.setItem("broken", "{not valid json");
    vi.spyOn(console, "error").mockImplementation(() => {});

    expect(getLocalJson("broken")).toBeNull();
  });
});

describe("setLocalJson / getLocalJson roundtrip", () => {
  it("preserves arrays and nested objects", () => {
    const data = {
      tags: ["a", "b"],
      nested: { deep: { value: 42 } },
    };

    setLocalJson("complex", data);

    expect(getLocalJson("complex")).toEqual(data);
  });
});
