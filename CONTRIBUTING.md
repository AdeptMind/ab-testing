# Contributing

Thanks for your interest in contributing to `@adeptmind/ab-testing`!

## Development Setup

```bash
git clone https://github.com/AdeptMind/ab-testing.git
cd ab-testing
npm install
```

## Scripts

| Command | Description |
|---|---|
| `npm test` | Run the test suite (Vitest) |
| `npm run build` | Build CJS, ESM, and type declarations |
| `npm run lint` | Type-check with `tsc --noEmit` |

## Making Changes

1. Create a feature branch from `main`.
2. Write or update tests for your change.
3. Make sure all checks pass: `npm run lint && npm test && npm run build`.
4. Open a pull request against `main` with a clear description of the change.

## Code Style

- TypeScript strict mode — no `any` types.
- Pure functions and immutable data where possible.
- Tests live alongside source files (`*.test.ts`).
