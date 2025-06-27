---
applyTo: "src/**/*.ts*"
---

When running tests, use `pnpm exec vitest run --project node` rather than the VS Code tests feature.

Ignore type errors and lint errors in unrelated code, i.e. when I ask to add a function or a test, there must be no errors, but don't try to fix them anywhere else as I might have something in progress myself.

Tysts are the type-level tests. These files are never executed nor included in the build, but helpful to check if the TypeScript generics are working correctly.
