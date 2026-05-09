# Continuous Integration (CI) Pipeline

The Node Stack uses **GitHub Actions** to automate quality checks and build verification on every change.

## Workflow Triggers

The CI pipeline (`.github/workflows/ci.yml`) is triggered on:
- Every push to `main` and `develop` branches.
- Every Pull Request (PR) targeting `main` or `develop`.

## Jobs & Stages

### 1. Lint & Typecheck
- **Description**: Ensures the code follows established style guidelines and is free of TypeScript compilation errors.
- **Commands**: `pnpm lint`, `pnpm typecheck`.

### 2. Unit Tests
- **Description**: Runs all unit tests across the monorepo using Vitest/Jest.
- **Command**: `pnpm test`.

### 3. Build Matrix
- **Description**: Verifies that all applications can be built successfully for production.
- **Apps**: `api`, `worker`, `dashboard`, `web`.
- **Optimization**: Uses `turbo` to only build packages that have changed since the last successful run.

### 4. Secret Scanning
- **Description**: Uses `gitleaks` to scan the commit history for accidental leaks of API keys, passwords, or other sensitive credentials.

## Caching Strategy

To keep the CI fast (typically < 3 minutes), we implement several layers of caching:
- **pnpm store**: Persists downloaded dependencies between runs.
- **.turbo**: Persists `turbo` task outputs to skip re-running tests or builds if the source code hasn't changed.

## Requirements for Merging
A Pull Request must have a "green checkmark" (all CI jobs passing) before it can be merged into the `develop` or `main` branches.
