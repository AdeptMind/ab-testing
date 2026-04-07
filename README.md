# @adeptmind/ab-testing

Lightweight A/B experiment bucketing with localStorage persistence. Assign users to experiment groups with a single function call — assignments are sticky, so returning users always see the same variant.

## Install

```bash
npm install @adeptmind/ab-testing
```

## Quick Start

```ts
import { getBucketedValue, parseEnvPct } from "@adeptmind/ab-testing";

const pct = parseEnvPct(process.env.REACT_APP_HPDP_PCT);
const overlayHPDP = getBucketedValue("ab-tests", "am-hpdp", pct);

if (overlayHPDP) {
  overlayHpdp(); // overlay the host PDP with the HPDP experience
}
```

On the first visit, `getBucketedValue` randomly assigns the user to the experiment group and saves the result to localStorage. On every subsequent visit, the stored assignment is returned — no re-randomization.

## API Reference

### `getBucketedValue(storageKey, experimentName, pctTrue): boolean`

The main function. Assigns a user to an experiment bucket and persists the result.

| Parameter | Type | Description |
|---|---|---|
| `storageKey` | `string` | localStorage key for storing all experiment assignments (e.g., `"ab-tests"`) |
| `experimentName` | `string` | Unique identifier for the experiment (e.g., `"am-hpdp"`) |
| `pctTrue` | `number` | Probability (0–100) of assigning `true` on first draw |

**Returns** `true` if the user is in the experiment group, `false` for control.

---

### `parseEnvPct(envVar): number`

Parses an environment variable string as a percentage. Useful for configuring rollout percentages without hardcoding.

```ts
import { parseEnvPct } from "@adeptmind/ab-testing";

const pct = parseEnvPct(process.env.REACT_APP_EXPERIMENT_PCT);
const showFeature = getBucketedValue("ab-tests", "new-feature", pct);
```

**Throws** if the value is `undefined`, non-numeric, or outside 0–100.

---

### `drawFromUniform(pctTrue): boolean`

A single non-sticky random draw. Returns `true` with probability `pctTrue / 100`.

```ts
import { drawFromUniform } from "@adeptmind/ab-testing";

if (drawFromUniform(30)) {
  // ~30% chance per call — not persisted
}
```

---

### `getLocalJson<T>(key): T | null`

Reads and parses a JSON value from localStorage. Returns `null` if the key is missing or the data is malformed.

### `setLocalJson<T>(key, value): void`

Serializes a value as JSON and writes it to localStorage.

## How Bucketing Works

```
First visit:
  1. Read localStorage["ab-tests"]        → null (empty)
  2. Draw random number, compare to pctTrue → true
  3. Write localStorage["ab-tests"]        → { "am-hpdp": true }
  4. Set window.__adeptmind_ab__["am-hpdp"] = true
  5. Return true

Second visit:
  1. Read localStorage["ab-tests"]         → { "am-hpdp": true }
  2. Key "am-hpdp" exists                  → skip random draw
  3. Set window.__adeptmind_ab__["am-hpdp"] = true
  4. Return true
```

All experiments under the same `storageKey` are stored in a single JSON object. Adding a new experiment never overwrites existing assignments.

## Two-Tier Experimentation

This library is designed for a two-tier experimentation pattern:

**Tier 1 — AMT script** buckets `am-hpdp` at page load. If `true`, HPDP overlays the host PDP (only header, footer, and popups remain from the host page). The assignment is written to `window.__adeptmind_ab__` so Tier 2 can read it.

**Tier 2 — Host PDP's Alloy script (Adobe Target)** runs post-hydration and reads `window.__adeptmind_ab__["am-hpdp"]`:

- `true` — use default splits for other Adobe Target experiments (HPDP overlays the page, so these splits don't affect the HPDP experience)
- `false` — proceed with regular experiment splits on the native PDP (can proceed as if HPDP experiment does not exist)

```ts
// Tier 1 — AMT script at page load
import { getBucketedValue, parseEnvPct } from "@adeptmind/ab-testing";

const pct = parseEnvPct(process.env.REACT_APP_HPDP_PCT);
const overlayHPDP = getBucketedValue("ab-tests", "am-hpdp", pct);
// window.__adeptmind_ab__ === { "am-hpdp": true }

if (overlayHPDP) {
  overlayHpdp();
}

// Tier 2 — Adobe Target audience rule (post-hydration):
//   window.__adeptmind_ab__["am-hpdp"] === true  → lock target splits to a consistent default set. This ensures that HPDP does not affect other ongoing experiment data
//   window.__adeptmind_ab__["am-hpdp"] === false → regular experiment splitting logic as if HPDP does not exist
```

## FAQs

### How do I run an experiment at 50/50?

Pass `50` as the `pctTrue` parameter:

```ts
const inExperiment = getBucketedValue("ab-tests", "my-experiment", 50);
```

### How do users stay in the same bucket?

The first call writes the assignment to localStorage. Every subsequent call reads from localStorage and returns the stored value — the random draw only happens once.

### Can I run multiple experiments at once?

Yes. Use the same `storageKey` with different `experimentName` values. Each experiment is tracked independently:

```ts
const showNewNav = getBucketedValue("ab-tests", "new-nav", 50);
const showNewFooter = getBucketedValue("ab-tests", "new-footer", 30);
```

### How do I reset/clear an experiment?

Remove the assignment from localStorage:

```ts
localStorage.removeItem("ab-tests");
```

This clears **all** experiments under that key. To clear a single experiment, read the object, delete the key, and write it back:

```ts
const stored = JSON.parse(localStorage.getItem("ab-tests") ?? "{}");
delete stored["my-experiment"];
localStorage.setItem("ab-tests", JSON.stringify(stored));
```

### How does this work with Adobe Target?

Adobe Target (Tier 2) runs after page hydration via the host PDP's Alloy script. By that point, `getBucketedValue` has already written bucket assignments to `window.__adeptmind_ab__`. Adobe Target reads `window.__adeptmind_ab__["am-hpdp"]` in its audience rules: if `true`, it applies default splits for its own experiments (since HPDP overlays the page anyway); if `false`, it proceeds with regular experiment splits on the native PDP.

### Does this work with SSR?

No — this library depends on `localStorage`, which is only available in the browser. For server-side rendering, bucket on the server using a different mechanism (e.g., cookie-based or user-ID-based hashing) and pass the assignment to the client.

### What happens if localStorage is unavailable?

The library does not catch `localStorage` errors internally. If `localStorage` is unavailable (e.g., private browsing in some browsers, or storage quota exceeded), the call will throw. Wrap in a try/catch if you need to handle this:

```ts
let showFeature = false;
try {
  showFeature = getBucketedValue("ab-tests", "my-feature", 50);
} catch {
  // localStorage unavailable — fall back to control
}
```

### How do I configure the percentage from an environment variable?

Use `parseEnvPct` to safely parse the env var:

```ts
const pct = parseEnvPct(process.env.REACT_APP_FEATURE_PCT);
const showFeature = getBucketedValue("ab-tests", "my-feature", pct);
```

This throws at startup if the env var is missing or invalid, so you catch configuration errors early.
