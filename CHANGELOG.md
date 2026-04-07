# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-04-07

### Added

- `getBucketedValue` — sticky A/B bucketing with localStorage persistence
- `parseEnvPct` — safe parsing of percentage values from environment variables
- `drawFromUniform` — single non-sticky random draw
- `getLocalJson` / `setLocalJson` — typed localStorage helpers
- Bucket assignments exposed on `window.__adeptmind_ab__` for Adobe Target integration
- Dual CJS/ESM package output
